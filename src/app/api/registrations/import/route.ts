import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { importRegistrations, type Registration } from "@/lib/registrations";

export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as Registration[];
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  }

  const imported = await importRegistrations(body);
  return NextResponse.json({ ok: true, imported });
}
