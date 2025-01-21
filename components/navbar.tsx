'use client';

import { useRouter } from "next/navigation";
import StoreSwitcher from "@/components/store-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { handleSignOut } from "@/lib/auth-utils";

interface NavbarProps {
  stores: any[];
}

const Navbar = ({ stores }: NavbarProps) => {
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
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
