import { useEffect, useState, useCallback } from "react";
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Download, Save, X, Image as ImageIcon, Video, FileText, Search, PlayCircle, Loader2, Trash2, FolderUp, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { withAuth, fetchWithAuth } from "@/context/AuthContext";

function AlbumDetailPage() {
  const router = useRouter();
  const { id: albumId } = router.query;
  const [album, setAlbum] = useState(null);
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingCaption, setEditingCaption] = useState("");
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [allAlbums, setAllAlbums] = useState([]); 
  const { toast } = useToast();

  const fetchFiles = useCallback(async () => {
    if (!albumId) return;
    setLoading(true);
    try {
        const res = await fetchWithAuth(`/api/files-in-album?albumId=${albumId}&caption=${search}&type=${typeFilter}`);
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        if (Array.isArray(data)) {
            setFiles(data);
            setError(null);
        } else {
            throw new Error(data.error || "Failed to load files.");
        }
    } catch (err) {
        setFiles([]);
        setError(err.message || "An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
  }, [albumId, search, typeFilter]);

  const fetchAlbumDetails = useCallback(async () => {
    if (!albumId) return;
    try {
        const res = await fetchWithAuth(`/api/albums/${albumId}`);
        const data = await res.json();
        if (data && !data.error) {
            setAlbum(data);
        } else {
            setError(data.error || "Could not load album details");
        }
    } catch (err) {
        setError(err.message);
    }
  }, [albumId]);
  
  const fetchAllAlbums = useCallback(async () => {
    try {
        const res = await fetchWithAuth('/api/albums');
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllAlbums(data);
        }
    } catch (err) {
        console.error("Failed to fetch all albums", err)
    }
  }, []);

  useEffect(() => {
    fetchFiles();
    fetchAlbumDetails();
    fetchAllAlbums();
  }, [fetchFiles, fetchAlbumDetails, fetchAllAlbums]);

  const handleEditClick = (file) => {
    setEditingId(file.id);
    setEditingCaption(file.caption || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingCaption("");
  };

  const handleUpdateCaption = async (fileId) => {
     const res = await fetchWithAuth('/api/update', {
        method: 'POST',
        body: JSON.stringify({ id: fileId, caption: editingCaption }),
    });
    const result = await res.json();
    if (result.success && result.file) {
        const updatedFile = { ...result.file, file_album_links: selectedFile.file_album_links };
        setFiles(files.map(f => (f.id === fileId ? updatedFile : f)));
        if (selectedFile && selectedFile.id === fileId) {
            setSelectedFile(updatedFile);
        }
        handleCancelEdit();
        toast({ title: "Caption Saved" });
    } else {
        toast({
            title: "Update Failed",
            description: result.error || "Unknown error",
            variant: "destructive"
        });
    }
  };

  const handleAlbumLinkChange = async (fileId, targetAlbumId, isChecked) => {
      const res = await fetchWithAuth('/api/file-album-link', {
          method: 'POST',
          body: JSON.stringify({ fileId: fileId, albumId: targetAlbumId, isChecked }),
      });
      const result = await res.json();
      if (result.success) {
            if (String(targetAlbumId) === String(albumId) && !isChecked) {
                setFiles(files.filter(f => f.id !== fileId));
                setSelectedFile(null); 
                toast({ title: "File removed from this album." });
            } else {
                const updatedFiles = files.map(file => {
                    if (file.id === fileId) {
                        let newLinks = [...file.file_album_links];
                        if (isChecked) {
                            newLinks.push({ album_id: targetAlbumId });
                        } else {
                            newLinks = newLinks.filter(link => link.album_id !== targetAlbumId);
                        }
                        return { ...file, file_album_links: newLinks };
                    }
                    return file;
                });
                setFiles(updatedFiles);

                if (selectedFile && selectedFile.id === fileId) {
                   let newLinks = [...selectedFile.file_album_links];
                   if (isChecked) {
                       newLinks.push({ album_id: targetAlbumId });
                   } else {
                       newLinks = newLinks.filter(link => link.album_id !== targetAlbumId);
                   }
                   setSelectedFile({...selectedFile, file_album_links: newLinks});
                }
                toast({ title: "Album link updated." });
            }
      } else {
          toast({
              title: "Update Failed",
              description: result.error || "Could not update album link.",
              variant: "destructive",
          });
      }
  };


  const handleMoveToTrash = async (fileToTrash) => {
    if (!fileToTrash) return;

    const res = await fetchWithAuth('/api/delete', {
      method: 'POST',
      body: JSON.stringify({ id: fileToTrash.id }),
    });
    const result = await res.json();

    if (result.success) {
      setFiles(files.filter(f => f.id !== fileToTrash.id));
      setSelectedFile(null);
      toast({
        title: "Moved to Trash",
        description: "The file has been moved to the trash bin.",
      });
    } else {
      toast({
        title: "Failed to Move",
        description: result.error || "Could not move the file to trash.",
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

  if (!album && loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (error) {
    return <div className="flex flex-col gap-4 justify-center items-center h-full text-destructive">
        <p>Error: {error}</p>
        <Button asChild><Link href="/albums"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Albums</Link></Button>
    </div>
  }

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex-shrink-0 sticky top-0 z-10 md:relative">
        <div className="px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 h-auto sm:h-16 border-b py-4 sm:py-0 glass-effect md:glass-effect-none md:bg-transparent md:border-0 md:shadow-none md:backdrop-blur-none">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link href="/albums" title="Back to Albums">
                        <ArrowLeft />
                    </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-foreground truncate" title={album?.name}>{album?.name}</h1>
                  <p className="text-sm text-muted-foreground">{album?.files[0]?.count || 0} items</p>
                </div>
            </div>
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
        
        {!loading && !error && files.length === 0 && (
           <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
            <ImageIcon className="w-24 h-24 mx-auto text-muted-foreground/50" strokeWidth={1} />
            <h2 className="text-2xl mt-4 font-semibold">This Album is Empty</h2>
            <p className="mt-2">Use the sidebar to upload new files to this album.</p>
          </div>
        )}
        
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 space-y-4">
          {files.map((f) => (
            <Card key={f.id} className="break-inside-avoid overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group bg-transparent border-border/20">
              <CardContent className="p-0 cursor-pointer" onClick={() => setSelectedFile(f)}>
                {renderFilePreview(f)}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={!!selectedFile} onOpenChange={(isOpen) => !isOpen && setSelectedFile(null)}>
          <DialogContent className="max-w-3xl w-11/12 p-0 flex flex-col h-[90vh]">
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
                <div className="flex-grow p-4 flex items-center justify-center bg-black/50 min-h-0">
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
                <CardFooter className="p-4 bg-background/80 border-t flex justify-end items-center gap-2 flex-shrink-0">
                    {editingId === selectedFile.id ? (
                        <>
                          <Button size="icon" variant="outline" onClick={() => handleUpdateCaption(selectedFile.id)} title="Save Caption"><Save className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={handleCancelEdit} title="Cancel Edit"><X className="w-4 h-4" /></Button>
                        </>
                    ) : (
                      <>
                        <Button size="icon" variant="outline" onClick={() => handleEditClick(selectedFile)} title="Edit Caption"><Edit className="w-4 h-4" /></Button>
                         <Popover>
                            <PopoverTrigger asChild>
                               <Button size="icon" variant="outline" title="Manage Albums"><FolderUp className="w-4 h-4" /></Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-0 glass-effect">
                                <div className="p-3 border-b">
                                  <p className="text-sm font-medium">Add to Albums</p>
                                </div>
                                <ScrollArea className="h-48">
                                  <div className="p-2 space-y-2">
                                      {allAlbums.length > 0 ? allAlbums.map(a => {
                                          const isChecked = selectedFile.file_album_links.some(link => link.album_id === a.id);
                                          return (
                                            <div key={a.id} className="flex items-center space-x-2">
                                              <Checkbox
                                                  id={`album-detail-${a.id}`}
                                                  checked={isChecked}
                                                  onCheckedChange={(checked) => handleAlbumLinkChange(selectedFile.id, a.id, checked)}
                                              />
                                              <Label htmlFor={`album-detail-${a.id}`} className="font-normal w-full truncate cursor-pointer">{a.name}</Label>
                                            </div>
                                          );
                                      }) : <p className="text-xs text-muted-foreground p-2">No albums yet.</p>}
                                  </div>
                                </ScrollArea>
                            </PopoverContent>
                        </Popover>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="destructive" title="Move to Trash"><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will move the file to the trash. You can restore it later.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleMoveToTrash(selectedFile)}>Move to Trash</AlertDialogAction>
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

export default withAuth(AlbumDetailPage);
