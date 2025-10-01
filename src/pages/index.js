import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import InfiniteGallery from '@/components/ui/3d-gallery-photography';
import imageData from '@/app/lib/placeholder-images.json';
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

  if (loading || user) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <main className="min-h-screen h-full w-full bg-background">
			<InfiniteGallery
				images={imageData.gallery}
				speed={1.2}
				zSpacing={3}
				visibleCount={12}
				falloff={{ near: 0.8, far: 14 }}
				className="h-screen w-full rounded-lg overflow-hidden"
			/>
      <div className="absolute top-6 right-6 z-20 flex gap-2">
          <Button asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>
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

			<div className="text-center fixed bottom-10 left-0 right-0 font-mono uppercase text-[11px] font-semibold text-foreground pointer-events-none z-20">
				<p>Use mouse wheel, arrow keys, or touch to navigate</p>
				<p className=" opacity-60">
					Auto-play resumes after 3 seconds of inactivity
				</p>
			</div>
		</main>
  );
}
