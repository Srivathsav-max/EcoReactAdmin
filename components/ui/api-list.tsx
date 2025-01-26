"use client";

import { useParams } from "next/navigation";
import { ApiAlert } from "@/components/ui/api-alert";

interface ApiListProps {
  entityName: string;
  entityIdName: string;
}

export const ApiList: React.FC<ApiListProps> = ({
  entityName,
  entityIdName,
}) => {
  const params = useParams();
  
  // Define the base URL using window.location when available
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/${params.storeId}`
    : `/api/${params.storeId}`;

  return (
    <>
      <ApiAlert 
        title="GET" 
        variant="public" 
        description={`${baseUrl}/${entityName}`}
      />
      <ApiAlert 
        title="GET" 
        variant="public" 
        description={`${baseUrl}/${entityName}/{${entityIdName}}`}
      />
      <ApiAlert 
        title="POST" 
        variant="admin" 
        description={`${baseUrl}/${entityName}`}
      />
      <ApiAlert 
        title="PATCH" 
        variant="admin" 
        description={`${baseUrl}/${entityName}/{${entityIdName}}`}
      />
      <ApiAlert 
        title="DELETE" 
        variant="admin" 
        description={`${baseUrl}/${entityName}/{${entityIdName}}`}
      />
    </>
  );
};
