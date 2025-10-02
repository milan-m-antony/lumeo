import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Image as ImageIcon, Video, FileText, Loader2, Trash2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { withAuth, fetchWithAuth } from "@/context/AuthContext";
import { useLayout } from "@/components/Layout";

function TrashPage() {
  const [trashedFiles, setTrashedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const { setMobileHeaderContent } = useLayout();

  useEffect(() => {
    setMobileHeaderContent({ title: "Trash" });
  }, [setMobileHeaderContent]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const res = await fetchWithAuth('/api/trashed-files');
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        if (Array.isArray(data)) {
          setTrashedFiles(data);
          setError(null);
        } else {
          throw new Error(data.error || "Failed to load trashed files.");
        }
    } catch(err) {
        setTrashedFiles([]);
        setError(err.message || "An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRestoreFile = async (fileToRestore) => {
    if (!fileToRestore) return;

    const res = await fetchWithAuth('/api/restore', {
      method: 'POST',
      body: JSON.stringify({ id: fileToRestore.id }),
    });
    const result = await res.json();

    if (result.success) {
      setTrashedFiles(files => files.filter(f => f.id !== fileToRestore.id));
      toast({
        title: "File Restored",
        description: "The file has been restored to your gallery.",
      });
    } else {
      toast({
        title: "Restore Failed",
        description: result.error || "Could not restore the file.",
        variant: "destructive",
      });
    }
  };
  
  const handlePermanentDelete = async (fileToDelete) => {
    if (!fileToDelete) return;

    const res = await fetchWithAuth('/api/permanent-delete', {
      method: 'POST',
      body: JSON.stringify({ id: fileToDelete.id, tg_message_id: fileToDelete.tg_message_id }),
    });
    const result = await res.json();

    if (result.success) {
      setTrashedFiles(files => files.filter(f => f.id !== fileToDelete.id));
      toast({
        title: "File Deleted Permanently",
        description: "The file has been permanently removed.",
      });
    } else {
      toast({
        title: "Permanent Deletion Failed",
        description: result.error || "Could not permanently delete the file.",
        variant: "destructive",
      });
    }
  };


  const getFileUrl = (fileId) => `/api/download?file_id=${fileId}`;

  const renderFilePreview = (file) => {
    const iconClass = "w-12 h-12 text-muted-foreground";
    switch (file.type) {
      case 'photo':
        return <img src={getFileUrl(file.thumbnail_file_id || file.file_id)} alt={file.caption} className="w-full h-32 object-cover" data-ai-hint="gallery photo" onError={(e) => {e.target.onerror = null; e.target.src='https://placehold.co/400x300.png';}} />;
      case 'video':
        if (file.thumbnail_file_id) {
          return <img src={getFileUrl(file.thumbnail_file_id)} alt={`${file.caption} thumbnail`} className="w-full h-32 object-cover" onError={(e) => {e.target.onerror = null; e.target.src='https://placehold.co/400x300.png';}}/>;
        }
        return <div className="w-full h-32 bg-secondary/20 flex items-center justify-center"><Video className={iconClass} /></div>;
      case 'document':
        return <div className="w-full h-32 bg-secondary/20 flex items-center justify-center"><FileText className={iconClass} /></div>;
      default:
        return <div className="w-full h-32 bg-secondary/20 flex items-center justify-center"><ImageIcon className={iconClass} /></div>;
    }
  };
  
  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex-shrink-0 sticky top-0 z-10 hidden md:block">
        <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 border-b bg-background/95 backdrop-blur-sm md:bg-transparent md:border-0 md:shadow-none md:backdrop-blur-none">
          <h1 className="text-2xl font-bold text-foreground">Trash</h1>
        </div>
      </header>

      <main className="flex-grow overflow-auto p-4 sm:p-6 lg:p-8">
        {loading && <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
        {error && <p className="text-center text-destructive">Error: {error}</p>}

        {!loading && !error && trashedFiles.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
            <Trash2 className="w-24 h-24 mx-auto text-muted-foreground/50" strokeWidth={1} />
            <h2 className="text-2xl mt-4 font-semibold">Your Trash is Empty</h2>
            <p className="mt-2">Deleted files will appear here.</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {trashedFiles.map((f) => (
            <Card key={f.id} className="overflow-hidden shadow-md flex flex-col bg-transparent border-border/20">
                <CardContent className="p-0">
                    {renderFilePreview(f)}
                </CardContent>
                <div className="p-4 flex-grow flex flex-col bg-background/50 backdrop-blur-sm">
                    <p className="text-sm font-medium truncate flex-grow" title={f.caption || "No Caption"}>{f.caption || "No Caption"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Deleted {formatDistanceToNow(new Date(f.deleted_at), { addSuffix: true })}
                    </p>
                </div>
                <CardFooter className="p-2 border-t bg-muted/50">
                    <div className="flex w-full justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleRestoreFile(f)} title="Restore">
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive" title="Delete Permanently">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the file from your gallery and from Telegram.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handlePermanentDelete(f)}>Delete Permanently</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

export default withAuth(TrashPage);
