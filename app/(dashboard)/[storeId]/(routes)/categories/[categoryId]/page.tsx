import prismadb from "@/lib/prismadb";
import { CategoryForm } from "./components/category-form";

const CategoryPage = async ({
  params
}: {
  params: { categoryId: string, storeId: string }
}) => {
  const category = await prismadb.category.findUnique({
    where: {
      id: params.categoryId
    }
  });

  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: params.storeId
    }
  });

  // Add categories fetch
  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
      NOT: {
        id: params.categoryId // Exclude current category
      }
    },
    include: {
      children: true
    }
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryForm 
          initialData={category}
          billboards={billboards}
          categories={categories} // Pass categories prop
        />
      </div>
    </div>
  );
}

export default CategoryPage;
