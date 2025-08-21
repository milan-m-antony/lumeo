
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Download, Save, X, Image as ImageIcon, Video, FileText, Search, PlayCircle, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingCaption, setEditingCaption] = useState("");
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { toast } = useToast();

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch(`/api/files?caption=${search}&type=${typeFilter}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
          if (Array.isArray(data)) {
            setFiles(data);
            setError(null);
          } else {
            throw new Error(data.error || "Failed to load files.");
          }
      })
      .catch((err) => {
        setFiles([]);
        setError(err.message || "An unexpected error occurred.");
      })
      .finally(() => setLoading(false));
  }, [search, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditClick = (file) => {
    setEditingId(file.id);
    setEditingCaption(file.caption || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingCaption("");
  };

  const handleUpdateCaption = async (fileId) => {
    if (!fileId) return;
    const res = await fetch('/api/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fileId, caption: editingCaption }),
    });
    const result = await res.json();
    if (result.success && result.file) {
        setFiles(files.map(f => (f.id === fileId ? result.file : f)));
        if (selectedFile && selectedFile.id === fileId) {
            setSelectedFile(result.file);
        }
        handleCancelEdit();
    } else {
        toast({
            title: "Update Failed",
            description: result.error || "Unknown error",
            variant: "destructive"
        });
    }
  };

  const handleDeleteFile = async (fileToDelete) => {
    if (!fileToDelete) return;

    const res = await fetch('/api/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: fileToDelete.id, tg_message_id: fileToDelete.tg_message_id }),
    });
    const result = await res.json();

    if (result.success) {
      setFiles(files.filter(f => f.id !== fileToDelete.id));
      setSelectedFile(null); // Close the modal
      toast({
        title: "File Deleted",
        description: "The file has been successfully removed.",
      });
    } else {
      toast({
        title: "Deletion Failed",
        description: result.error || "Could not delete the file.",
        variant: "destructive",
      });
    }
  }

  const getFileUrl = (fileId) => `/api/download?file_id=${fileId}`;

  const getDownloadFilename = (file) => {
    if (!file) return 'download';
    
    const caption = file.caption || 'lumeo_file';
    const safeCaption = caption.replace(/[^a-z0-9_ -]/gi, '_').replace(/ /g, '_');
    
    switch (file.type) {
        case 'photo': return `${safeCaption}.jpeg`;
        case 'video': return `${safeCaption}.mp4`;
        case 'document': return `${safeCaption}.zip`;
        default: return safeCaption;
    }
  };

  const renderFilePreview = (file) => {
    const iconClass = "w-16 h-16 text-muted-foreground";
    switch (file.type) {
      case 'photo':
        return <img src={getFileUrl(file.file_id)} alt={file.caption} className="w-full h-auto block" data-ai-hint="gallery photo" onError={(e) => {e.target.onerror = null; e.target.src='https://placehold.co/400x600.png';}} />;
      case 'video':
        if (file.thumbnail_file_id) {
          return (
            <div className="relative w-full h-auto group">
              <img src={getFileUrl(file.thumbnail_file_id)} alt={`${file.caption} thumbnail`} className="w-full h-auto block" onError={(e) => {e.target.onerror = null; e.target.src='https://placehold.co/400x600.png';}}/>
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle className="w-12 h-12 text-white/80" />
              </div>
            </div>
          );
        }
        return <div className="w-full aspect-video bg-secondary flex items-center justify-center"><Video className={iconClass} /></div>;
      case 'document':
        return <div className="w-full aspect-video bg-secondary flex items-center justify-center"><FileText className={iconClass} /></div>;
      default:
        return <div className="w-full aspect-video bg-secondary flex items-center justify-center"><ImageIcon className={iconClass} /></div>;
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex-shrink-0 bg-background/95 sticky top-0 z-10 backdrop-blur-sm">
        <div className="px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 h-auto sm:h-16 border-b py-4 sm:py-0">
            <h1 className="text-2xl font-bold text-foreground">Gallery</h1>
             <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search by caption..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-muted/50 border-0 focus-visible:ring-primary w-full"
                    />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[150px] bg-muted/50 border-0 focus:ring-primary">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="photo">Photos</SelectItem>
                        <SelectItem value="video">Videos</SelectItem>
                        <SelectItem value="document">Documents</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </header>
      
      <main className="flex-grow overflow-auto p-4 sm:p-6 lg:p-8">
        {loading && <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
        {error && <p className="text-center text-destructive">Error: {error}</p>}

        {!loading && !error && files.length === 0 && (
           <div className="text-center text-muted-foreground py-16">
            <ImageIcon className="w-24 h-24 mx-auto text-muted-foreground/50" strokeWidth={1} />
            <h2 className="text-2xl mt-4 font-semibold">Your Gallery is Empty</h2>
            <p className="mt-2">Use the sidebar to upload your first file.</p>
          </div>
        )}
        
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 space-y-4">
          {files.map((f) => (
            <div key={f.id} className="break-inside-avoid" onClick={() => setSelectedFile(f)}>
              <Card className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
                <CardContent className="p-0">
                  {renderFilePreview(f)}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>

      <Dialog open={!!selectedFile} onOpenChange={(isOpen) => !isOpen && setSelectedFile(null)}>
          <DialogContent className="max-w-4xl w-[90vw] h-[90vh] p-0 flex flex-col">
             {selectedFile && (
                <>
                <DialogHeader className="p-4 border-b flex-shrink-0">
                  <DialogTitle className="truncate">
                    {editingId === selectedFile.id ? (
                        <Input value={editingCaption} onChange={(e) => setEditingCaption(e.target.value)} placeholder="Enter caption" className="text-lg"/>
                    ) : (
                        selectedFile.caption || "No Caption"
                    )}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-grow p-4 flex items-center justify-center bg-secondary min-h-0">
                    <div className="relative w-full h-full flex items-center justify-center">
                      {selectedFile.type === 'photo' && <img src={getFileUrl(selectedFile.file_id)} alt={selectedFile.caption} className="max-w-full max-h-full object-contain" />}
                      {selectedFile.type === 'video' && <video src={getFileUrl(selectedFile.file_id)} controls autoPlay className="max-w-full max-h-full object-contain" />}
                      {selectedFile.type === 'document' && (
                          <div className="flex flex-col items-center justify-center h-64 bg-secondary rounded-md p-8">
                            <FileText className="w-24 h-24 text-muted-foreground" />
                            <p className="mt-4 text-lg text-center">This is a document preview.</p>
                            <a href={getFileUrl(selectedFile.file_id)} download={getDownloadFilename(selectedFile)} target="_blank" rel="noreferrer">
                                <Button className="mt-4">Download Document</Button>
                            </a>
                          </div>
                      )}
                    </div>
                </div>
                <CardFooter className="p-4 bg-background border-t flex justify-end items-center gap-2 flex-shrink-0">
                    {editingId === selectedFile.id ? (
                        <>
                          <Button size="icon" variant="outline" onClick={() => handleUpdateCaption(selectedFile.id)} title="Save Caption"><Save className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={handleCancelEdit} title="Cancel Edit"><X className="w-4 h-4" /></Button>
                        </>
                    ) : (
                      <>
                        <Button size="icon" variant="outline" onClick={() => handleEditClick(selectedFile)} title="Edit Caption"><Edit className="w-4 h-4" /></Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="destructive" title="Delete File"><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the file
                                    from your gallery and from Telegram.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteFile(selectedFile)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                    <a href={getFileUrl(selectedFile.file_id)} download={getDownloadFilename(selectedFile)} target="_blank" rel="noreferrer" title="Download File">
                      <Button size="icon" variant="outline"><Download className="w-4 h-4" /></Button>
                    </a>
                </CardFooter>
                </>
             )}
          </DialogContent>
        </Dialog>
    </div>
  );
}
