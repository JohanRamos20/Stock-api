export const REQUEST_LIST_CACHE_TTL_SECONDS = 60 * 30;

export const ALL_REQUESTS_CACHE_PREFIX = "requests:all:";

export function buildUserRequestsCacheKey(userId: string, page: number, limit: number): string {
  return `${userRequestsCachePrefix(userId)}page:${page}:limit:${limit}`;
}

export function buildAllRequestsCacheKey(page: number, limit: number): string {
  return `${ALL_REQUESTS_CACHE_PREFIX}page:${page}:limit:${limit}`;
}

export function userRequestsCachePrefix(userId: string): string {
  return `requests:user:${userId}:`;
}
