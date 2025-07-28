import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import http from 'http';
import { json } from 'body-parser';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
  });

  // Optional: Root endpoint for basic connectivity test
  app.get('/', (req, res) => {
    res.status(200).json({ 
      message: 'Hotel List API is running',
      endpoints: {
        health: '/health',
        graphql: '/graphql'
      }
    });
  });

  // Apply middleware directly to the /graphql endpoint
  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server),
  );

  const port = process.env.PORT || 4000;
  const host = '0.0.0.0'; // IMPORTANT: Bind to all interfaces for Kubernetes

  await new Promise<void>((resolve) => {
    httpServer.listen({ port, host }, () => {
      console.log(`🚀 Server ready at http://${host}:${port}`);
      console.log(`📊 Health check at http://${host}:${port}/health`);
      console.log(`🎯 GraphQL endpoint at http://${host}:${port}/graphql`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      resolve();
    });
  });
}

startServer();