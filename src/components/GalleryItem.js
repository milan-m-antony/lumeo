import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle, Video, FileText, ImageIcon } from "lucide-react";

// A generic base64-encoded transparent GIF.
const shimmer = (w, h) => `data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7`;

const getFileUrl = (fileId) => `/api/download?file_id=${fileId}`;

const FilePreview = ({ file }) => {
  const iconClass = "w-16 h-16 text-muted-foreground";

  switch (file.type) {
    case 'photo':
        const photoUrl = getFileUrl(file.thumbnail_file_id || file.file_id);
        return (
            <Image
                src={photoUrl}
                alt={file.caption || "Gallery photo"}
                width={400}
                height={600}
                placeholder="blur"
                blurDataURL={shimmer(400, 600)}
                className="w-full h-auto object-cover"
                unoptimized={true} // Since we are proxying from telegram
            />
        );
    case 'video':
      if (file.thumbnail_file_id) {
         const thumbUrl = getFileUrl(file.thumbnail_file_id);
         return (
            <div className="relative w-full h-auto group">
                <Image
                    src={thumbUrl}
                    alt={file.caption || "Video thumbnail"}
                    width={400}
                    height={300}
                    placeholder="blur"
                    blurDataURL={shimmer(400, 300)}
                    className="w-full h-auto object-cover"
                    unoptimized={true}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-12 h-12 text-white/80" />
                </div>
            </div>
         )
      }
      return <div className="w-full aspect-video bg-secondary flex items-center justify-center"><Video className={iconClass} /></div>;
    case 'document':
      return <div className="w-full aspect-video bg-secondary flex items-center justify-center"><FileText className={iconClass} /></div>;
    default:
      return <div className="w-full aspect-video bg-secondary flex items-center justify-center"><ImageIcon className={iconClass} /></div>;
  }
};


export const GalleryItem = ({ file, onSelectFile }) => {
  return (
    <Card 
        className="break-inside-avoid overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group bg-transparent border-border/20"
        onClick={() => onSelectFile(file)}
    >
      <CardContent className="p-0 cursor-pointer">
        <FilePreview file={file} />
      </CardContent>
    </Card>
  );
};
