"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Store } from "@prisma/client";
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
  Box,
  FileText,
  Grid,
  Image,
  MessageSquare,
  ArrowLeftRight,
  ChevronRight,
  FolderTree,
  FileQuestion,
  LayoutTemplate,
  Menu
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";


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

export function Sidebar({ store }: { store: Store | null }) {
  const pathname = usePathname();
  const params = useParams();
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const toggleCategory = (category: string) => {
    if (isCollapsed) return;
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
    <aside 
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background",
        "transition-all duration-300 ease-in-out z-30",
        "flex flex-col",
        isCollapsed ? "w-[70px]" : "w-[280px]"
      )}
    >
      <div className="relative h-full border-r border-r-accent/20">
        <div className="absolute right-0 top-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "flex items-center justify-center w-6 h-12 -mr-3",
              "rounded-l-xl bg-primary/5 hover:bg-primary/10",
              "transition-colors border-y border-l border-accent/20"
            )}
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
        
        <div className="h-full overflow-hidden">
          <div className="h-full overflow-y-auto no-scrollbar px-3 py-4">
            <div className="space-y-4">
              {store && (
                <div className={cn(
                  "flex items-center gap-3 px-3.5 py-4",
                  isCollapsed ? "justify-center" : "justify-start"
                )}>
                  {isCollapsed ? (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {store.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <h2 className="font-semibold text-lg truncate text-primary/80">
                      {store.name}
                    </h2>
                  )}
                </div>
              )}
              
              <nav className="space-y-1">
                {routes.map((route, index) => (
                  <div key={index}>
                    {route.items ? (
                      <Collapsible
                        open={!isCollapsed && openCategories.includes(route.label)}
                        onOpenChange={() => toggleCategory(route.label)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className={cn(
                            "group w-full rounded-lg border border-transparent",
                            "transition-all duration-200",
                            openCategories.includes(route.label)
                              ? "bg-primary/5 border-primary/20"
                              : "hover:bg-accent/5 hover:border-accent/10",
                            isCollapsed && "justify-center"
                          )}>
                            <div className="px-3.5 py-2.5 flex items-center justify-between">
                              <div className="flex items-center min-w-0 gap-3">
                                {route.icon && (
                                  <route.icon className={cn(
                                    "h-4 w-4 shrink-0",
                                    openCategories.includes(route.label)
                                      ? "text-primary"
                                      : "text-muted-foreground group-hover:text-foreground"
                                  )} />
                                )}
                                {!isCollapsed && (
                                  <span className="text-sm font-medium truncate">
                                    {route.label}
                                  </span>
                                )}
                              </div>
                              {!isCollapsed && (
                                <ChevronRight className={cn(
                                  "h-4 w-4 shrink-0 transition-transform",
                                  openCategories.includes(route.label) && "rotate-90"
                                )} />
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className={cn(
                            "mt-1 space-y-1",
                            !isCollapsed && "ml-4"
                          )}>
                            {route.items.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="block"
                              >
                                <div className={cn(
                                  "rounded-lg border border-transparent",
                                  "transition-all duration-200 group",
                                  item.active
                                    ? "bg-primary/5 border-primary/20"
                                    : "hover:bg-accent/5 hover:border-accent/10",
                                  isCollapsed ? "px-2 py-2" : "px-3.5 py-2"
                                )}>
                                  <div className="flex items-center min-w-0 gap-3">
                                    <div className={cn(
                                      "p-1 rounded shrink-0",
                                      item.active
                                        ? "bg-primary/10"
                                        : "bg-transparent group-hover:bg-accent/5"
                                    )}>
                                      {item.icon}
                                    </div>
                                    {!isCollapsed && (
                                      <span className={cn(
                                        "text-sm truncate",
                                        item.active
                                          ? "font-medium text-foreground"
                                          : "text-muted-foreground group-hover:text-foreground"
                                      )}>
                                        {item.label}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : route.href ? (
                      <Link href={route.href} className="block">
                        <div className={cn(
                          "rounded-lg border border-transparent",
                          "transition-all duration-200 group",
                          route.active
                            ? "bg-primary/5 border-primary/20"
                            : "hover:bg-accent/5 hover:border-accent/10",
                          isCollapsed ? "px-2 py-2" : "px-3.5 py-2.5"
                        )}>
                          <div className="flex items-center min-w-0 gap-3">
                            {route.icon && (
                              <div className={cn(
                                "p-1 rounded shrink-0",
                                route.active
                                  ? "bg-primary/10"
                                  : "bg-transparent group-hover:bg-accent/5"
                              )}>
                                <route.icon className={cn(
                                  "h-4 w-4",
                                  route.active
                                    ? "text-primary"
                                    : "text-muted-foreground group-hover:text-foreground"
                                )} />
                              </div>
                            )}
                            {!isCollapsed && (
                              <span className={cn(
                                "text-sm truncate",
                                route.active
                                  ? "font-medium text-foreground"
                                  : "text-muted-foreground group-hover:text-foreground"
                              )}>
                                {route.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ) : null}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
