# Multi-Store E-commerce Platform Setup

## Overview

This platform allows you to manage multiple e-commerce stores from a single admin panel, with each store having its own customizable storefront.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Appwrite account for file storage

## Setup Steps

1. **Environment Configuration**

```bash
cp .env.example .env
```

Fill in the following variables:
```env
# Database
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_database_url

# JWT Authentication
JWT_SECRET=your_secure_secret
JWT_EXPIRES_IN=7d

# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_BUCKET_ID=your_bucket_id

# Admin Configuration
ADMIN_DOMAIN=localhost:3000
```

2. **Database Setup**

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

3. **Install Dependencies**

```bash
npm install
```

4. **Start Development Server**

```bash
npm run dev
```

## Access Points

### Admin Panel

- **Development URL**: `http://localhost:3000`
- **Production URL**: Your configured admin domain

Admin Routes:
- `/` - Dashboard/Store selection
- `/{storeId}/products` - Product management
- `/{storeId}/settings` - Store settings
- `/{storeId}/taxonomies` - Category management

Authentication:
- `/signin` - Admin login
- `/signup` - Admin registration (if enabled)

### Store Fronts

Each store has its own domain-based storefront:

- **Development**: `http://{store-domain}:3000`
- **Production**: `http://{store-domain}`

Store Routes:
- `/` - Store homepage
- `/products` - Product listing
- `/products/{slug}` - Product details
- `/categories` - Category listing
- `/categories/{slug}` - Category products
- `/cart` - Shopping cart

## Directory Structure

```
app/
├── (dashboard)/          # Admin panel routes
├── store/[domain]/       # Store-specific routes
├── api/                  # API endpoints
└── components/          
    └── ui/              # Shared components

lib/
├── appwrite-config.ts   # File storage configuration
├── auth.ts             # JWT authentication
└── prismadb.ts        # Database client

types/                  # TypeScript definitions
actions/               # Server actions
```

## Key Features

1. **Multi-Store Management**
   - Each store has independent:
     * Products
     * Categories
     * Orders
     * Customers
     * Settings

2. **Store Customization**
   - Custom domain
   - Store branding (logo, favicon)
   - Custom CSS
   - Theme settings

3. **Security**
   - JWT-based authentication
   - Role-based access control
   - Secure file storage with Appwrite

## Development Workflow

1. **Local Store Testing**
   
   Add to `/etc/hosts`:
   ```
   127.0.0.1   mystore.localhost
   ```

2. **Working with Multiple Stores**
   - Each store needs a unique domain
   - Configure domains in store settings
   - Access via subdomain locally

## Production Deployment

1. **Environment Setup**
   - Configure production database
   - Set up Appwrite bucket
   - Configure domain and SSL

2. **Domain Configuration**
   - Admin Panel: `admin.yourdomain.com`
   - Stores: `*.yourdomain.com`

3. **Deploy**
   ```bash
   npm run build
   npm start
   ```

## Common Issues

1. **Image Upload Issues**
   - Check Appwrite credentials
   - Verify bucket permissions
   - Check file size limits

2. **Domain Access Issues**
   - Verify domain configuration
   - Check SSL certificates
   - Review middleware routing

3. **Authentication Problems**
   - Verify JWT_SECRET
   - Check token expiration
   - Review auth middleware

## Security Best Practices

1. Use strong JWT secrets
2. Implement rate limiting
3. Validate all user inputs
4. Use HTTPS in production
5. Keep dependencies updated

## Maintenance

1. **Database Backups**
   ```bash
   npx prisma db pull
   ```

2. **Update Dependencies**
   ```bash
   npm update
   ```

3. **Monitor Logs**
   - Check application logs
   - Monitor database performance
   - Track file storage usage