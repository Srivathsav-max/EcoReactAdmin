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
  query GetProductPageData($storeId: String!, $productId: String) {
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
        description
        position
        permalink
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
          count
        }
        optionValues {
         id
         optionValue {
           id
           name
           presentation
           position
         }
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
  query GetProducts($storeId: String!) {
    products(storeId: $storeId) {
      id
      name
      description
      price
      sku
      isVisible
      variants {
        stockItems {
          count
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
  mutation CreateProduct($storeId: String!, $input: ProductCreateInput!) {
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
          count
        }
      }
    }
  }
`;

export const UPDATE_PRODUCT = `
  mutation UpdateProduct($id: String!, $storeId: String!, $input: ProductUpdateInput!) {
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
          count
        }
      }
    }
  }
`;

export const DELETE_PRODUCT = `
  mutation DeleteProduct($id: String!, $storeId: String!) {
    deleteProduct(id: $id, storeId: $storeId)
  }
`;

export const GET_PRODUCT_DETAILS = `
  query GetProductDetails($storeId: String!, $productId: String!, $includeProduct: Boolean!) {
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
    product(id: $productId, storeId: $storeId) @include(if: $includeProduct) {
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
      brand {
        id
        name
      }
      images {
        url
        fileId
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
        description
        position
        permalink
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
          count
        }
        optionValues {
         id
         optionValue {
           id
           name
           presentation
           position
         }
       }
        images {
          url
          fileId
        }
      }
    }
  }
`;

export const graphqlClient = {
  request: (query: string, variables?: Record<string, any>) => {
    return fetchGraphQL(query, { variables });
  }
};