import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the user is logged in, redirect them to the gallery page
    if (!loading && user) {
      router.replace('/gallery');
    }
  }, [user, loading, router]);

  // If loading or user is present, don't render the landing page to avoid a flash of content
  if (loading || user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))] p-4 text-center">
        <div className="glass-effect p-8 rounded-xl shadow-2xl max-w-lg">
            <div className="flex justify-center items-center mb-6">
                <Home className="w-16 h-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Welcome to Lumeo
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Your personal, secure media gallery. Upload, organize, and manage your photos, videos, and documents with ease.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-4">
                <Button asChild>
                    <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Log In
                    </Link>
                </Button>
                <Button variant="secondary" asChild>
                    <Link href="/signup">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Sign Up
                    </Link>
                </Button>
            </div>
        </div>
    </div>
  );
}
