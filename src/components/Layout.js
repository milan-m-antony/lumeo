import React from 'react';
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
import { GalleryHorizontal, UploadCloud, Home, Menu } from 'lucide-react';

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

const Layout = ({ children }) => {
    const router = useRouter();

    const menuItems = [
        { href: '/', label: 'Gallery', icon: GalleryHorizontal },
        { href: '/upload', label: 'Upload', icon: UploadCloud },
    ];

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
                         <SidebarMenu>
                            {menuItems.map((item) => (
                                 <SidebarMenuItem key={item.href}>
                                    <Link href={item.href} passHref legacyBehavior>
                                        <SidebarMenuButton
                                             asChild
                                             isActive={router.pathname === item.href}
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
    );
};

export default Layout;
