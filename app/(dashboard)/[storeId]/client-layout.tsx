"use client";

import { Store } from "@prisma/client";
import { Sidebar } from "@/components/sidebar";
import { useSidebarState } from '@/hooks/use-sidebar-state';
import { cn } from "@/lib/utils";

interface ClientLayoutProps {
  children: React.ReactNode;
  params: { storeId: string };
  store: Store | null;
  stores: any[];
}

export function ClientLayout({ children, params, store, stores }: ClientLayoutProps) {
  const { isCollapsed } = useSidebarState();

  return (
    <div className="relative min-h-screen bg-background">
      <Sidebar store={store} stores={stores} />
      <main 
        className={cn(
          "min-h-screen w-full",
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "pl-[70px]" : "pl-[280px]"
        )}
      >
        <div className="container mx-auto p-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
