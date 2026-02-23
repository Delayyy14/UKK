'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Menu, LayoutDashboard, LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Footer() {
  return (
    <footer className="border-t bg-muted/40 text-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-4 text-sm">

        {/* Brand */}
        <div>
          <h3 className="text-lg font-semibold">Aplikasi Peminjaman Alat</h3>
          <p className="mt-2 text-muted-foreground">
            Sistem digital untuk mengelola peminjaman alat secara cepat, aman, dan terstruktur.
          </p>
        </div>

        {/* Menu */}
        <div>
          <h4 className="font-semibold mb-3">Menu</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><a href="/" className="hover:text-foreground">Landing Page</a></li>
            <li><a href="/products" className="hover:text-foreground">Daftar Alat</a></li>
            <li><a href="/login" className="hover:text-foreground">Login</a></li>
            <li><a href="/dashboard" className="hover:text-foreground">Dashboard</a></li>
          </ul>
        </div>

        {/* Informasi */}
        <div>
          <h4 className="font-semibold mb-3">Informasi</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>Tentang Sistem</li>
            <li>Kebijakan Privasi</li>
            <li>Syarat & Ketentuan</li>
          </ul>
        </div>

        {/* Kontak */}
        <div>
          <h4 className="font-semibold mb-3">Kontak</h4>
          <p className="text-muted-foreground">Email: naufalazkaannahl@gmail.com</p>
          <p className="text-muted-foreground">Ponorogo, Jawa Timur, Indonesia</p>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Aplikasi Peminjaman Alat. All rights reserved.
      </div>
    </footer>
  );
}