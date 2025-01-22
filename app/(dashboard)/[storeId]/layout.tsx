import { redirect } from 'next/navigation';
import { getSession, isAdmin } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { Sidebar } from "@/components/sidebar";
import Navbar from '@/components/navbar';

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { storeId: string }
}) {
  const { storeId } = await params;
  const session = await getSession();
  
  if (!session) {
    redirect('/signin');
  }

  if (!isAdmin(session)) {
    redirect('/signin');
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: storeId,
      userId: session.userId,
    }
  });

  if (!store) {
    redirect('/');
  }

  const stores = await prismadb.store.findMany({
    where: {
      userId: session.userId,
    }
  });

  return (
    <div className="relative h-full">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-background">
        <Sidebar store={store} />
      </div>
      <main className="md:pl-72">
        <Navbar stores={stores} />
        {children}
      </main>
    </div>
  );
}
