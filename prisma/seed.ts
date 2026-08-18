import { prisma } from "../src/database/prisma";
import { UserRole, UserSector } from "../src/domain/entities/user.entity";
import { BcryptPasswordHasher } from "../src/infrastructure/services/bcrypt-password-hasher.service";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable to seed the initial admin: ${name}`);
  }
  return value;
}

async function main(): Promise<void> {
  const existingAdmin = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } });
  if (existingAdmin) {
    console.log("An ADMIN user already exists — skipping initial admin seed.");
    return;
  }

  const name = requiredEnv("INITIAL_ADMIN_NAME");
  const email = requiredEnv("INITIAL_ADMIN_EMAIL").trim().toLowerCase();
  const siapp = requiredEnv("INITIAL_ADMIN_SIAPP");
  const sector = (process.env.INITIAL_ADMIN_SECTOR as UserSector) ?? UserSector.ADMINISTRATIVE;

  const passwordHasher = new BcryptPasswordHasher();
  const hashedPassword = await passwordHasher.hash(siapp);

  const admin = await prisma.user.create({
    data: { name, email, siapp, password: hashedPassword, role: UserRole.ADMIN, sector },
  });

  console.log(`Bootstrap ADMIN created: ${admin.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
