import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Automation from '@/lib/models/Automation';
import Metric from '@/lib/models/Metric';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const query =
      session.user.role === 'admin'
        ? {}
        : { clientId: session.user.clientId };

    const automations = await Automation.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Get stats for each automation (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const automationsWithStats = await Promise.all(
      automations.map(async (automation) => {
        const metrics = await Metric.find({
          automationId: automation._id,
          date: { $gte: sevenDaysAgo },
        }).lean();

        const emailsSent = metrics.reduce(
          (sum, m) => sum + m.emailsSent,
          0
        );

        return {
          ...automation,
          _id: automation._id.toString(),
          clientId: automation.clientId.toString(),
          stats: { emailsSent },
        };
      })
    );

    return NextResponse.json(automationsWithStats);
  } catch (error) {
    console.error('Get automations error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}