import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import { AuthProvider } from "@/context/AuthContext";
import "@/app/globals.css";
import Head from 'next/head';
import AppKeepAlive from "@/components/AppKeepAlive";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";

function AppContent({ Component, pageProps }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(router.pathname);
  const isHomePage = router.pathname === '/';

  // The withAuth HOC handles redirection for protected routes.
  // We only need to decide whether to show the main layout or the component directly.
  if (user && !isAuthPage) {
     return (
        <Layout>
          <Component {...pageProps} />
        </Layout>
     );
  }

  // Render auth pages or home page directly without the main layout if there's no user.
  if (!user && (isHomePage || isAuthPage)) {
     return <Component {...pageProps} />;
  }

  // For any other case (e.g., loading auth state, or a logged-in user on an auth page being redirected), show a loader.
  // The onAuthStateChange listener in AuthContext and the withAuth HOC will manage redirects.
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
