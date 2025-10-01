import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthForm } from '@/components/ui/AuthForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignUp() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      await signup(email, password);
      // The redirect and toast are handled by the AuthProvider
    } catch (err) {
        if (err.message && err.message.includes('User already registered')) {
            setError("An account with this email already exists.");
        } else {
            setError(err.message || 'An unexpected error occurred.');
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm 
        mode="signup"
        onSubmit={handleSubmit}
        isLoading={loading}
        error={error}
    />
  );
}
