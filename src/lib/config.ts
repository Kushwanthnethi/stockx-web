const rawUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.stocksx.info";
export const API_BASE_URL = rawUrl.trim().replace(/\/$/, "");

