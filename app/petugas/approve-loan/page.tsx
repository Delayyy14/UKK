'use client';

import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { useEffect, useState } from 'react';
import { CheckCircle, Package, User, Calendar, X, XCircle, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
}

export default function ApproveLoanPage() {
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    fetchPeminjaman();
  }, []);

  const fetchPeminjaman = async () => {
    try {
      const res = await fetch('/api/petugas/peminjaman');
      const data = await res.json();
      if (res.ok) {
        // Filter only pending items here to be strictly "pending aja"
        setPeminjaman(data.filter((p: Peminjaman) => p.status === 'pending'));
      }
    } catch (error) {
      console.error('Error fetching peminjaman:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number, approve: boolean) => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const res = await fetch(`/api/petugas/peminjaman/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved: approve,
          approved_by: user.id,
        }),
      });

      if (res.ok) {
        fetchPeminjaman();
        toast({ title: 'Berhasil', description: approve ? 'Peminjaman disetujui' : 'Peminjaman ditolak', variant: 'success' });
      } else {
        toast({ title: 'Gagal', description: 'Gagal memproses peminjaman', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Terjadi kesalahan sistem', variant: 'destructive' });
    }
  };

  const handleApproveAll = async (items: Peminjaman[]) => {
    if (!confirm(`Setujui semua (${items.length}) permintaan dari user ini?`)) return;
    
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const promises = items.map(item => 
        fetch(`/api/petugas/peminjaman/${item.id}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            approved: true,
            approved_by: user.id,
          }),
        })
      );

      await Promise.all(promises);
      fetchPeminjaman();
      toast({ title: 'Berhasil', description: 'Semua permintaan berhasil disetujui', variant: 'success' });
    } catch (error) {
      toast({ title: 'Error', description: 'Terjadi kesalahan saat menyetujui semua', variant: 'destructive' });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  const filteredPeminjaman = peminjaman.filter((item) =>
    item.user_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.alat_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toString().includes(searchTerm) ||
    item.tanggal_pinjam.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <Layout>
      <Breadcrumb
        title="Penerimaan Alat (ACC)"
        description="Kelola permintaan peminjaman yang masuk secara kolektif per akun user."
        icon={CheckCircle}
      />
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Cari peminjam, username, alat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm outline-none text-sm"
          />
          <Search size={18} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <div className="flex gap-2">
           <div className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
            {peminjaman.length} Permintaan Menunggu
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
        {groupedList.map((group) => (
          <div
            key={group.user_id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:border-blue-300 transition-all duration-300"
          >
            {/* Header Profil User */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
               <div className="relative flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100 shrink-0">
                      {group.user_nama?.charAt(0).toUpperCase() || <User size={20} />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate leading-tight mb-0.5">
                        {group.user_nama || `User #${group.user_id}`}
                      </h3>
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="text-[10px] font-medium text-gray-400 truncate tracking-tight">@{group.user_username || 'user'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => handleApproveAll(group.items)}
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-md shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <CheckCircle size={14} />
                        SETUJUI SEMUA
                      </button>
                  </div>
               </div>
            </div>

            <div className="flex-1 p-4 space-y-6">
              {group.items.map((item, index) => (
                <div key={item.id} className={`${index !== 0 ? 'pt-5 border-t border-gray-50' : ''} group/item`}>
                  <div className="flex gap-4">
                    {/* Foto Alat */}
                    <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100 group-hover/item:border-blue-200 transition-colors">
                      {item.alat_foto ? (
                        <img
                          src={item.alat_foto}
                          alt={item.alat_nama}
                          className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50">
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
                          <span className="inline-block mt-1 text-[9px] font-mono bg-gray-50 px-1 py-0.5 rounded text-gray-400 font-bold uppercase">
                            #{item.id}
                          </span>
                        </div>
                        <button 
                          onClick={() => toggleExpand(item.id)}
                          className="text-[10px] font-medium text-blue-600 hover:underline transition-colors shrink-0"
                        >
                          {expandedItems[item.id] ? 'TUTUP' : 'DETAIL'}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                          <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Jumlah</p>
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-700">
                            <Package size={12} className="text-blue-500/70" />
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
                                Kembali: {formatDate(item.tanggal_kembali)}
                             </div>
                             <div className="flex items-center gap-1.5 text-emerald-600 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-md">
                                <Package size={10} />
                                Stok: {item.jumlah_tersedia ?? 0}
                             </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 mt-auto pt-2">
                        <button
                          onClick={() => handleApprove(item.id, true)}
                          disabled={item.jumlah_tersedia !== undefined && item.jumlah_tersedia < item.jumlah}
                          className={`flex items-center justify-center gap-1.5 flex-1 py-1.5 px-3 rounded-lg font-bold text-[11px] transition-all duration-300 shadow-sm ${
                            item.jumlah_tersedia !== undefined && item.jumlah_tersedia < item.jumlah
                              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                              : 'bg-slate-900 text-white hover:bg-black'
                          }`}
                        >
                          <CheckCircle size={14} />
                          SETUJUI
                        </button>
                        <button
                          onClick={() => handleApprove(item.id, false)}
                          className="flex items-center justify-center px-3 py-1.5 rounded-lg font-bold text-[11px] bg-white text-rose-500 border border-rose-100 hover:bg-rose-50 transition-all active:scale-95"
                        >
                          TOLAK
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {groupedList.length === 0 && (
        <div className="text-center py-32 bg-gray-50/50 rounded-[3rem] border-4 border-dashed border-gray-100">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl text-gray-200">
            <Package size={48} />
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-2">
            {peminjaman.length === 0 
              ? 'Yippee! Tidak ada antrian' 
              : 'Pencarian tidak ditemukan'}
          </h3>
          <p className="text-gray-400 font-medium">
            {peminjaman.length === 0 
              ? 'Semua permintaan peminjaman telah Anda selesaikan.' 
              : 'Pastikan kata kunci pencarian Anda sudah benar.'}
          </p>
        </div>
      )}
    </Layout>
  );
}
