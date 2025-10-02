import React, { useState, useEffect, createContext, useContext } from 'react';
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
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { GalleryHorizontal, UploadCloud, Home, Menu, Trash2, LayoutGrid, Database, LogIn, UserPlus, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const LayoutContext = createContext(null);
export const useLayout = () => useContext(LayoutContext);

const MobileHeader = () => {
    const { toggleSidebar } = useSidebar();
    const { mobileHeaderContent } = useLayout();
    const { user } = useAuth();
    const router = useRouter();
    const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(router.pathname);

    return (
        <header className="md:hidden flex items-center justify-between p-2 h-14 border-b sticky top-0 z-30 glass-effect">
            <div className="flex items-center gap-2 flex-1 min-w-0">
                 {mobileHeaderContent?.title ? (
                    <div className="flex-1 min-w-0">
                        {React.isValidElement(mobileHeaderContent.title) ? mobileHeaderContent.title : (
                            <h1 className="text-xl font-bold text-foreground truncate">{mobileHeaderContent.title}</h1>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Home className="w-6 h-6 text-primary" />
                        <h1 className="text-xl font-bold text-foreground">lumeo</h1>
                    </div>
                )}
            </div>
             <div className="flex items-center gap-1">
                {mobileHeaderContent?.actions}
                {(user && !isAuthPage) && (
                    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                        <Menu />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                )}
            </div>
        </header>
    )
}

const AppMenu = () => {
    const router = useRouter();
    const { pathname } = router;
    const { isMobile, setOpenMobile } = useSidebar();
    const { user, logout } = useAuth();

    const menuItems = user ? [
        { href: '/gallery', label: 'Gallery', icon: GalleryHorizontal },
        { href: '/albums', label: 'Albums', icon: LayoutGrid },
        { href: '/upload', label: 'Upload', icon: UploadCloud },
        { href: '/trash', label: 'Trash', icon: Trash2 },
        { href: '/storage', label: 'Storage', icon: Database },
    ] : [
        { href: '/', label: 'Home', icon: Home },
        { href: '/login', label: 'Login', icon: LogIn },
        { href: '/signup', label: 'Sign Up', icon: UserPlus },
    ];

    const handleLinkClick = (href) => {
        if (isMobile) {
            setOpenMobile(false);
        }
        router.push(href);
    };

    const isPathActive = (path) => {
        if (!pathname || !path) return false;
        if (path === '/') return pathname === '/';
        if (path === '/gallery' && (pathname === '/' || pathname.startsWith('/gallery'))) return true;
        return pathname.startsWith(path);
    }

    return (
        <SidebarMenu>
            {menuItems.map((item) => (
                 <SidebarMenuItem key={item.href} asChild>
                    <Link href={item.href} passHref>
                        <SidebarMenuButton
                             isActive={isPathActive(item.href)}
                             tooltip={{children: item.label}}
                        >
                            <item.icon />
                            <span>{item.label}</span>
                        </SidebarMenuButton>
                    </Link>
                 </SidebarMenuItem>
            ))}
            {user && (
                <SidebarMenuItem onClick={logout}>
                     <SidebarMenuButton tooltip={{children: "Logout"}}>
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )}
         </SidebarMenu>
    );
};

const Layout = ({ children }) => {
    const [mobileHeaderContent, setMobileHeaderContent] = useState(null);
    const { user, loading } = useAuth();
    const router = useRouter();
    const { pathname } = router;

    useEffect(() => {
      // Reset header content on route change
      setMobileHeaderContent(null);
    }, [pathname]);

    const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(pathname);
    const isHomePage = pathname === '/';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user && !isHomePage && !isAuthPage) {
        // This case should be handled by withAuth HOC redirecting,
        // but as a fallback, we show a loader.
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }
    
    // Render pages like login, signup, or home without the main sidebar layout
    if (!user && (isHomePage || isAuthPage)) {
        return <>{children}</>;
    }


    return (
        <LayoutContext.Provider value={{ mobileHeaderContent, setMobileHeaderContent }}>
            <SidebarProvider>
                <div className="flex min-h-screen">
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
                            <SidebarTrigger />
                        </SidebarFooter>
                    </Sidebar>
                    <div className="flex flex-col flex-1">
                        <MobileHeader />
                        <SidebarInset>{children}</SidebarInset>
                    </div>
                </div>
            </SidebarProvider>
        </LayoutContext.Provider>
    );
};

export default Layout;
