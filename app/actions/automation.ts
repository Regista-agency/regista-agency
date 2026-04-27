'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleAutomation(id: string, active: boolean) {
  const session = await auth();
  if (!session) throw new Error('Non autorisé');

  const automation = await prisma.automation.findUnique({ where: { id } });
  if (!automation) throw new Error('Introuvable');

  if (session.user.role !== 'admin' && automation.clientId !== session.user.clientId) {
    throw new Error('Non autorisé');
  }

  await prisma.automation.update({
    where: { id },
    data: { status: active ? 'active' : 'inactive' },
  });

  revalidatePath('/dashboard');
  revalidatePath(`/dashboard/automations/${id}`);
}
