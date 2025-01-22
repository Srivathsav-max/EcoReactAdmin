import { redirect } from 'next/navigation';
import { getSession, isAdmin } from '@/lib/auth';
import { ModalProvider } from "@/providers/modal-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { ThemeProvider } from "@/providers/theme-provider";

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession();

  if (!session) {
    redirect('/signin');
  }

  if (!isAdmin(session)) {
    redirect('/signin');
  }

  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ToastProvider />
        <ModalProvider />
        {children}
      </ThemeProvider>
    </>
  );
}
