import { redirect } from 'next/navigation';
import { getAdminSession, isAdmin } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { ClientLayout } from "./client-layout";

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { storeId: string };
}) {
  const session = await getAdminSession();
  
  if (!session || !isAdmin(session)) {
    redirect('/signin');
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
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
    <ClientLayout params={params} store={store} stores={stores}>
      {children}
    </ClientLayout>
  );
}
