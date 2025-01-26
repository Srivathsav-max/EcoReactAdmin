import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ProductFormType } from "@/app/(dashboard)/[storeId]/(routes)/products/[productId]/components/sections";
import { graphqlClient, CREATE_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT } from "@/lib/graphql-client";

export const useProductForm = (storeId: string, productId?: string) => {
  const router = useRouter();

  const onSubmit = async (data: ProductFormType) => {
    try {
      const formattedData = {
        ...data,
        price: parseFloat(data.price.toString()),
        taxRate: data.taxRate ? Number((data.taxRate / 100).toFixed(4)) : undefined,
        images: data.images.map(img => ({
          url: img.url,
          fileId: img.fileId,
        })),
      };

      if (productId) {
        await graphqlClient.request(UPDATE_PRODUCT, {
          id: productId,
          storeId,
          input: formattedData,
        });
      } else {
        await graphqlClient.request(CREATE_PRODUCT, {
          storeId,
          input: formattedData,
        });
      }

      await router.push(`/${storeId}/products`);
      router.refresh();
      toast.success(productId ? "Product updated." : "Product created.");
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error("Something went wrong.");
      throw error;
    }
  };

  const onDelete = async () => {
    try {
      await graphqlClient.request(DELETE_PRODUCT, {
        id: productId,
        storeId,
      });

      await router.push(`/${storeId}/products`);
      router.refresh();
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred while deleting the product");
      throw error;
    }
  };

  return {
    onSubmit,
    onDelete,
  };
};