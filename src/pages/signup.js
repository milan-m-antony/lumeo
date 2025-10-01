
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import Prism from '@/components/ui/Prism';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationAllowed, setRegistrationAllowed] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const { signup } = useAuth();

  useEffect(() => {
    const checkUserCount = async () => {
      try {
        const res = await fetch('/api/auth/user-count');
        const data = await res.json();
        if (data.count === 0) {
          setRegistrationAllowed(true);
        }
      } catch (err) {
        setError("Could not verify registration status. Please try again later.");
      } finally {
        setCheckingStatus(false);
      }
    };
    checkUserCount();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!registrationAllowed) return;

    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await signup(email, password);
      setSuccess(true);
      setRegistrationAllowed(false); // Immediately block form after successful signup
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="absolute inset-0 z-0">
          <Prism
              animationType="rotate"
              timeScale={0.5}
              height={3.5}
              baseWidth={5.5}
              scale={3.6}
              hueShift={0}
              colorFrequency={1}
              noise={0.5}
              glow={1}
            />
        </div>
        <Card className="w-full max-w-sm glass-effect relative z-10">
            <CardHeader>
                <CardTitle className="text-2xl">Sign Up</CardTitle>
                <CardDescription>
                    {registrationAllowed ? 'Enter your information to create the primary account.' : 'Registration is currently closed.'}
                </CardDescription>
            </CardHeader>
            <Link href="/" passHref>
                <Button asChild variant="ghost" size="icon" className="absolute top-4 right-4 h-6 w-6">
                    <a><X className="h-4 w-4" /></a>
                </Button>
            </Link>
            {registrationAllowed ? (
            <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Sign Up Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {success && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Success!</AlertTitle>
                        <AlertDescription>Please check your email to confirm your account. You may now log in.</AlertDescription>
                    </Alert>
                )}
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={success}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={success}
                    />
                </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" type="submit" disabled={loading || success}>
                    {loading ? 'Creating account...' : 'Create Account'}
                </Button>
                </CardFooter>
            </form>
            ) : (
                <CardContent>
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Registration Closed</AlertTitle>
                        <AlertDescription>
                            An account already exists for this application. No new sign-ups are allowed.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            )}
            <CardFooter>
                <div className="text-center text-sm text-muted-foreground w-full">
                    Already have an account?{' '}
                    <Link href="/login" className="underline hover:text-primary">
                        Log in
                    </Link>
                </div>
            </CardFooter>
        </Card>
    </div>
  );
}
