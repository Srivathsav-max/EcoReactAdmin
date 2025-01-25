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

// Export Next.js route handlers
export { handler as GET, handler as POST };