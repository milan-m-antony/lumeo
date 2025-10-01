import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/gallery');
    }
  }, [user, loading, router]);

  if (loading || (!loading && user)) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <main className="min-h-screen h-full w-full bg-background relative">
      <div className="absolute top-6 right-6 z-20">
          <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="secondary">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>One-Time Registration</AlertDialogTitle>
                  <AlertDialogDescription>
                    This application is designed for a single administrator. By proceeding, you will create the one and only user account. After this, registration will be permanently closed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Link href="/signup">Continue to Sign Up</Link>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
      </div>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-foreground/90" style={{textShadow: '0 4px 15px rgba(0,0,0,0.5)'}}>
              Welcome to Lumeo
          </h1>
          <p className="mt-6 text-xl leading-8 text-foreground/70" style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>
              Your personal, secure media gallery. Ready to be set up.
          </p>
			</div>
		</main>
  );
}
