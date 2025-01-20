"use client";

import { useOrigin } from "@/hooks/use-origin";
import { useParams } from "next/navigation";
import { ApiAlert } from "@/components/ui/api-alert";
import { Separator } from "@/components/ui/separator";

interface ApiListProps {
  entityName: "taxonomies" | "taxons" | "products" | "billboards" | "colors" | "sizes";
  entityIdName?: string;
}

export const ApiList: React.FC<ApiListProps> = ({
  entityName,
  entityIdName = "id"
}) => {
  const params = useParams();
  const origin = useOrigin();
  const baseUrl = `${origin}/api/${params.storeId}`;

  const routes = {
    taxonomies: [
      {
        title: "GET",
        description: `${baseUrl}/taxonomies`,
        variant: "public"
      },
      {
        title: "GET BY ID",
        description: `${baseUrl}/taxonomies/{${entityIdName}}`,
        variant: "public"
      },
      {
        title: "POST",
        description: `${baseUrl}/taxonomies`,
        variant: "admin"
      },
      {
        title: "PATCH",
        description: `${baseUrl}/taxonomies/{${entityIdName}}`,
        variant: "admin"
      },
      {
        title: "DELETE",
        description: `${baseUrl}/taxonomies/{${entityIdName}}`,
        variant: "admin"
      }
    ],
    taxons: [
      {
        title: "GET",
        description: `${baseUrl}/taxons`,
        variant: "public"
      },
      {
        title: "GET BY ID",
        description: `${baseUrl}/taxons/{${entityIdName}}`,
        variant: "public"
      },
      {
        title: "POST",
        description: `${baseUrl}/taxons`,
        variant: "admin"
      },
      {
        title: "PATCH",
        description: `${baseUrl}/taxons/{${entityIdName}}`,
        variant: "admin"
      },
      {
        title: "DELETE",
        description: `${baseUrl}/taxons/{${entityIdName}}`,
        variant: "admin"
      }
    ],
    products: [
      {
        title: "GET",
        description: `${baseUrl}/products`,
        variant: "public"
      },
      {
        title: "GET BY ID",
        description: `${baseUrl}/products/{${entityIdName}}`,
        variant: "public"
      },
      {
        title: "POST",
        description: `${baseUrl}/products`,
        variant: "admin"
      },
      {
        title: "PATCH",
        description: `${baseUrl}/products/{${entityIdName}}`,
        variant: "admin"
      },
      {
        title: "DELETE",
        description: `${baseUrl}/products/{${entityIdName}}`,
        variant: "admin"
      }
    ],
    billboards: [
      {
        title: "GET",
        description: `${baseUrl}/billboards`,
        variant: "public"
      },
      {
        title: "GET BY ID",
        description: `${baseUrl}/billboards/{${entityIdName}}`,
        variant: "public"
      },
      {
        title: "POST",
        description: `${baseUrl}/billboards`,
        variant: "admin"
      },
      {
        title: "PATCH",
        description: `${baseUrl}/billboards/{${entityIdName}}`,
        variant: "admin"
      },
      {
        title: "DELETE",
        description: `${baseUrl}/billboards/{${entityIdName}}`,
        variant: "admin"
      }
    ],
    colors: [
      {
        title: "GET",
        description: `${baseUrl}/colors`,
        variant: "public"
      },
      {
        title: "GET BY ID",
        description: `${baseUrl}/colors/{${entityIdName}}`,
        variant: "public"
      },
      {
        title: "POST",
        description: `${baseUrl}/colors`,
        variant: "admin"
      },
      {
        title: "PATCH",
        description: `${baseUrl}/colors/{${entityIdName}}`,
        variant: "admin"
      },
      {
        title: "DELETE",
        description: `${baseUrl}/colors/{${entityIdName}}`,
        variant: "admin"
      }
    ],
    sizes: [
      {
        title: "GET",
        description: `${baseUrl}/sizes`,
        variant: "public"
      },
      {
        title: "GET BY ID",
        description: `${baseUrl}/sizes/{${entityIdName}}`,
        variant: "public"
      },
      {
        title: "POST",
        description: `${baseUrl}/sizes`,
        variant: "admin"
      },
      {
        title: "PATCH",
        description: `${baseUrl}/sizes/{${entityIdName}}`,
        variant: "admin"
      },
      {
        title: "DELETE",
        description: `${baseUrl}/sizes/{${entityIdName}}`,
        variant: "admin"
      }
    ]
  };

  return (
    <>
      <Separator />
      <div className="space-y-4">
        <h2 className="text-lg font-medium">API Endpoints</h2>
        {routes[entityName].map((route) => (
          <ApiAlert
            key={route.title}
            title={route.title}
            description={route.description}
            variant={route.variant as "public" | "admin"}
          />
        ))}
      </div>
    </>
  );
};
