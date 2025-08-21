import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { GalleryHorizontal, UploadCloud, Home, Menu, Trash2, LayoutGrid, Database, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


const MobileHeader = () => {
    const { toggleSidebar } = useSidebar();
    return (
        <header className="md:hidden flex items-center justify-between p-2 border-b bg-background sticky top-0 z-30">
            <div className="flex items-center gap-2">
                <Home className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold text-foreground">lumeo</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <Menu />
                <span className="sr-only">Toggle Menu</span>
            </Button>
        </header>
    )
}

const AppMenu = () => {
    const router = useRouter();
    const { isMobile, setOpenMobile } = useSidebar();

    const menuItems = [
        { href: '/', label: 'Gallery', icon: GalleryHorizontal },
        { href: '/albums', label: 'Albums', icon: LayoutGrid },
        { href: '/upload', label: 'Upload', icon: UploadCloud },
        { href: '/trash', label: 'Trash', icon: Trash2 },
    ];

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    const isPathActive = (path) => {
        if (path === '/') return router.pathname === '/';
        return router.pathname.startsWith(path);
    }

    return (
        <SidebarMenu>
            {menuItems.map((item) => (
                 <SidebarMenuItem key={item.href} onClick={handleLinkClick}>
                    <Link href={item.href} passHref legacyBehavior>
                        <SidebarMenuButton
                             asChild
                             isActive={isPathActive(item.href)}
                             tooltip={{children: item.label}}
                        >
                            <a>
                                <item.icon />
                                <span>{item.label}</span>
                            </a>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
            ))}
         </SidebarMenu>
    );
};

const StorageInfo = () => {
    const [storage, setStorage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/storage-summary')
            .then(res => res.json())
            .then(data => {
                if(data && !data.error) {
                    setStorage(data);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const { state } = useSidebar();

    if (loading) {
        return (
             <div className="px-4 py-2 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
             </div>
        )
    }

    if (!storage) return null;

    return (
        <div className="px-4 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Send className="w-3.5 h-3.5" />
                    <span className="font-medium">Telegram</span>
                </div>
                <span>{storage.telegram?.pretty || '0 B'}</span>
             </div>
             <div className="flex items-center justify-between mt-1">
                 <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5" />
                    <span className="font-medium">Database</span>
                 </div>
                 <span>{storage.supabase?.pretty || '0 B'}</span>
             </div>
        </div>
    )
}


const Layout = ({ children }) => {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background">
                <Sidebar>
                    <SidebarHeader>
                        <div className="flex items-center gap-2 p-2">
                             <Home className="w-8 h-8 text-primary" />
                             <h1 className="text-2xl font-bold text-foreground group-data-[collapsible=icon]:hidden">
                                lumeo
                             </h1>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <AppMenu />
                    </SidebarContent>
                    <SidebarFooter>
                        <SidebarSeparator />
                        <StorageInfo />
                        <SidebarSeparator />
                        <SidebarTrigger />
                    </SidebarFooter>
                </Sidebar>
                <div className="flex flex-col flex-1">
                    <MobileHeader />
                    <SidebarInset>{children}</SidebarInset>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default Layout;
