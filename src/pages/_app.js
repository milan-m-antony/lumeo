import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import { AuthProvider } from "@/context/AuthContext";
import "@/app/globals.css";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import Head from 'next/head';
import AppKeepAlive from "@/components/AppKeepAlive";

function AppContent({ Component, pageProps }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(router.pathname);
  const isHomePage = router.pathname === '/';

  // While the authentication state is loading, show a global loader.
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If a user is logged in, always show the main layout.
  // The `withAuth` HOC will handle redirecting from auth pages if needed.
  if (user) {
     return (
        <Layout>
          <Component {...pageProps} />
        </Layout>
     );
  }
  
  // If there is no user, check if we are on a public or auth page.
  if (!user && (isHomePage || isAuthPage)) {
     return <Component {...pageProps} />;
  }

  // If there's no user and we're not on a public page, it means we're on a protected route.
  // The `withAuth` HOC is handling the redirect. Show a loader in the meantime.
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}


function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4a29a0" />
      </Head>
      <AuthProvider>
        <AppKeepAlive />
        <AppContent Component={Component} pageProps={pageProps} />
        <Toaster />
      </AuthProvider>
    </>
  );
}

export default MyApp;
