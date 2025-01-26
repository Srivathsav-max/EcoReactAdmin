
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServer } from '@apollo/server';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';
import { createContext, GraphQLContext } from '@/graphql/context';
import { dynamicConfig } from '@/lib/route-config';

export const { runtime, dynamic } = dynamicConfig;

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