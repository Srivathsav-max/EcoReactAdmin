"use client";

import { Plus, Filter, ArrowUpDown, ArrowUp, ArrowDown, Package, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { columns, StockMovementColumn, StockMovementType } from "./columns";

const MOVEMENT_TYPES: { label: string; value: StockMovementType }[] = [
  { label: "Received", value: "received" },
  { label: "Shipped", value: "shipped" },
  { label: "Returned", value: "returned" },
  { label: "Adjustment", value: "adjustment" },
  { label: "Transfer In", value: "transfer_in" },
  { label: "Transfer Out", value: "transfer_out" },
  { label: "Damaged", value: "damaged" },
  { label: "Correction", value: "correction" },
];

interface StockMovementClientProps {
  data: StockMovementColumn[];
  stats: {
    totalStockValue: number;
    stockIn30Days: number;
    stockIn30DaysChange: number;
    stockOut30Days: number;
    stockOut30DaysChange: number;
    lowStockCount: number;
  };
}

export const StockMovementClient: React.FC<StockMovementClientProps> = ({
  data,
  stats
}) => {
  const router = useRouter();
  const params = useParams();
  const [selectedTypes, setSelectedTypes] = useState<StockMovementType[]>([]);

  const filteredData = selectedTypes.length > 0
    ? data.filter(item => selectedTypes.includes(item.type))
    : data;

  return (
    <>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">Total Stock Value</span>
                <span className="text-2xl font-bold">${stats.totalStockValue.toLocaleString()}</span>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">Stock In (30d)</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{stats.stockIn30Days}</span>
                  <Badge variant={stats.stockIn30DaysChange >= 0 ? "default" : "destructive"} className="flex items-center">
                    {stats.stockIn30DaysChange >= 0 ? (
                      <ArrowUp className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(stats.stockIn30DaysChange)}%
                  </Badge>
                </div>
              </div>
              <ArrowUpDown className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">Stock Out (30d)</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{stats.stockOut30Days}</span>
                  <Badge variant={stats.stockOut30DaysChange >= 0 ? "default" : "destructive"} className="flex items-center">
                    {stats.stockOut30DaysChange >= 0 ? (
                      <ArrowUp className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(stats.stockOut30DaysChange)}%
                  </Badge>
                </div>
              </div>
              <ArrowUpDown className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">Low Stock Items</span>
                <span className="text-2xl font-bold">{stats.lowStockCount}</span>
              </div>
              <Package className="h-8 w-8 text-destructive" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
        <div>
          <Heading
            title={`Stock Movements (${filteredData.length})`}
            description="View and manage stock movement history"
          />
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Showing {filteredData.length} of {data.length} total movements
            </p>
            {selectedTypes.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {selectedTypes.map((type) => (
                  <Badge 
                    key={type} 
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer hover:opacity-75"
                    onClick={() => setSelectedTypes(selectedTypes.filter(t => t !== type))}
                  >
                    {MOVEMENT_TYPES.find(t => t.value === type)?.label}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 flex-col sm:flex-row">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" /> 
            {selectedTypes.length > 0 ? `${selectedTypes.length} Selected` : "Filter Types"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Movement Types</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {MOVEMENT_TYPES.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type.value}
                  checked={selectedTypes.includes(type.value)}
                  onCheckedChange={(checked) => {
                    setSelectedTypes(
                      checked
                        ? [...selectedTypes, type.value]
                        : selectedTypes.filter((t) => t !== type.value)
                    );
                  }}
                >
                  {type.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => router.push(`/${params.storeId}/stock-movements/new`)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Movement
          </Button>
        </div>
      </div>
      <Separator className="my-4" />
      <DataTable
        searchKey="productName"
        columns={columns}
        data={filteredData}
      />
      </Card>
    </>
  );
};
