
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit, Download, Save, X, Image as ImageIcon, UploadCloud } from "lucide-react";

export default function Home() {
  const [files, setFiles] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingCaption, setEditingCaption] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/files?caption=${filter}`)
      .then((res) => res.json())
      .then(data => {
          if (Array.isArray(data)) {
            setFiles(data);
            setError(null);
          } else {
            setFiles([]);
            setError(data.error || "Failed to load files.");
          }
          setLoading(false);
      })
      .catch((err) => {
        setFiles([]);
        setError(err.message || "An unexpected error occurred.");
        setLoading(false);
      });
  }, [filter]);

  const handleEditClick = (file) => {
    setEditingId(file.id);
    setEditingCaption(file.caption || "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingCaption("");
  };

  const handleUpdateCaption = async (fileId) => {
    if (!fileId) return;

    const res = await fetch('/api/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fileId, caption: editingCaption }),
    });
    
    const result = await res.json();
    
    if (result.success && result.file) {
        setFiles(files.map(f => (f.id === fileId ? result.file : f)));
        handleCancelEdit();
    } else {
        alert("Failed to update caption: " + (result.error || "Unknown error"));
    }
  };

  const onImageError = (e) => {
    e.target.onerror = null; // prevent infinite loop
    e.target.src = "https://placehold.co/600x400.png";
  }

  return (
    <div className="bg-background min-h-screen font-body text-foreground">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-border">
          <h1 className="text-4xl font-bold text-primary mb-4 sm:mb-0">TeleGallery</h1>
          <Link href="/upload" passHref>
            <Button>
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </Link>
        </header>

        <div className="mb-8 flex justify-center">
          <Input
            type="text"
            placeholder="Search by caption..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-md w-full"
          />
        </div>

        {loading && <p className="text-center text-muted-foreground">Loading gallery...</p>}
        {error && <p className="text-center text-destructive">Error: {error}</p>}

        {!loading && !error && files.length === 0 && (
           <div className="text-center text-muted-foreground py-16">
            <div className="flex justify-center mb-4">
                <ImageIcon className="w-24 h-24 text-muted-foreground/50" strokeWidth={1} />
            </div>
            <h2 className="text-2xl font-semibold">Your Gallery is Empty</h2>
            <p className="mt-2">Upload your first file to see it here.</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {files.map((f) => (
            <Card key={f.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group">
              <CardHeader className="p-0 relative">
                {f.type === 'photo' ? (
                  <img 
                      src={`/api/download?file_id=${f.file_id}`} 
                      alt={f.caption || "Gallery image"} 
                      className="w-full h-48 object-cover"
                      data-ai-hint="gallery photo"
                      onError={onImageError}
                  />
                ) : (
                  <div className="w-full h-48 bg-secondary flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                {editingId === f.id ? (
                  <div className="flex flex-col gap-2">
                    <Input
                        value={editingCaption}
                        onChange={(e) => setEditingCaption(e.target.value)}
                        placeholder="Enter caption"
                    />
                  </div>
                ) : (
                  <p className="font-semibold text-lg truncate" title={f.caption}>{f.caption || "No caption"}</p>
                )}
                 <p className="text-sm text-muted-foreground mt-1 capitalize">{f.type === 'photo' ? 'Photo' : 'Document'}</p>
              </CardContent>
              <CardFooter className="p-4 bg-muted/50 flex justify-between items-center">
                {editingId === f.id ? (
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" onClick={() => handleUpdateCaption(f.id)}><Save className="w-4 h-4" /></Button>
                      <Button size="icon" variant="destructive" onClick={handleCancelEdit}><X className="w-4 h-4" /></Button>
                    </div>
                ) : (
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" onClick={() => handleEditClick(f)} title="Edit Caption">
                      <Edit className="w-4 h-4" />
                    </Button>
                     <a href={`/api/download?file_id=${f.file_id}`} target="_blank" rel="noreferrer" title="Download File">
                      <Button size="icon" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
