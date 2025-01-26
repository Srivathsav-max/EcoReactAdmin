# Authentication System Documentation

## Overview

The system implements three main authentication flows:
1. Admin Registration - New admin user signup
2. Admin Authentication - For store management
3. Customer Authentication - For store-specific customer access

## Authentication Flows

### Admin Registration Flow

```
Route: /signup
API: /api/auth/signup
```

When a new admin signs up:
1. Creates admin user account
2. Automatically creates default store
3. Links store to admin user
4. Redirects to signin page

### Admin Authentication

```
Route: /signin
API: /api/auth/signin
```

Admin users can:
- Access the admin dashboard
- Manage multiple stores
- Configure store settings
- Manage products and categories

### Customer Authentication

```
Route: /store/{domain}/signin
API: /api/auth/customer/signin
```

Customers can:
- Sign in to specific stores
- Access their store-specific data
- Place orders
- Manage their profile

## API Routes

### Admin Routes

- `POST /api/auth/signup` - Create new admin account
- `POST /api/auth/signin` - Admin login
- `POST /api/auth/signout` - Admin logout
- `GET /api/auth/session` - Check admin session

Registration Example:
```typescript
const response = await axios.post('/api/auth/signup', {
  name: "Admin Name",
  email: "admin@example.com",
  password: "securepassword"
});
```

### Customer Routes

- `POST /api/auth/customer/signin` - Customer login
- `POST /api/auth/customer/signout` - Customer logout
- `GET /api/auth/customer/session` - Check customer session

## JWT Tokens

1. Admin Token
```typescript
{
  userId: string;
  email: string;
  role: 'admin';
}
```

2. Customer Token
```typescript
{
  customerId: string;
  email: string;
  storeId: string;
  role: 'customer';
}
```

## Cookie Configuration

1. Admin Cookie:
```
Name: token
HttpOnly: true
Secure: true (in production)
SameSite: lax
Expiry: 7 days
```

2. Customer Cookie:
```
Name: customer_token
HttpOnly: true
Secure: true (in production)
SameSite: lax
Domain: store-specific in production
Expiry: 30 days
```

## Directory Structure

```
app/
├── (auth)/
│   ├── layout.tsx       # Auth layout
│   ├── signin/         # Admin signin
│   └── signup/         # Admin signup
├── store/
│   └── [domain]/
│       └── signin/     # Store customer signin
├── api/
│   └── auth/
│       ├── signup/     # Admin registration
│       ├── signin/     # Admin auth
│       ├── signout/    # Both auth types
│       ├── session/    # Session checks
│       └── customer/   # Customer auth
lib/
└── auth.ts            # Core auth utilities

hooks/
└── use-auth.tsx      # Auth state management
```

## Security Implementation

1. Password Handling:
- Hashed using bcrypt
- 10 salt rounds
- Never stored in plain text

2. Session Security:
- JWT-based authentication
- HttpOnly cookies
- Secure flag in production
- Domain-specific cookies for stores

3. Route Protection:
- Middleware checks for auth status
- Role-based access control
- Domain-based routing for stores

## Error Handling

Common error responses:
- 400 - Missing or invalid fields
- 401 - Unauthorized access
- 404 - Resource not found
- 409 - Email already exists
- 500 - Server error

## Development Setup

1. Environment Variables:
```env
JWT_SECRET=your-secure-secret
JWT_EXPIRES_IN=7d
CUSTOMER_TOKEN_EXPIRES=30d
```

2. Database Schema:
```prisma
model User {
  id             String   @id @default(uuid())
  name           String
  email          String   @unique
  password       String
  defaultStoreId String?
  stores         Store[]
}
```

## Testing Authentication

1. Admin Signup:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@example.com","password":"password"}'
```

2. Admin Signin:
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

3. Customer Signin:
```bash
curl -X POST http://localhost:3000/api/auth/customer/signin?domain=store-domain \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"password"}'
```


3. Monitoring
- Auth failure monitoring
- Session tracking
- Rate limit tracking