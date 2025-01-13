import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import prismadb from '@/lib/prismadb';
import Navbar from '@/components/navbar';
import { verifyAuth } from '@/lib/auth';  // Add your custom auth verification

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { storeId: string }
}) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    redirect('/sign-in');
  }

  const session = await verifyAuth(token);

  if (!session?.user) {
    redirect('/sign-in');
  }

  const store = await prismadb.store.findFirst({ 
    where: {
      id: params.storeId,
      userId: session.user.id,  // Use the user ID from your custom session
    }
   });

  if (!store) {
    redirect('/');
  };

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};
