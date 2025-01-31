"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type StockMovementType = 
  | "received"
  | "shipped"
  | "returned"
  | "adjustment"
  | "transfer_in"
  | "transfer_out"
  | "damaged"
  | "correction";

export type StockMovementColumn = {
  id: string;
  productName: string;
  variantName: string;
  color: string;
  size: string;
  quantity: number;
  type: StockMovementType;
  reason: string | null;
  originatorId: string | null;
  originatorType: string | null;
  createdAt: string;
};

const getTypeStyle = (type: StockMovementType) => {
  const style = {
    color: "default" as "default" | "destructive" | "secondary" | "outline",
    ...typeStyles[type]
  };

  switch (type) {
    case "received":
    case "returned":
    case "transfer_in":
      style.color = "default" as const;
      break;
    case "shipped":
    case "transfer_out":
    case "damaged":
      style.color = "destructive" as const;
      break;
    case "adjustment":
      style.color = "default" as const;
      break;
    case "correction":
      style.color = "secondary" as const;
      break;
  }

  return style;
};

const typeStyles: Record<StockMovementType, { icon: string; description: string }> = {
  received: { icon: "📦", description: "Stock received from supplier" },
  shipped: { icon: "🚚", description: "Stock shipped to customer" },
  returned: { icon: "↩️", description: "Stock returned by customer" },
  adjustment: { icon: "⚖️", description: "Manual stock adjustment" },
  transfer_in: { icon: "⬇️", description: "Stock transferred from another location" },
  transfer_out: { icon: "⬆️", description: "Stock transferred to another location" },
  damaged: { icon: "⚠️", description: "Stock marked as damaged/unsellable" },
  correction: { icon: "🔧", description: "Correction to fix inventory discrepancy" }
};

export const columns: ColumnDef<StockMovementColumn>[] = [
  {
    accessorKey: "productName",
    header: "Product",
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="flex flex-col">
              <span className="font-medium">{row.original.productName}</span>
              <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                {row.original.variantName}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div>
              <div className="font-medium">{row.original.productName}</div>
              <div className="text-sm">{row.original.variantName}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: "attributes",
    header: "Attributes",
    cell: ({ row }) => (
      <div className="flex gap-2">
        {row.original.color && (
          <Badge variant="outline">{row.original.color}</Badge>
        )}
        {row.original.size && (
          <Badge variant="outline">{row.original.size}</Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => (
      <span className={row.original.quantity > 0 ? "text-green-600" : "text-red-600"}>
        {row.original.quantity > 0 ? "+" : ""}{row.original.quantity}
      </span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center gap-2">
              <span>{typeStyles[row.original.type].icon}</span>
              <Badge 
                variant={getTypeStyle(row.original.type).color}
                className={cn(
                  "capitalize",
                  row.original.type.includes("out") && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
                  row.original.type.includes("in") && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
                  (row.original.type === "correction" || row.original.type === "adjustment") && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                )}
              >
                {row.original.type.replace("_", " ")}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{typeStyles[row.original.type].description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="flex flex-col gap-1 max-w-[200px]">
              {row.original.reason && (
                <span className="text-sm truncate">{row.original.reason}</span>
              )}
              <div className="flex items-center gap-2">
                {row.original.originatorType && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {row.original.originatorType}
                  </Badge>
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-2">
              {row.original.reason && (
                <p className="text-sm">{row.original.reason}</p>
              )}
              {row.original.originatorType && (
                <p className="text-sm">By: {row.original.originatorType}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>
        <span className="text-xs text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleTimeString()}
        </span>
      </div>
    ),
  },
];
