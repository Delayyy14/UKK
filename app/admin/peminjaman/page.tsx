'use client';

import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle, XCircle, Package, User, Calendar, Search } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Pagination from '@/components/Pagination';

interface Peminjaman {
  id: number;
  user_id: number;
  user_nama?: string;
  alat_id: number;
  alat_nama?: string;
  alat_foto?: string;
  jumlah_tersedia?: number;
  jumlah: number;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  status: string;
  alasan: string;
}

export default function PeminjamanPage() {
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [alat, setAlat] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9; // Grid 3x3
  
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    alat_id: '',
    jumlah: 1,
    tanggal_pinjam: '',
    tanggal_kembali: '',
    status: 'pending',
    alasan: '',
  });

  useEffect(() => {
    fetchPeminjaman();
    fetchUsers();
    fetchAlat();
  }, []);

  const fetchPeminjaman = async () => {
    try {
      const res = await fetch('/api/admin/peminjaman');
      const data = await res.json();
      if (res.ok) {
        setPeminjaman(data);
      }
    } catch (error) {
      console.error('Error fetching peminjaman:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAlat = async () => {
    try {
      const res = await fetch('/api/admin/alat');
      const data = await res.json();
      if (res.ok) {
        setAlat(data);
      }
    } catch (error) {
      console.error('Error fetching alat:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/admin/peminjaman';
      const method = 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: parseInt(formData.user_id),
          alat_id: parseInt(formData.alat_id),
          jumlah: parseInt(formData.jumlah.toString()),
        }),
      });

      if (res.ok) {
        setShowDialog(false);
        setFormData({
          user_id: '',
          alat_id: '',
          jumlah: 1,
          tanggal_pinjam: '',
          tanggal_kembali: '',
          status: 'pending',
          alasan: '',
        });
        fetchPeminjaman();
      } else {
        alert('Gagal menyimpan peminjaman');
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  };

  const handleUpdateStatus = async (item: Peminjaman, newStatus: string) => {
    if (!confirm(`Apakah anda yakin ingin mengubah status menjadi ${newStatus}?`)) return;

    try {
        const payload = {
            user_id: item.user_id,
            alat_id: item.alat_id,
            jumlah: item.jumlah,
            tanggal_pinjam: item.tanggal_pinjam,
            tanggal_kembali: item.tanggal_kembali,
            status: newStatus,
            alasan: item.alasan
        };

        const res = await fetch(`/api/admin/peminjaman/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            fetchPeminjaman();
        } else {
            alert('Gagal memperbarui status');
        }
    } catch (error) {
        console.error(error);
        alert('Terjadi kesalahan');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  if (loading) return <Layout><div className="flex justify-center p-8">Loading...</div></Layout>;

  const filteredPeminjaman = peminjaman.filter((item) => {
    const matchesSearch = 
      item.user_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alat_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toString().includes(searchTerm) ||
      item.tanggal_pinjam.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'semua' || item.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredPeminjaman.length / ITEMS_PER_PAGE);
  const paginatedPeminjaman = filteredPeminjaman.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Layout>
      <Breadcrumb
        title="Peminjaman Barang"
        description="Kelola data peminjaman alat."
        icon={ClipboardList}
      />

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full sm:w-auto">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Cari user, alat, ID..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="pl-8"
                />
            </div>
            <div className="w-full sm:w-[200px]">
                <Select value={filterStatus} onValueChange={(val) => { setFilterStatus(val); setCurrentPage(1); }}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="semua">Semua Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="disetujui">Disetujui</SelectItem>
                        <SelectItem value="ditolak">Ditolak</SelectItem>
                        <SelectItem value="sedang_dipinjam">Sedang Dipinjam</SelectItem>
                        <SelectItem value="selesai">Selesai</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {/* Button */}
        <Button onClick={() => {
            setFormData({
                user_id: '',
                alat_id: '',
                jumlah: 1,
                tanggal_pinjam: '',
                tanggal_kembali: '',
                status: 'pending',
                alasan: '',
            });
            setShowDialog(true);
        }}>
            Tambah Peminjaman
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedPeminjaman.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
             <div className="w-full h-40 bg-muted flex items-center justify-center text-muted-foreground">
                {item.alat_foto ? (
                    <img src={item.alat_foto} className="w-full h-full object-cover" alt={item.alat_nama} />
                ) : (
                   <Package size={48} />
                )}
             </div>
             <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1">{item.alat_nama}</CardTitle>
                    <Badge variant={
                        item.status === 'disetujui' ? 'default' :
                        item.status === 'selesai' ? 'secondary' :
                        item.status === 'ditolak' ? 'destructive' : 'outline'
                    }>
                        {item.status}
                    </Badge>
                </div>
                <CardDescription>ID: {item.id} • {item.user_nama}</CardDescription>
             </CardHeader>
             <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                        <Package size={14} /> Jumlah
                    </span>
                    <span className="font-medium">{item.jumlah} Unit</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                        <Calendar size={14} /> Pinjam
                    </span>
                    <span className="font-medium">{formatDate(item.tanggal_pinjam)}</span>
                </div>
                 <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                        <Calendar size={14} /> Kembali
                    </span>
                    <span className="font-medium">{formatDate(item.tanggal_kembali)}</span>
                </div>
                {item.alasan && (
                    <div className="bg-muted/50 p-2 rounded text-xs italic">
                        "{item.alasan}"
                    </div>
                )}
             </CardContent>
             <CardFooter className="pt-0">
                {item.status === 'pending' ? (
                    <div className="w-full flex gap-2">
                        <Button
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleUpdateStatus(item, 'disetujui')}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Setujui
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleUpdateStatus(item, 'ditolak')}
                        >
                            <XCircle className="w-4 h-4 mr-2" /> Tolak
                        </Button>
                    </div>
                ) : (
                    <div className="w-full text-center text-xs text-muted-foreground">
                        Status diperbarui
                    </div>
                )}
             </CardFooter>
          </Card>
        ))}
      </div>
      
      {filteredPeminjaman.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Tidak ada data peminjaman</p>
          </div>
      )}

      <div className="flex justify-between mt-4">
              Menampilkan {paginatedPeminjaman.length} dari {peminjaman.length} data peminjaman.
            
      
            <Pagination
               currentPage={currentPage}
               totalPages={totalPages}
               onPageChange={setCurrentPage}
            />
            </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Peminjaman</DialogTitle>
            <DialogDescription>
              Buat data peminjaman baru secara manual.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>User Peminjam</Label>
                <Select 
                    value={formData.user_id} 
                    onValueChange={(val) => setFormData({ ...formData, user_id: val })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih User" />
                    </SelectTrigger>
                    <SelectContent>
                        {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                                {user.nama} ({user.username})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="space-y-2">
                <Label>Alat</Label>
                <Select 
                    value={formData.alat_id} 
                    onValueChange={(val) => setFormData({ ...formData, alat_id: val })}
                >
                     <SelectTrigger>
                        <SelectValue placeholder="Pilih Alat" />
                    </SelectTrigger>
                    <SelectContent>
                         {alat.map((item) => (
                            <SelectItem 
                                key={item.id} 
                                value={item.id.toString()}
                                disabled={item.jumlah_tersedia === 0}
                            >
                                {item.nama} {item.jumlah_tersedia === 0 ? '(Stok Habis)' : `(Tersedia: ${item.jumlah_tersedia})`}
                            </SelectItem>
                         ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Jumlah</Label>
                    <Input
                        type="number"
                        min="1"
                        value={formData.jumlah}
                        onChange={(e) => setFormData({ ...formData, jumlah: parseInt(e.target.value) || 1 })}
                    />
                </div>
                 <div className="space-y-2">
                    <Label>Status Awal</Label>
                    <Select 
                        value={formData.status} 
                        onValueChange={(val) => setFormData({ ...formData, status: val })}
                    >
                         <SelectTrigger>
                            <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                         <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="disetujui">Disetujui</SelectItem>
                            <SelectItem value="sedang_dipinjam">Sedang Dipinjam</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Tanggal Pinjam</Label>
                    <Input
                        type="date"
                        value={formData.tanggal_pinjam}
                        onChange={(e) => setFormData({ ...formData, tanggal_pinjam: e.target.value })}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Tanggal Kembali</Label>
                    <Input
                        type="date"
                        value={formData.tanggal_kembali}
                        onChange={(e) => setFormData({ ...formData, tanggal_kembali: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Alasan</Label>
                <Textarea
                    value={formData.alasan}
                    onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                />
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Batal
                </Button>
                <Button type="submit">
                    Simpan
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}