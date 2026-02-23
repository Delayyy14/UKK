'use client';

import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle, XCircle, Package, User, Calendar, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
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
  user_email?: string;
  user_username?: string;
  alat_id: number;
  alat_nama?: string;
  alat_foto?: string;
  alat_deskripsi?: string;
  jumlah_tersedia?: number;
  jumlah: number;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  status: string;
  alasan: string;
  created_at?: string;
}

export default function PeminjamanPage() {
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [alat, setAlat] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
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
        toast({ title: 'Berhasil', description: 'Data berhasil di simpan', variant: 'success' });
      } else {
        toast({ title: 'Gagal', description: 'Gagal menyimpan peminjaman', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Terjadi kesalahan sistem', variant: 'destructive' });
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

        const data = await res.json();

        if (res.ok) {
            fetchPeminjaman();
            toast({ title: 'Berhasil', description: 'Data berhasil di simpan', variant: 'success' });
        } else {
            toast({ title: 'Gagal', description: data.error || 'Gagal memperbarui status', variant: 'destructive' });
        }
    } catch (error) {
        console.error(error);
        toast({ title: 'Error', description: 'Terjadi kesalahan sistem', variant: 'destructive' });
    }
  };

  const handleUpdateStatusAll = async (items: Peminjaman[], newStatus: string) => {
    if (!confirm(`Ubah status semua (${items.length}) barang menjadi ${newStatus}?`)) return;
    
    try {
      const promises = items.map(item => 
        fetch(`/api/admin/peminjaman/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...item,
            status: newStatus,
          }),
        })
      );

      await Promise.all(promises);
      fetchPeminjaman();
      toast({ title: 'Berhasil', description: 'Data berhasil di simpan', variant: 'success' });
    } catch (error) {
      toast({ title: 'Error', description: 'Terjadi kesalahan saat memperbarui semua status', variant: 'destructive' });
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
      item.user_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alat_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alat_deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toString().includes(searchTerm) ||
      item.tanggal_pinjam.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'semua' || item.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const groupedPeminjaman = filteredPeminjaman.reduce((acc, item) => {
    const key = item.user_id;
    if (!acc[key]) {
      acc[key] = {
        user_id: item.user_id,
        user_nama: item.user_nama,
        user_email: item.user_email,
        user_username: item.user_username,
        items: []
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {} as Record<number, { user_id: number; user_nama?: string; user_email?: string; user_username?: string; items: Peminjaman[] }>);

  const groupedList = Object.values(groupedPeminjaman);

  const totalPages = Math.ceil(groupedList.length / ITEMS_PER_PAGE);
  const paginatedGroups = groupedList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleExpand = (id: number) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Layout>
      <Breadcrumb
        title="Peminjaman Barang"
        description="Kelola data peminjaman alat. Gunakan filter untuk melihat permintaan yang butuh persetujuan."
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
                        <SelectItem value="pending">Pending (Menunggu ACC)</SelectItem>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {paginatedGroups.map((group) => (
          <div
            key={group.user_id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:border-primary/30 transition-all duration-300"
          >
            {/* Header Profil User */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
               <div className="relative flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20 shrink-0">
                      {group.user_nama?.charAt(0).toUpperCase() || <User size={20} />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate leading-tight mb-0.5">
                        {group.user_nama}
                      </h3>
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="text-[10px] font-medium text-gray-400 truncate tracking-tight">@{group.user_username}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                      {group.items.some(item => item.status === 'pending') && (
                        <button 
                          onClick={() => handleUpdateStatusAll(group.items.filter(i => i.status === 'pending'), 'disetujui')}
                          className="px-2.5 py-1.5 bg-primary hover:bg-primary/90 text-white text-[10px] font-bold rounded-md shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          <CheckCircle size={14} />
                          SETUJUI SEMUA
                        </button>
                      )}
                  </div>
               </div>
            </div>

            <div className="flex-1 p-4 space-y-6">
              {group.items.map((item, index) => (
                <div key={item.id} className={`${index !== 0 ? 'pt-5 border-t border-gray-50' : ''} group/item`}>
                  <div className="flex gap-4">
                    {/* Foto Alat */}
                    <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100 group-hover/item:border-primary/20 transition-colors">
                      {item.alat_foto ? (
                        <img
                          src={item.alat_foto}
                          alt={item.alat_nama}
                          className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                          <Package size={24} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div className="min-w-0 text-left">
                          <h4 className="text-[13px] font-bold text-gray-900 leading-tight truncate px-0">
                            {item.alat_nama}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="inline-block text-[9px] font-mono bg-gray-50 px-1 py-0.5 rounded text-gray-400 font-bold uppercase">
                              #{item.id}
                            </span>
                            <Badge variant={
                                item.status === 'disetujui' ? 'default' :
                                item.status === 'selesai' ? 'secondary' :
                                item.status === 'ditolak' ? 'destructive' : 'outline'
                            } className="text-[8px] h-4 px-1.5 uppercase font-black tracking-tight leading-none rounded">
                                {item.status === 'pending' ? 'MENUNGGU' : 
                                  item.status === 'disetujui' ? 'ACC' :
                                  item.status === 'sedang_dipinjam' ? 'PINJAM' :
                                  item.status === 'selesai' ? 'SELESAI' : item.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleExpand(item.id)}
                          className="text-[10px] font-medium text-primary hover:underline transition-colors shrink-0"
                        >
                          {expandedItems[item.id] ? 'TUTUP' : 'DETAIL'}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                          <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Jumlah</p>
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-700">
                            <Package size={12} className="text-primary/70" />
                            {item.jumlah} Unit
                          </div>
                        </div>
                        <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                          <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Pinjam</p>
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-700">
                            <Calendar size={12} className="text-orange-400" />
                            {formatDate(item.tanggal_pinjam)}
                          </div>
                        </div>
                      </div>

                      {/* Detail Section (Expandable) */}
                      {expandedItems[item.id] && (
                        <div className="mb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/50 text-left">
                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-1">Keterangan Alat</p>
                            <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                              {item.alat_deskripsi || "Tidak ada deskripsi."}
                            </p>
                          </div>
                          
                          <div className="bg-indigo-50/30 p-2.5 rounded-lg border border-indigo-100/50 text-left">
                            <p className="text-[8px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Keperluan</p>
                            <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                              "{item.alasan || 'Tidak ada alasan.'}"
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium">
                             <div className="flex items-center gap-1.5 text-gray-500 px-2 py-1 bg-gray-50 border border-gray-100 rounded-md">
                                <Calendar size={10} className="text-gray-400" />
                                Barang dikembalikan: {formatDate(item.tanggal_kembali)}
                             </div>
                             <div className="flex items-center gap-1.5 text-emerald-600 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-md">
                                <Package size={10} />
                                Stok: {item.jumlah_tersedia ?? 0}
                             </div>
                          </div>
                        </div>
                      )}

                      {item.status === 'pending' && (
                        <div className="flex gap-2 mt-auto pt-2">
                          <button
                            onClick={() => handleUpdateStatus(item, 'disetujui')}
                            className="flex items-center justify-center gap-1.5 flex-1 py-1.5 px-3 rounded-lg font-bold text-[11px] bg-slate-900 text-white hover:bg-black shadow-sm transition-all"
                          >
                            <CheckCircle size={14} />
                            SETUJUI
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item, 'ditolak')}
                            className="flex items-center justify-center px-3 py-1.5 rounded-lg font-bold text-[11px] bg-white text-rose-500 border border-rose-100 hover:bg-rose-50 transition-all active:scale-95"
                          >
                            TOLAK
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {groupedList.length === 0 && (
          <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
            <Package size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">Tidak ada data peminjaman</p>
          </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <span className="text-sm text-muted-foreground">
                Menampilkan <span className="font-bold text-foreground">{paginatedGroups.length}</span> user dari <span className="font-bold text-foreground">{groupedList.length}</span> total permintaan.
            </span>
            
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