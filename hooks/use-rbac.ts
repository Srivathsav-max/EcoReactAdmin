"use client";

import { useEffect, useState } from 'react';
import { Permission, Role } from '@/types/role';

export interface UserPermissions {
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
  error: Error | null;
}

export const useRBAC = (storeId: string): UserPermissions => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch(`/api/${storeId}/auth/permissions`);
        if (!response.ok) {
          throw new Error('Failed to fetch permissions');
        }
        const data = await response.json();
        setPermissions(data.permissions);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [storeId]);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  return {
    hasPermission,
    isLoading,
    error,
  };
};

// Predefined permission constants
export const Permissions = {
  // Product permissions
  VIEW_PRODUCTS: 'products:view',
  CREATE_PRODUCTS: 'products:create',
  EDIT_PRODUCTS: 'products:edit',
  DELETE_PRODUCTS: 'products:delete',

  // Order permissions
  VIEW_ORDERS: 'orders:view',
  MANAGE_ORDERS: 'orders:manage',
  
  // Customer permissions
  VIEW_CUSTOMERS: 'customers:view',
  MANAGE_CUSTOMERS: 'customers:manage',
  
  // Settings permissions
  VIEW_SETTINGS: 'settings:view',
  MANAGE_SETTINGS: 'settings:manage',
  
  // Role management permissions
  VIEW_ROLES: 'roles:view',
  MANAGE_ROLES: 'roles:manage',
  
  // Store management permissions
  VIEW_STORE: 'store:view',
  MANAGE_STORE: 'store:manage',
  
  // Billboard permissions
  VIEW_BILLBOARDS: 'billboards:view',
  MANAGE_BILLBOARDS: 'billboards:manage',
  
  // Category permissions
  VIEW_CATEGORIES: 'categories:view',
  MANAGE_CATEGORIES: 'categories:manage',
  
  // Brand permissions
  VIEW_BRANDS: 'brands:view',
  MANAGE_BRANDS: 'brands:manage',
  
  // Stock permissions
  VIEW_STOCK: 'stock:view',
  MANAGE_STOCK: 'stock:manage',
} as const;

// Helper type for permission values
export type PermissionValue = typeof Permissions[keyof typeof Permissions];

// Predefined roles with their permissions
export const DefaultRoles = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    description: 'Full access to all features',
    permissions: Object.values(Permissions),
  },
  STORE_ADMIN: {
    name: 'Store Admin',
    description: 'Manage store settings and operations',
    permissions: [
      Permissions.VIEW_PRODUCTS,
      Permissions.CREATE_PRODUCTS,
      Permissions.EDIT_PRODUCTS,
      Permissions.DELETE_PRODUCTS,
      Permissions.VIEW_ORDERS,
      Permissions.MANAGE_ORDERS,
      Permissions.VIEW_CUSTOMERS,
      Permissions.MANAGE_CUSTOMERS,
      Permissions.VIEW_SETTINGS,
      Permissions.MANAGE_SETTINGS,
      Permissions.VIEW_STORE,
      Permissions.MANAGE_STORE,
    ],
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
  ORDER_MANAGER: {
    name: 'Order Manager',
    description: 'Manage orders and customers',
    permissions: [
      Permissions.VIEW_ORDERS,
      Permissions.MANAGE_ORDERS,
      Permissions.VIEW_CUSTOMERS,
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
  },
};
