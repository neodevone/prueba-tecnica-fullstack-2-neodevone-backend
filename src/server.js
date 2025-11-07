const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { ApolloServer } = require('apollo-server-express');
require('dotenv').config();

const config = require('./config/env');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Importar GraphQL solo si no estamos en entorno de test
let graphqlSetup = Promise.resolve();

if (process.env.NODE_ENV !== 'test') {
  const graphqlSchema = require('./graphql/schema');
  const graphqlResolvers = require('./graphql/resolvers');
  
  graphqlSetup = (async () => {
    const apolloServer = new ApolloServer({
      typeDefs: graphqlSchema,
      resolvers: graphqlResolvers,
      context: ({ req }) => ({ req }),
      formatError: (error) => {
        console.error('GraphQL Error:', error);
        return {
          message: error.message,
          code: error.extensions?.code || 'INTERNAL_ERROR',
        };
      },
    });

    await apolloServer.start();
    return apolloServer;
  })();
}

// Route imports
const authRoutes = require('./routes/auth');
const programRoutes = require('./routes/programs');
const userRoutes = require('./routes/users');

const app = express();

// Conectar a DB solo si no estamos en test
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Security middleware - CONFIGURADO PARA APOLLO STUDIO
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
} else {
  // En desarrollo, configurar Helmet para permitir Apollo Studio
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'", 
            "'unsafe-inline'", 
            "https://apollo-server-landing-page.cdn.apollographql.com"
          ],
          styleSrc: [
            "'self'", 
            "'unsafe-inline'", 
            "https://fonts.googleapis.com", 
            "https://apollo-server-landing-page.cdn.apollographql.com"
          ],
          imgSrc: [
            "'self'", 
            "data:", 
            "https://apollo-server-landing-page.cdn.apollographql.com"
          ],
          fontSrc: [
            "'self'", 
            "https://fonts.gstatic.com"
          ],
          connectSrc: [
            "'self'", 
            "https://apollo-server-landing-page.cdn.apollographql.com"
          ]
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );
}

// Rate limiting (solo en producción)
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });
  app.use(limiter);
}

// CORS
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/users', userRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});

// Aplicar GraphQL después de que el servidor esté listo
if (process.env.NODE_ENV !== 'test') {
  graphqlSetup.then(apolloServer => {
    apolloServer.applyMiddleware({ app, path: '/graphql' });
  });
}

// Error handling middleware (should be last)
app.use(errorHandler);

const startServer = async () => {
  if (process.env.NODE_ENV !== 'test') {
    const server = app.listen(config.port, () => {
      console.log(`Server running in ${config.env} mode on port ${config.port}`);
      if (process.env.NODE_ENV !== 'test') {
        console.log(`GraphQL endpoint: http://localhost:${config.port}/graphql`);
      }
    });
    return server;
  }
  return app;
};

// For testing
if (require.main === module) {
  startServer();
}

module.exports = app;