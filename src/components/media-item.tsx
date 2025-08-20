import Image from "next/image";
import { PlayCircle, FileVideo, ImageIcon } from "lucide-react";
import { type Media } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MediaItemProps = {
  media: Media;
  index: number;
};

export default function MediaItem({ media, index }: MediaItemProps) {
  const isVideo = media.type === "video";

  return (
    <div
      className="animate-in fade-in-0 zoom-in-95"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
    >
      <Card className="group relative block w-full overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl">
        <CardContent className="p-0">
          <Image
            src={media.url}
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
