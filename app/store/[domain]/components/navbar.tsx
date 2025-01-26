"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { ShoppingBag, Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  taxons: {
    id: string;
    name: string;
    permalink: string;
  }[];
}

interface NavbarProps {
  taxonomies: Category[];
}

export const Navbar: React.FC<NavbarProps> = ({
  taxonomies = []
}) => {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const domain = params?.domain;
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    
    const checkAuth = async () => {
      try {
        const response = await fetch(`/api/auth/customer/profile?domain=${domain}`, {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          signal: controller.signal
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.id) {
            setIsAuthenticated(true);
            return;
          }
        }
        
        setIsAuthenticated(false);
        // Only redirect on protected routes
        if (pathname.includes('/profile') || pathname.includes('/orders')) {
          router.replace(`/store/${domain}/signin`);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Auth check failed:', error);
          setIsAuthenticated(false);
        }
      }
    };

    if (domain) {
      checkAuth();
    }

    return () => {
      controller.abort();
    };
  }, [domain, pathname, router]);

  return (
    <nav className="border-b">
      <div className="relative px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href={`/store/${domain}`} className="flex lg:ml-0 gap-x-2">
          <p className="font-bold text-xl">STORE</p>
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            {taxonomies.map((taxonomy) => (
              <NavigationMenuItem key={taxonomy.id}>
                <NavigationMenuTrigger>{taxonomy.name}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {taxonomy.taxons.map((taxon) => (
                      <li key={taxon.id}>
                        <Link
                          href={`/store/${domain}/category/${taxon.permalink}`}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">{taxon.name}</div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="mr-6"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          <Link href={`/store/${domain}/cart`}>
            <Button variant="ghost" size="icon">
              <ShoppingBag className="h-5 w-5" />
            </Button>
          </Link>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/store/${domain}/profile`}>
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/store/${domain}/orders`}>
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/store/${domain}/signout`}>
                    Sign Out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-x-4">
              <Link href={`/store/${domain}/signin`}>
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href={`/store/${domain}/signup`}>
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};