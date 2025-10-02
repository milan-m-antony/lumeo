import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle, Video, FileText, ImageIcon, CheckCircle } from "lucide-react";

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


export const GalleryItem = ({ file, onFileClick, isSelected, isSelectionMode }) => {
  return (
    <Card 
        className="break-inside-avoid overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group bg-transparent border-border/20 relative"
        onClick={() => onFileClick(file)}
    >
       {isSelectionMode && (
         <div className={`absolute top-2 right-2 z-10 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-black/40 text-white/70'}`}>
            {isSelected ? <CheckCircle className="h-5 w-5" /> : <div className="h-4 w-4 rounded-full border-2 border-white"></div>}
         </div>
       )}
       {isSelected && (
           <div className="absolute inset-0 bg-primary/40 ring-2 ring-primary z-0 pointer-events-none" />
       )}
      <CardContent className="p-0 cursor-pointer">
        <FilePreview file={file} />
      </CardContent>
    </Card>
  );
};
