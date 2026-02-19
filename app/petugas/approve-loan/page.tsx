'use client';

import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { useEffect, useState } from 'react';
import { CheckCircle, Package, User, Calendar, X, XCircle } from 'lucide-react';

interface Peminjaman {
  id: number;
  user_id: number;
  user_nama?: string;
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

  useEffect(() => {
    fetchPeminjaman();
  }, []);

  const fetchPeminjaman = async () => {
    try {
      const res = await fetch('/api/petugas/peminjaman');
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
        alert(approve ? 'Peminjaman disetujui' : 'Peminjaman ditolak');
      } else {
        alert('Gagal memproses peminjaman');
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  const pendingPeminjaman = peminjaman.filter((p) => p.status === 'pending');

  const filteredPeminjaman = pendingPeminjaman.filter((item) =>
    item.user_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.alat_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toString().includes(searchTerm) ||
    item.tanggal_pinjam.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <Layout>
      <Breadcrumb
        title="Setujui Peminjaman"
        description="Tinjau dan setujui atau tolak permintaan peminjaman alat dari peminjam. Pastikan alat tersedia dan sesuai dengan kebutuhan."
        icon={CheckCircle}
      />
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari peminjam, alat, ID, atau tanggal..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPeminjaman.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200 hover:shadow-xl transition-shadow"
          >
            {/* Foto Alat */}
            <div className="w-full h-48 bg-gray-200 overflow-hidden">
              {item.alat_foto ? (
                <img
                  src={item.alat_foto}
                  alt={item.alat_nama || 'Alat'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package size={64} />
                </div>
              )}
            </div>

            <div className="p-6">
              {/* Nama Alat */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {item.alat_nama || `Alat #${item.alat_id}`}
              </h3>

              {/* Informasi Peminjam dan Jumlah */}
              <div className="mb-4 space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <User size={18} className="text-gray-400" />
                  <span className="text-sm">Peminjam:</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {item.user_nama || `User #${item.user_id}`}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Package size={18} className="text-gray-400" />
                  <span className="text-sm">Jumlah: <strong className="text-gray-800">{item.jumlah} unit</strong></span>
                </div>

                {/* Tanggal Pinjam dan Rencana Kembali - Side by Side */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Tanggal Pinjam */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Tanggal Pinjam:</label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg">
                      <Calendar size={16} className="text-blue-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 font-medium">
                        {formatDate(item.tanggal_pinjam)}
                      </span>
                    </div>
                  </div>

                  {/* Rencana Kembali */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Rencana Kembali:</label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg">
                      <Calendar size={16} className="text-orange-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 font-medium">
                        {formatDate(item.tanggal_kembali)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Keperluan Peminjaman */}
                {item.alasan && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Keperluan Peminjaman</label>
                    <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg">
                      <p className="text-sm text-gray-700">
                        "{item.alasan}"
                      </p>
                    </div>
                  </div>
                )}
              </div>


              {/* Status Badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-300">
                  MENUNGGU PERSETUJUAN
                </span>
              </div>

              {/* Tombol Aksi */}
              <div className="flex gap-2">
                
              <button
  onClick={() => handleApprove(item.id, true)}
  disabled={item.jumlah_tersedia !== undefined && item.jumlah_tersedia < item.jumlah}
  className={`flex items-center justify-center gap-2 flex-1 py-3 px-4 rounded-full font-bold text-sm border-2 transition-all duration-200 transform hover:scale-105 ${
    item.jumlah_tersedia !== undefined && item.jumlah_tersedia < item.jumlah
      ? 'bg-gray-400 text-white border-gray-500 cursor-not-allowed'
      : 'bg-gray-800 text-white border-gray-800 shadow-lg hover:bg-gray-700 hover:shadow-xl'
  }`}
>
  <CheckCircle size={18} className="text-white" />
  <span>Setujui</span>
</button>
<button
  onClick={() => handleApprove(item.id, false)}
  className="flex items-center justify-center gap-2 flex-1 py-2 px-4 rounded-full font-bold text-sm bg-white text-gray-700 border-2 border-gray-400 shadow-lg hover:bg-gray-100 hover:text-gray-700 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
>
  <XCircle size={18} className="text-gray-700" />
  <span>Tolak</span>
</button>

              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPeminjaman.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
            {pendingPeminjaman.length === 0 
              ? 'Tidak ada peminjaman yang menunggu persetujuan' 
              : 'Tidak ada data yang ditemukan'}
          </p>
        </div>
      )}
    </Layout>
  );
}
