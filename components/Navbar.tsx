'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, Settings, ChevronDown, Home } from 'lucide-react';

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

interface NavbarProps {
  userName: string;
  userRole: string;
  userFoto?: string;
}

export default function Navbar({ userName, userRole, userFoto }: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
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

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  return (
    <nav className="bg-background border-b border-border shadow-sm sticky top-0 z-40 h-16 flex items-center">
      <div className="w-full px-6 flex items-center justify-between">
        {/* Left Side - Welcome Message */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Halo, <span className="text-primary">{userName}</span>!
          </h1>
          <p className="text-sm text-muted-foreground hidden md:block">
            Selamat Datang Di Dashboard {getRoleLabel(userRole)} Anda.
          </p>
        </div>

        {/* Right Side - Actions & Profile */}
        <div className="flex items-center gap-4">
             {/* Back to Home Button */}
            <Button variant="outline" size="sm" asChild className="hidden md:flex gap-2">
                <Link href="/">
                    <Home className="h-4 w-4" />
                    Kembali ke Beranda
                </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="group relative h-10 w-full md:w-auto justify-start gap-2 px-2"
                >
                  <div className="text-right hidden md:block mr-2">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs text-muted-foreground">{getRoleLabel(userRole)}</p>
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userFoto} alt={userName} />
                    <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="ml-2 h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {getRoleLabel(userRole)}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Mobile Back to Home - Only visible inside dropdown on small screens if we wanted, but let's keep it consistent */}
                <DropdownMenuItem asChild className="md:hidden">
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        <span>Kembali ke Beranda</span>
                    </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Pengaturan</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
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