import * as path from 'path';

/**
 * Absolute path to the GraphQL schema, based on this package’s build output.
 * Works in both ts-node (dev) and compiled usage because it’s relative to this file.
 */
export const graphqlSchemaPath = path.join(
  __dirname,
  'lib',
  'graphql',
  'schema.graphql'
);

// Re-export anything else your package already exposes:
export * from './lib/packages';
