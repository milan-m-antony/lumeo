
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { withAuth, fetchWithAuth } from '@/context/AuthContext';
import { useLayout } from '@/components/Layout';
import { PageHeader } from '@/components/PageHeader';
import { useToast } from "@/hooks/use-toast";


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
    const { toast } = useToast();

    useEffect(() => {
        setMobileHeaderContent({ title: "Storage" });
    }, [setMobileHeaderContent]);

    useEffect(() => {
        const getStorage = async () => {
            setLoading(true);
            setError(null);
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
                 toast({
                    title: "Failed to Load Storage Info",
                    description: err.message,
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };
        getStorage();
    }, [toast]);

    return (
        <div className="flex flex-col h-full w-full">
            <PageHeader title="Storage" />
            <main className="flex-grow overflow-auto p-4 sm:p-6 lg:p-8">
                 <div className="w-full max-w-2xl mx-auto">
                    {loading && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <StorageSkeleton />
                            <StorageSkeleton />
                        </div>
                    )}
                    {error && !loading && (
                        <Card className="bg-destructive/10 border-destructive/30">
                            <CardHeader>
                                <CardTitle className="text-destructive">Error</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>{error}</p>
                            </CardContent>
                        </Card>
                    )}
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
