import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { useState, useCallback } from 'react';

// GraphQL Operations
const VALIDATE_EMAIL = gql`
  query ValidateEmail($email: String!) {
    validateEmail(email: $email) {
      exists
      error
    }
  }
`;

const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      success
      user {
        id
        email
      }
      redirectUrl
      error
    }
  }
`;

const SIGN_UP = gql`
  mutation SignUp($email: String!, $password: String!) {
    signup(email: $email, password: $password) {
      user {
        id
        email
      }
      error
    }
  }
`;

export const useValidateEmail = () => {
  const [validateEmailQuery, { loading }] = useLazyQuery(VALIDATE_EMAIL, {
    fetchPolicy: 'network-only'
  });

  const checkEmail = useCallback(async (email: string) => {
    try {
      const { data } = await validateEmailQuery({
        variables: { email }
      });
      return data?.validateEmail || { exists: false, error: null };
    } catch (error) {
      console.error('Email validation error:', error);
      return { exists: false, error: 'Failed to validate email' };
    }
  }, [validateEmailQuery]);

  return { checkEmail, loading };
};

export const useSignIn = () => {
  const [error, setError] = useState<string | null>(null);
  const [signIn, { loading }] = useMutation(SIGN_IN);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { data } = await signIn({
        variables: { email, password }
      });

      if (data.signin.error) {
        setError(data.signin.error);
        return null;
      }

      setError(null);
      return data.signin;
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Failed to sign in');
      return null;
    }
  };

  return { handleSignIn, loading, error };
};

export const useSignUp = () => {
  const [error, setError] = useState<string | null>(null);
  const [signUp, { loading }] = useMutation(SIGN_UP);

  const handleSignUp = async (email: string, password: string) => {
    try {
      const { data } = await signUp({
        variables: { email, password }
      });

      if (data.signup.error) {
        setError(data.signup.error);
        return null;
      }

      setError(null);
      return data.signup;
    } catch (err) {
      console.error('Sign up error:', err);
      setError('Failed to sign up');
      return null;
    }
  };

  return { handleSignUp, loading, error };
};