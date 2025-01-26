"use client"

import { useState } from "react"
import { Plus, Trash } from "lucide-react"
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

export interface Property {
  id: string
  name: string
  value: string
  productId: string
}

interface PropertiesManagerProps {
  properties: Property[]
}

export const PropertiesManager: React.FC<PropertiesManagerProps> = ({
  properties: initialProperties
}) => {
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>(initialProperties)
  const [newProperty, setNewProperty] = useState({ name: "", value: "" })

  const handleAddProperty = async () => {
    try {
      setLoading(true)
      if (!newProperty.name || !newProperty.value) {
        toast.error("Name and value are required")
        return
      }

      const response = await axios.post(`/api/${params.storeId}/products/${params.productId}/properties`, newProperty)
      
      setProperties([...properties, response.data])
      setNewProperty({ name: "", value: "" })
      toast.success("Property added successfully")
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/products/${params.productId}/properties/${propertyId}`)
      
      setProperties(properties.filter(p => p.id !== propertyId))
      toast.success("Property deleted successfully")
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Property name"
          value={newProperty.name}
          onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
          disabled={loading}
        />
        <Input
          placeholder="Property value"
          value={newProperty.value}
          onChange={(e) => setNewProperty({ ...newProperty, value: e.target.value })}
          disabled={loading}
        />
        <Button
          onClick={handleAddProperty}
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property.id}>
              <TableCell>{property.name}</TableCell>
              <TableCell>{property.value}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteProperty(property.id)}
                  disabled={loading}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {properties.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No properties found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}