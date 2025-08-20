"use client";

import Image from "next/image";
import { PlayCircle, FileVideo, ImageIcon, Loader2 } from "lucide-react";
import { type Media } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getTelegramFileUrl } from "@/app/actions";

type MediaItemProps = {
  media: Media;
  index: number;
};

export default function MediaItem({ media, index }: MediaItemProps) {
  const isVideo = media.type === "video";
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUrl() {
        try {
            setLoading(true);
            const newUrl = await getTelegramFileUrl(media.telegram_file_id);
            setUrl(newUrl);
        } catch (error) {
            console.error("Failed to get media URL", error);
            // You might want to set an error state here and display a placeholder
        } finally {
            setLoading(false);
        }
    }
    loadUrl();
  }, [media.telegram_file_id]);


  return (
    <div
      className="animate-in fade-in-0 zoom-in-95"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
    >
      <Card className="group relative block w-full aspect-video overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl">
        <CardContent className="p-0">
            {loading || !url ? (
                 <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                 </div>
            ): (
                <>
                 <Image
                    src={url}
                    alt={media.caption}
                    width={600}
                    height={400}
                    data-ai-hint={media.ai_hint}
                    className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 group-hover:bg-black/40">
                    <PlayCircle className="h-12 w-12 text-white/80 drop-shadow-lg transition-transform group-hover:scale-110" />
                    </div>
                )}
                </>
            )}

          <div className="absolute bottom-0 left-0 p-3 text-white">
            <div className="flex items-center gap-2">
                {isVideo ? <FileVideo className="h-4 w-4"/> : <ImageIcon className="h-4 w-4"/>}
                <p className="truncate text-sm font-medium drop-shadow-sm">
                  {media.caption || "Untitled"}
                </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
