# API Documentation

## Authentication

All protected API routes require authentication using a Bearer token. You can obtain a token by signing in through the `/api/auth/signin` endpoint.

### Headers

For authenticated requests, include the following header:
```
Authorization: Bearer <your_token>
```

## Making Requests with Postman

1. **Authentication**
   ```http
   POST /api/auth/signin
   Content-Type: application/json

   {
     "email": "your@email.com",
     "password": "your_password"
   }
   ```
   The response will include a token that you should use for subsequent requests.

2. **Setting up the Bearer Token in Postman**
   - In the request Headers tab, add:
   ```
   Authorization: Bearer <token_from_signin>
   ```

3. **Store Management Examples**

   **Get Store**
   ```http
   GET /api/stores/{storeId}
   Authorization: Bearer <your_token>
   ```

   **Update Store**
   ```http
   PATCH /api/stores/{storeId}
   Content-Type: application/json
   Authorization: Bearer <your_token>

   {
     "name": "Updated Store Name",
     "domain": "store-domain",
     "customCss": "",
     "logoUrl": "",
     "faviconUrl": "",
     "themeSettings": {}
   }
   ```

   **Delete Store**
   ```http
   DELETE /api/stores/{storeId}
   Authorization: Bearer <your_token>
   ```

## Response Format

All API responses follow this structure:
```json
{
  "status": 200,
  "data": {
    // Response data here
  },
  "error": null,
  "timestamp": "2025-01-30T18:20:44.000Z"
}
```

### Error Responses
If an error occurs, you'll receive:
```json
{
  "status": 400,
  "data": null,
  "error": "Error message here",
  "timestamp": "2025-01-30T18:20:44.000Z"
}
```

Common HTTP Status Codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## CORS Support

The API supports CORS for cross-origin requests with the following allowed methods:
- GET
- POST
- PUT
- DELETE
- OPTIONS (preflight requests)

## Rate Limiting

To prevent abuse, API requests are subject to rate limiting. Current limits are:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Environment Variables

When using Postman, it's recommended to set up environment variables:

1. Create a new environment in Postman
2. Add these variables:
   - `BASE_URL`: Your API base URL (e.g., `http://localhost:3000`)
   - `AUTH_TOKEN`: Your authentication token (updated after signin)

Then you can use these in your requests like:
```
{{BASE_URL}}/api/stores/{{storeId}}
```

## Testing with Postman

1. Import the Postman collection (available in the repository)
2. Set up your environment variables
3. Run the authentication request first to get your token
4. The token will be automatically set in your environment variables
5. All subsequent requests will use this token

For local development, use:
- Base URL: `http://localhost:3000`
- Admin domain: `admin.lvh.me:3000`
