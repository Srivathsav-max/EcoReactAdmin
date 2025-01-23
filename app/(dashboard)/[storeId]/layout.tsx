import { redirect } from 'next/navigation';
import { getAdminSession, isAdmin } from '@/lib/auth';
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
  const session = await getAdminSession();
  
  if (!session || !isAdmin(session)) {
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
    <div className="relative min-h-screen">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-background">
        <Sidebar store={store} />
      </div>
      <main className="md:pl-72 flex flex-col min-h-screen">
        <Navbar stores={stores} />
        <div className="flex-grow p-4 pb-16">
          {children}
        </div>
      </main>
    </div>
  );
}
