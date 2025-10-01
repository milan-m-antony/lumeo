import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthForm } from '@/components/ui/AuthForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, LogIn, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SignUp() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registrationClosed, setRegistrationClosed] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const { signup } = useAuth();

  useEffect(() => {
    async function checkUser() {
      try {
        const response = await fetch('/api/auth/user-count');
        const data = await response.json();
        if (data.count > 0) {
          setRegistrationClosed(true);
        }
      } catch (error) {
        console.error("Failed to check for existing users:", error);
        setError("Could not verify registration status. Please try again later.");
      } finally {
        setCheckingStatus(false);
      }
    }
    checkUser();
  }, []);

  const handleSubmit = async (email, password) => {
    if (registrationClosed) {
      setError("Registration is closed.");
      return;
    }
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

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (registrationClosed) {
      return (
        <div className="min-h-screen w-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 z-0" style={{
                backgroundImage: 'radial-gradient(circle at top left, hsl(var(--primary) / 0.5) 0%, hsl(var(--background)) 30%)',
                backgroundAttachment: 'fixed'
            }} />
            <div className="absolute inset-0 bg-black/40 z-0"/>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-sm relative z-10 text-center"
            >
                <Alert variant="destructive" className="bg-destructive/10 relative">
                    <Link href="/login" passHref>
                        <button className="absolute top-2 right-2 p-1 rounded-md text-destructive/80 hover:text-destructive hover:bg-destructive/20 transition-colors">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                    </Link>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Registration Closed</AlertTitle>
                    <AlertDescription>
                        An administrator account already exists. New user registration is not allowed.
                    </AlertDescription>
                    <div className="mt-4">
                        <Button asChild variant="link" className="text-destructive/80">
                           <Link href="/login"><LogIn className="mr-2 h-4 w-4"/> Go to Sign In</Link>
                        </Button>
                    </div>
                </Alert>
            </motion.div>
        </div>
      );
  }

  return (
    <AuthForm 
        mode="signup"
        onSubmit={handleSubmit}
        isLoading={loading}
        error={error}
    />
  );
}
