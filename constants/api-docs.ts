import { Store } from "@prisma/client";

type ApiEndpoint = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  payloadExample?: any;
  responseExample?: any;
};

type ApiSection = {
  title: string;
  description: string;
  endpoints: ApiEndpoint[];
};

export const generateApiDocs = (storeId: string): Record<string, ApiSection> => ({
  products: {
    title: "Products API",
    description: "Manage product catalog",
    endpoints: [
      {
        method: "GET",
        path: `/api/${storeId}/products`,
        description: "Get all products",
        responseExample: {
          products: [
            {
              id: "uuid",
              name: "Product Name",
              description: "Product Description",
              price: 99.99,
              isFeatured: false,
              isArchived: false,
              sizeId: "uuid",
              colorId: "uuid",
              categoryId: "uuid",
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z"
            }
          ]
        }
      },
      {
        method: "POST",
        path: `/api/${storeId}/products`,
        description: "Create a new product",
        payloadExample: {
          name: "Product Name",
          description: "Product Description",
          price: 99.99,
          categoryId: "uuid",
          sizeId: "uuid",
          colorId: "uuid",
          images: ["url1", "url2"],
          isFeatured: false,
          isArchived: false
        }
      }
    ]
  },
  attributes: {
    title: "Attributes API",
    description: "Manage product attributes",
    endpoints: [
      {
        method: "GET",
        path: `/api/${storeId}/attributes`,
        description: "Get all attributes",
        responseExample: {
          attributes: [
            {
              id: "uuid",
              name: "Size",
              code: "size",
              type: "select",
              isRequired: true,
              isVisible: true,
              position: 1,
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z"
            }
          ]
        }
      },
      {
        method: "POST",
        path: `/api/${storeId}/attributes`,
        description: "Create a new attribute",
        payloadExample: {
          name: "Size",
          code: "size",
          type: "select",
          isRequired: true,
          isVisible: true,
          position: 1
        }
      }
    ]
  },
  "attribute-values": {
    title: "Attribute Values API",
    description: "Manage attribute values",
    endpoints: [
      {
        method: "GET",
        path: `/api/${storeId}/attribute-values`,
        description: "Get all attribute values",
        responseExample: {
          values: [
            {
              id: "uuid",
              attributeId: "uuid",
              value: "Large",
              position: 1,
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z"
            }
          ]
        }
      },
      {
        method: "POST",
        path: `/api/${storeId}/attribute-values`,
        description: "Create a new attribute value",
        payloadExample: {
          attributeId: "uuid",
          value: "Large",
          position: 1
        }
      }
    ]
  },
  taxonomies: {
    title: "Taxonomies API",
    description: "Manage product categories and taxonomies",
    endpoints: [
      {
        method: "GET",
        path: `/api/${storeId}/taxonomies`,
        description: "Get all taxonomies",
        responseExample: {
          taxonomies: [
            {
              id: "uuid",
              name: "Categories",
              description: "Product Categories",
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z"
            }
          ]
        }
      }
    ]
  },
  taxons: {
    title: "Taxons API",
    description: "Manage taxonomy nodes",
    endpoints: [
      {
        method: "GET",
        path: `/api/${storeId}/taxons`,
        description: "Get all taxons",
        responseExample: {
          taxons: [
            {
              id: "uuid",
              name: "Electronics",
              description: "Electronic Products",
              taxonomyId: "uuid",
              parentId: null,
              position: 1,
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z"
            }
          ]
        }
      }
    ]
  },
  variants: {
    title: "Variants API",
    description: "Manage product variants",
    endpoints: [
      {
        method: "GET",
        path: `/api/${storeId}/variants`,
        description: "Get all variants",
        responseExample: {
          variants: [
            {
              id: "uuid",
              productId: "uuid",
              sku: "SKU-001",
              price: 99.99,
              compareAtPrice: null,
              position: 1,
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z"
            }
          ]
        }
      }
    ]
  },
  "stock-items": {
    title: "Stock Items API",
    description: "Manage product inventory",
    endpoints: [
      {
        method: "GET",
        path: `/api/${storeId}/stock-items`,
        description: "Get all stock items",
        responseExample: {
          stockItems: [
            {
              id: "uuid",
              variantId: "uuid",
              count: 100,
              stockStatus: "in_stock",
              reserved: 5,
              backorderedQty: 0,
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z"
            }
          ]
        }
      },
      {
        method: "POST",
        path: `/api/${storeId}/stock-items`,
        description: "Create a stock item",
        payloadExample: {
          variantId: "uuid",
          count: 100,
          stockStatus: "in_stock",
          reserved: 0,
          backorderedQty: 0
        }
      },
      {
        method: "PATCH",
        path: `/api/${storeId}/stock-items/{stockItemId}`,
        description: "Update stock item quantity",
        payloadExample: {
          count: 150,
          stockStatus: "in_stock"
        }
      }
    ]
  },
  "stock-movements": {
    title: "Stock Movements API",
    description: "Track inventory changes",
    endpoints: [
      {
        method: "GET",
        path: `/api/${storeId}/stock-movements`,
        description: "Get all stock movements",
        responseExample: {
          movements: [
            {
              id: "uuid",
              variantId: "uuid",
              stockItemId: "uuid",
              quantity: 10,
              type: "increment",
              reason: "Purchase order received",
              createdAt: "2024-01-01T00:00:00.000Z"
            }
          ]
        }
      },
      {
        method: "POST",
        path: `/api/${storeId}/stock-movements`,
        description: "Record a stock movement",
        payloadExample: {
          variantId: "uuid",
          stockItemId: "uuid",
          quantity: 10,
          type: "increment",
          reason: "Purchase order received"
        }
      }
    ]
  },
  orders: {
    title: "Orders API",
    description: "Manage customer orders",
    endpoints: [
      {
        method: "GET",
        path: `/api/${storeId}/orders`,
        description: "Get all orders",
        responseExample: {
          orders: [
            {
              id: "uuid",
              status: "pending",
              isPaid: false,
              phone: "+1234567890",
              address: "123 Main St",
              orderItems: [
                {
                  id: "uuid",
                  variantId: "uuid",
                  quantity: 2,
                  price: 99.99
                }
              ],
              createdAt: "2024-01-01T00:00:00.000Z"
            }
          ]
        }
      },
      {
        method: "PATCH",
        path: `/api/${storeId}/orders/{orderId}`,
        description: "Update order status",
        payloadExample: {
          status: "processing",
          isPaid: true
        }
      }
    ]
  },
  customers: {
    title: "Customers API",
    description: "Manage customer data",
    endpoints: [
      {
        method: "GET",
        path: `/api/${storeId}/customers`,
        description: "Get all customers",
        responseExample: {
          customers: [
            {
              id: "uuid",
              name: "John Doe",
              email: "john@example.com",
              phone: "+1234567890",
              addresses: [
                {
                  id: "uuid",
                  type: "shipping",
                  street: "123 Main St",
                  city: "New York",
                  state: "NY",
                  postalCode: "10001",
                  country: "USA",
                  isDefault: true
                }
              ]
            }
          ]
        }
      },
      {
        method: "POST",
        path: `/api/${storeId}/customers`,
        description: "Create a new customer",
        payloadExample: {
          name: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
          password: "hashedPassword"
        }
      }
    ]
  },
  reviews: {
    title: "Product Reviews API",
    description: "Manage product reviews",
    endpoints: [
      {
        method: "GET",
        path: `/api/${storeId}/reviews`,
        description: "Get all product reviews",
        responseExample: {
          reviews: [
            {
              id: "uuid",
              productId: "uuid",
              customerId: "uuid",
              rating: 5,
              title: "Great product!",
              content: "Very satisfied with this purchase",
              status: "approved",
              createdAt: "2024-01-01T00:00:00.000Z"
            }
          ]
        }
      },
      {
        method: "POST",
        path: `/api/${storeId}/reviews`,
        description: "Create a product review",
        payloadExample: {
          productId: "uuid",
          rating: 5,
          title: "Great product!",
          content: "Very satisfied with this purchase"
        }
      },
      {
        method: "PATCH",
        path: `/api/${storeId}/reviews/{reviewId}`,
        description: "Update review status",
        payloadExample: {
          status: "approved"
        }
      }
    ]
  },
  billboards: {
    title: "Billboards API",
    description: "Manage promotional billboards",
    endpoints: [
      {
        method: "GET",
        path: `/api/${storeId}/billboards`,
        description: "Get all billboards",
        responseExample: {
          billboards: [
            {
              id: "uuid",
              label: "Summer Sale",
              imageUrl: "https://example.com/image.jpg",
              createdAt: "2024-01-01T00:00:00.000Z"
            }
          ]
        }
      },
      {
        method: "POST",
        path: `/api/${storeId}/billboards`,
        description: "Create a billboard",
        payloadExample: {
          label: "Summer Sale",
          imageUrl: "https://example.com/image.jpg"
        }
      }
    ]
  }
});

export const PAYLOAD_EXAMPLES = {
  product: {
    create: {
      name: "Example Product",
      description: "Product description",
      price: 99.99,
      categoryId: "category_id",
      images: ["image_url1", "image_url2"],
      sizeId: "size_id",
      colorId: "color_id",
      isFeatured: false,
      isArchived: false
    },
    // Add more examples
  },
  // Add more entities
  stockMovement: {
    increment: {
      variantId: "uuid",
      stockItemId: "uuid",
      quantity: 10,
      type: "increment",
      reason: "Purchase order received"
    },
    decrement: {
      variantId: "uuid",
      stockItemId: "uuid",
      quantity: -5,
      type: "decrement",
      reason: "Order fulfillment"
    }
  },
  order: {
    create: {
      items: [
        {
          variantId: "uuid",
          quantity: 2
        }
      ],
      customerInfo: {
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        address: "123 Main St"
      }
    },
    update: {
      status: "processing",
      isPaid: true,
      trackingNumber: "1234567890"
    }
  }
};

export const RESPONSE_EXAMPLES = {
  // Add response examples
}; 