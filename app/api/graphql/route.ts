import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServer } from '@apollo/server';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';
import { createContext, GraphQLContext } from '@/graphql/context';

// Create Apollo Server instance
const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
});

// Create handler for Next.js API route
const handler = startServerAndCreateNextHandler(server, {
  context: async (req, res) => createContext({ req, res }),
});

// Wrapper for better error handling
async function graphqlHandler(req: Request) {
  try {
    const response = await handler(req);
    
    // Add CORS and cache control headers
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    headers.set('Cache-Control', 'no-store');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch (error) {
    console.error('GraphQL Error:', error);
    return new Response(JSON.stringify({
      errors: [{ message: 'Internal server error' }]
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Export Next.js route handlers with OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

export const GET = graphqlHandler;
export const POST = graphqlHandler;
=======
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
