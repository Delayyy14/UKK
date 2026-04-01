'use client';

import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  ClipboardList, 
  RotateCcw, 
  Activity,
  CheckCircle,
  Eye,
  Printer,
  Package,
  PlusCircle,
  Settings,
  Menu,
  Mail,
  HelpCircle,
  Newspaper,
  Tag,
  Image,
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  userRole: 'admin' | 'petugas' | 'peminjam';
}

interface MenuItem {
  name: string;
  path: string;
  icon: any;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export function SidebarContent({ userRole, onItemClick }: SidebarProps & { onItemClick?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  const adminMenu: MenuSection[] = [
    {
      title: "",
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Pesan Masuk', path: '/dashboard/messages', icon: Mail },
      ]
    },
    {
      title: "MANAJEMEN DATA",
      items: [
        { name: 'Data User', path: '/admin/users', icon: Users },
        { name: 'Inventaris Alat', path: '/admin/alat', icon: Package },
        { name: 'Kategori Alat', path: '/admin/kategori', icon: FolderOpen },
        { name: 'Manajemen Berita', path: '/admin/berita', icon: Newspaper },
        { name: 'Kategori Berita', path: '/admin/berita/kategori', icon: Tag },
        { name: 'Manajemen Banners', path: '/admin/banners', icon: Image }
      ]
    },
    {
      title: "TRANSAKSI",
      items: [
        { name: 'Peminjaman', path: '/admin/peminjaman', icon: ClipboardList },
        { name: 'Pengembalian', path: '/admin/pengembalian', icon: RotateCcw },
      ]
    },
    {
      title: "SISTEM",
      items: [
        { name: 'Log Aktifitas', path: '/admin/activity-log', icon: Activity },
        { name: 'Manajemen FAQ', path: '/admin/faq', icon: HelpCircle },
        { name: 'Pengaturan Profile', path: '/settings', icon: Settings },
      ]
    }
  ];

  const petugasMenu: MenuSection[] = [
    {
      title: "",
      items: [
        { name: 'Statistik', path: '/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: "VERIFIKASI",
      items: [
        { name: 'Setujui Peminjaman', path: '/petugas/approve-loan', icon: CheckCircle },
        { name: 'Monitor Pengembalian', path: '/petugas/monitor-return', icon: Eye },
      ]
    },
    {
      title: "LAPORAN",
      items: [
        { name: 'Cetak Laporan', path: '/petugas/reports', icon: Printer },
      ]
    },
    {
      title: "SISTEM",
      items: [
        { name: 'Pengaturan Profile', path: '/settings', icon: Settings },
      ]
    }
  ];

  const peminjamMenu: MenuSection[] = [
    {
      title: "",
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Daftar Alat', path: '/peminjam/alat', icon: Package },
        { name: 'Berita', path: '/berita', icon: Newspaper },
      ]
    },
    {
      title: "LAYANAN",
      items: [
        { name: 'Ajukan Pinjaman', path: '/peminjam/pinjam', icon: PlusCircle },
        { name: 'Kembalikan Alat', path: '/peminjam/kembalikan', icon: RotateCcw },
      ]
    },
    {
      title: "SISTEM",
      items: [
        { name: 'FAQ', path: '/faq', icon: HelpCircle },
        { name: 'Pengaturan Profile', path: '/settings', icon: Settings },
      ]
    }
  ];

  const sections = userRole === 'admin' ? adminMenu : userRole === 'petugas' ? petugasMenu : peminjamMenu;

  return (
    <div className="flex flex-col h-full bg-background text-foreground/80">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <h2 className="text-xl font-black tracking-tight flex items-center gap-2 text-foreground">
          <div className="bg-primary p-1.5 rounded-lg">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <span>PinjamAlat</span>
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-thin scrollbar-thumb-muted">
        <div className="space-y-7">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-2">
              {section.title && (
                <h3 className="px-3 text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">
                  {section.title}
                </h3>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-10 px-3 transition-all duration-200 font-semibold",
                        isActive 
                          ? "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary shadow-sm"
                          : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                      )}
                      onClick={() => {
                        router.push(item.path);
                        if (onItemClick) onItemClick();
                      }}
                    >
                      <Icon className={cn("h-[18px] w-[18px]", isActive ? "text-primary" : "text-muted-foreground")} />
                      {item.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ userRole }: SidebarProps) {
  return (
    <div className="no-print border-r border-border bg-background w-64 h-screen fixed left-0 top-0 hidden md:block z-50 shadow-sm">
      <SidebarContent userRole={userRole} />
    </div>
  );
}