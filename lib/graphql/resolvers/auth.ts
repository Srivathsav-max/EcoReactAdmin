import { verifyPassword, getUserByEmail, createUser } from "@/lib/auth";
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const resolvers = {
  Query: {
    validateEmail: async (_: any, { email }: { email: string }) => {
      try {
        if (!email) {
          return { exists: false, error: "Email is required" };
        }

        const user = await getUserByEmail(email);
        return { exists: !!user, error: null };
      } catch (error) {
        console.error('ValidateEmail error:', error);
        return { exists: false, error: "Internal server error" };
      }
    },
  },

  Mutation: {
    signin: async (_: any, { email, password }: { email: string; password: string }, context: any) => {
      try {
        if (!email || !password) {
          return { 
            success: false, 
            error: "Email and password are required",
          };
        }

        const user = await getUserByEmail(email);

        if (!user) {
          return { 
            success: false, 
            error: "Invalid credentials",
          };
        }

        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
          return { 
            success: false, 
            error: "Invalid password",
          };
        }

        if (!process.env.JWT_SECRET) {
          console.error("JWT_SECRET is not defined");
          return { 
            success: false, 
            error: "Server configuration error",
          };
        }

        const token = sign(
          { sub: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '1d' }
        );

        // Set cookie using Next.js cookies API
        const cookieStore = cookies();
        cookieStore.set('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 // 1 day
        });

        return {
          success: true,
          user: { id: user.id, email: user.email },
          redirectUrl: '/dashboard'
        };
      } catch (error) {
        console.error('SignIn error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Authentication failed'
        };
      }
    },

    signup: async (_: any, { email, password }: { email: string; password: string }) => {
      try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
          return {
            error: 'Email already exists'
          };
        }

        const user = await createUser(email, password);
        return {
          user: { id: user.id, email: user.email }
        };
      } catch (error) {
        console.error('SignUp error:', error);
        return {
          error: error instanceof Error ? error.message : 'Failed to create account'
        };
      }
    },
  },
};