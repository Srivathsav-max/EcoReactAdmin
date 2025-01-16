"use client";

import { ApiAlert } from "@/components/ui/api-alert";
import { useParams } from "next/navigation";
import { Code } from "@/components/ui/code";
import { useOrigin } from "@/hooks/use-origin";
import { ApiSection } from "./api-docs";

export const CustomerApiList = () => {
  const params = useParams();
  const origin = useOrigin();

  const setupInstructions = `
// 1. Environment Setup
Add these to your .env file:
JWT_SECRET=your_secure_jwt_secret
REFRESH_SECRET=your_secure_refresh_secret

// 2. Authentication Flow
- Store access token in memory
- Store refresh token securely (HTTP-only cookie recommended)
- Include Authorization header in all protected requests
- Handle 401 responses by attempting token refresh

// 3. Error Handling
401 - Unauthorized (invalid/expired token)
403 - Forbidden (insufficient permissions)
404 - Resource not found
500 - Server error

// 4. Security Best Practices
- Use HTTPS in production
- Implement rate limiting
- Validate all input data
- Handle token refresh securely
  `;

  const signupJson = {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    phone: "1234567890", // optional
    address: "123 Street" // optional
  };

  const signinJson = {
    email: "john@example.com",
    password: "password123"
  };

  const resetPasswordJson = {
    email: "john@example.com",
    newPassword: "newpassword123"
  };

  const forgotPasswordJson = {
    email: "john@example.com"
  };

  const updateProfileJson = {
    name: "John Doe Updated",
    phone: "0987654321",
    address: "456 New Street"
  };

  const addressJson = {
    type: "home",
    street: "123 Main St",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "USA",
    isDefault: true
  };

  const authHeaderExample = {
    headers: {
      "Authorization": "Bearer your_access_token_here",
      "Content-Type": "application/json"
    }
  };

  const refreshTokenJson = {
    refreshToken: "your_refresh_token_here"
  };

  return (
    <div className="space-y-4">
      <ApiSection title="Getting Started">
        <Code 
          className="mt-2"
          content={setupInstructions}
        />
      </ApiSection>

      <ApiSection title="Authentication">
        <div>
          <ApiAlert 
            title="POST - SIGNIN" 
            variant="public" 
            description={`${origin}/api/${params.storeId}/customer/signin`}
          />
          <Code 
            className="mt-2"
            content={JSON.stringify(signinJson, null, 2)}
          />
        </div>
        <div className="mt-4">
          <ApiAlert 
            title="POST - Refresh Token" 
            variant="public" 
            description={`${origin}/api/${params.storeId}/customer/refresh`}
          />
          <Code 
            className="mt-2"
            content={JSON.stringify(refreshTokenJson, null, 2)}
          />
        </div>
      </ApiSection>

      <ApiSection title="User Management">
        <div>
          <ApiAlert 
            title="POST - SIGNUP" 
            variant="public" 
            description={`${origin}/api/${params.storeId}/customer/signup`}
          />
          <Code 
            className="mt-2"
            content={JSON.stringify(signupJson, null, 2)}
          />
        </div>
        <div className="mt-4">
          <ApiAlert 
            title="PATCH - UPDATE PROFILE" 
            variant="public" 
            description={`${origin}/api/${params.storeId}/customer/profile`}
          />
          <Code 
            className="mt-2"
            content={JSON.stringify(updateProfileJson, null, 2)}
          />
        </div>
      </ApiSection>

      <ApiSection title="Password Management">
        <div>
          <ApiAlert 
            title="POST - RESET PASSWORD" 
            variant="public" 
            description={`${origin}/api/${params.storeId}/customer/reset-password`}
          />
          <Code 
            className="mt-2"
            content={JSON.stringify(resetPasswordJson, null, 2)}
          />
        </div>
        <div className="mt-4">
          <ApiAlert 
            title="POST - FORGOT PASSWORD" 
            variant="public" 
            description={`${origin}/api/${params.storeId}/customer/forgot-password`}
          />
          <Code 
            className="mt-2"
            content={JSON.stringify(forgotPasswordJson, null, 2)}
          />
        </div>
      </ApiSection>

      <ApiSection title="Address Management">
        <div>
          <ApiAlert 
            title="POST - Add Address" 
            variant="public" 
            description={`${origin}/api/${params.storeId}/customer/address`}
          />
          <Code 
            className="mt-2"
            content={JSON.stringify(addressJson, null, 2)}
          />
        </div>
      </ApiSection>

      <ApiSection title="Authentication Headers">
        <ApiAlert 
          title="Required Headers" 
          variant="public" 
          description="Include these headers in your protected route requests"
        />
        <Code 
          className="mt-2"
          content={JSON.stringify(authHeaderExample, null, 2)}
        />
      </ApiSection>
    </div>
  );
};
