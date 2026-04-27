import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;

  const automation = await prisma.automation.findUnique({ where: { id } });
  if (!automation) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  if (session.user.role !== 'admin' && automation.clientId !== session.user.clientId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const dir = path.join(UPLOADS_DIR, id);
  await mkdir(dir, { recursive: true });

  // Sanitize filename
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  await writeFile(path.join(dir, safeName), buffer);

  return NextResponse.json({ name: safeName, size: file.size });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;

  try {
    const { readdir, stat } = await import('fs/promises');
    const dir = path.join(UPLOADS_DIR, id);
    const names = await readdir(dir);
    const files = await Promise.all(
      names.map(async (name) => {
        const s = await stat(path.join(dir, name));
        return { name, size: s.size };
      })
    );
    return NextResponse.json(files);
  } catch {
    return NextResponse.json([]);
  }
}
