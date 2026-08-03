import { NextRequest } from "next/server";

export function isAdminAuthorized(request: NextRequest): boolean {
  const expected = process.env.ADMIN_PASSWORD || "agropac2026";
  const header = request.headers.get("authorization") || "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  return provided === expected;
}
