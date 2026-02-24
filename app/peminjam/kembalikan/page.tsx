'use client';

import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Peminjaman {
  id: number;
  alat_id: number;
  alat_nama?: string;
  jumlah: number;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  status: string;
}

export default function KembalikanPage() {
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState<Peminjaman | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    kondisi: 'baik',
    catatan: '',
  });

  useEffect(() => {
    fetchPeminjaman();
  }, []);

  const fetchPeminjaman = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const res = await fetch(`/api/peminjam/peminjaman?user_id=${user.id}`);
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

  const handleReturn = (item: Peminjaman) => {
    setSelectedPeminjaman(item);
    setFormData({ kondisi: 'baik', catatan: '' });
    setShowModal(true);
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeminjaman) return;

    try {
      const res = await fetch('/api/peminjam/pengembalian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peminjaman_id: selectedPeminjaman.id,
          tanggal_kembali: new Date().toISOString().split('T')[0],
          ...formData,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Berhasil', description: 'Data berhasil di simpan', variant: 'success' });
        setShowModal(false);
        setSelectedPeminjaman(null);
        fetchPeminjaman();
      } else {
        toast({ title: 'Gagal', description: data.error || 'Gagal melakukan pengembalian', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Terjadi kesalahan sistem', variant: 'destructive' });
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  const activePeminjaman = peminjaman.filter(
    (p) => p.status === 'disetujui' || p.status === 'sedang_dipinjam'
  );

  const filteredPeminjaman = activePeminjaman.filter((item) =>
    item.alat_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toString().includes(searchTerm) ||
    item.tanggal_pinjam.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tanggal_kembali?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <Breadcrumb
        title="Pengembalian Alat"
        description="Kembalikan alat yang sedang Anda pinjam. Catat kondisi alat saat dikembalikan dan pastikan pengembalian tepat waktu."
        icon={RotateCcw}
      />
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari alat, ID, atau tanggal..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Alat</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Tanggal Pinjam</TableHead>
              <TableHead>Tanggal Kembali</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPeminjaman.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>{item.alat_nama || item.alat_id}</TableCell>
                <TableCell>{item.jumlah}</TableCell>
                <TableCell>
                  {new Date(item.tanggal_pinjam).toLocaleDateString('id-ID')}
                </TableCell>
                <TableCell>
                  {item.tanggal_kembali ? new Date(item.tanggal_kembali).toLocaleDateString('id-ID') : '-'}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${
                      item.status === 'disetujui'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : item.status === 'sedang_dipinjam'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {item.status === 'disetujui'
                      ? 'Disetujui'
                      : item.status === 'sedang_dipinjam'
                      ? 'Sedang Dipinjam'
                      : item.status}
                  </span>
                </TableCell> 
                <TableCell>
                  <div className="flex gap-2">
                    {(item.status === 'disetujui') && (
                    <a
                        href={`/peminjam/peminjaman/${item.id}/bukti`}
                        target="_blank"
                        className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 transition shadow-sm"
                      >
                        Cetak Bukti
                      </a>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredPeminjaman.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {activePeminjaman.length === 0 
              ? 'Tidak ada peminjaman aktif' 
              : 'Tidak ada data yang ditemukan'}
          </div>
        )}


      {showModal && selectedPeminjaman && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Pengembalian Alat</h3>
            <p className="mb-4 text-gray-700">
              Alat: {selectedPeminjaman.alat_nama || selectedPeminjaman.alat_id}
            </p>
            <form onSubmit={handleSubmitReturn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kondisi Alat</label>
                <select
                  value={formData.kondisi}
                  onChange={(e) => setFormData({ ...formData, kondisi: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="baik">Baik</option>
                  <option value="rusak_ringan">Rusak Ringan</option>
                  <option value="rusak_berat">Rusak Berat</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catatan</label>
                <textarea
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                  placeholder="Catatan pengembalian (opsional)"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Kembalikan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedPeminjaman(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}