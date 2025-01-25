import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # Custom scalars
  scalar DateTime
  scalar Decimal
  scalar JSON

  # Common types
  type Image {
    id: ID!
    url: String!
    fileId: String!
  }

  # Checkout types
  type CheckoutSession {
    url: String!
    orderId: String!
  }

  input CheckoutInput {
    variantIds: [ID!]!
    quantities: JSON
    email: String!
    phone: String
    address: String
  }

  # Order types
  type Order {
    id: ID!
    storeId: String!
    store: Store!
    customerId: String!
    customer: Customer!
    orderItems: [OrderItem!]!
    isPaid: Boolean!
    phone: String
    address: String
    status: String!
    total: Decimal!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type OrderItem {
    id: ID!
    orderId: String!
    order: Order!
    variantId: String!
    variant: Variant!
    quantity: Int!
    price: Decimal!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input OrderFilterInput {
    isPaid: Boolean
    status: String
  }

  # Customer types
  type Customer {
    id: ID!
    name: String!
    email: String!
    phone: String
    storeId: String!
    store: Store!
    reviews: [Review!]!
    orders: [Order!]!
    addresses: [Address!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Address {
    id: ID!
    customerId: String!
    customer: Customer!
    type: String!
    street: String!
    city: String!
    state: String!
    postalCode: String!
    country: String!
    isDefault: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input AddressCreateInput {
    type: String!
    street: String!
    city: String!
    state: String!
    postalCode: String!
    country: String!
    isDefault: Boolean
  }

  input AddressUpdateInput {
    type: String
    street: String
    city: String
    state: String
    postalCode: String
    country: String
    isDefault: Boolean
  }

  # Store types
  type StoreCount {
    products: Int!
    billboards: Int!
    customers: Int!
    orders: Int!
  }

  type Store {
    id: ID!
    name: String!
    userId: String!
    currency: String
    locale: String
    domain: String
    themeSettings: JSON
    customCss: String
    logoUrl: String
    faviconUrl: String
    _count: StoreCount!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input StoreCreateInput {
    name: String!
    currency: String
    locale: String
  }

  input StoreUpdateInput {
    name: String
    currency: String
    locale: String
    domain: String
    themeSettings: JSON
    customCss: String
    logoUrl: String
    faviconUrl: String
  }

  # Previous types remain the same...
  # (Include all previous type definitions)

  # Queries
  type Query {
    # Order queries
    orders(storeId: ID!, filter: OrderFilterInput): [Order!]!
    order(id: ID!, storeId: ID!): Order

    # Customer queries
    customers(storeId: ID!): [Customer!]!
    customer(id: ID!, storeId: ID!): Customer
    customerByEmail(email: String!, storeId: ID!): Customer

    # Store queries
    stores: [Store!]!
    store(id: ID!): Store
    storeByDomain(domain: String!): Store

    # Previous queries remain the same...
  }

  # Mutations
  type Mutation {
    # Checkout mutations
    createCheckoutSession(storeId: ID!, input: CheckoutInput!): CheckoutSession!

    # Customer mutations
    updateCustomerAddress(customerId: ID!, addressId: ID!, input: AddressUpdateInput!): Address!
    addCustomerAddress(customerId: ID!, input: AddressCreateInput!): Address!
    deleteCustomerAddress(customerId: ID!, addressId: ID!): Boolean!
    setDefaultAddress(customerId: ID!, addressId: ID!): Address!

    # Previous mutations remain the same...
  }
`;
