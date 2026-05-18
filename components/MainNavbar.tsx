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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.refresh();
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto flex items-center justify-between px-6 md:px-12">

        {/* Logo (Left) */}
        <div className="w-1/4 flex justify-start">
          <Link href="/" className={`text-2xl font-black tracking-tighter drop-shadow-sm ${scrolled ? 'text-blue-600' : 'text-blue-500'}`}>
            PINJAMLE<span className={scrolled ? "text-gray-900" : "text-white"}>.</span>
          </Link>
        </div>

        {/* Desktop Menu (Center) */}
        <div className="hidden md:flex flex-1 justify-center gap-8 items-center">
          <Link href="/" className={`text-[15px] font-bold uppercase tracking-widest transition-colors drop-shadow-sm ${scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-400'}`}>
            BERANDA
          </Link>
          <Link href="/products" className={`text-[15px] font-bold uppercase tracking-widest transition-colors drop-shadow-sm ${scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-400'}`}>
            KATALOG
          </Link>
          <Link href="/berita" className={`text-[15px] font-bold uppercase tracking-widest transition-colors drop-shadow-sm ${scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-400'}`}>
            BERITA
          </Link>
          <Link href="/aboutus" className={`text-[15px] font-bold uppercase tracking-widest transition-colors drop-shadow-sm ${scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-400'}`}>
            TENTANG
          </Link>
          <Link href="/contact" className={`text-[15px] font-bold uppercase tracking-widest transition-colors drop-shadow-sm ${scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-400'}`}>
            KONTAK
          </Link>
        </div>

        {/* Auth Buttons (Right) */}
        <div className="hidden md:flex w-1/4 justify-end gap-3 items-center">
          {user ? (
            <>
              <Button variant="ghost" className={`rounded-full font-bold uppercase tracking-wider text-xs ${scrolled ? 'text-gray-700 hover:text-blue-600 hover:bg-gray-100' : 'text-white hover:text-blue-400 hover:bg-white/10'}`} asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  DASHBOARD
                </Link>
              </Button>
              <Button variant="outline" onClick={handleLogout} className={`rounded-full font-bold uppercase tracking-wider text-xs flex items-center gap-2 bg-transparent ${scrolled ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white'}`}>
                <LogOut className="h-4 w-4" />
                KELUAR
              </Button>
            </>
          ) : (
            <Button variant="outline" className={`rounded-full px-6 py-5 font-bold uppercase tracking-widest text-xs transition-all ${scrolled ? 'border-gray-300 text-gray-800 bg-white hover:bg-gray-50' : 'border-white/30 text-white bg-transparent backdrop-blur-sm hover:bg-white hover:text-black'}`} asChild>
              <Link href="/login">MASUK</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex justify-end w-1/4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={`rounded-full ${scrolled ? 'text-gray-800 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}>
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="bg-[#030712] border-l-white/10 text-white">
              <SheetHeader>
                <SheetTitle className="text-left text-blue-500 font-black tracking-tighter text-2xl mt-4">
                  PINJAMLE<span className="text-white">.</span>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Menu navigasi
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-6 mt-12">
                <Link href="/" className="text-sm font-bold uppercase tracking-widest hover:text-blue-400 transition-colors">
                  BERANDA
                </Link>
                <Link href="/products" className="text-sm font-bold uppercase tracking-widest hover:text-blue-400 transition-colors">
                  KATALOG
                </Link>
                <Link href="/berita" className="text-sm font-bold uppercase tracking-widest hover:text-blue-400 transition-colors">
                  BERITA
                </Link>
                <Link href="/aboutus" className="text-sm font-bold uppercase tracking-widest hover:text-blue-400 transition-colors">
                  TENTANG
                </Link>
                <Link href="/contact" className="text-sm font-bold uppercase tracking-widest hover:text-blue-400 transition-colors">
                  KONTAK
                </Link>

                <hr className="border-white/10 my-4" />

                {user ? (
                  <>
                    <Button variant="ghost" className="justify-start gap-3 text-white hover:bg-white/5 rounded-full font-bold uppercase tracking-wider text-xs" asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="h-4 w-4" />
                        DASHBOARD
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={handleLogout} className="justify-start border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white rounded-full gap-3 font-bold uppercase tracking-wider text-xs bg-transparent">
                      <LogOut className="h-4 w-4" />
                      KELUAR
                    </Button>
                  </>
                ) : (
                  <Button className="w-full bg-white text-black hover:bg-gray-200 rounded-full py-6 font-bold uppercase tracking-widest text-xs" asChild>
                    <Link href="/login">MASUK</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </nav>
  )
}