import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { deleteAllRegistrations, insertRegistration, listRegistrations, type Registration } from "@/lib/registrations";

export async function GET(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const registrations = await listRegistrations();
  return NextResponse.json(registrations);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Registration;

  if (!body || typeof body.id !== "string" || typeof body.name !== "string" || typeof body.phone !== "string") {
    return NextResponse.json({ error: "Registro inválido" }, { status: 400 });
  }

  await insertRegistration(body);
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  await deleteAllRegistrations();
  return NextResponse.json({ ok: true });
}
