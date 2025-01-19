"use client";

import { Taxon } from "@prisma/client";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface TaxonTreeProps {
  taxon: Taxon & {
    children?: (Taxon & {
      children?: (Taxon & {
        children?: Taxon[];
      })[];
    })[];
  };
  level?: number;
  onSelect?: (taxon: Taxon) => void;
  selectedId?: string;
  products?: any[];
}

export const TaxonTree: React.FC<TaxonTreeProps> = ({
  taxon,
  level = 0,
  onSelect,
  selectedId,
  products = []
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = taxon.children && taxon.children.length > 0;
  const isSelected = selectedId === taxon.id;

  // Sort function for children
  const sortChildren = (children: any[]) => {
    return children?.sort((a, b) => {
      if (a.position !== b.position) {
        return a.position - b.position;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  // Get all descendants for product count
  const getAllDescendantIds = (taxon: any): string[] => {
    let ids = [taxon.id];
    if (taxon.children) {
      taxon.children.forEach((child: any) => {
        ids = [...ids, ...getAllDescendantIds(child)];
      });
    }
    return ids;
  };

  // Calculate product count including children
  const productCount = products.filter(
    product => product.taxons?.some((t: any) => 
      getAllDescendantIds(taxon).includes(t.id)
    )
  ).length;

  const sortedChildren = sortChildren(taxon.children || []);

  return (
    <div className="w-full">
      <div 
        className={cn(
          "flex items-center gap-2 p-2 hover:bg-slate-100 rounded-md transition-colors group",
          isSelected && "bg-slate-100",
          level > 0 && "ml-4"
        )}
      >
        <div className="flex-shrink-0 w-6">
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-90"
              )} />
            </Button>
          )}
        </div>
        <div 
          onClick={() => onSelect?.(taxon)}
          className="flex-1 flex items-center cursor-pointer"
        >
          <span className="text-sm font-medium">{taxon.name}</span>
          {productCount > 0 && (
            <span className="text-sm text-muted-foreground ml-2">
              ({productCount})
            </span>
          )}
          {taxon.description && (
            <span className="text-sm text-muted-foreground ml-2 truncate">
              - {taxon.description}
            </span>
          )}
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="pl-4 space-y-1 mt-1">
          {sortedChildren?.map((child) => (
            <TaxonTree
              key={child.id}
              taxon={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
              products={products}
            />
          ))}
        </div>
      )}
    </div>
  );
};
