# Expense Manager Backend API

A robust NestJS-based backend system for expense management with multi-level approval workflows, currency conversion, and company management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation & Setup

1. **Clone and navigate to backend**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   Create `.env` file in the backend directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/expense_db?schema=public"
   ```

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start Development Server**
   ```bash
   npm run start:dev
   ```
   Server runs on: **http://localhost:3000**

## 📋 API Documentation

### Base URL
```
http://localhost:3000
```

### 🔐 Authentication

#### POST `/auth/signup`
Creates a new company and admin user.

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "password123",
  "name": "John Doe",
  "country": "United States"
}
```

**Response:**
```json
{
  "message": "Company and Admin created successfully",
  "companyId": 1,
  "userId": 1
}
```

### 💰 Expenses

#### POST `/expenses`
Create a new expense entry.

**Request Body:**
```json
{
  "amount": 100.50,
  "currency_code": "USD",
  "category": "Travel",
  "description": "Business trip taxi fare",
  "date": "2024-10-04"
}
```

**Response:**
```json
{
  "id": 1,
  "employee_id": 1,
  "company_id": 1,
  "amount": "100.50",
  "currency_code": "USD",
  "converted_amount": "100.50",
  "category": "Travel",
  "description": "Business trip taxi fare",
  "date": "2024-10-04T00:00:00.000Z",
  "status": "PENDING",
  "created_at": "2024-10-04T12:00:00.000Z",
  "updated_at": "2024-10-04T12:00:00.000Z"
}
```

#### GET `/expenses/my`
Retrieve current user's expenses with full details.

**Response:**
```json
[
  {
    "id": 1,
    "amount": "100.50",
    "currency_code": "USD",
    "converted_amount": "100.50",
    "category": "Travel",
    "description": "Business trip taxi fare",
    "date": "2024-10-04T00:00:00.000Z",
    "status": "PENDING",
    "created_at": "2024-10-04T12:00:00.000Z",
    "employee": {
      "id": 1,
      "name": "John Doe",
      "email": "admin@company.com"
    },
    "company": {
      "id": 1,
      "name": "John Doe's Company",
      "currency_code": "USD",
      "currency_symbol": "$"
    },
    "approvals": [
      {
        "id": 1,
        "status": "PENDING",
        "step_order": 1,
        "comments": null,
        "approved_at": null,
        "approver": {
          "id": 2,
          "name": "Manager Name",
          "email": "manager@company.com",
          "role": "MANAGER"
        }
      }
    ],
    "attachments": []
  }
]
```

### ✅ Approvals

#### GET `/approvals/pending`
Get pending approvals for the current user.

**Response:**
```json
[
  {
    "id": 1,
    "expense_id": 1,
    "approver_id": 2,
    "step_order": 1,
    "status": "PENDING",
    "comments": null,
    "approved_at": null,
    "expense": {
      "id": 1,
      "amount": "100.50",
      "currency_code": "USD",
      "category": "Travel",
      "description": "Business trip taxi fare",
      "employee": {
        "id": 1,
        "name": "John Doe",
        "email": "admin@company.com"
      },
      "company": {
        "id": 1,
        "name": "John Doe's Company"
      }
    }
  }
]
```

#### POST `/approvals/:expenseId/approve`
Approve or reject an expense.

**Request Body:**
```json
{
  "status": "APPROVED",
  "comments": "Approved for business travel"
}
```

**Response:**
```json
{
  "success": true,
  "newStatus": "APPROVED"
}
```

**Example URLs:**
- `POST /approvals/1/approve` - Approve expense with ID 1
- `POST /approvals/2/approve` - Approve expense with ID 2

## 🏗️ System Architecture

### Database Schema

#### Core Models:
- **Company**: Multi-tenant support with currency settings
- **User**: Employees with roles (ADMIN, MANAGER, EMPLOYEE)
- **Expense**: Expense records with currency conversion
- **ExpenseApproval**: Multi-step approval workflow
- **ApprovalFlow**: Configurable approval rules
- **ExchangeRate**: Currency conversion rates

#### User Roles:
- **ADMIN**: Full system access, company management
- **MANAGER**: Approve expenses, manage employees
- **EMPLOYEE**: Submit expenses, view own records

### Key Features

#### 🌍 Multi-Currency Support
- Automatic currency conversion using live exchange rates
- Company-based default currency
- Real-time rate fetching from external API

#### 🔄 Approval Workflow
- Configurable multi-step approval process
- Role-based and user-specific approvers
- Automatic status updates

#### 🏢 Multi-Tenant Architecture
- Company-based data isolation
- Separate approval flows per company
- Company-specific currency settings

## 🔧 Frontend Integration Guide

### Authentication Flow
1. **Initial Setup**: Call `/auth/signup` to create company and admin
2. **User Management**: Implement JWT token handling (TODO: Add JWT auth)
3. **Session**: Store user context (company_id, user_id, role)

### Expense Management Workflow
1. **Create Expense**: POST to `/expenses` with expense details
2. **View Expenses**: GET `/expenses/my` for user's expense list
3. **Track Status**: Monitor expense approval status through response data

### Approval Interface
1. **Manager Dashboard**: GET `/approvals/pending` for approval queue
2. **Approve/Reject**: POST to `/approvals/:id/approve` with decision
3. **Real-time Updates**: Poll or implement WebSocket for status changes

### Error Handling
```typescript
// Standard error response format
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Data Models for Frontend

#### User Interface
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  company_id: number;
}
```

#### Expense Interface
```typescript
interface Expense {
  id: number;
  amount: string;
  currency_code: string;
  converted_amount: string;
  category?: string;
  description?: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  employee: {
    id: number;
    name: string;
    email: string;
  };
  approvals: Approval[];
}
```

#### Approval Interface
```typescript
interface Approval {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments?: string;
  approved_at?: string;
  approver: {
    id: number;
    name: string;
    role: string;
  };
}
```

## 🧪 Testing

### API Test Files
- **`api-tests.http`**: VS Code REST Client tests
- **`Expense-Manager-API.postman_collection.json`**: Postman collection
- **`curl-tests.sh`**: Command line tests

### Test Sequence
1. Create company with signup
2. Create test expenses
3. Test approval workflow
4. Verify currency conversion

## 🛠️ Development

### Available Scripts
```bash
npm run start:dev     # Development server with hot reload
npm run build         # Production build
npm run start:prod    # Production server
npm run test          # Run tests
```

### Database Commands
```bash
npx prisma generate   # Generate Prisma client
npx prisma db push    # Push schema to database
npx prisma studio     # Database GUI
```

## 🚨 TODO for Production

### Security
- [ ] Implement JWT authentication
- [ ] Add input validation middleware
- [ ] Implement rate limiting
- [ ] Add CORS configuration
- [ ] Environment variable validation

### Features
- [ ] File upload for expense attachments
- [ ] Email notifications for approvals
- [ ] Audit logging
- [ ] Bulk operations
- [ ] Advanced reporting endpoints

### Performance
- [ ] Database indexing
- [ ] Caching layer
- [ ] Pagination for large datasets
- [ ] Query optimization

## 📞 Support

### Common Issues
- **Database Connection**: Check DATABASE_URL format
- **Port Conflicts**: Server runs on port 3000 by default
- **CORS Errors**: Configure CORS in main.ts for frontend domain

### Development Team Contact
- Backend API: NestJS + Prisma + PostgreSQL
- Real-time currency conversion
- Multi-tenant architecture ready
- RESTful API design

---

**Ready for frontend integration!** 🎉

Start with the signup endpoint to create your first company and admin user, then build your frontend components around the provided API endpoints and data models.
