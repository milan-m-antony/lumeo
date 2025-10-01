import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthForm } from '@/components/ui/AuthForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';


export default function SignUp() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationAllowed, setRegistrationAllowed] = useState(true);
  const { signup } = useAuth();

  const handleSubmit = async (email, password) => {
    if (!registrationAllowed) {
        setError("An account already exists for this application. No new sign-ups are allowed.");
        return;
    }

    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await signup(email, password);
      setSuccess(true);
    } catch (err) {
        if (err.message && err.message.includes('User already registered')) {
            setRegistrationAllowed(false);
            setError("An account already exists for this application. No new sign-ups are allowed.");
        } else {
            setError(err.message || 'An unexpected error occurred.');
        }
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
      return (
         <div className="min-h-screen w-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 z-0" style={{
                backgroundImage: 'radial-gradient(circle at top left, hsl(var(--primary) / 0.5) 0%, hsl(var(--background)) 30%)',
                backgroundAttachment: 'fixed'
            }}/>
            <div className="absolute inset-0 bg-black/40 z-0"/>
            <motion.div initial={{opacity: 0, y: 20}} animate={{opacity:1, y:0}} className="relative z-10 w-full max-w-sm">
                <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05] shadow-2xl overflow-hidden">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Success!</AlertTitle>
                        <AlertDescription>Please check your email to confirm your account. You may now log in.</AlertDescription>
                    </Alert>
                </div>
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
