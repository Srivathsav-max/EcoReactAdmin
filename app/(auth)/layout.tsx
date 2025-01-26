import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifyAuth();

  // If already logged in, redirect to dashboard
  if (session) {
    return redirect('/');
  }

  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-slate-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          Multi Store Admin Platform
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Manage your stores from one centralized dashboard.
            </p>
            <footer className="text-sm">Admin Dashboard</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {children}
        </div>
      </div>
    </div>
  );
}
