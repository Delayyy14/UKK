'use client';

import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package,
  RotateCcw,
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface DashboardData {
  role: string;
  stats: any;
  recentPeminjaman?: any[];
  recentActivity?: any[];
  recentPengembalian?: any[];
  charts?: {
    monthlyPeminjaman?: { name: string; total: number }[];
    peminjamanByStatus?: { name: string; value: number }[];
  };
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const statusLabels: Record<string, string> = {
    pending: "Pending",
    disetujui: "Disetujui",
    ditolak: "Ditolak",
    sedang_dipinjam: "Sedang Dipinjam",
    selesai: "Selesai",
    rusak_ringan: "Rusak Ringan",
    rusak_berat: "Rusak Berat",
    tersedia: "Tersedia",
    rusak: "Rusak",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const userData = JSON.parse(userStr);
      const res = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${userData.id}`,
        },
      });
      const responseData = await res.json();
      
      // Format chart data names
      if (responseData.charts?.peminjamanByStatus) {
        responseData.charts.peminjamanByStatus = responseData.charts.peminjamanByStatus.map((item: any) => ({
          ...item,
          name: statusLabels[item.name] || item.name
        }));
      }

      if (res.ok) {
        setData(responseData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string } } = {
      pending: { variant: "secondary", label: 'Pending', className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80" },
      disetujui: { variant: "default", label: 'Disetujui', className: "bg-blue-100 text-blue-800 hover:bg-blue-100/80" },
      ditolak: { variant: "destructive", label: 'Ditolak' },
      sedang_dipinjam: { variant: "secondary", label: 'Sedang Dipinjam', className: "bg-purple-100 text-purple-800 hover:bg-purple-100/80" },
      selesai: { variant: "default", label: 'Selesai', className: "bg-green-100 text-green-800 hover:bg-green-100/80" },
    };
    const statusInfo = statusMap[status] || { variant: "outline", label: status };
    
    return (
      <Badge variant={statusInfo.variant} className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return <Layout><div className="flex justify-center p-8">Loading...</div></Layout>;
  }

  if (!data) {
    return <Layout><div className="text-center py-8">Tidak ada data</div></Layout>;
  }

  // Admin Dashboard
  if (data.role === 'admin') {
    return (
      <Layout>
        <Breadcrumb
          title="Dashboard Admin"
          description="Ringkasan lengkap sistem. Pantau semua aktivitas, statistik, dan data penting dalam satu tampilan."
          icon={LayoutDashboard}
        />
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Peminjaman per Bulan</CardTitle>
              <CardDescription>Statistik peminjaman dalam 6 bulan terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts?.monthlyPeminjaman || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}`} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="total" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribusi Status Peminjaman</CardTitle>
              <CardDescription>Persentase peminjaman berdasarkan status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.charts?.peminjamanByStatus || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(data.charts?.peminjamanByStatus || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Peminjaman */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList size={20} className="text-blue-600" />
                Peminjaman Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Alat</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentPeminjaman && data.recentPeminjaman.length > 0 ? (
                    data.recentPeminjaman.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.user_nama}</TableCell>
                        <TableCell>{item.alat_nama}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Tidak ada data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity size={20} className="text-green-600" />
                Aktivitas Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
              {data.recentActivity && data.recentActivity.length > 0 ? (
                data.recentActivity.map((item: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="mt-1 bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full">
                      <Activity size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{item.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.user_nama || 'System'} • {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">Tidak ada aktivitas</p>
              )}
            </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Petugas Dashboard
  if (data.role === 'petugas') {
    return (
      <Layout>
        <Breadcrumb
          title="Dashboard Petugas"
          description="Ringkasan peminjaman dan pengembalian. Kelola persetujuan peminjaman dan pantau pengembalian alat."
          icon={LayoutDashboard}
        />
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Tren Peminjaman</CardTitle>
              <CardDescription>Aktivitas peminjaman dalam 6 bulan terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts?.monthlyPeminjaman || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}`} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="total" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Peminjaman */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock size={20} className="text-yellow-600" />
                Peminjaman Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Alat</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentPeminjaman && data.recentPeminjaman.length > 0 ? (
                    data.recentPeminjaman.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.user_nama}</TableCell>
                        <TableCell>{item.alat_nama}</TableCell>
                        <TableCell>{item.jumlah}</TableCell>
                        <TableCell>{formatDate(item.tanggal_pinjam)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Tidak ada peminjaman pending
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {data.recentPeminjaman && data.recentPeminjaman.length > 0 && (
                <div className="mt-4">
                  <Button variant="link" asChild className="p-0 h-auto">
                    <a href="/petugas/approve-loan">Lihat Semua →</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Pengembalian */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <RotateCcw size={20} className="text-green-600" />
                Pengembalian Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Alat</TableHead>
                    <TableHead>Kondisi</TableHead>
                    <TableHead>Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentPengembalian && data.recentPengembalian.length > 0 ? (
                    data.recentPengembalian.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.user_nama}</TableCell>
                        <TableCell>{item.alat_nama}</TableCell>
                        <TableCell>
                          <Badge variant={item.kondisi === 'baik' ? 'default' : item.kondisi === 'rusak_ringan' ? 'secondary' : 'destructive'}
                             className={item.kondisi === 'baik' ? 'bg-green-100 text-green-800' : item.kondisi === 'rusak_ringan' ? 'bg-yellow-100 text-yellow-800' : ''}
                          >
                            {item.kondisi === 'baik' ? 'Baik' :
                             item.kondisi === 'rusak_ringan' ? 'Rusak Ringan' : 'Rusak Berat'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(item.tanggal_kembali)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Tidak ada pengembalian
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Peminjam Dashboard
  return (
    <Layout>
      <Breadcrumb
        title="Dashboard Peminjam"
        description="Ringkasan peminjaman Anda. Pantau status peminjaman dan lihat alat yang tersedia untuk dipinjam."
        icon={LayoutDashboard}
      />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
    
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Peminjaman Saya</CardTitle>
              <CardDescription>Grafik status peminjaman yang pernah dilakukan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.charts?.peminjamanByStatus || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(data.charts?.peminjamanByStatus || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex flex-col justify-center items-center bg-muted/20">
             <CardContent className="text-center pt-6">
                <p className="text-muted-foreground mb-4">Ingin meminjam alat lagi?</p>
                <Button asChild size="lg" className="w-full md:w-auto">
                    <a href="/peminjam/pinjam">Pinjam Alat Sekarang</a>
                </Button>
             </CardContent>
          </Card>
      </div>

      {/* Recent Peminjaman */}
      <Card>
        <CardHeader>
           <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList size={20} className="text-blue-600" />
            Peminjaman Terbaru
           </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alat</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Tanggal Pinjam</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentPeminjaman && data.recentPeminjaman.length > 0 ? (
                data.recentPeminjaman.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.foto ? (
                          <img
                            src={item.foto}
                            alt={item.alat_nama}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <Package size={20} className="text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium">{item.alat_nama}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.jumlah}</TableCell>
                    <TableCell>{formatDate(item.tanggal_pinjam)}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                        {(item.status === 'pending' || item.status === 'disetujui') && (
                            <Button size="sm" asChild>
                                <a href={`/peminjam/peminjaman/${item.id}/bukti`} target="_blank">
                                    Cetak Bukti
                                </a>
                            </Button>
                        )}
                        </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Belum ada peminjaman
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {data.recentPeminjaman && data.recentPeminjaman.length > 0 && (
            <div className="mt-4 flex gap-2">
              <Button asChild variant="outline">
                <a href="/peminjam/pinjam">Pinjam Alat Baru →</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/peminjam/kembalikan">Kembalikan Alat →</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}