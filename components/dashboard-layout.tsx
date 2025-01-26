"use client";

import { Store } from "@prisma/client";
import { SidebarProvider } from "@/components/providers/sidebar-provider";
import { Sidebar } from "@/components/sidebar";
import { MainContent } from "@/components/main-content";
import Navbar from "@/components/navbar";

interface DashboardLayoutProps {
  store: Store;
  stores: Store[];
  children: React.ReactNode;
}

export function DashboardLayout({ store, stores, children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="relative min-h-screen">
        <Sidebar store={store} />
        <MainContent>
          <Navbar stores={stores} />
          <div className="flex-grow p-4 pb-16">
            {children}
          </div>
        </MainContent>
      </div>
    </SidebarProvider>
  );
}