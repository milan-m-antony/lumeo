import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, AlertCircle, UploadCloud, Image as ImageIcon, Video, FileText } from "lucide-react";
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
      const response = JSON.parse(xhr.responseText);

      if (xhr.status === 200 && response.success) {
        toast({
            title: "Upload Successful!",
            description: `"${response.file.caption || file.name}" has been added to the gallery.`,
            variant: "default",
        });
        setFile(null);
        setCaption("");
      } else {
        setError(response.error || "An unknown error occurred during upload.");
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-body">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4 mb-2">
             <Link href="/" passHref>
                <Button variant="outline" size="icon" aria-label="Back to gallery"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <div className="flex-grow">
              <CardTitle className="text-2xl text-primary">Upload to TeleGallery</CardTitle>
              <CardDescription>Drag & drop a file or click to select</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-6">
              <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                  <input {...getInputProps()} />
                  {file ? (
                      <div className="flex flex-col items-center gap-2">
                          {renderPreview()}
                          <p className="font-medium truncate">{file.name}</p>
                          <Button variant="link" size="sm" onClick={() => setFile(null)}>Choose another file</Button>
                      </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <UploadCloud className="w-12 h-12"/>
                      <p className="font-semibold">{isDragActive ? "Drop the file here..." : "Drag & drop file here, or click to select"}</p>
                      <p className="text-xs">Supports images, videos, and documents.</p>
                    </div>
                  )}
              </div>

              <div className="grid w-full items-center gap-1.5">
                  <label htmlFor="caption" className="font-medium">Caption</label>
                  <Input id="caption" type="text" placeholder="Add an optional caption..." value={caption} onChange={(e) => setCaption(e.target.value)} />
              </div>
              
              {isUploading && (
                  <div className="w-full">
                      <Progress value={uploadProgress} />
                      <p className="text-sm text-center mt-2 text-muted-foreground">{uploadProgress}% complete</p>
                  </div>
              )}

              {error && (
                   <Alert variant="destructive" className="w-full">
                     <AlertCircle className="h-4 w-4" />
                     <AlertTitle>Upload Failed</AlertTitle>
                     <AlertDescription>{error}</AlertDescription>
                  </Alert>
              )}

          </CardContent>
          <CardFooter>
              <Button type="submit" disabled={!file || isUploading} className="w-full">
                  {isUploading ? 'Uploading...' : 'Upload & Add to Gallery'}
              </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
