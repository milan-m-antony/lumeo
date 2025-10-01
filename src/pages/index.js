import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import InfiniteGallery from '@/components/ui/3d-gallery-photography';
import imageData from '@/app/lib/placeholder-images.json';


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
            {/* Optional: Add a loader here */}
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
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                <div className="glass-effect p-8 rounded-xl shadow-2xl max-w-2xl pointer-events-auto">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
                        Welcome to Lumeo
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        Your personal, secure media gallery. Built with Telegram & Supabase.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-4">
                        <Button asChild size="lg">
                            <Link href="/login">
                                <LogIn className="mr-2 h-4 w-4" />
                                Log In
                            </Link>
                        </Button>
                        <Button variant="secondary" size="lg" asChild>
                            <Link href="/signup">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Sign Up
                            </Link>
                        </Button>
                    </div>
                </div>
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
