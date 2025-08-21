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
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Folder, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDescription, setNewAlbumDescription] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const fetchAlbums = useCallback(() => {
    setLoading(true);
    fetch('/api/albums')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch albums");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setAlbums(data);
        } else {
            throw new Error(data.error || "Could not load albums.");
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) {
        toast({ title: "Album name is required", variant: "destructive" });
        return;
    }
    const res = await fetch('/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAlbumName, description: newAlbumDescription }),
    });

    const result = await res.json();
    if (res.ok) {
        setAlbums([result, ...albums]);
        toast({ title: "Album Created!", description: `"${result.name}" has been created.` });
        setNewAlbumName("");
        setNewAlbumDescription("");
        setIsDialogOpen(false);
    } else {
        toast({ title: "Failed to Create Album", description: result.error, variant: "destructive" });
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex-shrink-0 bg-background/95 sticky top-0 z-10 backdrop-blur-sm">
        <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 border-b">
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
                    <Card className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Folder className="w-8 h-8 text-primary" />
                                <div className="flex-grow">
                                    <CardTitle className="truncate">{album.name}</CardTitle>
                                    <CardDescription className="truncate mt-1">{album.description || "No description"}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>
            ))}
        </div>
      </main>
    </div>
  );
}
