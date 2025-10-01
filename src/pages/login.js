import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { AuthForm } from '@/components/ui/AuthForm';

export default function Login() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      // The redirect is handled by the AuthProvider
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm 
        mode="login"
        onSubmit={handleSubmit}
        isLoading={loading}
        error={error}
    />
  );
}
