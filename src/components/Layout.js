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
} from '@/components/ui/sidebar';
import { GalleryHorizontal, UploadCloud, Settings, Home } from 'lucide-react';

const Layout = ({ children }) => {
    const router = useRouter();

    const menuItems = [
        { href: '/', label: 'Gallery', icon: GalleryHorizontal },
        { href: '/upload', label: 'Upload', icon: UploadCloud },
        // { href: '/settings', label: 'Settings', icon: Settings }, // Example for future use
    ];

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background">
                <Sidebar>
                    <SidebarHeader>
                        <div className="flex items-center gap-2 p-2">
                             <Home className="w-8 h-8 text-primary" />
                             <h1 className="text-2xl font-bold text-foreground group-data-[collapsible=icon]:hidden">
                                TeleGallery
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
                <SidebarInset>{children}</SidebarInset>
            </div>
        </SidebarProvider>
    );
};

export default Layout;
