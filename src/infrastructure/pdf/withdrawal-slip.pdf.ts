import PDFDocument from "pdfkit";
import { Response } from "express";
import { WithdrawalSlipDto } from "@application/dtos/request/withdrawal-slip.dto";
import { IFCE_LOGO_PNG } from "./assets/ifce-logo";

const GREEN_DARK = "#1F5D3A";
const GREEN_ACCENT = "#2E8B57";
const LIGHT_BG = "#EEF5F0";
const GRAY_TEXT = "#5B6472";
const BORDER = "#D7E4DB";

const MARGIN = 54;
const SIGNATURE_BLOCK_HEIGHT = 130;
const LOGO_BOX_WIDTH = 44;
const LOGO_BOX_HEIGHT = 56;
const LOGO_GAP = 12;

/**
 * Draws the signature block anchored to the bottom of the current page.
 * Called after any content — always relative to the page's end, regardless
 * of how much content came before it.
 */
function drawSignatureFooter(doc: PDFKit.PDFDocument, requestId: string): void {
  // Every `.text()` call below moves pdfkit's flowing cursor (`doc.x`/`doc.y`)
  // to just past the drawn text — even with explicit x/y — because pdfkit
  // still runs it through LineWrapper whenever `width` is set. Since this
  // footer draws near the physical bottom of the page, that leaves `doc.y`
  // far past the content area's bottom margin. Save/restore the cursor so
  // callers can keep flowing content normally right after this returns.
  const cursorX = doc.x;
  const cursorY = doc.y;

  // `doc.page.margins.bottom` reserves MARGIN + SIGNATURE_BLOCK_HEIGHT, i.e.
  // it already spans the whole footer zone — using it here would anchor the
  // block SIGNATURE_BLOCK_HEIGHT too high, overlapping content that fills
  // the page close to the reserved zone. Anchor to the true bottom instead,
  // leaving just MARGIN as blank space below (matching the other 3 sides).
  const pageBottom = doc.page.height - MARGIN;
  const lineY = pageBottom - SIGNATURE_BLOCK_HEIGHT + 20;

  // The signature block is drawn inside the reserved bottom margin (outside
  // the content area). Without zeroing the margin, any `.text()` call with
  // y >= pageBottom makes pdfkit think it doesn't fit and call `addPage()`,
  // which fires "pageAdded" again => infinite recursion.
  const originalBottomMargin = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;

  doc.strokeColor(BORDER).lineWidth(0.75)
    .moveTo(MARGIN, lineY).lineTo(doc.page.width - MARGIN, lineY).stroke();

  doc.fillColor(GREEN_DARK).fontSize(11).font("Helvetica-Bold")
    .text("Assinaturas", MARGIN, lineY + 14);

  const sigY = pageBottom - 34;
  const col1x1 = MARGIN + 12, col1x2 = MARGIN + 260;
  const col2x1 = doc.page.width - MARGIN - 260, col2x2 = doc.page.width - MARGIN - 12;

  doc.strokeColor(GRAY_TEXT).lineWidth(0.75)
    .moveTo(col1x1, sigY).lineTo(col1x2, sigY).stroke()
    .moveTo(col2x1, sigY).lineTo(col2x2, sigY).stroke();

  doc.fillColor(GRAY_TEXT).fontSize(9).font("Helvetica")
    .text("Assinatura do requisitante", col1x1, sigY + 6, { width: col1x2 - col1x1, align: "center" })
    .text("Assinatura do responsável pelo almoxarifado", col2x1, sigY + 6, { width: col2x2 - col2x1, align: "center" });

  doc.fillColor(GRAY_TEXT).fontSize(7.5).font("Helvetica")
    .text(
      `Documento gerado eletronicamente pelo sistema STOCK para fins de auditoria — Solicitação ${requestId}`,
      MARGIN, pageBottom + 2,
      { width: doc.page.width - MARGIN * 2, align: "center" },
    );

  doc.page.margins.bottom = originalBottomMargin;
  doc.x = cursorX;
  doc.y = cursorY;
}

export function generateWithdrawalSlipPdf(data: WithdrawalSlipDto, res: Response): void {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: MARGIN, bottom: MARGIN + SIGNATURE_BLOCK_HEIGHT, left: MARGIN, right: MARGIN },
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="termo-retirada-${data.requestId}.pdf"`);

  doc.on("error", (err) => {
    if (!res.headersSent) res.status(500);
    res.destroy(err);
  });
  res.on("error", () => doc.destroy());

  doc.pipe(res);

  // `new PDFDocument()` already creates the first page synchronously, before
  // any listener can be attached, so "pageAdded" never fires for it. Draw its
  // footer explicitly, then let the listener handle every subsequent page.
  doc.on("pageAdded", () => drawSignatureFooter(doc, data.requestId));
  drawSignatureFooter(doc, data.requestId);

  // ---------- Header ----------
  const logoX = doc.page.width - MARGIN - LOGO_BOX_WIDTH;
  const logoY = MARGIN;
  doc.image(IFCE_LOGO_PNG, logoX, logoY, {
    fit: [LOGO_BOX_WIDTH, LOGO_BOX_HEIGHT],
    align: "right",
  });

  const headerTextWidth = doc.page.width - MARGIN * 2 - LOGO_BOX_WIDTH - LOGO_GAP;
  doc.fillColor(GREEN_ACCENT).fontSize(11).font("Helvetica-Bold").text("STOCK", { width: headerTextWidth });
  doc.moveDown(0.6);
  doc.fillColor(GREEN_DARK).fontSize(18).font("Helvetica-Bold")
    .text("Termo de Retirada de Material", { width: headerTextWidth });
  doc.fillColor(GRAY_TEXT).fontSize(9.5).font("Helvetica")
    .text("Documento de auditoria — controle de saída de materiais do almoxarifado", { width: headerTextWidth });

  // `doc.image()` with explicit x/y doesn't advance `doc.y`, so the divider
  // must clear both the text block and the logo, whichever is taller.
  doc.y = Math.max(doc.y, logoY + LOGO_BOX_HEIGHT);
  doc.moveDown(0.8);
  doc.strokeColor(BORDER).lineWidth(1).moveTo(MARGIN, doc.y).lineTo(doc.page.width - MARGIN, doc.y).stroke();
  doc.moveDown(1);

  // ---------- Identification block ----------
  doc.fillColor(GRAY_TEXT).fontSize(8)
    .text(`Solicitação nº `, { continued: true })
    .fillColor(GREEN_ACCENT).text(data.requestId);
  doc.moveDown(0.5);

  const boxTop = doc.y;
  const boxWidth = doc.page.width - MARGIN * 2;
  const col1X = MARGIN + 12;
  const col2X = MARGIN + 246;
  const col1Width = col2X - col1X - 12;
  const col2Width = MARGIN + boxWidth - 12 - col2X;

  // Box/row heights are derived from the actual wrapped text height so long
  // requester names or sector labels can't overflow the background rect.
  doc.fontSize(10.5).font("Helvetica-Bold");
  const topRowValueHeight = Math.max(
    doc.heightOfString(data.requesterName, { width: col1Width }),
    doc.heightOfString(data.sector, { width: col2Width }),
    14,
  );
  const secondRowY = boxTop + 22 + topRowValueHeight + 8;
  const bottomRowValueHeight = Math.max(
    doc.heightOfString(data.deadline, { width: col1Width }),
    doc.heightOfString(data.createdAt, { width: col2Width }),
    14,
  );
  const boxHeight = secondRowY - boxTop + 12 + bottomRowValueHeight + 10;

  doc.rect(MARGIN, boxTop, boxWidth, boxHeight).fill(LIGHT_BG);
  doc.fillColor(GRAY_TEXT).fontSize(8).font("Helvetica")
    .text("REQUISITANTE", col1X, boxTop + 10)
    .text("SETOR", col2X, boxTop + 10);
  doc.fillColor(GREEN_DARK).fontSize(10.5).font("Helvetica-Bold")
    .text(data.requesterName, col1X, boxTop + 22, { width: col1Width })
    .text(data.sector, col2X, boxTop + 22, { width: col2Width });
  doc.fillColor(GRAY_TEXT).fontSize(8).font("Helvetica")
    .text("PRAZO", col1X, secondRowY)
    .text("ABERTA EM", col2X, secondRowY);
  doc.fillColor(GREEN_DARK).fontSize(10.5).font("Helvetica-Bold")
    .text(data.deadline, col1X, secondRowY + 12, { width: col1Width })
    .text(data.createdAt, col2X, secondRowY + 12, { width: col2Width });

  doc.y = boxTop + boxHeight + 20;

  // ---------- Materials ----------
  doc.fillColor(GREEN_DARK).fontSize(11).font("Helvetica-Bold").text("Materiais Retirados");
  doc.moveDown(0.5);

  const col3X = MARGIN + 366;
  const rowHeight = 26;

  const drawTableHeader = (top: number): number => {
    doc.rect(MARGIN, top, boxWidth, 24).fill(GREEN_DARK);
    doc.fillColor("white").fontSize(9.5).font("Helvetica-Bold")
      .text("Item", MARGIN + 12, top + 7)
      .text("Tipo", MARGIN + 226, top + 7)
      .text("Quantidade", col3X, top + 7);
    return top + 24;
  };

  let tableTop = doc.y;
  let rowY = drawTableHeader(tableTop);
  let totalUnits = 0;

  data.materials.forEach((material, i) => {
    const contentBottom = doc.page.height - doc.page.margins.bottom;
    if (rowY + rowHeight > contentBottom) {
      doc.strokeColor(BORDER).lineWidth(0.75).rect(MARGIN, tableTop, boxWidth, rowY - tableTop).stroke();
      doc.addPage();
      tableTop = doc.page.margins.top;
      rowY = drawTableHeader(tableTop);
    }

    if (i % 2 === 1) doc.rect(MARGIN, rowY, boxWidth, rowHeight).fill(LIGHT_BG);
    doc.fillColor(GREEN_DARK).fontSize(9.5).font("Helvetica")
      .text(material.name, MARGIN + 12, rowY + 8, { width: 202 })
      .text(material.category, MARGIN + 226, rowY + 8, { width: 128 })
      .text(`${material.quantity} ${material.unit}`, col3X, rowY + 8, { width: MARGIN + boxWidth - 12 - col3X });
    totalUnits += material.quantity;
    rowY += rowHeight;
  });

  doc.strokeColor(BORDER).lineWidth(0.75).rect(MARGIN, tableTop, boxWidth, rowY - tableTop).stroke();

  doc.y = rowY + 10;
  doc.fillColor(GRAY_TEXT).fontSize(9.5).font("Helvetica-Bold")
    .text(`Total: ${data.materials.length} material(is)  •  ${totalUnits} unidades`, { align: "right" });

  // The current page's footer was already drawn — either by the explicit
  // call above (page 1) or by the "pageAdded" listener (any later page).

  doc.end();
}
