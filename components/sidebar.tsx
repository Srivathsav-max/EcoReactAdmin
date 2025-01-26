"use client";

import { Store } from "@prisma/client";
import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/providers/sidebar-provider";
import {
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Layers,
  Tags,
  Building2,
  Truck,
  ListChecks,
  ShoppingBag,
  BarChart,
  Box,
  FileText,
  Grid,
  Image,
  MessageSquare,
  ArrowLeftRight,
  ChevronRight,
  FolderTree,
  FileQuestion,
  LayoutTemplate
} from "lucide-react";
import { LucideIcon } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SidebarProps {
  store: Store | null;
}

type MenuItem = {
  label: string;
  href: string;
  active: boolean;
  icon?: React.ReactNode;
};

type RouteItem = {
  label: string;
  icon?: LucideIcon;
  href?: string;
  active?: boolean;
  items?: MenuItem[];
};

export function Sidebar({ store }: SidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setOpenCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const routes: RouteItem[] = [
    {
      label: "Overview",
      icon: LayoutDashboard,
      href: `/${params.storeId}`,
      active: pathname === `/${params.storeId}`,
    },
    {
      label: "Catalog",
      icon: Package,
      items: [
        {
          label: "Products",
          href: `/${params.storeId}/products`,
          active: pathname === `/${params.storeId}/products`,
          icon: <ShoppingBag className="h-4 w-4" />
        },
        {
          label: "Variants",
          href: `/${params.storeId}/variants`,
          active: pathname === `/${params.storeId}/variants`,
          icon: <Box className="h-4 w-4" />
        },
        {
          label: "Taxonomies",
          href: `/${params.storeId}/taxonomies`,
          active: pathname === `/${params.storeId}/taxonomies`,
          icon: <Layers className="h-4 w-4" />
        },
        {
          label: "Taxons",
          href: `/${params.storeId}/taxons`,
          active: pathname === `/${params.storeId}/taxons`,
          icon: <FolderTree className="h-4 w-4" />
        },
        {
          label: "Brands",
          href: `/${params.storeId}/brands`,
          active: pathname === `/${params.storeId}/brands`,
          icon: <Building2 className="h-4 w-4" />
        },
        {
          label: "Suppliers",
          href: `/${params.storeId}/suppliers`,
          active: pathname === `/${params.storeId}/suppliers`,
          icon: <Truck className="h-4 w-4" />
        },
      ],
    },
    {
      label: "Attributes & Properties",
      icon: Tags,
      items: [
        {
          label: "Attributes",
          href: `/${params.storeId}/attributes`,
          active: pathname === `/${params.storeId}/attributes`,
          icon: <ListChecks className="h-4 w-4" />
        },
        {
          label: "Attribute Values",
          href: `/${params.storeId}/attribute-values`,
          active: pathname === `/${params.storeId}/attribute-values`,
          icon: <Tags className="h-4 w-4" />
        },
        {
          label: "Option Types",
          href: `/${params.storeId}/option-types`,
          active: pathname === `/${params.storeId}/option-types`,
          icon: <Grid className="h-4 w-4" />
        },
      ]
    },
    {
      label: "Inventory",
      icon: Package,
      items: [
        {
          label: "Stock Items",
          href: `/${params.storeId}/stock-items`,
          active: pathname === `/${params.storeId}/stock-items`,
          icon: <Package className="h-4 w-4" />
        },
        {
          label: "Stock Movements",
          href: `/${params.storeId}/stock-movements`,
          active: pathname === `/${params.storeId}/stock-movements`,
          icon: <ArrowLeftRight className="h-4 w-4" />
        },
      ]
    },
    {
      label: "Sales",
      icon: ShoppingCart,
      items: [
        {
          label: "Orders",
          href: `/${params.storeId}/orders`,
          active: pathname === `/${params.storeId}/orders`,
          icon: <ShoppingCart className="h-4 w-4" />
        },
        {
          label: "Customers",
          href: `/${params.storeId}/customers`,
          active: pathname === `/${params.storeId}/customers`,
          icon: <Users className="h-4 w-4" />
        },
      ]
    },
    {
      label: "Content",
      icon: FileText,
      items: [
        {
          label: "Home Layouts",
          href: `/${params.storeId}/layouts`,
          active: pathname === `/${params.storeId}/layouts`,
          icon: <LayoutTemplate className="h-4 w-4" />
        },
        {
          label: "Billboards",
          href: `/${params.storeId}/billboards`,
          active: pathname === `/${params.storeId}/billboards`,
          icon: <Image className="h-4 w-4" />
        },
        {
          label: "Reviews",
          href: `/${params.storeId}/reviews`,
          active: pathname === `/${params.storeId}/reviews`,
          icon: <MessageSquare className="h-4 w-4" />
        },
      ]
    },
    {
      label: "Documentation",
      icon: FileQuestion,
      items: [
        {
          label: "API Reference",
          href: `/${params.storeId}/documentation`,
          active: pathname === `/${params.storeId}/documentation`,
          icon: <FileQuestion className="h-4 w-4" />
        }
      ]
    },
    {
      label: "Settings",
      icon: Settings,
      href: `/${params.storeId}/settings`,
      active: pathname === `/${params.storeId}/settings`,
    },
  ];

  return (
    <div
      className={cn(
        "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[80] bg-background border-r transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[80px]" : "w-[280px]"
      )}
      aria-expanded={!isCollapsed}
    >
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 z-50 rounded-full border bg-background p-1.5 hover:bg-accent transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 transition-transform duration-300",
            isCollapsed ? "rotate-0" : "rotate-180"
          )}
        />
      </button>
      <div className="space-y-4 py-4 h-full overflow-y-auto max-h-screen scrollbar-hide">
        <div className="px-3 py-2">
          <h2 
            className={cn(
              "mb-2 px-4 text-lg font-semibold sticky top-0 bg-background z-40 transition-all duration-300",
              isCollapsed && "text-center text-sm px-0 overflow-hidden whitespace-nowrap"
            )}
          >
            {isCollapsed ? "SM" : "Store Management"}
          </h2>
          <div className="space-y-1">
            {routes.map((route, index) => (
              <div key={index}>
                {route.items ? (
                  <Collapsible
                    open={openCategories.includes(route.label)}
                    onOpenChange={() => toggleCategory(route.label)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div 
                        className={cn(
                          "px-4 py-2 flex items-center justify-between text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-all duration-300",
                          isCollapsed && "px-2 justify-center"
                        )}
                      >
                        <div className="flex items-center">
                          {route.icon && (
                            <route.icon 
                              className={cn(
                                "h-4 w-4 transition-all duration-300",
                                isCollapsed ? "mr-0" : "mr-2"
                              )} 
                            />
                          )}
                          {!isCollapsed && route.label}
                        </div>
                        {!isCollapsed && (
                          <ChevronRight 
                            className={cn(
                              "h-4 w-4 transition-transform duration-300",
                              openCategories.includes(route.label) && "transform rotate-90"
                            )} 
                          />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className={cn(
                        "pl-4 space-y-1 pt-2",
                        isCollapsed && "pl-2"
                      )}>
                        {route.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-300",
                              item.active ? "bg-accent text-accent-foreground" : "transparent",
                              isCollapsed && "px-2 justify-center"
                            )}
                            title={isCollapsed ? item.label : undefined}
                          >
                            {item.icon && (
                              <div className={cn(
                                "transition-all duration-300",
                                isCollapsed ? "w-5 h-5" : "w-4 h-4"
                              )}>
                                {item.icon}
                              </div>
                            )}
                            {!isCollapsed && <span className="ml-2">{item.label}</span>}
                          </Link>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ) : route.href ? (
                  <Link
                    href={route.href}
                    className={cn(
                      "flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-300",
                      route.active ? "bg-accent text-accent-foreground" : "transparent",
                      isCollapsed && "px-2 justify-center"
                    )}
                    title={isCollapsed ? route.label : undefined}
                  >
                    {route.icon && (
                      <route.icon 
                        className={cn(
                          "h-4 w-4 transition-all duration-300",
                          isCollapsed ? "mr-0" : "mr-2"
                        )} 
                      />
                    )}
                    {!isCollapsed && route.label}
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}