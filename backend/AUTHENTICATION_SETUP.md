# Backend Authentication System Setup Guide

## Overview
This backend authentication system provides a complete, production-ready solution for the Expense Management app with the following features:

- **Company Registration**: First signup creates company + admin user
- **User Management**: Admin can create users with temporary passwords
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: ADMIN, MANAGER, EMPLOYEE roles
- **Email Integration**: Automatic temporary password emails
- **Password Security**: Bcrypt hashing with proper salt rounds

## Setup Instructions

### 1. Environment Configuration
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens (change in production)
- `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS`: Email provider settings

### 2. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# OR run migrations (recommended for production)
npx prisma migrate dev --name init
```

### 3. Start the Server
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm start
```

## API Endpoints

### Authentication Routes

#### Company Signup (Public)
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "admin@company.com",
  "password": "secure123",
  "country": "United States"
}
```

#### User Login (Public)
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "password123"
}
```

#### Change Password (Authenticated)
```http
PATCH /auth/change-password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

### User Management Routes (Admin Only)

#### Get All Users
```http
GET /users
Authorization: Bearer <jwt_token>
```

#### Create New User
```http
POST /users
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "role": "EMPLOYEE"
}
```

#### Get User Profile
```http
GET /users/profile
Authorization: Bearer <jwt_token>
```

#### Update User Status
```http
PATCH /users/:id/status
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "isActive": false
}
```

## Security Features

### 1. Password Security
- Passwords hashed using bcrypt with 12 salt rounds
- Temporary passwords generated for new users
- Force password change on first login

### 2. JWT Authentication
- Access tokens with configurable expiration
- User context includes role and company information
- Automatic token validation on protected routes

### 3. Role-based Access Control
- Three roles: ADMIN, MANAGER, EMPLOYEE
- Route-level protection using guards
- Company-scoped data access

### 4. Input Validation
- DTO validation using class-validator
- Whitelist and transform input data
- Proper error messages for validation failures

## Architecture

### Modules
- **AuthModule**: Authentication logic and JWT configuration
- **UsersModule**: User management functionality
- **MailModule**: Email service for notifications
- **Common**: Shared guards, decorators, and utilities

### Key Components
- **JwtStrategy**: Passport JWT strategy for token validation
- **JwtAuthGuard**: Global authentication guard
- **RolesGuard**: Role-based authorization guard
- **MailService**: Nodemailer integration for emails

## Integration with Frontend

### CORS Configuration
The backend is configured to accept requests from:
- `http://localhost:3000` (Next.js development)
- `http://localhost:3001` (Alternative port)

### Response Format
All API responses follow a consistent format:
```json
{
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

### Error Handling
Proper HTTP status codes and error messages:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate email)

## Production Considerations

### 1. Environment Variables
- Use strong, unique JWT_SECRET
- Configure proper email provider settings
- Use secure database connection strings

### 2. Database
- Run migrations instead of db push
- Set up database backups
- Configure connection pooling

### 3. Email Service
- Configure production email provider (SendGrid, AWS SES, etc.)
- Set up proper email templates
- Handle email delivery failures

### 4. Monitoring
- Add logging for security events
- Monitor failed login attempts
- Set up health checks

## Testing

### Manual Testing with curl
```bash
# Company signup
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Admin","email":"admin@test.com","password":"test123","country":"United States"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"test123"}'

# Get users (with token)
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

This backend system is now ready to integrate with your Next.js frontend and provides all the authentication and user management features required by your Expense Management application.