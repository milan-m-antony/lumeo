import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import { AuthProvider } from "@/context/AuthContext";
import "@/app/globals.css";
import Head from 'next/head';
import AppKeepAlive from "@/components/AppKeepAlive";

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
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Toaster />
      </AuthProvider>
    </>
  );
}

export default MyApp;
