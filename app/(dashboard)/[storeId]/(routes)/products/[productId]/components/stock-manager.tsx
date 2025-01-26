"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"

import { StockItem, StockManagerVariant } from './types';

interface StockManagerProps {
  variants: StockManagerVariant[]
}

export const StockManager: React.FC<StockManagerProps> = ({
  variants
}) => {
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [quantities, setQuantities] = useState<{[key: string]: number}>({})

  const handleStockChange = async (variantId: string, stockItemId: string, type: 'add' | 'subtract') => {
    try {
      setLoading(true)
      const quantity = quantities[variantId] || 1

      await axios.post(`/api/${params.storeId}/stock-movements`, {
        variantId,
        stockItemId,
        quantity,
        type
      })

      toast.success('Stock updated successfully')
      // You might want to refresh the page or update the local state here
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Variant</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Stock On Hand</TableHead>
            <TableHead>Backorderable</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((variant) => (
            <TableRow key={variant.id}>
              <TableCell>{variant.name}</TableCell>
              <TableCell>{variant.sku}</TableCell>
              <TableCell>{variant.stockItems[0]?.count || 0}</TableCell>
              <TableCell>
                {variant.stockItems[0]?.backorderable ? "Yes" : "No"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      className="w-20"
                      value={quantities[variant.id] || 1}
                      onChange={(e) => setQuantities({
                        ...quantities,
                        [variant.id]: parseInt(e.target.value)
                      })}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStockChange(
                        variant.id,
                        variant.stockItems[0]?.id,
                        'add'
                      )}
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStockChange(
                        variant.id,
                        variant.stockItems[0]?.id,
                        'subtract'
                      )}
                      disabled={loading}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}