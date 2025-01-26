import { getAdminSession, isAdmin } from '@/lib/auth';
import { ModalProvider } from "@/providers/modal-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAdminSession();
  
  return (
    <div className="h-full flex items-center justify-center">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
      >
        <ToastProvider />
        <ModalProvider />
        {children}
      </ThemeProvider>
    </div>
  );
}
