
import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { CardFooter } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Download, Save, X as XIcon, Image as ImageIcon, Video, FileText, Search, PlayCircle, Loader2, Trash2, FolderUp, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { withAuth, fetchWithAuth } from "@/context/AuthContext";
import { useInView } from "react-intersection-observer";
import { GalleryItem } from "@/components/GalleryItem";
import { useLayout } from "@/components/Layout";

function GalleryPage() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingCaption, setEditingCaption] = useState("");
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [albums, setAlbums] = useState([]);
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isInitialLoad = useRef(true);

  const { setMobileHeaderContent } = useLayout();

  useEffect(() => {
    setMobileHeaderContent({
      title: "Gallery",
      actions: (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon"><Filter /></Button>
          </PopoverTrigger>
          <PopoverContent className="mr-2 p-0 glass-effect">
            <div className="p-4 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-8 bg-muted/50 border-0 focus-visible:ring-primary w-full"
                    />
                    {search && (
                      <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearch('')}>
                        <XIcon className="h-4 w-4" />
                      </Button>
                    )}
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full bg-muted/50 border-0 focus:ring-primary">
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
          </PopoverContent>
        </Popover>
      ),
    });
  }, [setMobileHeaderContent, search, typeFilter]);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  const fetchFiles = useCallback(async (isNewSearch = false) => {
    if (isNewSearch) {
        setLoading(true);
        setFiles([]);
        setPage(1);
        setHasMore(true);
    } else {
        setLoadingMore(true);
    }
    
    const currentPage = isNewSearch ? 1 : page;

    try {
      const res = await fetchWithAuth(`/api/files?caption=${search}&type=${typeFilter}&page=${currentPage}`);
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      
      if (data.files && Array.isArray(data.files)) {
        setFiles(prevFiles => isNewSearch ? data.files : [...prevFiles, ...data.files]);
        setHasMore(data.hasMore);
        if(!isNewSearch) setPage(prevPage => prevPage + 1);
        setError(null);
      } else {
        throw new Error(data.error || "Failed to load files.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      if (isNewSearch) setLoading(false);
      setLoadingMore(false);
      isInitialLoad.current = false;
    }
  }, [search, typeFilter, page]);

  useEffect(() => {
    const handler = setTimeout(() => {
        fetchFiles(true);
    }, 500); 
    return () => clearTimeout(handler);
  }, [search, typeFilter]);

  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore && !isInitialLoad.current) {
      fetchFiles(false);
    }
  }, [inView, hasMore, loading, loadingMore, fetchFiles]);


  const fetchAlbums = useCallback(async () => {
    try {
        const res = await fetchWithAuth('/api/albums');
        const data = await res.json();
        if (Array.isArray(data)) {
          setAlbums(data);
        }
    } catch (err) {
        console.error("Failed to fetch albums", err)
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

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
  }
  
  const handleAlbumLinkChange = async (fileId, albumId, isChecked) => {
      const res = await fetchWithAuth('/api/file-album-link', {
          method: 'POST',
          body: JSON.stringify({ fileId, albumId, isChecked }),
      });
      const result = await res.json();
      if (result.success) {
          const updatedFiles = files.map(file => {
              if (file.id === fileId) {
                  let newLinks = [...file.file_album_links];
                  if (isChecked) {
                      newLinks.push({ album_id: albumId });
                  } else {
                      newLinks = newLinks.filter(link => link.album_id !== albumId);
                  }
                  return { ...file, file_album_links: newLinks };
              }
              return file;
          });
          setFiles(updatedFiles);
          if (selectedFile && selectedFile.id === fileId) {
             let newLinks = [...selectedFile.file_album_links];
             if (isChecked) {
                 newLinks.push({ album_id: albumId });
             } else {
                 newLinks = newLinks.filter(link => link.album_id !== albumId);
             }
             setSelectedFile({...selectedFile, file_album_links: newLinks});
          }
          toast({ title: "Album link updated." });
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
      setSelectedFile(null); // Close the modal
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
    if (selectedFile && selectedFile.id === file.id) {
       switch (file.type) {
        case 'photo': return <img src={getFileUrl(file.file_id)} alt={file.caption} className="max-w-full max-h-full object-contain" />;
        case 'video': return <video src={getFileUrl(file.file_id)} controls autoPlay className="max-w-full max-h-full object-contain" />;
        case 'document': return (
             <div className="flex flex-col items-center justify-center h-64 bg-secondary rounded-md p-8">
                <FileText className="w-24 h-24 text-muted-foreground" />
                <p className="mt-4 text-lg text-center">This is a document preview.</p>
                <a href={getFileUrl(file.file_id)} download={getDownloadFilename(file)} target="_blank" rel="noreferrer">
                    <Button className="mt-4">Download Document</Button>
                </a>
              </div>
        );
        default: return <p>Unsupported file type</p>
      }
    }
    return null;
  }

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex-shrink-0 sticky top-0 z-10 md:top-0">
        <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 h-16 border-b bg-background/95 backdrop-blur-sm">
            <h1 className="text-2xl font-bold text-foreground hidden md:block">Gallery</h1>
             <div className="hidden md:flex items-center gap-2 w-full md:w-auto justify-end">
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search by caption..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-10 bg-muted/50 border-0 focus-visible:ring-primary w-full"
                    />
                    {search && (
                      <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setSearch('')}>
                        <XIcon className="h-4 w-4" />
                      </Button>
                    )}
                </div>
                <Select value={typeFilter} onValueChange={(value) => {setTypeFilter(value); setPage(1);}}>
                    <SelectTrigger className="w-[180px] bg-muted/50 border-0 focus:ring-primary">
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
        
        {!loading && error && <p className="text-center text-destructive">Error: {error}</p>}
        
        {!loading && !error && files.length === 0 && (
           <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
            <ImageIcon className="w-24 h-24 mx-auto text-muted-foreground/50" strokeWidth={1} />
            <h2 className="text-2xl mt-4 font-semibold">Your Gallery is Empty</h2>
            <p className="mt-2">Use the sidebar to upload your first file.</p>
          </div>
        )}
        
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 space-y-4">
          {files.map((file) => (
            <GalleryItem key={file.id} file={file} onSelectFile={setSelectedFile} />
          ))}
        </div>
        
        {(hasMore || loadingMore) && (
            <div ref={loadMoreRef} className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )}

      </main>

       <Dialog open={!!selectedFile} onOpenChange={(isOpen) => !isOpen && setSelectedFile(null)}>
          <DialogContent className="max-w-3xl w-full h-full md:h-auto md:max-h-[90vh] p-0 flex flex-col sm:rounded-lg">
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
                   <DialogClose className="md:hidden absolute right-2 top-2 rounded-sm p-2 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                        <XIcon className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                   </DialogClose>
                </DialogHeader>
                <div className="flex-grow p-4 flex items-center justify-center bg-black/50 min-h-0">
                    <div className="relative w-full h-full flex items-center justify-center">
                      {renderFilePreview(selectedFile)}
                    </div>
                </div>
                <CardFooter className="p-2 md:p-4 bg-background/80 border-t flex justify-end items-center gap-2 flex-shrink-0 glass-effect md:rounded-b-lg">
                    {editingId === selectedFile.id ? (
                        <>
                          <Button size="icon" variant="outline" onClick={() => handleUpdateCaption(selectedFile.id)} title="Save Caption"><Save className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={handleCancelEdit} title="Cancel Edit"><XIcon className="w-4 h-4" /></Button>
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
                                      {albums.length > 0 ? albums.map(album => {
                                          const isChecked = selectedFile.file_album_links.some(link => link.album_id === album.id);
                                          return (
                                            <div key={album.id} className="flex items-center space-x-2">
                                              <Checkbox
                                                  id={`album-${album.id}`}
                                                  checked={isChecked}
                                                  onCheckedChange={(checked) => handleAlbumLinkChange(selectedFile.id, album.id, checked)}
                                              />
                                              <Label htmlFor={`album-${album.id}`} className="font-normal w-full truncate cursor-pointer">{album.name}</Label>
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

export default withAuth(GalleryPage);

    