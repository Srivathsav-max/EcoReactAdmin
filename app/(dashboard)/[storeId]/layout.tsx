import { redirect } from 'next/navigation';
import { getAdminSession, isAdmin } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { DashboardLayout } from "@/components/dashboard-layout";

export default async function Layout({
  children,
  params
}: {
  children: React.ReactNode
  params: { storeId: string }
}) {
  const { storeId } = params;
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

  return <DashboardLayout store={store} stores={stores}>{children}</DashboardLayout>;
}
