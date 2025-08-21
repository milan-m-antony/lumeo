import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Download, Save, X, Image as ImageIcon, UploadCloud, Video, FileText, Search } from "lucide-react";

export default function Home() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingCaption, setEditingCaption] = useState("");
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch(`/api/files?caption=${search}&type=${typeFilter}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
          if (Array.isArray(data)) {
            setFiles(data);
            setError(null);
          } else {
            throw new Error(data.error || "Failed to load files.");
          }
      })
      .catch((err) => {
        setFiles([]);
        setError(err.message || "An unexpected error occurred.");
      })
      .finally(() => setLoading(false));
  }, [search, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const getFileUrl = (fileId) => `/api/download?file_id=${fileId}`;

  const renderFilePreview = (file) => {
    const iconClass = "w-16 h-16 text-muted-foreground";
    switch (file.type) {
      case 'photo':
        return <img src={getFileUrl(file.file_id)} alt={file.caption} className="w-full h-full object-cover" data-ai-hint="gallery photo" onError={(e) => e.target.src = 'https://placehold.co/400x400.png'} />;
      case 'video':
        return <div className="w-full h-full bg-secondary flex items-center justify-center"><Video className={iconClass} /></div>;
      case 'document':
        return <div className="w-full h-full bg-secondary flex items-center justify-center"><FileText className={iconClass} /></div>;
      default:
        return <div className="w-full h-full bg-secondary flex items-center justify-center"><ImageIcon className={iconClass} /></div>;
    }
  };

  return (
    <div className="bg-background min-h-screen font-body text-foreground">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-border">
          <h1 className="text-4xl font-bold text-primary mb-4 sm:mb-0">TeleGallery</h1>
          <Link href="/upload" passHref>
            <Button><UploadCloud className="mr-2 h-4 w-4" />Upload File</Button>
          </Link>
        </header>

        <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search by caption..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
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

        {loading && <p className="text-center text-muted-foreground">Loading gallery...</p>}
        {error && <p className="text-center text-destructive">Error: {error}</p>}

        {!loading && !error && files.length === 0 && (
           <div className="text-center text-muted-foreground py-16">
            <ImageIcon className="w-24 h-24 mx-auto text-muted-foreground/50" strokeWidth={1} />
            <h2 className="text-2xl mt-4 font-semibold">Your Gallery is Empty</h2>
            <p className="mt-2">Upload your first file or adjust your filters.</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
          {files.map((f) => (
            <Card key={f.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group aspect-square">
              <CardContent className="p-0 flex-grow relative cursor-pointer" onClick={() => setSelectedFile(f)}>
                 {renderFilePreview(f)}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <p className="text-white text-center p-2 truncate">{f.caption || "No Caption"}</p>
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={!!selectedFile} onOpenChange={(isOpen) => !isOpen && setSelectedFile(null)}>
          <DialogContent className="max-w-4xl w-full h-auto max-h-[90vh] p-0">
             {selectedFile && (
                <>
                <DialogHeader className="p-4 border-b">
                  <DialogTitle className="truncate">
                    {editingId === selectedFile.id ? (
                        <Input value={editingCaption} onChange={(e) => setEditingCaption(e.target.value)} placeholder="Enter caption"/>
                    ) : (
                        selectedFile.caption || "No Caption"
                    )}
                  </DialogTitle>
                </DialogHeader>
                <div className="p-4 flex-grow overflow-y-auto">
                    {selectedFile.type === 'photo' && <img src={getFileUrl(selectedFile.file_id)} alt={selectedFile.caption} className="max-w-full max-h-[70vh] mx-auto" />}
                    {selectedFile.type === 'video' && <video src={getFileUrl(selectedFile.file_id)} controls autoPlay className="max-w-full max-h-[70vh] mx-auto" />}
                    {selectedFile.type === 'document' && (
                        <div className="flex flex-col items-center justify-center h-64 bg-secondary rounded-md">
                           <FileText className="w-24 h-24 text-muted-foreground" />
                           <p className="mt-4 text-lg">This is a document.</p>
                           <a href={getFileUrl(selectedFile.file_id)} download target="_blank" rel="noreferrer">
                              <Button className="mt-4">Download Document</Button>
                           </a>
                        </div>
                    )}
                </div>
                <CardFooter className="p-4 bg-muted/50 flex justify-end items-center gap-2">
                    {editingId === selectedFile.id ? (
                        <>
                          <Button size="icon" variant="outline" onClick={() => handleUpdateCaption(selectedFile.id)}><Save className="w-4 h-4" /></Button>
                          <Button size="icon" variant="destructive" onClick={handleCancelEdit}><X className="w-4 h-4" /></Button>
                        </>
                    ) : (
                        <Button size="icon" variant="outline" onClick={() => handleEditClick(selectedFile)} title="Edit Caption"><Edit className="w-4 h-4" /></Button>
                    )}
                    <a href={getFileUrl(selectedFile.file_id)} download target="_blank" rel="noreferrer" title="Download File">
                      <Button size="icon" variant="outline"><Download className="w-4 h-4" /></Button>
                    </a>
                </CardFooter>
                </>
             )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
