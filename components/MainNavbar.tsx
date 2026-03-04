'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Menu, LayoutDashboard, LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function MainNavbar() {
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
    <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight">
          Pinjamin.
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Beranda
          </Link>
          <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Katalog
          </Link>
          <Link href="/berita" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Berita
          </Link>
          <Link href="/aboutus" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Tentang Kami
          </Link>
          <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Kontak
          </Link>
          <Link href="/faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </Link>
        </div>

        {/* Auth Buttons Desktop */}
        <div className="hidden md:flex gap-3 items-center">
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="outline" onClick={handleLogout} className="text-destructive hover:text-destructive flex items-center gap-2">
                <LogOut className="h-4 w-4" />
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
                  Menu navigasi untuk akses fitur aplikasi.
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-4 mt-6">
                <Link href="/" className="text-sm font-medium hover:text-primary">
                  Beranda
                </Link>
                <Link href="/products" className="text-sm font-medium hover:text-primary">
                  Katalog
                </Link>
                <Link href="/berita" className="text-sm font-medium hover:text-primary">
                  Berita
                </Link>
                <Link href="/aboutus" className="text-sm font-medium hover:text-primary">
                  Tentang Kami
                </Link>
                <Link href="/faq" className="text-sm font-medium hover:text-primary">
                  FAQ
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
                    <Button variant="ghost" className="justify-start" asChild>
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

      </div>
    </nav>
  )
}