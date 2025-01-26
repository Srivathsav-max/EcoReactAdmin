"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/providers/sidebar-provider";

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const { isCollapsed } = useSidebar();

  return (
    <main
      className={cn(
        "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
        isCollapsed ? "md:pl-[80px]" : "md:pl-[280px]"
      )}
    >
      {children}
    </main>
  );
}