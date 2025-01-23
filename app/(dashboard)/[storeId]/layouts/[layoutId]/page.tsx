import { notFound } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { LayoutForm } from "./components/layout-form";
import ConfigSection from "@/app/(dashboard)/[storeId]/layouts/[layoutId]/components/config/config-section";
import type { LayoutComponent } from "@/types/models";

interface LayoutPageProps {
  params: {
    layoutId: string;
    storeId: string;
  }
}

const LayoutPage = async ({ params }: LayoutPageProps) => {
  // Get layout with all related data
  const layout = await prismadb.homeLayout.findUnique({
    where: {
      id: params.layoutId
    },
    include: {
      components: {
        orderBy: {
          position: 'asc'
        }
      }
    }
  });

  if (!layout) {
    notFound();
  }

  // Verify store ownership
  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      homeLayouts: {
        some: {
          id: layout.id
        }
      }
    }
  });

  if (!store) {
    notFound();
  }

  // Assert the component types since we know they are restricted in our schema
  const typedComponents = layout.components as unknown as LayoutComponent[];

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <LayoutForm initialData={layout} />
        <ConfigSection
          layoutId={layout.id}
          components={typedComponents}
        />
      </div>
    </div>
  );
};

export default LayoutPage;