const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { ApolloServer } = require('apollo-server-express');
require('dotenv').config();

const config = require('./config/env');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// *** CONFIGURACIÓN CORS SIMPLIFICADA Y FUNCIONAL ***
const allowedOrigins = [
  'https://main.d16uz79ib5bvwh.amplifyapp.com',
  'https://main.d16u29sl50u6h.amplifyapp.com', 
  'https://studio.apollographql.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS permitido para: ${origin}`);
      callback(null, true);
    } else {
      console.log(`🚫 CORS bloqueado para: ${origin}`);
      console.log(`📋 Dominios permitidos:`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400
};

// Route imports
const authRoutes = require('./routes/auth');
const programRoutes = require('./routes/programs');
const userRoutes = require('./routes/users');

const app = express();

// Conectar a DB solo si no estamos en test
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// *** ORDEN CRÍTICO DE MIDDLEWARE ***

// 1. CORS debe ir PRIMERO - antes de cualquier otro middleware
app.use(cors(corsOptions));

// 2. Manejo EXPLÍCITO de preflight OPTIONS para TODAS las rutas
app.options('*', cors(corsOptions));

// 3. Security middleware
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
} else {
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
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
}

// 4. Rate limiting
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      error: 'Too many requests from this IP, please try again later.'
    }
  });
  app.use('/api/', limiter);
}

// 5. Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 6. Logging middleware para debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Routes (REST)
app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/users', userRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Test CORS route
app.get('/api/cors-test', (req, res) => {
  res.json({ 
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Test OPTIONS específico
app.options('/api/cors-test', cors(corsOptions));
app.options('/api/auth/login', cors(corsOptions));
app.options('/api/auth/*', cors(corsOptions));

// *** Apollo Server Setup ***
const startServer = async () => {
  if (process.env.NODE_ENV !== 'test') {
    let apolloServer;
    
    if (process.env.NODE_ENV !== 'test') {
      const graphqlSchema = require('./graphql/schema');
      const graphqlResolvers = require('./graphql/resolvers');

      apolloServer = new ApolloServer({
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
        introspection: process.env.NODE_ENV !== 'production',
        playground: process.env.NODE_ENV !== 'production',
        cache: 'bounded'
      });

      await apolloServer.start();
      
      apolloServer.applyMiddleware({ 
        app, 
        path: '/graphql',
        cors: corsOptions
      });
    }

    // Error handling middleware (debe ir al final)
    app.use(errorHandler);

    const server = app.listen(config.port, () => {
      console.log(`🚀 Server running in ${config.env} mode on port ${config.port}`);
      console.log(`🌐 Allowed CORS origins: ${allowedOrigins.join(', ')}`);
      console.log(`✅ Health check: https://node.alyneos.com/health`);
      console.log(`✅ CORS test: https://node.alyneos.com/api/cors-test`);
      if (apolloServer) {
        console.log(`🔮 GraphQL endpoint: https://node.alyneos.com/graphql`);
      }
    });
    
    return server;
  }
  
  app.use(errorHandler);
  return app;
};

if (require.main === module) {
  startServer().catch(console.error);
}

module.exports = app;