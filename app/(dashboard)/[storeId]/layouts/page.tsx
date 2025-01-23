import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { LayoutClient } from "./components/client";

const LayoutsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const layouts = await prismadb.$queryRaw<Array<{
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
  }>>`
    SELECT id, name, "isActive", "createdAt"
    FROM "HomeLayout"
    WHERE "storeId" = ${params.storeId}
    ORDER BY "createdAt" DESC
  `;

  const formattedLayouts = layouts.map((item) => ({
    id: item.id,
    name: item.name,
    isActive: item.isActive,
    createdAt: format(item.createdAt, 'MMMM do, yyyy')
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <LayoutClient data={formattedLayouts} />
      </div>
    </div>
  );
}

export default LayoutsPage;