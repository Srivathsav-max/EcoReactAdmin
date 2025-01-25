// Types for GraphQL operations
type RequestOptions = {
  variables?: Record<string, any>;
};

async function fetchGraphQL(query: string, options: RequestOptions = {}) {
  try {
    const res = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: options.variables,
      }),
    });

    if (!res.ok) {
      throw new Error('Network response was not ok');
    }

    const json = await res.json();

    if (json.errors) {
      throw new Error(json.errors[0].message);
    }

    return json.data;
  } catch (error) {
    console.error('Error fetching GraphQL:', error);
    throw error;
  }
}

// Product queries
export const GET_PRODUCT_PAGE_DATA = `
  query GetProductPageData($storeId: ID!, $productId: ID) {
    brands(storeId: $storeId) {
      id
      name
    }
    colors(storeId: $storeId) {
      id
      name
      value
    }
    sizes(storeId: $storeId) {
      id
      name
      value
    }
    taxonomies(storeId: $storeId) {
      id
      name
      taxons {
        id
        name
        description
        position
        permalink
        billboard {
          id
          label
          imageUrl
        }
      }
    }
    store(id: $storeId) {
      id
      name
      currency
      locale
    }
    product(id: $productId, storeId: $storeId) @include(if: $productId) {
      id
      name
      description
      slug
      price
      status
      isVisible
      hasVariants
      sku
      barcode
      tags
      taxRate
      weight
      height
      width
      depth
      minimumQuantity
      maximumQuantity
      images {
        url
        fileId
      }
      brand {
        id
        name
      }
      optionTypes {
        id
        name
        presentation
        position
        optionValues {
          id
          name
          presentation
          position
        }
      }
      taxons {
        id
        name
        permalink
        description
        position
        billboard {
          id
          label
          imageUrl
        }
      }
      variants {
        id
        name
        sku
        price
        compareAtPrice
        position
        isVisible
        isDefault
        size {
          id
          name
          value
        }
        color {
          id
          name
          value
        }
        stockItems {
          id
          quantity
        }
        optionValues {
          id
          name
          presentation
          position
        }
        images {
          url
          fileId
        }
      }
    }
  }
`;

export const GET_PRODUCTS = `
  query GetProducts($storeId: ID!) {
    products(storeId: $storeId) {
      id
      name
      description
      price
      sku
      isVisible
      variants {
        stockItems {
          quantity
        }
      }
      taxons {
        name
      }
      images {
        url
        fileId
      }
      createdAt
    }
  }
`;

// Product mutations
export const CREATE_PRODUCT = `
  mutation CreateProduct($storeId: ID!, $input: ProductCreateInput!) {
    createProduct(storeId: $storeId, input: $input) {
      id
      name
      description
      slug
      price
      status
      isVisible
      hasVariants
      sku
      barcode
      tags
      taxRate
      weight
      height
      width
      depth
      minimumQuantity
      maximumQuantity
      images {
        url
        fileId
      }
      brand {
        id
        name
      }
      optionTypes {
        id
        name
        presentation
        position
      }
      taxons {
        id
        name
      }
      variants {
        id
        name
        sku
        price
        stockItems {
          quantity
        }
      }
    }
  }
`;

export const UPDATE_PRODUCT = `
  mutation UpdateProduct($id: ID!, $storeId: ID!, $input: ProductUpdateInput!) {
    updateProduct(id: $id, storeId: $storeId, input: $input) {
      id
      name
      description
      slug
      price
      status
      isVisible
      hasVariants
      sku
      barcode
      tags
      taxRate
      weight
      height
      width
      depth
      minimumQuantity
      maximumQuantity
      images {
        url
        fileId
      }
      brand {
        id
        name
      }
      optionTypes {
        id
        name
        presentation
        position
      }
      taxons {
        id
        name
      }
      variants {
        id
        name
        sku
        price
        stockItems {
          quantity
        }
      }
    }
  }
`;

export const DELETE_PRODUCT = `
  mutation DeleteProduct($id: ID!, $storeId: ID!) {
    deleteProduct(id: $id, storeId: $storeId)
  }
`;

export const graphqlClient = {
  request: (query: string, variables?: Record<string, any>) => {
    return fetchGraphQL(query, { variables });
  }
};