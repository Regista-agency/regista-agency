import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { SessionProvider } from 'next-auth/react';
import dbConnect from '@/lib/db';
import Automation from '@/lib/models/Automation';
import { Sidebar } from '@/components/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  await dbConnect();

  const query =
    session.user.role === 'admin'
      ? {}
      : { clientId: session.user.clientId };

  const automations = await Automation.find(query)
    .select('_id name status')
    .sort({ name: 1 })
    .lean();

  const automationsData = automations.map((a) => ({
    _id: a._id.toString(),
    name: a.name,
    status: a.status,
  }));

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen">
        <Sidebar automations={automationsData} />
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </SessionProvider>
  );
}