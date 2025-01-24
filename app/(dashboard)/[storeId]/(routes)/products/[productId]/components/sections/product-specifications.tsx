"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronRight, X, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ProductSpecificationsProps } from "./types";
import { useState } from "react";
import { NavigationTaxonomy, TaxonNode } from "@/types/models";

interface ProcessedTaxon extends TaxonNode {
  fullPath: string;
  level: number;
  children: ProcessedTaxon[];
  taxonomyName: string;
  parent?: ProcessedTaxon;
}

interface ProcessedTaxonomy extends Omit<NavigationTaxonomy, 'taxons'> {
  taxons: ProcessedTaxon[];
  _count?: { taxons: number };
}

export const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({
  loading,
  form,
  taxonomies
}) => {
  const [expandedTaxons, setExpandedTaxons] = useState<Set<string>>(new Set());
  
  // Helper to get all parent taxon IDs
  const getParentTaxonIds = (taxon: ProcessedTaxon): string[] => {
    const parents: string[] = [];
    let current = taxon.parent;
    while (current) {
      parents.push(current.id);
      current = current.parent;
    }
    return parents;
  };

  // Helper to get all child taxon IDs recursively
  const getChildTaxonIds = (taxon: ProcessedTaxon): string[] => {
    const children: string[] = [];
    const traverse = (node: ProcessedTaxon) => {
      node.children.forEach(child => {
        children.push(child.id);
        traverse(child);
      });
    };
    traverse(taxon);
    return children;
  };

  const toggleTaxon = (id: string) => {
    setExpandedTaxons(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleTaxonSelect = (taxon: ProcessedTaxon, isSelected: boolean, field: any) => {
    const currentValues = new Set(field.value || []);
    
    if (isSelected) {
      // Deselection: Remove this taxon and all its children
      const childIds = getChildTaxonIds(taxon);
      [taxon.id, ...childIds].forEach(id => currentValues.delete(id));
    } else {
      // Selection: Add this taxon and all its parents
      const parentIds = getParentTaxonIds(taxon);
      [taxon.id, ...parentIds].forEach(id => currentValues.add(id));
    }
    
    field.onChange(Array.from(currentValues));
  };
  // Helper to process taxonomy data
  const processTaxonomy = (taxonomy: NavigationTaxonomy): ProcessedTaxonomy => {
    const processTaxon = (
      taxon: TaxonNode,
      level: number,
      parent?: ProcessedTaxon
    ): ProcessedTaxon => {
      const processed: ProcessedTaxon = {
        ...taxon,
        fullPath: `${taxonomy.name}: ${taxon.name}`,
        level,
        taxonomyName: taxonomy.name,
        children: [],
        parent
      };

      if (taxon.children?.length) {
        processed.children = taxon.children.map(child =>
          processTaxon(child, level + 1, processed)
        );
      }

      return processed;
    };

    return {
      ...taxonomy,
      taxons: taxonomy.taxons.map(taxon => processTaxon(taxon, 0))
    };
  };

  const processedTaxonomies = taxonomies.map(processTaxonomy);

  // Helper to find a taxon by ID across all taxonomies
  const findTaxonById = (id: string): ProcessedTaxon | undefined => {
    let found: ProcessedTaxon | undefined;
    
    const searchInTaxons = (taxons: ProcessedTaxon[]) => {
      for (const taxon of taxons) {
        if (taxon.id === id) {
          found = taxon;
          return;
        }
        if (taxon.children.length) {
          searchInTaxons(taxon.children);
          if (found) return;
        }
      }
    };

    processedTaxonomies.forEach(taxonomy => {
      searchInTaxons(taxonomy.taxons);
      if (found) return;
    });

    return found;
  };

  // Helper to get display path
  const getDisplayPath = (taxon: ProcessedTaxon): string => {
    const parts = [taxon.name];
    let current = taxon.parent;
    
    while (current) {
      parts.unshift(current.name);
      current = current.parent;
    }

    return `${taxon.taxonomyName}: ${parts.join(' > ')}`;
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {/* Dimension fields */}
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  disabled={loading} 
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Height (cm)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.1" 
                  disabled={loading} 
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="width"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Width (cm)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.1" 
                  disabled={loading} 
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="depth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Depth (cm)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.1" 
                  disabled={loading} 
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <FormField
          control={form.control}
          name="minimumQuantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Order Quantity</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  disabled={loading} 
                  min={1} 
                  {...field}
                  value={field.value || 1}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="maximumQuantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Order Quantity</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  disabled={loading} 
                  min={1} 
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="taxRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax Rate (%)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  disabled={loading} 
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Taxonomies */}
      <div className="mt-8">
        <FormField
          control={form.control}
          name="taxons"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Taxonomies & Categories</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Selected Categories</h4>
                      {(field.value || []).length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {(field.value as string[]).length} selected
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[24px]">
                      {(field.value || []).length > 0 ? (
                        (field.value as string[]).map((taxonId: string) => {
                          const taxon = findTaxonById(taxonId);
                          return taxon ? (
                            <Badge
                              key={taxon.id}
                              variant="secondary"
                              className="flex items-center gap-1 py-1.5 px-3 text-sm"
                            >
                              <span className="truncate max-w-[300px]">
                                {getDisplayPath(taxon)}
                              </span>
                              <button
                                type="button"
                                className="ml-1 rounded-full hover:bg-destructive/20 p-1"
                                onClick={() => handleTaxonSelect(taxon, true, field)}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ) : null;
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground">No categories selected</p>
                      )}
                    </div>
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Categories
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[600px] p-0" align="start">
                      <Command className="rounded-lg">
                        <CommandInput
                          placeholder="Search categories..."
                          className="border-none focus:ring-0"
                        />
                        <div className="max-h-[400px] overflow-y-auto p-2 space-y-2">
                          {processedTaxonomies.map((taxonomy) => {
                            const renderTaxons = (taxons: ProcessedTaxon[]) => {
                              return taxons.map((taxon) => {
                                const selectedValues = new Set(field.value || []);
                                const isSelected = selectedValues.has(taxon.id);
                                const hasChildren = taxon.children?.length > 0;
                                const indent = taxon.level * 24;

                                // Check if any children are selected
                                const hasSelectedChildren = hasChildren &&
                                  taxon.children.some(child =>
                                    selectedValues.has(child.id) ||
                                    getChildTaxonIds(child).some(id => selectedValues.has(id))
                                  );
                                
                                // Check if all children are selected
                                const allChildrenSelected = hasChildren &&
                                  taxon.children.every(child =>
                                    selectedValues.has(child.id) &&
                                    getChildTaxonIds(child).every(id => selectedValues.has(id))
                                  );

                                return (
                                  <div key={taxon.id} className="relative">
                                    {/* Tree line connectors */}
                                    {taxon.level > 0 && (
                                      <div
                                        className="absolute border-l border-dashed border-border"
                                        style={{
                                          left: `${(taxon.level * 24) - 12}px`,
                                          top: 0,
                                          bottom: hasChildren ? '50%' : '100%',
                                          width: '1px'
                                        }}
                                      />
                                    )}
                                    {taxon.level > 0 && (
                                      <div
                                        className="absolute border-t border-dashed border-border"
                                        style={{
                                          left: `${(taxon.level * 24) - 12}px`,
                                          width: '12px',
                                          top: '50%'
                                        }}
                                      />
                                    )}
                                    
                                    <CommandItem
                                      onSelect={() => handleTaxonSelect(taxon, isSelected, field)}
                                      className={cn(
                                        "flex items-center gap-2 py-2 rounded-md transition-colors relative",
                                        "hover:bg-accent/50",
                                        isSelected && "bg-accent",
                                        hasSelectedChildren && !isSelected && "bg-accent/30",
                                        allChildrenSelected && !isSelected && "bg-accent/50"
                                      )}
                                      style={{ marginLeft: `${indent}px` }}
                                    >
                                      <div className="flex items-center gap-2 min-w-0 group">
                                        {hasChildren ? (
                                          <button
                                            type="button"
                                            className="w-4 h-4 flex items-center justify-center"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleTaxon(taxon.id);
                                            }}
                                          >
                                            <ChevronRight
                                              className={cn(
                                                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:text-primary",
                                                expandedTaxons.has(taxon.id) && "rotate-90"
                                              )}
                                            />
                                          </button>
                                        ) : (
                                          <div className="w-4 h-4 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                                          </div>
                                        )}
                                        <div
                                          className={cn(
                                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                                            isSelected ? "bg-primary border-primary text-primary-foreground" :
                                            hasSelectedChildren ? "bg-primary/30 border-primary/30" :
                                            "border-muted group-hover:border-primary/50"
                                          )}
                                        >
                                          {isSelected && <Check className="h-3 w-3" />}
                                          {!isSelected && hasSelectedChildren && (
                                            <div className="h-2 w-2 bg-primary rounded-sm" />
                                          )}
                                        </div>
                                        <div className="flex-1 truncate">
                                          <span className={cn(
                                            "text-sm transition-colors",
                                            isSelected ? "font-medium text-primary" : "group-hover:text-primary"
                                          )}>
                                            {taxon.name}
                                          </span>
                                          {hasChildren && (
                                            <span className="ml-1.5 text-xs text-muted-foreground">
                                              ({taxon.children.length})
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </CommandItem>
                                    {hasChildren && (
                                      <div className={cn(
                                        "overflow-hidden transition-all duration-300",
                                        expandedTaxons.has(taxon.id) ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                                      )}>
                                        <div className="pt-1">
                                          {renderTaxons(taxon.children)}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              });
                            };

                            return (
                              <CommandGroup
                                key={taxonomy.id}
                                heading={
                                  <div className="flex flex-col space-y-1.5 px-2 py-3 bg-muted/40 rounded-md mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="h-6 w-1 bg-primary rounded-full" />
                                      <div className="flex-1">
                                        <div className="flex items-baseline justify-between">
                                          <span className="font-semibold">
                                            {taxonomy.name}
                                          </span>
                                          <Badge variant="outline" className="font-normal text-xs">
                                            {taxonomy.taxons.length} taxons
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          Click items to expand sub-categories
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                }
                                className="mb-6 [&>h3]:px-0"
                              >
                                {renderTaxons(taxonomy.taxons)}
                              </CommandGroup>
                            );
                          })}
                        </div>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};