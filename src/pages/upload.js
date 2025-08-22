
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, UploadCloud, X as XIcon, ChevronDown, Folder } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [allAlbums, setAllAlbums] = useState([]);
  const [selectedAlbumIds, setSelectedAlbumIds] = useState(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/albums')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllAlbums(data);
        }
      })
      .catch(err => console.error("Failed to fetch albums", err));
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      selectedFile.preview = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setError(null);
      setUploadComplete(false);
      setUploadProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'image/*': ['.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov'],
      'application/*': ['.pdf', '.doc', '.docx', '.zip']
    }
  });

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
      setFile(null);
      setCaption("");
      setSelectedAlbumIds(new Set());
      setIsUploading(false);
      setError(null);
      setUploadComplete(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    
    setIsUploading(true);
    setUploadComplete(false);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);
    selectedAlbumIds.forEach(id => {
        formData.append("albumIds", id);
    });

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload", true);

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
        if (xhr.status === 200 && response.success) {
          toast({
              title: "Upload Successful!",
              description: `"${response.file.caption || file.name}" has been added.`,
              variant: "default",
          });
          resetForm();
          setUploadProgress(100);
          setTimeout(() => {
            setUploadComplete(false);
            setUploadProgress(0);
          }, 2000);
        } else {
          setUploadProgress(0);
          setError(response.error || "An unknown error occurred during upload.");
        }
      } catch (e) {
          setUploadProgress(0);
          setError("An unexpected error occurred parsing the server response.");
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setUploadProgress(0);
      setError("Upload failed. Please check your network connection and try again.");
    };

    xhr.send(formData);
  };
  
  const renderPreview = () => {
    if (!file) return null;
    const fileType = file.type.split('/')[0];
    const iconClass = "w-16 h-16 text-muted-foreground";

    if (fileType === 'image') {
      return <img src={file.preview} alt="Preview" className="max-h-48 rounded-md object-contain" onLoad={() => URL.revokeObjectURL(file.preview)} />;
    }
    if (fileType === 'video') {
       return <video className="max-h-48 rounded-md" src={file.preview} controls />;
    }
    return <Folder className={iconClass} />;
  }
  
  const selectedAlbums = allAlbums.filter(album => selectedAlbumIds.has(album.id));


  return (
    <div className="flex flex-col h-full w-full">
         <header className="flex-shrink-0 sticky top-0 z-10">
            <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 border-b glass-effect">
                <h1 className="text-2xl font-bold text-foreground">Upload File</h1>
            </div>
         </header>
         <main className="flex-grow overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="w-full flex justify-center">
                <Card className="w-full max-w-2xl shadow-lg bg-transparent border-border/20">
                  <form onSubmit={handleSubmit}>
                    <CardContent className="p-6">
                        <div {...getRootProps()} className={`w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                            <input {...getInputProps()} />
                            {file ? (
                                <div className="flex flex-col items-center gap-2">
                                    {renderPreview()}
                                    <p className="font-medium truncate max-w-xs">{file.name}</p>
                                    <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); setUploadProgress(0); setUploadComplete(false); }}>Choose another file</Button>
                                </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <UploadCloud className="w-12 h-12"/>
                                <p className="font-semibold">{isDragActive ? "Drop the file here..." : "Drag & drop file here, or click to select"}</p>
                                <p className="text-xs">Supports images, videos, and documents.</p>
                              </div>
                            )}
                        </div>

                        <div className="grid w-full items-center gap-4 mt-6">
                            <div>
                                <Label htmlFor="caption" className="font-medium">Caption</Label>
                                <Input id="caption" type="text" placeholder="Add an optional caption..." value={caption} onChange={(e) => setCaption(e.target.value)} className="mt-1"/>
                            </div>
                             <div>
                                <Label className="font-medium">Albums (optional)</Label>
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
                                       <ScrollArea className="h-48">
                                          <div className="p-2 space-y-2">
                                              {allAlbums.map(album => (
                                                  <div key={album.id} className="flex items-center space-x-2">
                                                      <Checkbox
                                                          id={`album-upload-${album.id}`}
                                                          checked={selectedAlbumIds.has(album.id)}
                                                          onCheckedChange={() => handleAlbumSelect(album.id)}
                                                      />
                                                      <Label htmlFor={`album-upload-${album.id}`} className="font-normal w-full truncate cursor-pointer">{album.name}</Label>
                                                  </div>
                                              ))}
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
                        
                        {(isUploading || uploadProgress > 0 || uploadComplete) && (
                            <div className="w-full mt-6">
                                <Progress value={uploadProgress} />
                                <p className="text-sm text-center mt-2 text-muted-foreground">
                                  {isUploading && `Uploading... ${uploadProgress}%`}
                                  {uploadComplete && 'Upload complete!'}
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
                        <Button type="submit" disabled={!file || isUploading} className="w-full">
                            {isUploading ? 'Uploading...' : 'Upload File'}
                        </Button>
                    </CardFooter>
                  </form>
                </Card>
            </div>
         </main>
    </div>
  );
}

    
