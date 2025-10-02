
import { useEffect, useState, useMemo, useCallback } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, Folder, PlusCircle, MoreVertical, Trash2, Search, X as XIcon, SlidersHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { withAuth, fetchWithAuth } from "@/context/AuthContext";
import { useLayout } from "@/components/Layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PageHeader } from "@/components/PageHeader";


function AlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDescription, setNewAlbumDescription] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const { setMobileHeaderContent } = useLayout();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("created_at_desc");
  const [isSearchVisible, setIsSearchVisible] = useState(false);


  const handleCreateAlbum = useCallback(async () => {
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
        setAlbums([newAlbumWithDefaults, ...albums]);
        toast({ title: "Album Created!", description: `"${result.name}" has been created.` });
        setNewAlbumName("");
        setNewAlbumDescription("");
        setIsDialogOpen(false);
    } else {
        toast({ title: "Failed to Create Album", description: result.error, variant: "destructive" });
    }
  }, [newAlbumName, newAlbumDescription, albums, toast]);


  useEffect(() => {
    setMobileHeaderContent({
      title: "Albums",
      actions: (
        <>
          <Button variant="ghost" size="icon" onClick={() => setIsSearchVisible(p => !p)}>
            <Search />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon"><SlidersHorizontal /></Button>
            </PopoverTrigger>
            <PopoverContent className="mr-2 p-0 glass-effect w-56">
              <div className="p-2 space-y-2">
                <Label className="px-2 text-xs text-muted-foreground">Sort by</Label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full bg-muted/50 border-0 focus:ring-primary">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at_desc">Newest</SelectItem>
                    <SelectItem value="created_at_asc">Oldest</SelectItem>
                    <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon"><PlusCircle /></Button>
            </DialogTrigger>
             <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Album</DialogTitle>
                <DialogDescription>Give your new album a name and an optional description.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name-mobile" className="text-right">Name</Label>
                  <Input id="name-mobile" value={newAlbumName} onChange={(e) => setNewAlbumName(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description-mobile" className="text-right">Description</Label>
                  <Textarea id="description-mobile" value={newAlbumDescription} onChange={(e) => setNewAlbumDescription(e.target.value)} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateAlbum}>Create Album</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )
    });
  }, [setMobileHeaderContent, isDialogOpen, newAlbumName, newAlbumDescription, sortOrder, isSearchVisible, handleCreateAlbum]);


  const fetchAlbums = async () => {
    setLoading(true);
    setError(null);
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
        toast({
            title: "Failed to load albums",
            description: err.message,
            variant: "destructive",
        });
    } finally {
        setLoading(false)
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const filteredAndSortedAlbums = useMemo(() => {
    let filtered = albums;

    if (searchQuery) {
        filtered = albums.filter(album =>
            album.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (album.description && album.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }
    
    return filtered.sort((a, b) => {
        switch (sortOrder) {
            case 'created_at_desc':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'created_at_asc':
                return new Date(a.created_at) - new Date(b.created_at);
            case 'name_asc':
                return a.name.localeCompare(b.name);
            case 'name_desc':
                return b.name.localeCompare(a.name);
            default:
                return 0;
        }
    });
  }, [albums, searchQuery, sortOrder]);

  
  const handleDeleteAlbum = async (albumId) => {
    const res = await fetchWithAuth(`/api/albums/${albumId}`, { method: 'DELETE' });
    const result = await res.json();

    if (res.ok) {
        setAlbums(albums.filter(a => a.id !== albumId));
        toast({ title: "Album Deleted", description: "The album has been deleted." });
    } else {
        toast({ title: "Deletion Failed", description: result.error, variant: "destructive" });
    }
  };

  const getFileUrl = (fileId) => `/api/download?file_id=${fileId}`;

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex-shrink-0 sticky top-14 md:top-0 z-10">
         <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 h-16 border-b glass-effect">
            <h1 className="text-2xl font-bold text-foreground hidden md:block">Albums</h1>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
                 <div className="relative w-full max-w-xs hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search albums..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10 bg-muted/50 border-0 focus-visible:ring-primary w-full"
                    />
                    {searchQuery && (
                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setSearchQuery('')}>
                            <XIcon className="h-4 w-4" />
                        </Button>
                    )}
                 </div>
                 <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-[180px] hidden md:flex">
                        <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="created_at_desc">Newest</SelectItem>
                        <SelectItem value="created_at_asc">Oldest</SelectItem>
                        <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                        <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                    </SelectContent>
                 </Select>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="hidden md:inline-flex">
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
                                <Label htmlFor="name-desktop" className="text-right">Name</Label>
                                <Input id="name-desktop" value={newAlbumName} onChange={(e) => setNewAlbumName(e.target.value)} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description-desktop" className="text-right">Description</Label>
                                <Textarea id="description-desktop" value={newAlbumDescription} onChange={(e) => setNewAlbumDescription(e.target.value)} className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                        <Button type="submit" onClick={handleCreateAlbum}>Create Album</Button>
                        </DialogFooter>
                    </DialogContent>
                 </Dialog>
            </div>
         </div>
          <AnimatePresence>
            {isSearchVisible && (
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="p-2 border-b glass-effect md:hidden"
              >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search albums..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10 bg-muted/50 border-0 focus-visible:ring-primary w-full"
                    />
                     {searchQuery && (
                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setSearchQuery('')}>
                            <XIcon className="h-4 w-4" />
                        </Button>
                    )}
                  </div>
              </motion.div>
            )}
        </AnimatePresence>
      </header>

      <main className="flex-grow overflow-auto p-4 sm:p-6 lg:p-8">
        {loading && <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
        
        {!loading && filteredAndSortedAlbums.length === 0 && (
          <div className="text-center text-muted-foreground py-16">
            <Folder className="w-24 h-24 mx-auto text-muted-foreground/50" strokeWidth={1} />
            <h2 className="text-2xl mt-4 font-semibold">{error ? "Error Loading Albums" : (searchQuery ? "No Matching Albums Found" : "No Albums Yet")}</h2>
            <p className="mt-2">{error ? error : (searchQuery ? `Your search for "${searchQuery}" did not return any results.` : "Click \"Create Album\" to get started.")}</p>
            {searchQuery && <Button onClick={() => setSearchQuery('')} variant="outline" className="mt-4">Clear Search</Button>}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAndSortedAlbums.map(album => (
                <Card key={album.id} className="group overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col bg-transparent border-border/20">
                    <Link href={`/album/${album.id}`} passHref className="flex flex-col h-full">
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
                    </Link>
                    <div className="absolute top-2 right-2">
                        <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 bg-black/30 hover:bg-black/50 text-white hover:text-white" onClick={(e) => e.stopPropagation()}>
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Album
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to delete this album?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the album "{album.name}", but the files within it will remain in your gallery.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteAlbum(album.id)}>
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </Card>
            ))}
        </div>
      </main>
    </div>
  );
}

export default withAuth(AlbumsPage);

    