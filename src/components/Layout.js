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
import { GalleryHorizontal, UploadCloud, Home, Menu, Trash2, LayoutGrid, Database, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';


const MobileHeader = () => {
    const { toggleSidebar } = useSidebar();
    return (
        <header className="md:hidden flex items-center justify-between p-2 border-b sticky top-0 z-30 glass-effect">
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

    const handleLinkClick = (e, href) => {
        if (isMobile) {
            setOpenMobile(false);
        }
        if (href) {
            router.push(href);
        }
    };

    const isPathActive = (path) => {
        if (path === '/') return router.pathname === '/';
        if (path === '/gallery' && router.pathname === '/') return true; // Treat index as gallery for active state
        return router.pathname.startsWith(path);
    }

    return (
        <SidebarMenu>
            {menuItems.map((item) => (
                 <SidebarMenuItem key={item.href} onClick={(e) => handleLinkClick(e, item.href)}>
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
    return (
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
                <div className="flex flex-col flex-1 items-center justify-center">
                    <MobileHeader />
                    <SidebarInset>{children}</SidebarInset>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default Layout;
