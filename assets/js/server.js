// server.js
import 'dotenv/config';
import express from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import { buildSchema } from 'graphql';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Load GraphQL Schema
const schemaPath = join(__dirname, 'admin-schema.graphql');
const typeDefs = readFileSync(schemaPath, 'utf8');
const schema = buildSchema(typeDefs);

// GraphQL Resolvers
const root = {
  // Admin Login
  adminLogin: async ({ username, password }) => {
    try {
      // Find admin by username
      const admins = await sql`
        SELECT a.*, r.name as role_name, r.permissions as role_permissions
        FROM admins a
        LEFT JOIN roles r ON a.role_id = r.id
        WHERE a.username = ${username}
        LIMIT 1
      `;

      if (admins.length === 0) {
        return {
          success: false,
          message: 'Invalid username or password',
          admin: null,
          session: null,
          requires2FA: false
        };
      }

      const admin = admins[0];

      // Check if admin is active
      if (!admin.is_active) {
        return {
          success: false,
          message: 'Account is inactive. Contact administrator.',
          admin: null,
          session: null,
          requires2FA: false
        };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password_hash);
      
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid username or password',
          admin: null,
          session: null,
          requires2FA: false
        };
      }

      // Check if 2FA is enabled
      if (admin.two_factor_enabled) {
        return {
          success: true,
          message: '2FA code required',
          admin: {
            id: admin.id.toString(),
            uuid: admin.uuid,
            username: admin.username,
            email: admin.email,
            fullName: admin.full_name,
            isActive: admin.is_active
          },
          session: null,
          requires2FA: true
        };
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          adminId: admin.id, 
          username: admin.username,
          roleId: admin.role_id 
        },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      // Update last login
      await sql`
        UPDATE admins 
        SET last_login = NOW() 
        WHERE id = ${admin.id}
      `;

      // Log activity
      await sql`
        INSERT INTO activity_logs (admin_id, action_type, resource_type, details)
        VALUES (${admin.id}, 'LOGIN', 'ADMIN', 'Admin logged in successfully')
      `;

      return {
        success: true,
        message: 'Login successful',
        admin: {
          id: admin.id.toString(),
          uuid: admin.uuid,
          username: admin.username,
          email: admin.email,
          fullName: admin.full_name,
          profilePicture: admin.profile_picture,
          isActive: admin.is_active,
          permissions: admin.role_permissions || [],
          role: {
            id: admin.role_id?.toString(),
            name: admin.role_name,
            permissions: admin.role_permissions || []
          }
        },
        session: {
          token: token,
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
        },
        requires2FA: false
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login',
        admin: null,
        session: null,
        requires2FA: false
      };
    }
  },

  // Validate Session
  adminValidateSession: async ({ sessionToken }) => {
    try {
      const decoded = jwt.verify(sessionToken, JWT_SECRET);
      
      const admins = await sql`
        SELECT a.*, r.name as role_name, r.permissions as role_permissions
        FROM admins a
        LEFT JOIN roles r ON a.role_id = r.id
        WHERE a.id = ${decoded.adminId} AND a.is_active = true
        LIMIT 1
      `;

      if (admins.length === 0) {
        return { isValid: false, admin: null, expiresAt: null };
      }

      const admin = admins[0];

      return {
        isValid: true,
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
        admin: {
          id: admin.id.toString(),
          uuid: admin.uuid,
          username: admin.username,
          email: admin.email,
          fullName: admin.full_name,
          profilePicture: admin.profile_picture,
          isActive: admin.is_active,
          permissions: admin.role_permissions || [],
          role: {
            id: admin.role_id?.toString(),
            name: admin.role_name,
            permissions: admin.role_permissions || []
          }
        }
      };
    } catch (error) {
      return { isValid: false, admin: null, expiresAt: null };
    }
  },

  // Get Admin by Username (for password reset)
  getAdminByUsername: async ({ username }) => {
    try {
      const admins = await sql`
        SELECT security_question 
        FROM admins 
        WHERE username = ${username}
        LIMIT 1
      `;

      if (admins.length === 0) {
        return null;
      }

      return {
        securityQuestion: admins[0].security_question
      };
    } catch (error) {
      console.error('Error fetching admin:', error);
      return null;
    }
  }
};

// GraphQL endpoint
app.all('/graphql', createHandler({ schema, rootValue: root }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}/graphql`);
});
