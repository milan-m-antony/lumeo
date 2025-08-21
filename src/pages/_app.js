import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import "@/app/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
      <Toaster />
    </Layout>
  );
}

export default MyApp;
