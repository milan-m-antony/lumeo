import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import { AuthProvider } from "@/context/AuthContext";
import "@/app/globals.css";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Conditionally render the Layout. Don't render it on the landing page.
  if (router.pathname === '/') {
    return (
      <AuthProvider>
        <Component {...pageProps} />
        <Toaster />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
        <Toaster />
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;
