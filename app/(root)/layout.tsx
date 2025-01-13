import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import prismadb from '@/lib/prismadb';
import { verifyAuth } from '@/lib/auth';

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode
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
      userId: session.user.id
    }
  });

  if (store) {
    redirect(`/${store.id}`);
  }

  return (
    <>
      {children}
    </>
  );
}
