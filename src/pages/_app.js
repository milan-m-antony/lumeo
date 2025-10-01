import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import { AuthProvider } from "@/context/AuthContext";
import "@/app/globals.css";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import Head from 'next/head';

function AppContent({ Component, pageProps }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(router.pathname);
  const isHomePage = router.pathname === '/';

  // While checking auth state, show a loader
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If user is logged in, wrap the component with the main layout
  if (user) {
     return (
        <Layout>
          <Component {...pageProps} />
        </Layout>
     );
  }
  
  // If not logged in, and on a public page, show the page without the main layout.
  if (isHomePage || isAuthPage) {
     return <Component {...pageProps} />;
  }

  // If not logged in and trying to access a protected page, AuthProvider will handle redirect.
  // We show a loader as a fallback while the redirect is happening.
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
        <AppContent Component={Component} pageProps={pageProps} />
        <Toaster />
      </AuthProvider>
    </>
  );
}

export default MyApp;
