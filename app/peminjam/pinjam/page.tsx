'use client';

import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PlusCircle, Package } from 'lucide-react';

interface Alat {
  id: number;
  nama: string;
  jumlah_tersedia: number;
  foto?: string;
  deskripsi?: string;
  kategori_nama?: string;
}

function PinjamPageContent() {
  const searchParams = useSearchParams();
  const alatId = searchParams.get('alat_id');
  const [search, setSearch] = useState('');
  const [alat, setAlat] = useState<Alat[]>([]);
  const [selectedAlat, setSelectedAlat] = useState<number | null>(
    alatId ? parseInt(alatId) : null
  );

  const [formData, setFormData] = useState({
    jumlah: 1,
    tanggal_pinjam: '',
    tanggal_kembali: '',
    alasan: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlat();
    if (alatId) setSelectedAlat(parseInt(alatId));
  }, [alatId]);

  const fetchAlat = async () => {
    try {
      const res = await fetch('/api/peminjam/alat');
      const data = await res.json();
      if (res.ok) setAlat(data);
    } catch (error) {
      console.error('Error fetching alat:', error);
    }
  };

  const filteredAlat = alat.filter((alat) =>
    alat.nama.toLowerCase().includes(search.toLowerCase())
  );

  const selectedAlatData = alat.find((a) => a.id === selectedAlat);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAlat) return alert('Pilih alat terlebih dahulu');

    if (formData.jumlah > (selectedAlatData?.jumlah_tersedia || 0)) {
      return alert(`Jumlah melebihi stok tersedia`);
    }

    setLoading(true);

    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return alert('Anda harus login');

      const user = JSON.parse(userStr);

      const res = await fetch('/api/peminjam/peminjaman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          alat_id: selectedAlat,
          ...formData,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Peminjaman berhasil diajukan');
        window.location.href = '/dashboard';
      } else {
        alert(data.error || 'Gagal mengajukan peminjaman');
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
        description="Pilih alat dengan gambar, tentukan tanggal, dan ajukan peminjaman."
        icon={PlusCircle}
      />

      <div className="bg-white rounded-xl shadow p-6 max-w-5xl">

        {/* ================= PILIH ALAT GRID ================= */}
        <div>
          <label className="block text-sm font-semibold mb-3">Pilih Alat</label>
          <input
            type="text"
            placeholder="Cari alat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredAlat.map((item) => (
              <div
                key={item.id}
                onClick={() => item.jumlah_tersedia > 0 && setSelectedAlat(item.id)}
                className={`cursor-pointer border rounded-xl p-3 transition hover:shadow-lg
                  ${selectedAlat === item.id ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'}
                  ${item.jumlah_tersedia === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {/* FOTO */}
                <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-2">
                  {item.foto ? (
                    <img src={item.foto} alt={item.nama} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package size={40} />
                    </div>
                  )}
                </div>

                {/* INFO */}
                <h3 className="font-medium text-sm">{item.nama}</h3>
                <p className="text-xs text-gray-500">{item.kategori_nama}</p>

                <span className={`text-xs font-semibold mt-1 inline-block
                  ${item.jumlah_tersedia > 0 ? 'text-green-600' : 'text-red-500'}
                `}>
                  {item.jumlah_tersedia > 0 ? `Stok: ${item.jumlah_tersedia}` : 'Stok Habis'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ================= PREVIEW ALAT TERPILIH ================= */}
        {selectedAlatData && (
          <div className="mt-6 p-4 bg-gray-50 border rounded-xl flex gap-4">
            <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200">
              <img
                src={selectedAlatData.foto || '/placeholder.png'}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold">{selectedAlatData.nama}</h3>
              <p className="text-sm text-gray-500">{selectedAlatData.kategori_nama}</p>
              <p className="text-sm mt-2">{selectedAlatData.deskripsi}</p>
              <p className="mt-2 font-medium">
                Stok: <span className="text-green-600">{selectedAlatData.jumlah_tersedia}</span>
              </p>
            </div>
          </div>
        )}

        {/* ================= FORM PEMINJAMAN ================= */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          {/* JUMLAH */}
          <div>
            <label className="text-sm font-medium">Jumlah</label>
            <input
              type="number"
              min={1}
              max={selectedAlatData?.jumlah_tersedia || 1}
              value={formData.jumlah}
              onChange={(e) => setFormData({ ...formData, jumlah: Number(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* TANGGAL PINJAM */}
          <div>
            <label className="text-sm font-medium">Tanggal Pinjam</label>
            <input
              type="date"
              value={formData.tanggal_pinjam}
              onChange={(e) => setFormData({ ...formData, tanggal_pinjam: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* TANGGAL KEMBALI */}
          <div>
            <label className="text-sm font-medium">Tanggal Kembali</label>
            <input
              type="date"
              value={formData.tanggal_kembali}
              onChange={(e) => setFormData({ ...formData, tanggal_kembali: e.target.value })}
              min={formData.tanggal_pinjam}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ALASAN */}
          <div>
            <label className="text-sm font-medium">Alasan Peminjaman</label>
            <textarea
              rows={4}
              value={formData.alasan}
              onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Jelaskan alasan peminjaman..."
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading || !selectedAlat}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Mengajukan...' : 'Ajukan Peminjaman'}
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default function PinjamPage() {
  return (
    <Suspense fallback={<Layout><div>Loading...</div></Layout>}>
      <PinjamPageContent />
    </Suspense>
  );
}
