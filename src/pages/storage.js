
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { withAuth, fetchWithAuth } from '@/context/AuthContext';
import { useLayout } from '@/components/Layout';


const StorageSkeleton = () => (
    <Card className="bg-transparent border-border/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-6 rounded-full" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
        </CardContent>
    </Card>
);

function StoragePage() {
    const [storage, setStorage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { setMobileHeaderContent } = useLayout();

    useEffect(() => {
        setMobileHeaderContent({ title: "Storage" });
    }, [setMobileHeaderContent]);

    useEffect(() => {
        const getStorage = async () => {
            setLoading(true);
            try {
                const res = await fetchWithAuth('/api/storage-summary');
                if (!res.ok) {
                    throw new Error('Failed to fetch storage data');
                }
                const data = await res.json();
                if (data.error) {
                    throw new Error(data.error);
                }
                setStorage(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        getStorage();
    }, []);

    return (
        <div className="flex flex-col h-full w-full">
            <header className="flex-shrink-0 sticky top-0 z-10 hidden md:block">
                <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 border-b bg-background/95 backdrop-blur-sm">
                    <h1 className="text-2xl font-bold text-foreground">Storage</h1>
                </div>
            </header>
            <main className="flex-grow overflow-auto p-4 sm:p-6 lg:p-8">
                 <div className="max-w-2xl mx-auto">
                    {loading && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <StorageSkeleton />
                            <StorageSkeleton />
                        </div>
                    )}
                    {error && <p className="text-center text-destructive">Error: {error}</p>}
                    {!loading && storage && (
                         <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                             <Card className="bg-transparent border-border/20">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">
                                    Telegram Storage
                                    </CardTitle>
                                    <Send className="w-4 h-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{storage.telegram?.pretty || '0 B'}</div>
                                    <p className="text-xs text-muted-foreground">
                                    Total size of all uploaded files.
                                    </p>
                                </CardContent>
                            </Card>
                             <Card className="bg-transparent border-border/20">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Database Size
                                    </CardTitle>
                                    <Database className="w-4 h-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{storage.supabase?.pretty || '0 B'}</div>
                                    <p className="text-xs text-muted-foreground">
                                    Total size of the metadata database.
                                    </p>
                                </CardContent>
                            </Card>
                         </div>
                    )}
                 </div>
            </main>
        </div>
    );
}

export default withAuth(StoragePage);
