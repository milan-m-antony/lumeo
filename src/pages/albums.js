import { useEffect, useState, useCallback } from "react";
import Link from 'next/link';
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, Folder, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { withAuth, fetchWithAuth } from "@/context/AuthContext";

function AlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDescription, setNewAlbumDescription] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    try {
        const res = await fetchWithAuth('/api/albums');
        if (!res.ok) throw new Error("Failed to fetch albums");
        const data = await res.json();
        if (Array.isArray(data)) {
          setAlbums(data);
        } else {
            throw new Error(data.error || "Could not load albums.");
        }
    } catch(err) {
        setError(err.message)
    } finally {
        setLoading(false)
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

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
        const newAlbumWithDefaults = { ...result, files: [{count: 0}], cover_file_id: null };
        setAlbums([newAlbumWithDefaults, ...albums]);
        toast({ title: "Album Created!", description: `"${result.name}" has been created.` });
        setNewAlbumName("");
        setNewAlbumDescription("");
        setIsDialogOpen(false);
    } else {
        toast({ title: "Failed to Create Album", description: result.error, variant: "destructive" });
    }
  }

  const getFileUrl = (fileId) => `/api/download?file_id=${fileId}`;

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex-shrink-0 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 border-b glass-effect">
          <h1 className="text-2xl font-bold text-foreground">Albums</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Album
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Create New Album</DialogTitle>
                <DialogDescription>
                    Give your new album a name and an optional description.
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={newAlbumName} onChange={(e) => setNewAlbumName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Textarea id="description" value={newAlbumDescription} onChange={(e) => setNewAlbumDescription(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                <Button type="submit" onClick={handleCreateAlbum}>Create Album</Button>
                </DialogFooter>
            </DialogContent>
           </Dialog>
        </div>
      </header>

      <main className="flex-grow overflow-auto p-4 sm:p-6 lg:p-8">
        {loading && <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
        {error && <p className="text-center text-destructive">Error: {error}</p>}
        
        {!loading && !error && albums.length === 0 && (
          <div className="text-center text-muted-foreground py-16">
            <Folder className="w-24 h-24 mx-auto text-muted-foreground/50" strokeWidth={1} />
            <h2 className="text-2xl mt-4 font-semibold">No Albums Yet</h2>
            <p className="mt-2">Click "Create Album" to get started.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {albums.map(album => (
                <Link href={`/album/${album.id}`} key={album.id} passHref>
                    <Card className="cursor-pointer group overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-200 flex flex-col h-full bg-transparent border-border/20">
                        <CardContent className="p-0 relative aspect-[4/3]">
                            {album.cover_file_id ? (
                                <img 
                                    src={getFileUrl(album.cover_thumbnail_file_id || album.cover_file_id)} 
                                    alt={`${album.name} cover photo`}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint="album cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-secondary/20 flex items-center justify-center">
                                    <Folder className="w-16 h-16 text-muted-foreground/50" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        </CardContent>
                        <div className="p-4 flex-grow flex flex-col bg-background/50 backdrop-blur-sm">
                            <CardTitle className="truncate text-lg">{album.name}</CardTitle>
                            <CardDescription className="truncate mt-1 flex-grow">{album.description || "No description"}</CardDescription>
                            <p className="text-xs text-muted-foreground mt-2">
                                {album.files[0]?.count || 0} items
                            </p>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
      </main>
    </div>
  );
}

export default withAuth(AlbumsPage);
