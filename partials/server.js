// ============================================
// 1. server.js - PRODUCTION READY
// ============================================
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import express from 'express'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { readFileSync } from 'fs'
import jwt from 'jsonwebtoken'
import { resolvers } from './resolvers.js'
import { sql, testDB } from './wow.js'

// Load GraphQL schema
const typeDefs = readFileSync('./admin-schema.graphql', 'utf8')

// Environment variables with fallbacks
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
const PORT = process.env.PORT || 4000
const NODE_ENV = process.env.NODE_ENV || 'development'
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:4000']

// Rate limiting - stricter in production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 200,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/test'
})

// Context function with enhanced security
const context = async ({ req }) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || null
  
  let adminId = null
  let roleId = null
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      adminId = decoded.adminId
      roleId = decoded.roleId
      
      // Verify session is still valid in database
      const session = await sql`
        SELECT session_id 
        FROM admin_sessions 
        WHERE session_token = ${token}
          AND is_valid = true
          AND expires_at > CURRENT_TIMESTAMP
        LIMIT 1
      `
      
      if (session.length === 0) {
        adminId = null
        roleId = null
      }
    } catch (error) {
      // Invalid or expired token
      console.warn('Token validation failed:', error.message)
      adminId = null
      roleId = null
    }
  }
  
  // Get real IP address (handling proxy/load balancer)
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
              req.headers['x-real-ip'] || 
              req.connection.remoteAddress || 
              req.socket.remoteAddress || 
              'unknown'
  
  return {
    adminId,
    roleId,
    ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    sql
  }
}

async function startServer() {
  // Test database connection
  console.log('🔍 Testing database connection...')
  const dbConnected = await testDB()
  
  if (!dbConnected) {
    console.error('❌ Cannot start server without database connection')
    console.error('💡 Please check your database configuration in wow.js')
    process.exit(1)
  }
  
  console.log('✅ Database connected successfully')
  
  const app = express()
  const httpServer = http.createServer(app)
  
  // Trust proxy (important for production behind load balancer)
  app.set('trust proxy', 1)
  
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false
  }))
  
  // CORS configuration - dynamic based on environment
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true)
      
      if (NODE_ENV === 'development' || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))
  
  // Apply rate limiting
  app.use(limiter)
  
  // Body parsing
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  
  // Request logging middleware
  app.use((req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
      const duration = Date.now() - start
      console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`)
    })
    next()
  })
  
  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async requestDidStart() {
          return {
            async didEncounterErrors(requestContext) {
              console.error('GraphQL Errors:', requestContext.errors)
            }
          }
        }
      }
    ],
    formatError: (error) => {
      console.error('GraphQL Error:', error)
      
      // Don't expose internal errors in production
      if (NODE_ENV === 'production') {
        return {
          message: error.message.includes('permission') || error.message.includes('not found') 
            ? error.message 
            : 'An error occurred processing your request',
          locations: error.locations,
          path: error.path
        }
      }
      
      return error
    },
    introspection: NODE_ENV !== 'production',
    includeStacktraceInErrorResponses: NODE_ENV !== 'production'
  })
  
  await server.start()
  console.log('✅ Apollo Server started')
  
  // GraphQL endpoint
  app.use(
    '/graphql',
    expressMiddleware(server, { context })
  )
  
  // Health check endpoint
  app.get('/health', async (req, res) => {
    try {
      const dbCheck = await sql`SELECT 1 as health_check`
      
      if (dbCheck.length === 0) {
        throw new Error('Database query returned no results')
      }
      
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        environment: NODE_ENV,
        uptime: process.uptime()
      })
    } catch (error) {
      console.error('Health check failed:', error)
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message
      })
    }
  })
  
  // Test endpoint
  app.get('/test', (req, res) => {
    res.json({
      message: 'Server is working',
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      environment: NODE_ENV
    })
  })
  
  // API version endpoint
  app.get('/api/version', (req, res) => {
    res.json({
      version: '1.0.0',
      graphql: '/graphql',
      health: '/health',
      timestamp: new Date().toISOString()
    })
  })
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.path} not found`,
      timestamp: new Date().toISOString()
    })
  })
  
  // Error handler
  app.use((err, req, res, next) => {
    console.error('Express Error:', err)
    
    res.status(err.status || 500).json({
      error: NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
      timestamp: new Date().toISOString()
    })
  })
  
  // Start the server
  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve))
  
  console.log('\n' + '='.repeat(60))
  console.log('🚀 Server ready!')
  console.log('='.repeat(60))
  console.log(`📍 GraphQL:     http://localhost:${PORT}/graphql`)
  console.log(`💚 Health:      http://localhost:${PORT}/health`)
  console.log(`🧪 Test:        http://localhost:${PORT}/test`)
  console.log(`📦 Environment: ${NODE_ENV}`)
  console.log('='.repeat(60) + '\n')
  
  return { server, app, httpServer }
}

// Graceful shutdown
async function shutdown(signal) {
  console.log(`\n${signal} signal received: closing HTTP server`)
  
  try {
    await sql.end({ timeout: 5 })
    console.log('✅ Database connections closed')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error during shutdown:', error)
    process.exit(1)
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  // In production, you might want to exit and let a process manager restart
  if (NODE_ENV === 'production') {
    shutdown('UNHANDLED_REJECTION')
  }
})

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})

// ============================================
// 2. .env.example - COPY TO .env
// ============================================
/*
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kalenjin_vibes
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=change-this-to-a-very-long-random-string-in-production

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS Configuration (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4000,https://yourdomain.com

# Email Configuration
EMAIL_USER=kalenjivibezke@gmail.com
EMAIL_PASS=your_app_password_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session Configuration
SESSION_DURATION_HOURS=24
SESSION_CLEANUP_INTERVAL_HOURS=1
*/

// ============================================
// 3. wow.js - DATABASE CONNECTION (OPTIMIZED)
// ============================================
/*
import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config()

// Database configuration with environment variables
const sql = postgres({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'kalenjin_vibes',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20, // Maximum pool size
  idle_timeout: 30, // Close idle connections after 30 seconds
  connect_timeout: 10, // Connection timeout in seconds
  onnotice: () => {}, // Suppress notices in production
  debug: process.env.NODE_ENV !== 'production'
})

// Test database connection
export async function testDB() {
  try {
    const result = await sql`SELECT NOW() as current_time, version() as db_version`
    console.log('✅ Database connected:', result[0].db_version.split(' ')[0])
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
}

// Cleanup function
export async function closeDB() {
  try {
    await sql.end({ timeout: 5 })
    console.log('✅ Database connection pool closed')
  } catch (error) {
    console.error('❌ Error closing database:', error)
  }
}

export { sql }
*/

// ============================================
// 4. package.json - COMPLETE DEPENDENCIES
// ============================================
/*
{
  "name": "kalenjin-vibes-admin",
  "version": "1.0.0",
  "type": "module",
  "description": "Admin panel for Kalenjin Vibes",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node --test",
    "migrate": "node migrations/run.js",
    "seed": "node migrations/seed.js"
  },
  "dependencies": {
    "@apollo/server": "^4.10.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "graphql": "^16.8.1",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "moment": "^2.30.1",
    "nodemailer": "^6.9.8",
    "postgres": "^3.4.3",
    "speakeasy": "^2.0.0",
    "uuid": "^9.0.1",
    "validator": "^13.11.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
*/

// ============================================
// 5. STARTUP CHECKLIST
// ============================================
/*
✅ BEFORE STARTING:

1. Database Setup:
   - Create PostgreSQL database
   - Run migrations (see migrations folder)
   - Verify tables exist

2. Environment Setup:
   - Copy .env.example to .env
   - Fill in all required values
   - Generate strong JWT_SECRET

3. Install Dependencies:
   npm install

4. Test Connection:
   node -e "import('./wow.js').then(m => m.testDB())"

5. Start Server:
   npm run dev (development)
   npm start (production)

6. Verify Endpoints:
   curl http://localhost:4000/health
   curl http://localhost:4000/test

7. Test Login:
   curl -X POST http://localhost:4000/graphql \
     -H "Content-Type: application/json" \
     -d '{"query":"{ adminLogin(username: \"superuser\", password: \"SuperAdmin123!\") { success message admin { username } session { token } } }"}'

✅ PRODUCTION DEPLOYMENT:

1. Set NODE_ENV=production
2. Use strong JWT_SECRET (64+ characters)
3. Configure proper CORS origins
4. Enable SSL/TLS
5. Use environment variables for all secrets
6. Set up monitoring and logging
7. Configure database connection pooling
8. Enable rate limiting
9. Set up automated backups
10. Configure reverse proxy (nginx/apache)
*/