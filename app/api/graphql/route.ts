import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { typeDefs } from '@/lib/graphql/types/auth';
import { resolvers } from '@/lib/graphql/resolvers/auth';

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    // Log server-side errors and return a generic error to the client
    console.error('GraphQL Error:', error);
    return new Error(error.message);
  },
});

// Create request handler
const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => ({
    req,
  }),
});

// Export route handlers
export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}