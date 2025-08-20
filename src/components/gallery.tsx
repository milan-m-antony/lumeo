import { type Media } from "@/lib/data";
import MediaItem from "./media-item";
import { Frown } from "lucide-react";

type GalleryProps = {
  media: Media[];
};

export default function Gallery({ media }: GalleryProps) {
  if (media.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
        <Frown className="mx-auto h-12 w-12" />
        <h3 className="mt-4 text-lg font-medium">No Media Found</h3>
        <p className="mt-1 text-sm">Try uploading something to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {media.map((item, index) => (
        <MediaItem key={item.id} media={item} index={index} />
      ))}
    </div>
  );
}
