
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { CheckCircle, AlertCircle, UploadCloud, X as XIcon, ChevronDown, File as FileIcon, PlusCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea";
import { withAuth, fetchWithAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useLayout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";


const FileUploadItem = ({ file, progress, status, error }) => {
    const fileType = file.type.split('/')[0];
    const iconClass = "w-8 h-8 text-muted-foreground";

    let previewElement;
    if (fileType === 'image' && file.preview) {
      previewElement = <img src={file.preview} alt={file.name} className="w-12 h-12 rounded-md object-cover" />;
    } else if (fileType === 'video' && file.preview) {
      previewElement = <video className="w-12 h-12 rounded-md bg-black" src={file.preview} />;
    } else {
      previewElement = <div className="w-12 h-12 bg-secondary flex items-center justify-center rounded-md"><FileIcon className={iconClass} /></div>;
    }

    return (
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
            {previewElement}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                {status === 'uploading' && <Progress value={progress} className="h-1 mt-1" />}
                {status === 'error' && <p className="text-xs text-destructive mt-1 truncate">{error}</p>}
            </div>
            <div className="flex-shrink-0">
                {status === 'uploading' && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {status === 'error' && <AlertCircle className="h-5 w-5 text-destructive" />}
            </div>
        </div>
    );
};


function UploadPage() {
  const [fileEntries, setFileEntries] = useState([]);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [allAlbums, setAllAlbums] = useState([]);
  const [selectedAlbumIds, setSelectedAlbumIds] = useState(new Set());
  const { toast } = useToast();
  
  const [uploadState, setUploadState] = useState({
      progress: 0,
      files: [], // { file, status: 'pending' | 'uploading' | 'success' | 'error', progress: 0, error: null }
  });


  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDescription, setNewAlbumDescription] = useState("");
  const { setMobileHeaderContent } = useLayout();

  useEffect(() => {
    setMobileHeaderContent({ title: "Upload Files" });
  }, [setMobileHeaderContent]);


  const fetchAlbums = useCallback(async () => {
    try {
        const res = await fetchWithAuth('/api/albums');
        if (!res.ok) throw new Error("Failed to fetch albums");
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllAlbums(data);
        } else {
           if(data.error) throw new Error(data.error);
        }
    } catch(err) {
        console.error("Failed to fetch albums", err)
        toast({
            title: "Failed to load albums",
            description: err.message,
            variant: "destructive",
        });
    }
  }, [toast]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);
  
  useEffect(() => {
    return () => uploadState.files.forEach(f => {
        if(f.file.preview) URL.revokeObjectURL(f.file.preview)
    });
  }, [uploadState.files]);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.map(file => ({
        file: Object.assign(file, {
            preview: URL.createObjectURL(file)
        }),
        caption: "",
        status: 'pending',
        progress: 0,
        error: null,
      }));
      setUploadState(prevState => ({ ...prevState, files: [...prevState.files, ...newFiles]}));
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'image/*': ['.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov'],
      'application/*': ['.pdf', '.doc', '.docx', '.zip']
    }
  });

  const removeFile = (fileToRemove) => {
    if(fileToRemove.preview) URL.revokeObjectURL(fileToRemove.preview);
    setUploadState(prevState => ({
        ...prevState,
        files: prevState.files.filter(f => f.file !== fileToRemove)
    }));
  };
  
  const handleCaptionChange = (index, newCaption) => {
      setUploadState(prev => {
          const updatedFiles = [...prev.files];
          updatedFiles[index].caption = newCaption;
          return { ...prev, files: updatedFiles };
      });
  };
  
  const handleAlbumSelect = (albumId) => {
    const newSelection = new Set(selectedAlbumIds);
    if (newSelection.has(albumId)) {
      newSelection.delete(albumId);
    } else {
      newSelection.add(albumId);
    }
    setSelectedAlbumIds(newSelection);
  };
  
  const resetForm = useCallback(() => {
      setUploadState({ progress: 0, files: [] });
      setSelectedAlbumIds(new Set());
      setIsUploading(false);
      setError(null);
  }, []);

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) {
      toast({ title: "Album name is required", variant: "destructive" });
      return;
    }
    const res = await fetchWithAuth('/api/albums', {
      method: 'POST',
      body: JSON.stringify({ name: newAlbumName, description: newAlbumDescription }),
    });

    const result = await res.json();
    if (res.ok) {
      const newAlbumWithDefaults = { ...result, files: [{ count: 0 }], cover_file_id: null };
      setAllAlbums(prev => [newAlbumWithDefaults, ...prev]);
      handleAlbumSelect(result.id);
      
      toast({ title: "Album Created!", description: `"${result.name}" has been created and selected.`, variant: 'success' });

      setNewAlbumName("");
      setNewAlbumDescription("");
      setIsCreateAlbumOpen(false);
    } else {
      toast({ title: "Failed to Create Album", description: result.error, variant: "destructive" });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadState.files.length === 0) {
      setError("Please select at least one file to upload.");
      return;
    }
    
    setIsUploading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
        setError("Authentication token not found. Please log in again.");
        setIsUploading(false);
        return;
    }
    
    const formData = new FormData();
    uploadState.files.forEach(entry => {
      formData.append("files", entry.file);
      formData.append("captions", entry.caption);
    });
    
    selectedAlbumIds.forEach(id => {
        formData.append("albumIds", id);
    });
    
    setUploadState(prev => ({
        ...prev,
        files: prev.files.map(f => ({...f, status: 'uploading', progress: 0}))
    }));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload", true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadState(prev => ({ ...prev, progress: percentComplete }));
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && response.success) {
          toast({
              title: "Upload Complete!",
              description: response.message,
              variant: "success",
          });
          resetForm();
        } else {
          const serverError = response.error || "An unknown error occurred during upload.";
          setError(serverError);
          setUploadState(prev => ({...prev, files: prev.files.map(f => ({...f, status: 'error', error: serverError}))}));
          toast({
            title: "Upload Failed",
            description: serverError,
            variant: "destructive"
          });
        }
      } catch (e) {
          const errorMessage = "An unexpected error occurred parsing the server response.";
          setError(errorMessage);
          setUploadState(prev => ({...prev, files: prev.files.map(f => ({...f, status: 'error', error: errorMessage}))}));
          toast({
              title: "Upload Failed",
              description: errorMessage,
              variant: "destructive"
          });
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      const errorMessage = "Upload failed. Please check your network connection and try again.";
      setError(errorMessage);
      setUploadState(prev => ({...prev, files: prev.files.map(f => ({...f, status: 'error', error: errorMessage}))}));
      toast({
          title: "Network Error",
          description: errorMessage,
          variant: "destructive"
      });
    };

    xhr.send(formData);
  };
  
  const selectedAlbums = allAlbums.filter(album => selectedAlbumIds.has(album.id));

  return (
    <div className="flex flex-col h-full w-full">
      <PageHeader title="Upload Files" />
      <main className="flex-grow overflow-auto p-2 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto">
          <AnimatePresence>
            {!isUploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="shadow-lg bg-transparent border-border/20">
                  <form onSubmit={handleSubmit}>
                    <CardContent className="p-4 sm:p-6">
                      <div {...getRootProps()} className={`w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <UploadCloud className="w-12 h-12"/>
                          <p className="font-semibold">{isDragActive ? "Drop the files here..." : "Drag & drop files here, or click to select"}</p>
                          <p className="text-xs">Supports multiple images, videos, and documents.</p>
                        </div>
                      </div>
                      
                       {uploadState.files.length > 0 && (
                        <div className="mt-4">
                          <Label>Selected Files ({uploadState.files.length})</Label>
                          <ScrollArea className={cn("mt-2", uploadState.files.length > 3 ? "h-64" : "h-auto")}>
                            <div className="space-y-2 pr-4">
                              {uploadState.files.map((entry, index) => (
                                <div key={`${entry.file.name}-${index}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg bg-muted/50 gap-3 relative">
                                  <div className="flex items-center gap-4 flex-grow w-full">
                                    <div className="w-16 h-16 bg-secondary flex items-center justify-center rounded-md flex-shrink-0">
                                      {entry.file.type.startsWith('image/') ? (
                                        <img src={entry.file.preview} alt={entry.file.name} className="w-full h-full object-cover rounded-md" />
                                      ) : (
                                        <FileIcon className="w-8 h-8 text-muted-foreground" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{entry.file.name}</p>
                                      <p className="text-xs text-muted-foreground">{Math.round(entry.file.size / 1024)} KB</p>
                                    </div>
                                  </div>
                                  <Textarea 
                                    placeholder="Enter caption..." 
                                    value={entry.caption} 
                                    onChange={(e) => handleCaptionChange(index, e.target.value)}
                                    className="flex-grow w-full sm:w-auto min-h-[40px] h-10 resize-none"
                                    rows={1}
                                  />
                                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 absolute top-1 right-1 sm:static" onClick={() => removeFile(entry.file)}>
                                    <XIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}


                      <div className="grid w-full items-center gap-4 mt-6">
                        <div>
                          <Label className="font-medium">Add to Albums (optional, for all files)</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start font-normal mt-1">
                                <div className="flex items-center justify-between w-full">
                                  <span className="truncate">
                                    {selectedAlbums.length === 0 && "Select albums..."}
                                    {selectedAlbums.length > 0 && selectedAlbums.map(a => a.name).join(', ')}
                                  </span>
                                  <ChevronDown className="h-4 w-4 opacity-50"/>
                                </div>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 glass-effect">
                              <Dialog open={isCreateAlbumOpen} onOpenChange={setIsCreateAlbumOpen}>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" className="w-full justify-start rounded-none border-b">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create New Album
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Create New Album</DialogTitle>
                                    <DialogDescription>
                                      Give your new album a name and an optional description. It will be automatically selected.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-2 pb-4">
                                      <div className="space-y-2">
                                          <Label htmlFor="new-album-name-upload">Name</Label>
                                          <Input id="new-album-name-upload" value={newAlbumName} onChange={(e) => setNewAlbumName(e.target.value)} />
                                      </div>
                                      <div className="space-y-2">
                                          <Label htmlFor="new-album-description-upload">Description</Label>
                                          <Textarea id="new-album-description-upload" value={newAlbumDescription} onChange={(e) => setNewAlbumDescription(e.target.value)} />
                                      </div>
                                  </div>
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button variant="outline" type="button">Cancel</Button>
                                    </DialogClose>
                                    <Button type="button" onClick={handleCreateAlbum}>Create Album</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <ScrollArea className="h-48">
                                <div className="p-2 space-y-2">
                                  {allAlbums.length > 0 ? allAlbums.map(album => (
                                    <div key={album.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`album-upload-${album.id}`}
                                        checked={selectedAlbumIds.has(album.id)}
                                        onCheckedChange={() => handleAlbumSelect(album.id)}
                                      />
                                      <Label htmlFor={`album-upload-${album.id}`} className="font-normal w-full truncate cursor-pointer">{album.name}</Label>
                                    </div>
                                  )) : (
                                    <p className="text-xs text-muted-foreground p-2 text-center">No albums created yet.</p>
                                  )}
                                </div>
                              </ScrollArea>
                            </PopoverContent>
                          </Popover>
                          <div className="pt-2 flex flex-wrap gap-1">
                            {selectedAlbums.map(album => (
                              <Badge key={album.id} variant="secondary">
                                {album.name}
                                <button type="button" onClick={() => handleAlbumSelect(album.id)} className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                  <XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {error && (
                        <Alert variant="destructive" className="w-full mt-6">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                    </CardContent>
                    <CardFooter className="w-full p-4 sm:p-6 pt-0">
                      <Button type="submit" disabled={uploadState.files.length === 0} className="w-full">
                         Upload {uploadState.files.length > 0 ? `${uploadState.files.length} File(s)`: ''}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {isUploading && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-lg bg-transparent border-border/20">
                  <CardContent className="p-4 sm:p-6">
                      <div className="mb-4">
                          <h3 className="text-lg font-semibold">Uploading Files...</h3>
                          <p className="text-muted-foreground text-sm">Please keep this window open until all uploads are complete.</p>
                      </div>
                      <div className="w-full mt-4">
                          <Label>Overall Progress</Label>
                          <Progress value={uploadState.progress} className="mt-1" />
                          <p className="text-sm text-center mt-2 text-muted-foreground">
                            {`${uploadState.progress}% complete`}
                          </p>
                      </div>
                  </CardContent>
              </Card>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}

export default withAuth(UploadPage);
