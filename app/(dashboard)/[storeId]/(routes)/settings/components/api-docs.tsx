"use client";

import { ApiAlert } from "@/components/ui/api-alert";
import { useOrigin } from "@/hooks/use-origin";
import { useParams } from "next/navigation";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ApiDocs = () => {
  const params = useParams();
  const origin = useOrigin();
  const baseUrl = `${origin}/api/${params.storeId}`;

  return (
    <div className="space-y-6">
      <Heading title="API Documentation" description="Endpoints available for your store" />
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle>Taxonomies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ApiAlert 
            title="GET /taxonomies" 
            variant="public" 
            description={`${baseUrl}/taxonomies`}
          />
          <p className="text-sm text-muted-foreground">
            Returns all taxonomies with their complete hierarchy and products
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ApiAlert 
            title="GET /products" 
            variant="public" 
            description={`${baseUrl}/products?taxonId={id}&isFeatured=true&colorId={id}&sizeId={id}`}
          />
          <p className="text-sm text-muted-foreground">
            Returns filtered products. All query parameters are optional.
          </p>

          <ApiAlert 
            title="GET /products/{productId}" 
            variant="public" 
            description={`${baseUrl}/products/{productId}`}
          />
          <p className="text-sm text-muted-foreground">
            Returns detailed information about a specific product
          </p>

          <ApiAlert 
            title="GET /products/{productId}/related" 
            variant="public" 
            description={`${baseUrl}/products/{productId}/related`}
          />
          <p className="text-sm text-muted-foreground">
            Returns up to 4 related products based on shared taxonomies
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Store</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ApiAlert 
            title="GET /store" 
            variant="public" 
            description={`${baseUrl}/store`}
          />
          <p className="text-sm text-muted-foreground">
            Returns basic store information
          </p>
          <div className="text-xs text-muted-foreground mt-2">
            Example Response:
            <pre className="mt-2 bg-slate-950 p-4 rounded-md">
              {JSON.stringify({
                id: "store_id",
                name: "Store Name",
                userId: "user_id",
                createdAt: "2023-01-01T00:00:00.000Z",
                updatedAt: "2023-01-01T00:00:00.000Z"
              }, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
