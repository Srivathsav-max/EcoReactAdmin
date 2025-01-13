import { redirect } from "next/navigation";
import { cookies } from 'next/headers';
import { MainNav } from "@/components/main-nav";
import StoreSwitcher from "@/components/store-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import prismadb from "@/lib/prismadb";
import { verifyAuth } from "@/lib/auth";

const Navbar = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/sign-in');
  }

  const session = await verifyAuth(token);
  if (!session?.user) {
    redirect('/sign-in');
  }

  const stores = await prismadb.store.findMany({
    where: {
      userId: session.user.id,
    },
  });

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <StoreSwitcher items={stores} />
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <form action="/api/auth/signout" method="post">
            <button 
              type="submit"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
