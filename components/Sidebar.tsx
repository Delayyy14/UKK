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
  Mail
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  userRole: 'admin' | 'petugas' | 'peminjam';
}

export function SidebarContent({ userRole, onItemClick }: SidebarProps & { onItemClick?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  const adminMenu = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Pesan', path: '/dashboard/messages', icon: Mail },
    { name: 'User', path: '/admin/users', icon: Users },
    { name: 'Alat', path: '/admin/alat', icon: Package },
    { name: 'Kategori', path: '/admin/kategori', icon: FolderOpen },
    { name: 'Peminjaman', path: '/admin/peminjaman', icon: ClipboardList },
    { name: 'Pengembalian', path: '/admin/pengembalian', icon: RotateCcw },
    { name: 'Log Aktifitas', path: '/admin/activity-log', icon: Activity },
    { name: 'Pengaturan Profile', path: '/settings', icon: Settings },
  ];

  const petugasMenu = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Setujui Peminjaman', path: '/petugas/approve-loan', icon: CheckCircle },
    { name: 'Pengembalian', path: '/petugas/monitor-return', icon: Eye },
    { name: 'Cetak Laporan', path: '/petugas/reports', icon: Printer },
    { name: 'Pengaturan Profile', path: '/settings', icon: Settings },
  ];

  const peminjamMenu = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Daftar Alat', path: '/peminjam/alat', icon: Package },
    { name: 'Ajukan Peminjaman', path: '/peminjam/pinjam', icon: PlusCircle },
    { name: 'Pengembalian Alat', path: '/peminjam/kembalikan', icon: RotateCcw },
    { name: 'Pengaturan Profile', path: '/settings', icon: Settings },
  ];

  const menuItems = userRole === 'admin' ? adminMenu : userRole === 'petugas' ? petugasMenu : peminjamMenu;

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
          <Menu className="h-6 w-6" />
          <span>PinjamAlat</span>
        </h2>
      </div>
      <div className="py-4 flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "bg-secondary text-secondary-foreground shadow-sm"
                )}
                onClick={() => {
                  router.push(item.path);
                  if (onItemClick) onItemClick();
                }}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default function Sidebar({ userRole }: SidebarProps) {
  return (
    <div className="no-print border-r bg-muted/40 text-foreground w-64 min-h-screen fixed left-0 top-0 hidden md:block">
      <SidebarContent userRole={userRole} />
    </div>
  );
}