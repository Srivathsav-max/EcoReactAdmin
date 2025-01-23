import { AdminSession, CustomerSession, verifyAuth, isAdmin } from "@/lib/auth";

export const getCurrentUser = async () => {
  try {
    const session = await verifyAuth();

    if (!session) {
      return null;
    }

    // For admin routes, ensure we have admin access
    if (isAdmin(session)) {
      return {
        id: session.userId,
        email: session.email,
        role: 'admin'
      };
    }

    return null;
  } catch (error) {
    console.error('[GET_CURRENT_USER_ERROR]', error);
    return null;
  }
};

export const getAuthSession = async () => {
  try {
    const session = await verifyAuth();

    if (!session) {
      return null;
    }

    if (isAdmin(session)) {
      return {
        user: {
          id: session.userId,
          email: session.email,
          role: 'admin'
        },
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    }

    return null;
  } catch (error) {
    console.error('[GET_AUTH_SESSION_ERROR]', error);
    return null;
  }
};

export type { AdminSession, CustomerSession };