import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserPlus, LogIn } from 'lucide-react';
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
import Prism from '@/components/ui/Prism';


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
       <div className="absolute inset-0 bg-black/40 z-0"/>


       <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-4">
          <div className="flex flex-col items-center justify-center text-center">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground/90">
                  Welcome to Lumeo
              </h1>
              <p className="mt-4 text-lg leading-8 text-foreground/70 max-w-xl">
                  Your personal, secure media gallery. Ready to be set up.
              </p>
              <div className="mt-8 flex items-center justify-center gap-x-4">
                 <Button asChild size="lg">
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Link>
                 </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="lg">
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
          </div>
      </div>
		</main>
  );
}
