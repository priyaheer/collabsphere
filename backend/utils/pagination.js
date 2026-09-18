// Parse ?page=1&limit=10 with sane bounds.
export function getPagination(query, { defaultLimit = 10, maxLimit = 100 } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPaginationMeta({ page, limit }, total) {
  return { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) };
}

// Parse ?sort=-createdAt or ?sort=name (whitelisted fields only).
export function getSort(query, allowedFields, fallback = "-createdAt") {
  const raw = typeof query.sort === "string" && query.sort.trim() ? query.sort.trim() : fallback;
  const desc = raw.startsWith("-");
  const field = desc ? raw.slice(1) : raw;
  if (!allowedFields.includes(field)) {
    const fbDesc = fallback.startsWith("-");
    return { [fbDesc ? fallback.slice(1) : fallback]: fbDesc ? -1 : 1 };
  }
  return { [field]: desc ? -1 : 1 };
}

export function escapeRegex(str = "") {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
