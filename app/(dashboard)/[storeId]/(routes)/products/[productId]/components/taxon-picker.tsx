"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { Taxonomy, Taxon } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface TaxonWithChildren extends Taxon {
  children?: TaxonWithChildren[];
}

interface TaxonomyWithTaxons extends Taxonomy {
  taxons: TaxonWithChildren[];
}

interface TaxonPickerProps {
  taxonomies: TaxonomyWithTaxons[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export const TaxonPicker: React.FC<TaxonPickerProps> = ({
  taxonomies,
  value,
  onChange,
  disabled
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTaxons, setExpandedTaxons] = useState<{ [key: string]: boolean }>({});

  // Get all selected taxons with their parents
  const getAllParentIds = (taxonId: string, depth = 0): string[] => {
    if (depth > 100) return []; // Prevent infinite recursion
    const result: string[] = [];
    
    const findParent = (id: string, currentDepth: number) => {
      if (currentDepth > 100) return; // Safety check
      const parent = findTaxonWithParent(taxonomies, id);
      if (parent?.parentId) {
        result.push(parent.parentId);
        findParent(parent.parentId, currentDepth + 1);
      }
    };

    findParent(taxonId, 0);
    return result;
  };

  // Get all child ids for a given taxon
  const getAllChildIds = (taxon: Taxon & { children?: Taxon[] }): string[] => {
    const childIds: string[] = [];
    if (!taxon.children) return childIds;

    for (const child of taxon.children) {
      childIds.push(child.id);
      childIds.push(...getAllChildIds(child));
    }
    return childIds;
  };

  const handleTaxonSelect = (taxonId: string, isSelected: boolean, taxonomy: Taxonomy) => {
    if (isSelected) {
      // Remove the taxon and all its children
      const childIds = getAllChildIds(findTaxonById(taxonomies, taxonId) as any);
      onChange(value.filter(id => id !== taxonId && !childIds.includes(id)));
    } else {
      // Prevent selecting if a parent is already selected in the same taxonomy
      const parentIds = getAllParentIds(taxonId);
      if (parentIds.some(id => value.includes(id))) {
        return;
      }

      // Prevent selecting if any children are already selected in the same taxonomy
      const taxon = findTaxonById(taxonomies, taxonId);
      if (taxon) {
        const childIds = getAllChildIds(taxon);
        if (childIds.some(id => value.includes(id))) {
          return;
        }
      }

      // Add the taxon
      onChange([...value, taxonId]);
    }
  };

  const buttonText = value.length > 0
    ? "Add more classifications..."
    : "Select classifications...";

  // Improved search function that considers taxonomy context
  const searchTaxons = (taxons: any[], query: string, taxonomyName: string): any[] => {
    if (!query) return taxons;

    return taxons.reduce((acc: any[], taxon: any) => {
      // Include taxonomy name in search to differentiate between similar names
      const searchText = `${taxonomyName} > ${getFullPath(taxon)}${taxon.name}`.toLowerCase();
      const matchesSearch = searchText.includes(query.toLowerCase());
      
      let result: any[] = [];
      
      if (matchesSearch) {
        result.push({
          ...taxon,
          children: taxon.children ? searchTaxons(taxon.children, '', taxonomyName) : undefined
        });
      } else if (taxon.children) {
        const matchingChildren = searchTaxons(taxon.children, query, taxonomyName);
        if (matchingChildren.length > 0) {
          result.push({
            ...taxon,
            children: matchingChildren
          });
        }
      }

      return [...acc, ...result];
    }, []);
  };

  // Get full path including taxonomy
  const getFullPath = (taxon: Taxon & { children?: Taxon[] }): string => {
    const taxonomy = findTaxonomyByTaxonId(taxonomies, taxon.id);
    const path = getParentPath(taxon);
    return path ? `${path} > ` : '';
  };

  const toggleTaxonExpand = (taxonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTaxons(prev => ({
      ...prev,
      [taxonId]: !prev[taxonId]
    }));
  };

  const renderTaxonGroup = (taxon: Taxon & { children?: Taxon[] }, level = 0, taxonomy: Taxonomy) => {
    if (!taxon) return null;
    
    const uniqueId = `${taxonomy.id}-${taxon.id}`;  // Create unique identifier
    const isSelected = value.includes(taxon.id);
    const hasChildren = taxon.children && taxon.children.length > 0;
    const hasSelectedParent = getAllParentIds(taxon.id).some(id => value.includes(id));
    const isExpanded = expandedTaxons[uniqueId];  // Use unique identifier for expansion state
    
    if (hasSelectedParent) return null;

    const fullPath = getFullPath(taxon);

    return (
      <div key={uniqueId} className="relative">
        <CommandItem
          className={cn(
            "flex items-center w-full",
            "pl-[calc(12px_*_var(--level))]",
            { "pl-6": level === 0 }
          )}
          style={{ "--level": level } as any}
          onSelect={() => handleTaxonSelect(taxon.id, isSelected, taxonomy)}
        >
          <div className="flex items-center flex-1 min-h-[32px] gap-2">
            {hasChildren && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedTaxons(prev => ({
                    ...prev,
                    [uniqueId]: !prev[uniqueId]
                  }));
                }}
              >
                <ChevronRight 
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isExpanded && "rotate-90"
                  )} 
                />
              </Button>
            )}
            <Check
              className={cn(
                "h-4 w-4",
                isSelected ? "opacity-100" : "opacity-0"
              )}
            />
            <div className="flex flex-col flex-1">
              <span className="text-xs text-muted-foreground">
                {taxonomy.name}
              </span>
              <span className="truncate">
                {fullPath}{taxon.name}
              </span>
            </div>
          </div>
        </CommandItem>
        {hasChildren && isExpanded && (
          <div className={cn(
            "ml-4 border-l border-slate-200 dark:border-slate-700",
            "pl-2 mt-1"
          )}>
            {taxon.children?.map(child => 
              renderTaxonGroup(child, level + 1, taxonomy)
            )}
          </div>
        )}
      </div>
    );
  };

  // Helper function to get the full path of parents
  const getParentPath = (taxon: Taxon): string => {
    let path = '';
    let current = taxon;
    
    while (current.parentId) {
      const parent = findTaxonById(taxonomies, current.parentId);
      if (parent) {
        path = `${parent.name} / ${path}`;
        current = parent;
      } else {
        break;
      }
    }
    
    return path;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value.length && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          {buttonText}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[400px] p-0" 
        align="start"
        side="bottom"
        sideOffset={8}
      >
        <Command>
          <CommandInput 
            placeholder="Search classifications..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty>No classifications found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {taxonomies.map(taxonomy => (
              <div key={taxonomy.id} className="mb-2">
                <h4 className="px-2 py-1 text-xs font-medium text-muted-foreground bg-slate-50 dark:bg-slate-900 sticky top-0">
                  {taxonomy.name}
                </h4>
                {searchTaxons(taxonomy.taxons, searchQuery, taxonomy.name).map(taxon => 
                  renderTaxonGroup(taxon, 0, taxonomy)
                )}
              </div>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// Helper functions
const findTaxonWithParent = (taxonomies: any[], id: string): Taxon | null => {
  for (const taxonomy of taxonomies) {
    for (const taxon of taxonomy.taxons) {
      const found = findTaxonInHierarchyWithParent(taxon, id);
      if (found) return found;
    }
  }
  return null;
};

const findTaxonInHierarchyWithParent = (taxon: any, id: string): Taxon | null => {
  if (taxon.id === id) return taxon;
  if (!taxon.children) return null;
  
  for (const child of taxon.children) {
    const found = findTaxonInHierarchyWithParent(child, id);
    if (found) return found;
  }
  return null;
};

const findTaxonById = (taxonomies: any[], id: string): Taxon | null => {
  for (const taxonomy of taxonomies) {
    const found = findTaxonInHierarchy(taxonomy.taxons, id);
    if (found) return found;
  }
  return null;
};

const findTaxonInHierarchy = (taxons: any[], id: string): Taxon | null => {
  for (const taxon of taxons) {
    if (taxon.id === id) return taxon;
    if (taxon.children) {
      const found = findTaxonInHierarchy(taxon.children, id);
      if (found) return found;
    }
  }
  return null;
};

const findTaxonomyByTaxonId = (taxonomies: any[], id: string): Taxonomy | null => {
  for (const taxonomy of taxonomies) {
    const found = findTaxonInHierarchy(taxonomy.taxons, id);
    if (found) return taxonomy;
  }
  return null;
};

// Add memoization to prevent redundant recursion
const memoizedFindTaxonById = (() => {
  const cache = new Map<string, Taxon | null>();
  return (taxonomies: any[], id: string): Taxon | null => {
    if (cache.has(id)) return cache.get(id) ?? null;
    const result = findTaxonById(taxonomies, id);
    cache.set(id, result);
    return result;
  };
})();