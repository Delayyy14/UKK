'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Menu, LayoutDashboard, LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function LandingNavbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.refresh();
  };

  return (
    <nav className="flex items-center justify-between p-6 container mx-auto bg-background/80 backdrop-blur-sm fixed top-0 w-full z-50 border-b">
      <Link href="/" className="text-xl font-bold tracking-tight">
        Pinjamin.
      </Link>
      
      {/* Desktop Menu */}
      <div className="hidden md:flex gap-6 items-center">
        <Link href="/" className="text-base font-semibold text-muted-foreground hover:text-foreground transition-colors">
          Beranda
        </Link>
        <Link href="/products" className="text-base font-semibold text-muted-foreground hover:text-foreground transition-colors">
          Katalog
        </Link>
        <Link href="/aboutus" className="text-base font-semibold text-muted-foreground hover:text-foreground transition-colors">
          Tentang Kami
        </Link>
      </div>
      <div className="hidden md:flex gap-4">
        {user ? (
          <>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button variant="outline" onClick={handleLogout} className="text-destructive hover:text-destructive">
               <LogOut className="mr-2 h-4 w-4" />
               Logout
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Daftar</Link>
            </Button>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
               <SheetTitle className="text-left">Menu</SheetTitle>
               <SheetDescription className="sr-only">
                 Navigasi menu untuk halaman utama.
               </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4 mt-6">
              <Link href="/#features" className="text-base font-semibold transition-colors hover:text-primary">
                Fitur
              </Link>
              <Link href="/products" className="text-base font-semibold transition-colors hover:text-primary">
                Katalog
              </Link>
              <hr className="border-muted" />
              {user ? (
                <>
                  <Button variant="ghost" className="justify-start gap-2" asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={handleLogout} className="justify-start text-destructive hover:text-destructive gap-2">
                     <LogOut className="h-4 w-4" />
                     Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="justify-start px-0" asChild>
                    <Link href="/login">Masuk</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/register">Daftar</Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
