const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
export const API_BASE_URL = rawUrl.trim().replace(/\/$/, "");

