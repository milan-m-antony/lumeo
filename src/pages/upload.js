
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, AlertCircle, Loader } from "lucide-react";

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
    setStatus({ type: "loading", message: "Uploading..." });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);

    try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (res.ok && data.success) {
            setStatus({ type: "success", message: "Uploaded successfully!" });
            setFile(null);
            setCaption("");
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
          <div className="flex items-center gap-4 mb-4">
             <Link href="/" passHref>
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <CardTitle className="text-2xl text-primary">Upload File</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Input id="picture" type="file" required onChange={handleFileChange} className="file:text-primary" />
            </div>
            <Input
              type="text"
              placeholder="Enter a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <Button type="submit" disabled={!file || status.type === "loading"}>
                {status.type === "loading" && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Upload
            </Button>
          </form>
        </CardContent>
        {status.message && (
             <CardFooter>
                 <Alert variant={status.type === 'error' ? 'destructive' : 'default'} className="w-full">
                   {status.type === 'success' && <CheckCircle className="h-4 w-4" />}
                   {status.type === 'error' && <AlertCircle className="h-4 w-4" />}
                  <AlertTitle>
                    {status.type === 'loading' ? 'Uploading...' : status.type === 'success' ? 'Success' : 'Error'}
                  </AlertTitle>
                  <AlertDescription>
                    {status.message}
                  </AlertDescription>
                </Alert>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
