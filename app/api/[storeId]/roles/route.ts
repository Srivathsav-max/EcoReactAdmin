import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { checkPermissions } from '@/lib/rbac-middleware';
import { Permissions } from '@/hooks/use-rbac';

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is store owner
    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    // Check permissions only if not store owner
    if (!store) {
      const hasPermission = await checkPermissions(
        session.userId,
        params.storeId,
        [Permissions.VIEW_ROLES]
      );

      if (!hasPermission) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    const roles = await prismadb.role.findMany({
      include: {
        permissions: true,
      },
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error('[ROLES_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is store owner
    const isStoreOwner = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    // If not store owner, check for MANAGE_ROLES permission
    if (!isStoreOwner) {
      const hasPermission = await checkPermissions(
        session.userId,
        params.storeId,
        [Permissions.MANAGE_ROLES]
      );

      if (!hasPermission) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    const body = await req.json();
    const { name, description, permissionNames } = body;

    // Validate name and permissions
    if (!name || !permissionNames?.length) {
      return new NextResponse("Name and permissions are required", { status: 400 });
    }

    // Check if role name already exists
    const existingRole = await prismadb.role.findFirst({
      where: { name }
    });

    if (existingRole) {
      return new NextResponse("Role name already exists", { status: 400 });
    }

    // Create role and connect permissions
    const role = await prismadb.role.create({
      data: {
        name,
        description,
        permissions: {
          connect: permissionNames.map((name: string) => ({ name }))
        }
      },
      include: {
        permissions: true,
      }
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error('[ROLES_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
