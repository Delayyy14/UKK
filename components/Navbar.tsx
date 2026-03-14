'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, Settings, ChevronDown, Home, Menu } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SidebarContent } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';
import { useState } from 'react';

interface NavbarProps {
  userName: string;
  userRole: 'admin' | 'petugas' | 'peminjam';
  userFoto?: string;
}

export default function Navbar({ userName, userRole, userFoto }: NavbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'petugas':
        return 'Petugas';
      case 'peminjam':
        return 'Peminjam';
      default:
        return role;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  return (
    <nav className="bg-background border-b border-border shadow-sm sticky top-0 z-40 h-16 flex items-center">
      <div className="w-full px-4 md:px-6 flex items-center justify-between">
        {/* Left Side - Hamburger (Mobile) + Welcome Message */}
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu Navigasi</SheetTitle>
                <SheetDescription>
                  Akses berbagai fitur dan pengaturan aplikasi melalui menu ini.
                </SheetDescription>
              </SheetHeader>
              <SidebarContent userRole={userRole} onItemClick={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div>
            <h1 className="text-lg md:text-xl font-semibold text-foreground leading-tight">
              Halo, <span className="text-primary">{userName}</span>!
            </h1>
            <p className="text-xs text-muted-foreground hidden md:block">
              Selamat Datang Di Dashboard {getRoleLabel(userRole)} Anda.
            </p>
          </div>
        </div>

        {/* Right Side - Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            
            <Button variant="outline" size="sm" asChild className="hidden md:flex gap-2">
                <Link href="/">
                    <Home className="h-4 w-4" />
                    Beranda
                </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="group relative h-10 flex items-center gap-2 px-2 hover:bg-muted/50 rounded-full"
                >
                  <div className="text-right hidden sm:block mr-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{getRoleLabel(userRole)}</p>
                  </div>
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={userFoto} alt={userName} />
                    <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {getRoleLabel(userRole)}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="md:hidden">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        <span>Beranda</span>
                    </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Pengaturan</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}