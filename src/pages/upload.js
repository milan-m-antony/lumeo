
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" }); // idle, loading, success, error

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus({ type: "idle", message: "" });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus({ type: "error", message: "Please select a file to upload." });
      return;
    }
    setStatus({ type: "loading", message: "Uploading your file to Telegram..." });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);

    try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (res.ok && data.success) {
            setStatus({ type: "success", message: "File uploaded and added to gallery!" });
            setFile(null);
            setCaption("");
            // Reset file input
            e.target.reset(); 
        } else {
            throw new Error(data.error || "An unknown error occurred.");
        }
    } catch(error) {
         setStatus({ type: "error", message: `Error: ${error.message}`});
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-body">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4 mb-2">
             <Link href="/" passHref>
                <Button variant="outline" size="icon" aria-label="Back to gallery">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <div className="flex-grow">
              <CardTitle className="text-2xl text-primary">Upload to TeleGallery</CardTitle>
              <CardDescription>Select a photo or document to send</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-6">
              <div className="grid w-full items-center gap-1.5">
                  <label htmlFor="file-upload" className="font-medium">File</label>
                  <Input id="file-upload" type="file" required onChange={handleFileChange} className="file:text-primary" />
              </div>
              <div className="grid w-full items-center gap-1.5">
                  <label htmlFor="caption" className="font-medium">Caption</label>
                  <Input
                    id="caption"
                    type="text"
                    placeholder="Add an optional caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
              </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-4">
              <Button type="submit" disabled={!file || status.type === "loading"}>
                  {status.type === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {status.type === "loading" ? 'Uploading...' : 'Upload File'}
              </Button>
              {status.type !== 'idle' && (
                   <Alert variant={status.type === 'error' ? 'destructive' : 'default'} className="w-full">
                     {status.type === 'success' && <CheckCircle className="h-4 w-4" />}
                     {status.type === 'error' && <AlertCircle className="h-4 w-4" />}
                     {status.type === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
                    <AlertTitle>
                      {status.type === 'loading' ? 'Uploading' : status.type === 'success' ? 'Success' : 'Upload Failed'}
                    </AlertTitle>
                    <AlertDescription>
                      {status.message}
                    </AlertDescription>
                  </Alert>
              )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

