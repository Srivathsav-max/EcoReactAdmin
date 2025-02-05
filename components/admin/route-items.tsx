"use client";

import { usePathname, useParams } from "next/navigation";
import { LucideIcon } from "lucide-react";
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
  FolderTree,
  FileQuestion,
  LayoutTemplate,
} from "lucide-react";

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

export function useRouteItems() {
  const pathname = usePathname();
  const params = useParams();

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
      items: [
        {
          label: "General Settings",
          href: `/${params.storeId}/settings`,
          active: pathname === `/${params.storeId}/settings`,
          icon: <Settings className="h-4 w-4" />
        },
        {
          label: "Staff Management",
          href: `/${params.storeId}/staff`,
          active: pathname === `/${params.storeId}/staff`,
          icon: <Users className="h-4 w-4" />
        },
        {
          label: "Roles & Permissions",
          href: `/${params.storeId}/roles`,
          active: pathname === `/${params.storeId}/roles`,
          icon: <Users className="h-4 w-4" />
        }
      ]
    },
  ];

  return routes;
}

export type { MenuItem, RouteItem };
