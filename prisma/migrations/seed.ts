import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const Permissions = {
  VIEW_PRODUCTS: 'products:view',
  CREATE_PRODUCTS: 'products:create',
  EDIT_PRODUCTS: 'products:edit',
  DELETE_PRODUCTS: 'products:delete',
  VIEW_ORDERS: 'orders:view',
  MANAGE_ORDERS: 'orders:manage',
  VIEW_CUSTOMERS: 'customers:view',
  MANAGE_CUSTOMERS: 'customers:manage',
  VIEW_SETTINGS: 'settings:view',
  MANAGE_SETTINGS: 'settings:manage',
  VIEW_ROLES: 'roles:view',
  MANAGE_ROLES: 'roles:manage',
  VIEW_STORE: 'store:view',
  MANAGE_STORE: 'store:manage',
  VIEW_BILLBOARDS: 'billboards:view',
  MANAGE_BILLBOARDS: 'billboards:manage',
  VIEW_CATEGORIES: 'categories:view',
  MANAGE_CATEGORIES: 'categories:manage',
  VIEW_BRANDS: 'brands:view',
  MANAGE_BRANDS: 'brands:manage',
  VIEW_STOCK: 'stock:view',
  MANAGE_STOCK: 'stock:manage',
};

const DefaultRoles = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    description: 'Full access to all features',
    permissions: Object.values(Permissions),
  },
  STORE_MANAGER: {
    name: 'Store Manager',
    description: 'Manage products and orders',
    permissions: [
      Permissions.VIEW_PRODUCTS,
      Permissions.CREATE_PRODUCTS,
      Permissions.EDIT_PRODUCTS,
      Permissions.VIEW_ORDERS,
      Permissions.MANAGE_ORDERS,
      Permissions.VIEW_CUSTOMERS,
      Permissions.VIEW_SETTINGS,
    ],
  },
  INVENTORY_MANAGER: {
    name: 'Inventory Manager',
    description: 'Manage products and stock',
    permissions: [
      Permissions.VIEW_PRODUCTS,
      Permissions.EDIT_PRODUCTS,
      Permissions.VIEW_STOCK,
      Permissions.MANAGE_STOCK,
    ],
  },
  CONTENT_MANAGER: {
    name: 'Content Manager',
    description: 'Manage content and marketing',
    permissions: [
      Permissions.VIEW_BILLBOARDS,
      Permissions.MANAGE_BILLBOARDS,
      Permissions.VIEW_CATEGORIES,
      Permissions.MANAGE_CATEGORIES,
    ],
  }
};

async function main() {
  console.log('Seeding default roles and permissions...');

  // Create all permissions first
  const permissionNames = Object.values(Permissions);
  for (const name of permissionNames) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: {
        name,
        description: name.split(':').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      }
    });
  }
  console.log('Created permissions');

  // Create default roles
  for (const [key, role] of Object.entries(DefaultRoles)) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
        permissions: {
          connect: role.permissions.map(name => ({ name }))
        }
      },
      create: {
        name: role.name,
        description: role.description,
        permissions: {
          connect: role.permissions.map(name => ({ name }))
        }
      }
    });
  }

  console.log('Created default roles');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
