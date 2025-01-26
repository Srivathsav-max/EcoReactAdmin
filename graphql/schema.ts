import { join } from 'path';
import { readFileSync } from 'fs';
import { makeExecutableSchema } from '@graphql-tools/schema';

// Import resolvers
import { resolvers } from './resolvers';

// Read type definitions from .graphql files
const loadTypeDefinitions = () => {
  const types = [
    'scalar',
    'auth',      // Added auth schema
    'store',
    'product',
    'order',
    'customer',
    'taxonomy',
    'attributes',
    'inventory',
    'brand-supplier',
    'layout-user',
    'reviews',
    'option-values', // Added option values schema
  ];

  return types.map(type => {
    const path = join(process.cwd(), 'graphql', 'types', `${type}.graphql`);
    return readFileSync(path, 'utf-8');
  }).join('\n');
};

// Combine type definitions and export
export const typeDefs = loadTypeDefinitions();

// Create and export the executable schema
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});