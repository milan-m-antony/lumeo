

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, UploadCloud, X as XIcon, ChevronDown, Folder, File as FileIcon, PlusCircle } from "lucide-react";
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
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator";
import { withAuth, fetchWithAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const FilePreview = ({ fileWithPreview, caption, onCaptionChange, onRemove }) => {
  const { file, preview } = fileWithPreview;
  const fileType = file.type.split('/')[0];
  const iconClass = "w-10 h-10 text-muted-foreground";

  let previewElement;
  if (fileType === 'image') {
    previewElement = <img src={preview} alt={file.name} className="w-16 h-16 rounded-md object-cover" onLoad={() => URL.revokeObjectURL(preview)} />;
  } else if (fileType === 'video') {
    previewElement = <video className="w-16 h-16 rounded-md bg-black" src={preview} />;
  } else {
    previewElement = <div className="w-16 h-16 bg-secondary flex items-center justify-center rounded-md"><FileIcon className={iconClass} /></div>;
  }

  return (
    <div className="flex items-center justify-between p-2 border rounded-lg bg-muted/50 gap-2">
      <div className="flex items-center gap-3 flex-shrink-0">
        {previewElement}
        <span className="text-sm font-medium truncate hidden sm:inline-block max-w-[150px]">{file.name}</span>
      </div>
      <Input 
        type="text" 
        placeholder="Enter caption..." 
        value={caption} 
        onChange={onCaptionChange}
        className="flex-grow"
      />
      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => onRemove(file)}>
        <XIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};


function UploadPage() {
  const [fileEntries, setFileEntries] = useState([]);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [allAlbums, setAllAlbums] = useState([]);
  const [selectedAlbumIds, setSelectedAlbumIds] = useState(new Set());
  const { toast } = useToast();

  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDescription, setNewAlbumDescription] = useState("");


  const fetchAlbums = useCallback(async () => {
    try {
        const res = await fetchWithAuth('/api/albums');
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllAlbums(data);
        }
    } catch(err) {
        console.error("Failed to fetch albums", err)
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);
  
  useEffect(() => {
    return () => fileEntries.forEach(entry => URL.revokeObjectURL(entry.file.preview));
  }, [fileEntries]);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const newFileEntries = acceptedFiles.map(file => ({
        file: Object.assign(file, {
            preview: URL.createObjectURL(file)
        }),
        caption: "",
      }));
      setFileEntries(prevEntries => [...prevEntries, ...newFileEntries]);
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
    URL.revokeObjectURL(fileToRemove.preview);
    setFileEntries(prevEntries => prevEntries.filter(entry => entry.file !== fileToRemove));
  };
  
  const handleCaptionChange = (index, newCaption) => {
      setFileEntries(prevEntries => {
          const updatedEntries = [...prevEntries];
          updatedEntries[index].caption = newCaption;
          return updatedEntries;
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
      setFileEntries([]);
      setSelectedAlbumIds(new Set());
      setIsUploading(false);
      setError(null);
      setUploadProgress(0);
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
      
      toast({ title: "Album Created!", description: `"${result.name}" has been created and selected.` });

      setNewAlbumName("");
      setNewAlbumDescription("");
      setIsCreateAlbumOpen(false);
    } else {
      toast({ title: "Failed to Create Album", description: result.error, variant: "destructive" });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fileEntries.length === 0) {
      setError("Please select at least one file to upload.");
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
        setError("Authentication token not found. Please log in again.");
        setIsUploading(false);
        return;
    }
    
    const formData = new FormData();
    fileEntries.forEach(entry => {
      formData.append("files", entry.file);
      formData.append("captions", entry.caption);
    });
    
    selectedAlbumIds.forEach(id => {
        formData.append("albumIds", id);
    });

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload", true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
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
              variant: "default",
          });
          resetForm();
        } else {
          setError(response.error || "An unknown error occurred during upload.");
        }
      } catch (e) {
          setError("An unexpected error occurred parsing the server response.");
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setError("Upload failed. Please check your network connection and try again.");
    };

    xhr.send(formData);
  };
  
  const selectedAlbums = allAlbums.filter(album => selectedAlbumIds.has(album.id));

  return (
    <div className="flex flex-col h-full w-full">
         <header className="flex-shrink-0 sticky top-0 z-10 md:relative">
            <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 border-b glass-effect md:glass-effect-none md:bg-transparent md:border-0 md:shadow-none md:backdrop-blur-none">
                <h1 className="text-2xl font-bold text-foreground">Upload Files</h1>
            </div>
         </header>
         <main className="flex-grow overflow-auto p-4 sm:p-6 lg:p-8 flex items-center group-data-[state=expanded]/sidebar-wrapper:md:ml-20 md:ml-72 transition-all duration-200 ease-in-out">
            <div className="max-w-2xl">
                <Card className="shadow-lg bg-transparent border-border/20">
                  <form onSubmit={handleSubmit}>
                    <CardContent className="p-6">
                        <div {...getRootProps()} className={`w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <UploadCloud className="w-12 h-12"/>
                              <p className="font-semibold">{isDragActive ? "Drop the files here..." : "Drag & drop files here, or click to select"}</p>
                              <p className="text-xs">Supports multiple images, videos, and documents.</p>
                            </div>
                        </div>
                        
                        {fileEntries.length > 0 && (
                          <div className="mt-4">
                            <Label>Selected Files ({fileEntries.length})</Label>
                            <ScrollArea className="h-48 mt-2">
                              <div className="space-y-2 pr-4">
                                {fileEntries.map((entry, index) => (
                                  <FilePreview 
                                    key={`${entry.file.name}-${index}`} 
                                    fileWithPreview={{ file: entry.file, preview: entry.file.preview }}
                                    caption={entry.caption}
                                    onCaptionChange={(e) => handleCaptionChange(index, e.target.value)}
                                    onRemove={removeFile} 
                                  />
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
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="new-album-name" className="text-right">Name</Label>
                                                        <Input id="new-album-name" value={newAlbumName} onChange={(e) => setNewAlbumName(e.target.value)} className="col-span-3" />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="new-album-description" className="text-right">Description</Label>
                                                        <Textarea id="new-album-description" value={newAlbumDescription} onChange={(e) => setNewAlbumDescription(e.target.value)} className="col-span-3" />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setIsCreateAlbumOpen(false)}>Cancel</Button>
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
                        
                        {isUploading && (
                            <div className="w-full mt-6">
                                <Label>Overall Progress</Label>
                                <Progress value={uploadProgress} className="mt-1" />
                                <p className="text-sm text-center mt-2 text-muted-foreground">
                                  {`Uploading ${fileEntries.length} files... ${uploadProgress}%`}
                                </p>
                            </div>
                        )}

                        {error && (
                             <Alert variant="destructive" className="w-full mt-6">
                               <AlertCircle className="h-4 w-4" />
                               <AlertTitle>Upload Failed</AlertTitle>
                               <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                    </CardContent>
                    <CardFooter className="w-full p-6 pt-0">
                        <Button type="submit" disabled={fileEntries.length === 0 || isUploading} className="w-full">
                            {isUploading ? 'Uploading...' : `Upload ${fileEntries.length} File(s)`}
                        </Button>
                    </CardFooter>
                  </form>
                </Card>
            </div>
         </main>
    </div>
  );
}

export default withAuth(UploadPage);
