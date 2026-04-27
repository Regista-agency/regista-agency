import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

const MIME: Record<string, string> = {
  pdf:  'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc:  'application/msword',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls:  'application/vnd.ms-excel',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; filename: string }> }
) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  const { id, filename } = await params;

  const automation = await prisma.automation.findUnique({ where: { id } });
  if (!automation) return new NextResponse('Introuvable', { status: 404 });
  if (session.user.role !== 'admin' && automation.clientId !== session.user.clientId) {
    return new NextResponse('Non autorisé', { status: 403 });
  }

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = path.join(process.cwd(), 'uploads', id, safeName);

  try {
    const buffer = await readFile(filePath);
    const ext = safeName.split('.').pop()?.toLowerCase() ?? '';
    const contentType = MIME[ext] ?? 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${safeName}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch {
    return new NextResponse('Fichier introuvable', { status: 404 });
  }
}
