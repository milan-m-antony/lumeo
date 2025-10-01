import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthForm } from '@/components/ui/AuthForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/router';


export default function SignUp() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      await signup(email, password);
      toast({
        title: "Registration Successful!",
        description: "Please check your email to confirm your account, then log in.",
      });
      router.push('/login');
    } catch (err) {
        if (err.message && err.message.includes('User already registered')) {
            setError("An account already exists for this application. No new sign-ups are allowed.");
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
