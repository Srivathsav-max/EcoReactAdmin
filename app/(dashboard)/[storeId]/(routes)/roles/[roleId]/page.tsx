import prismadb from "@/lib/prismadb";
import { RoleForm } from "./components/role-form";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserPermissions } from "@/lib/rbac-middleware";
import { Permissions } from "@/hooks/use-rbac";

const RolePage = async ({
  params
}: {
  params: { roleId: string, storeId: string }
}) => {
  const session = await getAdminSession();

  if (!session) {
    redirect('/signin');
  }

  // Check if user has permission to manage roles
  const userPermissions = await getUserPermissions(session.userId, params.storeId);
  if (!userPermissions.includes(Permissions.MANAGE_ROLES)) {
    redirect(`/${params.storeId}/roles`);
  }

  let role = null;

  if (params.roleId !== "new") {
    role = await prismadb.role.findUnique({
      where: {
        id: params.roleId
      },
      include: {
        permissions: true
      }
    });
  }
  
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <RoleForm initialData={role} />
      </div>
    </div>
  );
}

export default RolePage;
