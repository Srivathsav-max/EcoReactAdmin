import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (token) {
    const session = await verifyAuth(token);
    if (session?.user) {
      redirect('/');
    }
  }

  return (
    <div className="flex items-center justify-center h-full w-full">
      {children}
    </div>
  );
}
