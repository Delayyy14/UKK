'use client';

import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PlusCircle, Package, Receipt, Tag } from 'lucide-react';

interface Alat {
  id: number;
  nama: string;
  jumlah_tersedia: number;
  foto?: string;
  deskripsi?: string;
  kategori_nama?: string;
  harga_per_hari: number;
}

interface ItemRequest {
  alat_id: number;
  nama: string;
  jumlah: number;
  stok_tersedia: number;
  foto?: string;
  harga_per_hari: number;
}

function PinjamPageContent() {
  const searchParams = useSearchParams();
  const initialAlatId = searchParams.get('alat_id');
  
  const [search, setSearch] = useState('');
  const [alat, setAlat] = useState<Alat[]>([]);
  const [selectedItems, setSelectedItems] = useState<ItemRequest[]>([]);
  
  const [globalFormData, setGlobalFormData] = useState({
    tanggal_pinjam: '',
    tanggal_kembali: '',
    alasan: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlat();
  }, []);

  useEffect(() => {
    if (initialAlatId && alat.length > 0) {
      const tool = alat.find(a => a.id === parseInt(initialAlatId));
      if (tool && !selectedItems.find(i => i.alat_id === tool.id)) {
        addItem(tool);
      }
    }
  }, [initialAlatId, alat]);

  const fetchAlat = async () => {
    try {
      const res = await fetch('/api/peminjam/alat');
      const data = await res.json();
      if (res.ok) setAlat(data);
    } catch (error) {
      console.error('Error fetching alat:', error);
    }
  };

  const addItem = (item: Alat) => {
    if (item.jumlah_tersedia <= 0) return;
    if (selectedItems.find(i => i.alat_id === item.id)) return;
    
    setSelectedItems([...selectedItems, {
      alat_id: item.id,
      nama: item.nama,
      jumlah: 1,
      stok_tersedia: item.jumlah_tersedia,
      foto: item.foto,
      harga_per_hari: Number(item.harga_per_hari) || 0
    }]);
    setSearch('');
  };

  const removeItem = (id: number) => {
    setSelectedItems(selectedItems.filter(i => i.alat_id !== id));
  };

  const updateItemJumlah = (id: number, jumlah: number) => {
    setSelectedItems(selectedItems.map(i => 
      i.alat_id === id ? { ...i, jumlah: Math.max(1, Math.min(jumlah, i.stok_tersedia)) } : i
    ));
  };

  // Perhitungan Hari
  const durasiHari = useMemo(() => {
    if (!globalFormData.tanggal_pinjam || !globalFormData.tanggal_kembali) return 0;
    const tgl1 = new Date(globalFormData.tanggal_pinjam);
    const tgl2 = new Date(globalFormData.tanggal_kembali);
    const diffTime = tgl2.getTime() - tgl1.getTime();
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays; // Minimal 1 hari
  }, [globalFormData.tanggal_pinjam, globalFormData.tanggal_kembali]);

  // Perhitungan Harga
  const pricingData = useMemo(() => {
    const subtotal = selectedItems.reduce((acc, item) => {
      return acc + (item.harga_per_hari * item.jumlah * durasiHari);
    }, 0);
    
    const diskon = subtotal * 0.1; // 10% diskon
    const total = subtotal - diskon;
    
    return { subtotal, diskon, total };
  }, [selectedItems, durasiHari]);

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredAlat = search.trim() === '' 
    ? [] 
    : alat.filter((a) => a.nama.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedItems.length === 0) return alert('Pilih minimal satu alat');
    if (!globalFormData.tanggal_pinjam || !globalFormData.tanggal_kembali) return alert('Pilih tanggal pinjam dan kembali');
    if (durasiHari <= 0) return alert('Tanggal kembali harus setelah tanggal pinjam');

    setLoading(true);

    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return alert('Anda harus login');
      const user = JSON.parse(userStr);

      const promises = selectedItems.map(item => {
        // Hitung total_harga per item (setelah diskon)
        const itemSubtotal = item.harga_per_hari * item.jumlah * durasiHari;
        const itemDiscount = itemSubtotal * 0.1;
        const itemTotal = itemSubtotal - itemDiscount;

        return fetch('/api/peminjam/peminjaman', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            alat_id: item.alat_id,
            jumlah: item.jumlah,
            total_harga: itemTotal,
            ...globalFormData,
          }),
        });
      });

      const results = await Promise.all(promises);
      const allOk = results.every(res => res.ok);

      if (allOk) {
        alert('Semua peminjaman berhasil diajukan');
        window.location.href = '/dashboard';
      } else {
        alert('Beberapa atau semua pengajuan gagal. Silakan cek riwayat Anda.');
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Breadcrumb
        title="Ajukan Peminjaman"
        description="Pilih satu atau beberapa alat, tentukan tanggal, dan ajukan peminjaman."
        icon={PlusCircle}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pb-12">
        {/* ================= SELEKSI ALAT ================= */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">Cari & Tambah Alat</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ketik nama alat di sini... (Contoh: Kamera, Tenda)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg transition-all shadow-sm"
              />
              {search.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {filteredAlat.length > 0 ? (
                    filteredAlat.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => addItem(item)}
                        className={`flex items-center gap-4 p-4 hover:bg-blue-50 cursor-pointer transition
                          ${item.jumlah_tersedia <= 0 ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                          ${selectedItems.find(i => i.alat_id === item.id) ? 'bg-blue-50' : ''}
                        `}
                      >
                        <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.foto ? (
                            <img src={item.foto} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package size={24} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{item.nama}</h4>
                          <p className="text-[10px] text-blue-600 font-bold uppercase">{item.kategori_nama || 'Tanpa Kategori'}</p>
                          <p className="text-sm font-semibold text-gray-600 mt-1">{formatIDR(item.harga_per_hari)} <span className="text-[10px] font-normal text-gray-400">/ hari</span></p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.jumlah_tersedia > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {item.jumlah_tersedia > 0 ? `Stok: ${item.jumlah_tersedia}` : 'Habis'}
                          </span>
                          {selectedItems.find(i => i.alat_id === item.id) && (
                            <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase">Sudah dipilih</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-gray-400">Alat tidak ditemukan</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* DAFTAR ITEM YANG DIPILIH */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[300px]">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              Daftar Alat yang Akan Dipinjam
              <span className="inline-flex items-center justify-center bg-blue-600 text-white text-[10px] h-5 w-5 rounded-full">{selectedItems.length}</span>
            </h3>
            
            {selectedItems.length > 0 ? (
              <div className="grid gap-4">
                {selectedItems.map((item) => (
                  <div key={item.alat_id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-blue-200 transition bg-white shadow-sm">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                      <img src={item.foto || '/placeholder.png'} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 line-clamp-1">{item.nama}</h4>
                      <p className="text-[10px] font-bold text-blue-600">{formatIDR(item.harga_per_hari)} / hari</p>
                      <p className="text-xs text-gray-400 mt-1">Stok: {item.stok_tersedia}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border rounded-lg bg-gray-50 overflow-hidden">
                        <button 
                          type="button"
                          onClick={() => updateItemJumlah(item.alat_id, item.jumlah - 1)}
                          className="px-3 py-1 hover:bg-gray-200 transition disabled:opacity-30"
                          disabled={item.jumlah <= 1}
                        >-</button>
                        <input 
                          type="number"
                          value={item.jumlah}
                          onChange={(e) => updateItemJumlah(item.alat_id, parseInt(e.target.value) || 1)}
                          className="w-10 text-center bg-transparent border-none focus:ring-0 text-sm font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button 
                          type="button"
                          onClick={() => updateItemJumlah(item.alat_id, item.jumlah + 1)}
                          className="px-3 py-1 hover:bg-gray-200 transition disabled:opacity-30"
                          disabled={item.jumlah >= item.stok_tersedia}
                        >+</button>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <p className="text-sm font-bold text-gray-800">{formatIDR(item.harga_per_hari * item.jumlah * (durasiHari || 1))}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Subtotal</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeItem(item.alat_id)}
                        className="p-2 text-red-200 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                 <div className="p-4 bg-white rounded-full mb-3 shadow-sm border border-gray-50 text-gray-200">
                    <Package size={32} />
                 </div>
                 <p className="text-gray-400 text-sm font-medium">Belum ada alat yang dipilih.</p>
                 <p className="text-gray-300 text-[11px] mt-1">Gunakan kotak pencarian di atas untuk menambahkan alat.</p>
              </div>
            )}
          </div>
        </div>

        {/* ================= FORM DETAIL PEMINJAMAN ================= */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-24 space-y-6">
            <h3 className="font-bold text-gray-800 text-lg border-b pb-4 flex items-center gap-2">
              <Receipt size={20} className="text-blue-600" />
              Detail Peminjaman
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tgl Pinjam</label>
                  <input
                    type="date"
                    required
                    value={globalFormData.tanggal_pinjam}
                    onChange={(e) => setGlobalFormData({ ...globalFormData, tanggal_pinjam: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tgl Kembali</label>
                  <input
                    type="date"
                    required
                    value={globalFormData.tanggal_kembali}
                    onChange={(e) => setGlobalFormData({ ...globalFormData, tanggal_kembali: e.target.value })}
                    min={globalFormData.tanggal_pinjam || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Alasan Peminjaman</label>
                <textarea
                  rows={3}
                  required
                  value={globalFormData.alasan}
                  onChange={(e) => setGlobalFormData({ ...globalFormData, alasan: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium resize-none shadow-inner"
                  placeholder="Ceritakan keperluan Anda..."
                />
              </div>
            </div>

            {/* RINGKASAN HARGA */}
            <div className="pt-4 border-t space-y-3">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Durasi Pinjam</span>
                  <span className="font-bold text-gray-800">{durasiHari} Hari</span>
               </div>
               
               <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Subtotal Sewa</span>
                  <span className="font-bold text-gray-800">{formatIDR(pricingData.subtotal)}</span>
               </div>

               <div className="flex justify-between items-center text-sm text-green-600 bg-green-50 p-3 rounded-xl border border-green-100">
                  <span className="flex items-center gap-1 font-medium"><Tag size={14} /> Diskon Member (10%)</span>
                  <span className="font-bold">-{formatIDR(pricingData.diskon)}</span>
               </div>

               <div className="pt-2 flex justify-between items-end border-t border-dashed">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Total Pembayaran</p>
                    <p className="text-2xl font-black text-blue-600">{formatIDR(pricingData.total)}</p>
                  </div>
                  {durasiHari > 0 && (
                    <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold animate-pulse">
                        READY TO BOOK
                    </div>
                  )}
               </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={loading || selectedItems.length === 0 || durasiHari <= 0}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2
                ${loading || selectedItems.length === 0 || durasiHari <= 0
                  ? 'bg-gray-200 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-br from-blue-600 to-indigo-700 hover:shadow-blue-200 hover:-translate-y-1'
                }
              `}
            >
              {loading ? 'Memproses...' : 'Kirim Pengajuan Pinjam'}
            </button>
            <p className="text-[10px] text-center text-gray-400">Peminjaman akan masuk status pending untuk ditinjau admin.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function PinjamPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-blue-600 font-bold">Memuat Halaman...</div>
        </div>
      </Layout>
    }>
      <PinjamPageContent />
    </Suspense>
  );
}
