'use client';

import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Pagination from '@/components/Pagination';
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
  user_id: number;
  user_nama?: string;
  alat_id: number;
  alat_nama?: string;
  jumlah: number;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  tanggal_pengembalian: string;
  status: string;
}

interface Pengembalian {
  id: number;
  peminjaman_id: number;
  tanggal_kembali: string;
  kondisi: string;
  catatan: string;
  denda: number;
}

export default function MonitorReturnPage() {
  const [peminjaman, setPeminjaman] = useState<Peminjaman[]>([]);
  const [pengembalian, setPengembalian] = useState<Pengembalian[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [printItem, setPrintItem] = useState<Peminjaman | null>(null);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState<Peminjaman | null>(null);
  const [formData, setFormData] = useState({
    kondisi: 'baik',
    catatan: '',
    denda: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [peminjamanRes, pengembalianRes] = await Promise.all([
        fetch('/api/petugas/peminjaman'),
        fetch('/api/petugas/pengembalian'),
      ]);

      const peminjamanData = await peminjamanRes.json();
      const pengembalianData = await pengembalianRes.json();

      if (peminjamanRes.ok) {
        setPeminjaman(peminjamanData);
      }
      if (pengembalianRes.ok) {
        setPengembalian(pengembalianData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className="flex justify-center p-8">Loading...</div></Layout>;

  const activeLoans = peminjaman.filter((p) => 
    p.status === 'disetujui' || p.status === 'sedang_dipinjam'
  );

  const filteredActiveLoans = activeLoans.filter((item) =>
    item.user_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.alat_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toString().includes(searchTerm)
  );

  const paginatedActiveLoans = filteredActiveLoans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const filteredPengembalian = pengembalian.filter((item) =>
    item.peminjaman_id.toString().includes(searchTerm) ||
    item.tanggal_kembali.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = (item: Peminjaman) => {
    setPrintItem(item);
    setTimeout(() => {
      window.print();
    }, 100);
  };
  

  const handleReturn = (item: Peminjaman) => {
    setSelectedPeminjaman(item);
    setFormData({ kondisi: 'baik', catatan: '', denda: 0 });
    setShowModal(true);
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeminjaman) return;

    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert('Anda harus login');
        return;
      }

      const user = JSON.parse(userStr);
      const res = await fetch('/api/petugas/pengembalian', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
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
        fetchData();
      } else {
        toast({ title: 'Gagal', description: data.error || 'Gagal mengkonfirmasi pengembalian', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Terjadi kesalahan sistem', variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <Breadcrumb
        title="Pantau Pengembalian"
        description="Pantau status peminjaman aktif dan riwayat pengembalian alat. Pastikan semua alat dikembalikan tepat waktu dan dalam kondisi baik."
        icon={Eye}
        />
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari peminjam, alat, ID, atau tanggal..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border print:hidden border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="print:hidden">
        <div>
          <h3 className="text-xl font-semibold mb-4">Peminjaman Aktif</h3>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Peminjam</TableHead>
                <TableHead>Alat</TableHead>
                <TableHead className="text-center">Jumlah</TableHead>
                <TableHead>Tgl Kembali</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActiveLoans.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold text-primary">#{item.id}</TableCell>
                  <TableCell className="font-medium">{item.user_nama || item.user_id}</TableCell>
                  <TableCell className="text-muted-foreground">{item.alat_nama || item.alat_id}</TableCell>
                  <TableCell className="text-center font-bold">{item.jumlah}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {item.tanggal_kembali
                      ? new Date(item.tanggal_kembali).toLocaleDateString("id-ID")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                        item.status === "disetujui"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : item.status === "sedang_dipinjam"
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {item.status === "disetujui"
                        ? "Disetujui"
                        : item.status === "sedang_dipinjam"
                        ? "Sedang Dipinjam"
                        : item.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleReturn(item)}
                        className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition shadow-sm"
                      >
                        Konfirmasi
                      </button>
                      <button
                        onClick={() => handlePrint(item)}
                        className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition shadow-sm"
                      >
                        Print
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

  {filteredActiveLoans.length === 0 && (
    <div className="text-center py-10 text-gray-500">
      Tidak ada data peminjaman aktif
    </div>
  )}
      </div>
    </div>
        

      {/* Modal Konfirmasi Pengembalian */}
      {showModal && selectedPeminjaman && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Konfirmasi Pengembalian Alat</h3>
            <p className="mb-4 text-gray-700">
              <strong>Peminjam:</strong> {selectedPeminjaman.user_nama || selectedPeminjaman.user_id}
            </p>
            <p className="mb-4 text-gray-700">
              <strong>Alat:</strong> {selectedPeminjaman.alat_nama || selectedPeminjaman.alat_id}
            </p>
            <p className="mb-4 text-gray-700">
              <strong>Jumlah:</strong> {selectedPeminjaman.jumlah} unit
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
              <div>
                <label className="block text-sm font-medium mb-1">Denda (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.denda}
                  onChange={(e) => setFormData({ ...formData, denda: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 font-bold"
                >
                  Konfirmasi Pengembalian
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
      {printItem && (
        <div className="hidden print:block text-black">
  <div className="mx-auto w-[500px]">
    {/* Header */}
    <div className="text-center mb-6">
      <h2 className="text-sm uppercase">
        Aplikasi Peminjaman Alat
      </h2>
      <h1 className="text-2xl font-bold mt-2">
        Bukti Peminjaman Alat
      </h1>
    </div>

    {/* Info Cetak */}
    <div className="gap-4 mb-6 text-sm">
      <div>
        <p><strong>ID Peminjaman:</strong> {printItem.id}</p>
        <p>
          <strong>Status:</strong>{' '}
          {printItem.status === 'disetujui'
            ? 'Disetujui'
            : printItem.status === 'sedang_dipinjam'
            ? 'Sedang Dipinjam'
            : printItem.status}
        </p>
      </div>
      <div className="text-left">
        <p>
          <strong>Tanggal Cetak:</strong>{' '}
          {new Date().toLocaleString('id-ID')}
        </p>
        <p>
          <strong>Dicetak Oleh:</strong>{' '}
          {JSON.parse(localStorage.getItem('user') || '{}')?.nama || '-'}
        </p>
      </div>
    </div>

    {/* Table Detail */}
    <table className="w-full border border-black text-sm">
      <tbody>
        <tr>
          <td className="border p-2 font-semibold w-1/3">Nama Peminjam</td>
          <td className="border p-2">{printItem.user_nama}</td>
        </tr>
        <tr>
          <td className="border p-2 font-semibold">Nama Alat</td>
          <td className="border p-2">{printItem.alat_nama}</td>
        </tr>
        <tr>
          <td className="border p-2 font-semibold">Jumlah</td>
          <td className="border p-2">{printItem.jumlah} unit</td>
        </tr>
        <tr>
          <td className="border p-2 font-semibold">Tanggal Kembali</td>
          <td className="border p-2">
            {new Date(printItem.tanggal_kembali).toLocaleDateString('id-ID')}
          </td>
        </tr>
      </tbody>
    </table>

    {/* Footer TTD */}
    <div className="mt-14 flex justify-end">
      <div className="text-center">
        <p className="mb-16">Petugas</p>
        <p className="font-semibold">
          ({JSON.parse(localStorage.getItem('user') || '{}')?.nama || '....................'})
        </p>
      </div>
    </div>
  </div>
  </div>
)}
    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4 text-center sm:text-left block print:hidden ">
            <span className="text-sm text-muted-foreground">
              Menampilkan {paginatedActiveLoans.length} dari {activeLoans.length} data peminjaman.
            </span>
          
    
          <Pagination
             currentPage={currentPage}
             totalPages={Math.ceil(activeLoans.length / itemsPerPage)}
             onPageChange={setCurrentPage}
          />
          </div>
    </Layout>
  );
}