"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TaxonNode {
  id: string;
  name: string;
  children?: TaxonNode[];
}

interface NestedTaxonMenuProps {
  taxons: TaxonNode[];
  domain: string;
  level?: number;
}

export const NestedTaxonMenu: React.FC<NestedTaxonMenuProps> = ({
  taxons,
  domain,
  level = 0
}) => {
  return (
    <div className={cn(
      "grid gap-3",
      level === 0 ? "grid-cols-2" : "grid-cols-1 pl-4"
    )}>
      {taxons.map((taxon) => (
        <div key={taxon.id} className="space-y-1">
          <Link
            href={`/store/${domain}/category/${taxon.id}`}
            className="flex items-center justify-between rounded-md p-2 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          >
            <span className={cn(
              "text-sm font-medium leading-none",
              level > 0 && "text-muted-foreground"
            )}>
              {taxon.name}
            </span>
            {((taxon.children?.length ?? 0) > 0 || level === 0) && (
              <ChevronRight className="ml-2 h-4 w-4 opacity-50" />
            )}
          </Link>
          {taxon.children && taxon.children.length > 0 && (
            <div className="pt-1">
              <NestedTaxonMenu
                taxons={taxon.children}
                domain={domain}
                level={level + 1}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
