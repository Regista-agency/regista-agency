import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { templateId } = await request.json();

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID requis' },
        { status: 400 }
      );
    }

    // Get template
    const template = await prisma.automationTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template non trouvé' },
        { status: 404 }
      );
    }

    // Check if already added
    const existing = await prisma.automation.findFirst({
      where: {
        clientId: session.user.clientId!,
        templateId: template.id,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Automatisation déjà ajoutée' },
        { status: 400 }
      );
    }

    // Create automation from template
    const automation = await prisma.automation.create({
      data: {
        name: template.name,
        description: template.description,
        clientId: session.user.clientId!,
        templateId: template.id,
        status: 'inactive',
        settings: template.defaultSettings ?? {},
      },
    });

    return NextResponse.json({
      message: 'Automatisation ajoutée avec succès',
      automationId: automation.id,
    });
  } catch (error) {
    console.error('Add automation error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
