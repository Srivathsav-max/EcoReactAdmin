'use client';

import { useRouter } from "next/navigation";
import { MainNav } from "@/components/main-nav";
import StoreSwitcher from "@/components/store-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { handleSignOut } from "@/lib/auth-utils";

const Navbar = ({ stores }: { stores: any[] }) => {
  const router = useRouter();

  const onSignOut = async () => {
    try {
      await handleSignOut();
      router.push('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <StoreSwitcher items={stores} />
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <button 
            onClick={onSignOut}
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
