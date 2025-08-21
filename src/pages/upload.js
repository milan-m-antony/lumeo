import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, UploadCloud, Image as ImageIcon, Video, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


export default function Upload() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      // Create a preview URL
      selectedFile.preview = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setError(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);

    // Using XMLHttpRequest to monitor progress
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
      setUploadProgress(100);
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && response.success) {
          toast({
              title: "Upload Successful!",
              description: `"${response.file.caption || file.name}" has been added to the gallery.`,
              variant: "default",
          });
          setFile(null);
          setCaption("");
          setUploadProgress(0);
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
  
  const renderPreview = () => {
    if (!file) return null;
    const fileType = file.type.split('/')[0];
    const iconClass = "w-16 h-16 text-muted-foreground";

    if (fileType === 'image') {
      return <img src={file.preview} alt="Preview" className="max-h-48 rounded-md object-contain" onLoad={() => URL.revokeObjectURL(file.preview)} />;
    }
    if (fileType === 'video') {
       return <Video className={iconClass} />;
    }
    return <FileText className={iconClass} />;
  }


  return (
    <div className="flex flex-col h-full w-full">
         <header className="flex-shrink-0 bg-background/95 sticky top-0 z-10 backdrop-blur-sm">
            <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 border-b">
                <h1 className="text-2xl font-bold text-foreground">Upload File</h1>
            </div>
         </header>
         <main className="flex-grow overflow-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <Card className="w-full max-w-2xl shadow-lg">
              <form onSubmit={handleSubmit}>
                <CardContent className="p-6">
                    <div {...getRootProps()} className={`w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                        <input {...getInputProps()} />
                        {file ? (
                            <div className="flex flex-col items-center gap-2">
                                {renderPreview()}
                                <p className="font-medium truncate max-w-xs">{file.name}</p>
                                <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); setUploadProgress(0); }}>Choose another file</Button>
                            </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <UploadCloud className="w-12 h-12"/>
                            <p className="font-semibold">{isDragActive ? "Drop the file here..." : "Drag & drop file here, or click to select"}</p>
                            <p className="text-xs">Supports images, videos, and documents.</p>
                          </div>
                        )}
                    </div>

                    <div className="grid w-full items-center gap-1.5 mt-6">
                        <label htmlFor="caption" className="font-medium">Caption</label>
                        <Input id="caption" type="text" placeholder="Add an optional caption..." value={caption} onChange={(e) => setCaption(e.target.value)} />
                    </div>
                    
                    {(isUploading || uploadProgress > 0) && (
                        <div className="w-full mt-6">
                            <Progress value={uploadProgress} />
                            <p className="text-sm text-center mt-2 text-muted-foreground">{uploadProgress > 0 && uploadProgress < 100 ? `${uploadProgress}% complete` : ''}</p>
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
                <CardFooter className="w-full">
                    <Button type="submit" disabled={!file || isUploading} className="w-full">
                        {isUploading ? 'Uploading...' : 'Upload & Add to Gallery'}
                    </Button>
                </CardFooter>
              </form>
            </Card>
         </main>
    </div>
  );
}
