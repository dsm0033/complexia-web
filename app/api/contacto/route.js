import { NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/mail';

export async function POST(request) {
  const { nombre, email, empresa, mensaje } = await request.json();

  if (!nombre?.trim() || !email?.trim() || !mensaje?.trim()) {
    return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'El email no es válido.' }, { status: 400 });
  }

  try {
    await sendContactEmail({ nombre: nombre.trim(), email: email.trim(), empresa: empresa?.trim(), mensaje: mensaje.trim() });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'No se pudo enviar el mensaje. Inténtalo de nuevo.' }, { status: 500 });
  }
}
