import UploadForm from "@/components/upload-form";
import Gallery from "@/components/gallery";
import { getMedia } from "@/lib/data";
import { Separator } from "@/components/ui/separator";

export default async function Home() {
  const media = await getMedia();

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <header className="text-center my-8 md:my-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          TeleGallery
        </h1>
        <p className="text-muted-foreground mt-3 text-lg md:text-xl max-w-2xl mx-auto">
          Your personal media gallery, powered by Telegram.
        </p>
      </header>
      <main className="space-y-12">
        <section id="upload" className="max-w-2xl mx-auto">
          <UploadForm />
        </section>
        
        <Separator />

        <section id="gallery">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-8">Gallery</h2>
          <Gallery media={media} />
        </section>
      </main>
      <footer className="text-center py-8 mt-12 text-muted-foreground">
        <p>Built with Next.js and ❤️</p>
      </footer>
    </div>
  );
}
