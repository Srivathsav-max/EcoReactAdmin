import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: String!
    email: String!
  }

  type AuthResponse {
    success: Boolean
    user: User
    token: String
    redirectUrl: String
    error: String
  }

  type ValidateEmailResponse {
    exists: Boolean!
    error: String
  }

  type SignupResponse {
    user: User
    error: String
  }

  type Query {
    validateEmail(email: String!): ValidateEmailResponse!
  }

  type Mutation {
    signin(email: String!, password: String!): AuthResponse!
    signup(email: String!, password: String!): SignupResponse!
  }
`;