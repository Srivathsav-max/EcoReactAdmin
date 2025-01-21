"use client";

import Link from "next/link"
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Settings, 
  Package, 
  Users,
  Layers,
  Tags,
  Building2,
  Truck,
  ListChecks
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  active: boolean;
  icon?: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const params = useParams();

  const routes: NavGroup[] = [
    {
      label: "Overview",
      items: [
        {
          href: `/${params.storeId}`,
          label: 'Dashboard',
          active: pathname === `/${params.storeId}`,
          icon: <LayoutDashboard className="w-4 h-4 mr-2" />
        },
      ]
    },
    {
      label: "Catalog",
      items: [
        {
          href: `/${params.storeId}/products`,
          label: 'Products',
          active: pathname === `/${params.storeId}/products`,
          icon: <ShoppingBag className="w-4 h-4 mr-2" />
        },
        {
          href: `/${params.storeId}/variants`,
          label: 'Variants',
          active: pathname === `/${params.storeId}/variants`,
          icon: <Package className="w-4 h-4 mr-2" />
        },
        {
          href: `/${params.storeId}/brands`,
          label: 'Brands',
          active: pathname === `/${params.storeId}/brands`,
          icon: <Building2 className="w-4 h-4 mr-2" />
        },
        {
          href: `/${params.storeId}/suppliers`,
          label: 'Suppliers',
          active: pathname === `/${params.storeId}/suppliers`,
          icon: <Truck className="w-4 h-4 mr-2" />
        },
      ]
    },
    {
      label: "Attributes & Options",
      items: [
        {
          href: `/${params.storeId}/attributes`,
          label: 'Attributes',
          active: pathname === `/${params.storeId}/attributes`,
          icon: <ListChecks className="w-4 h-4 mr-2" />
        },
        {
          href: `/${params.storeId}/option-types`,
          label: 'Option Types',
          active: pathname === `/${params.storeId}/option-types`,
          icon: <Tags className="w-4 h-4 mr-2" />
        },
      ]
    },
    {
      label: "Organization",
      items: [
        {
          href: `/${params.storeId}/taxonomies`,
          label: 'Taxonomies',
          active: pathname === `/${params.storeId}/taxonomies`,
          icon: <Layers className="w-4 h-4 mr-2" />
        },
        {
          href: `/${params.storeId}/customers`,
          label: 'Customers',
          active: pathname === `/${params.storeId}/customers`,
          icon: <Users className="w-4 h-4 mr-2" />
        },
      ]
    },
    {
      label: "Settings",
      items: [
        {
          href: `/${params.storeId}/settings`,
          label: 'Store Settings',
          active: pathname === `/${params.storeId}/settings`,
          icon: <Settings className="w-4 h-4 mr-2" />
        },
      ]
    }
  ];

  return (
    <nav className="space-y-6" {...props}>
      {routes.map((group, index) => (
        <div key={index} className="space-y-2">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground px-4">
            {group.label}
          </h2>
          <div className="space-y-1">
            {group.items.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors',
                  route.active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
              >
                {route.icon}
                {route.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
};
