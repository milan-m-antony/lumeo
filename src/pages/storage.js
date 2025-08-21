import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Database, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const StorageSkeleton = () => (
    <Card>
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


export default function Storage() {
    const [storage, setStorage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch('/api/storage-summary')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch storage data');
                }
                return res.json();
            })
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                setStorage(data);
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <div className="flex flex-col h-full w-full">
            <header className="flex-shrink-0 bg-background/95 sticky top-0 z-10 backdrop-blur-sm">
                <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 border-b">
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
                         <div className="grid gap-4 md:grid-cols-2">
                             <Card>
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
                             <Card>
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
