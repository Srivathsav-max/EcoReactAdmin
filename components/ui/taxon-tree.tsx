"use client";

import { Taxon } from "@prisma/client";
import { ChevronRight, Plus, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface TaxonWithChildren extends Taxon {
  children?: TaxonWithChildren[];
}

interface TaxonTreeProps {
  taxon: TaxonWithChildren;
  level?: number;
  onSelect?: (taxon: Taxon) => void;
  onAddChild?: (parentId: string) => void;
  selectedId?: string;
  products?: any[];
}

export const TaxonTree: React.FC<TaxonTreeProps> = ({
  taxon,
  level = 0,
  onSelect,
  onAddChild,
  selectedId,
  products = []
}) => {
  // Move all hooks to the top
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Then add the safety check
  if (level > 100) {
    console.warn('Maximum nesting level reached');
    return null;
  }

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
          "flex items-center gap-2 p-2 rounded-md transition-all group relative",
          "hover:bg-slate-100 dark:hover:bg-slate-800",
          "border border-transparent hover:border-slate-200 dark:hover:border-slate-700",
          isSelected && "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
          level > 0 && [
            "ml-4",
            "before:absolute before:left-[-1.75rem] before:top-[50%] before:w-6 before:h-px",
            "before:bg-slate-200 dark:before:bg-slate-700",
            "after:absolute after:left-[-1.75rem] after:top-[-1rem] after:bottom-1/2 after:w-px",
            "after:bg-slate-200 dark:after:bg-slate-700",
            "last:after:bottom-auto last:after:height-[50%]"
          ]
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
              className={cn(
                "p-0 h-6 w-6",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                "hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform",
                "text-slate-600 dark:text-slate-400",
                isExpanded && "rotate-90"
              )} />
            </Button>
          )}
        </div>
        <div 
          onClick={() => onSelect?.(taxon)}
          className="flex-1 flex items-center cursor-pointer min-h-[2rem]"
        >
          <span className="text-sm font-medium dark:text-slate-100">{taxon.name}</span>
          {productCount > 0 && (
            <span className={cn(
              "text-xs ml-2 px-2 py-1 rounded-full",
              "bg-slate-100 dark:bg-slate-800",
              "text-slate-600 dark:text-slate-400"
            )}>
              {productCount}
            </span>
          )}
          {taxon.description && (
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 truncate">
              - {taxon.description}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddChild?.(taxon.id);
            }}
            className={cn(
              "h-8 w-8 p-0",
              "hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            <Plus className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(taxon);
            }}
            className={cn(
              "h-8 w-8 p-0",
              "hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </Button>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className={cn(
          "pl-4 space-y-1 mt-1 relative",
          "before:absolute before:left-3 before:top-0 before:bottom-4 before:w-px",
          "before:bg-slate-200 dark:before:bg-slate-700"
        )}>
          {sortedChildren?.map((child) => (
            <TaxonTree
              key={child.id}
              taxon={child}
              level={level + 1}
              onSelect={onSelect}
              onAddChild={onAddChild}
              selectedId={selectedId}
              products={products}
            />
          ))}
        </div>
      )}
    </div>
  );
};
