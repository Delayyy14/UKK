'use client';

import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { useEffect, useState } from 'react';
import { RotateCcw, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Pagination from '@/components/Pagination';
import Swal from 'sweetalert2';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Pengembalian {
  id: number;
  peminjaman_id: number;
  peminjaman_info?: string;
  tanggal_kembali: string;
  kondisi: string;
  catatan: string;
  denda: number;
}

export default function PengembalianPage() {
  const [pengembalian, setPengembalian] = useState<Pengembalian[]>([]);
  const [peminjaman, setPeminjaman] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPengembalian, setEditingPengembalian] = useState<Pengembalian | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKondisi, setFilterKondisi] = useState('semua');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [formData, setFormData] = useState({
    peminjaman_id: '',
    tanggal_kembali: '',
    kondisi: 'baik',
    catatan: '',
    denda: 0,
  });

  useEffect(() => {
    fetchPengembalian();
    fetchPeminjaman();
  }, []);

  const fetchPengembalian = async () => {
    try {
      const res = await fetch('/api/admin/pengembalian');
      const data = await res.json();
      if (res.ok) {
        setPengembalian(data);
      }
    } catch (error) {
      console.error('Error fetching pengembalian:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPeminjaman = async () => {
    try {
      const res = await fetch('/api/admin/peminjaman');
      const data = await res.json();
      if (res.ok) {
        setPeminjaman(data);
      }
    } catch (error) {
      console.error('Error fetching peminjaman:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPengembalian ? `/api/admin/pengembalian/${editingPengembalian.id}` : '/api/admin/pengembalian';
      const method = editingPengembalian ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          peminjaman_id: parseInt(formData.peminjaman_id),
          denda: parseFloat(formData.denda.toString()),
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingPengembalian(null);
        setFormData({
          peminjaman_id: '',
          tanggal_kembali: '',
          kondisi: 'baik',
          catatan: '',
          denda: 0,
        });
        fetchPengembalian();
        toast({ title: 'Berhasil', description: 'Data berhasil di simpan', variant: 'success' });
      } else {
        toast({ title: 'Gagal', description: 'Gagal menyimpan pengembalian', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Terjadi kesalahan sistem', variant: 'destructive' });
    }
  };

  const handleEdit = (item: Pengembalian) => {
    setEditingPengembalian(item);
    setFormData({
      peminjaman_id: item.peminjaman_id.toString(),
      tanggal_kembali: item.tanggal_kembali.split('T')[0],
      kondisi: item.kondisi,
      catatan: item.catatan || '',
      denda: item.denda,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Apakah anda yakin?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/admin/pengembalian/${id}`, { method: 'DELETE' });
          if (res.ok) {
            fetchPengembalian();
            toast({ title: 'Berhasil', description: 'Data berhasil di hapus', variant: 'success' });
          } else {
            toast({ title: 'Gagal', description: 'Gagal menghapus pengembalian', variant: 'destructive' });
          }
        } catch (error) {
          toast({ title: 'Error', description: 'Terjadi kesalahan sistem', variant: 'destructive' });
        }
      }
    });
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  // Filter data
  const filteredPengembalian = pengembalian.filter((item) => {
    const matchesSearch = 
      item.peminjaman_info?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.peminjaman_id.toString().includes(searchTerm) ||
      item.tanggal_kembali.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterKondisi === 'semua' || item.kondisi === filterKondisi;
    
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredPengembalian.length / ITEMS_PER_PAGE);
  const paginatedPengembalian = filteredPengembalian.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Layout>
      <Breadcrumb
        title="Pengembalian Barang"
        description="Kelola data pengembalian alat. Catat kondisi alat saat dikembalikan, tentukan denda jika ada, dan kelola status pengembalian."
        icon={RotateCcw}
      />
      <div className="mb-4 flex justify-between items-center gap-4">

  {/* Search + Filter */}
  <div className="flex gap-4 flex-1">
    <input
      type="text"
      placeholder="Cari peminjaman, ID, atau tanggal..."
      value={searchTerm}
      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />

    <select
      value={filterKondisi}
      onChange={(e) => { setFilterKondisi(e.target.value); setCurrentPage(1); }}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="semua">Semua Kondisi</option>
      <option value="baik">Baik</option>
      <option value="rusak_ringan">Rusak Ringan</option>
      <option value="rusak_berat">Rusak Berat</option>
    </select>
  </div>

  {/* Button */}
  <button
    onClick={() => {
      setEditingPengembalian(null);
      setFormData({
        peminjaman_id: '',
        tanggal_kembali: '',
        kondisi: 'baik',
        catatan: '',
        denda: 0,
      });
      setShowModal(true);
    }}
    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
  >
    Tambah Pengembalian
  </button>

</div>


      <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Peminjaman</TableHead>
              <TableHead>Tanggal Kembali</TableHead>
              <TableHead>Kondisi</TableHead>
              <TableHead>Denda</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPengembalian.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">#{item.id}</TableCell>
                <TableCell>{item.peminjaman_info || item.peminjaman_id}</TableCell>
                <TableCell>{new Date(item.tanggal_kembali).toLocaleDateString('id-ID')}</TableCell>
                <TableCell className="capitalize">{item.kondisi}</TableCell>
                <TableCell>Rp {item.denda.toLocaleString('id-ID')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredPengembalian.length === 0 && (
          <div className="text-center py-8 text-gray-500 font-medium">
            Tidak ada data pengembalian yang ditemukan
          </div>
        )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4 text-center sm:text-left">
          <p className="text-sm text-muted-foreground">
            Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredPengembalian.length)} dari {filteredPengembalian.length} data
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingPengembalian ? 'Edit Pengembalian' : 'Tambah Pengembalian'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Peminjaman</label>
                <select
                  required
                  value={formData.peminjaman_id}
                  onChange={(e) => setFormData({ ...formData, peminjaman_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Pilih Peminjaman</option>
                  {peminjaman.map((item) => (
                    <option key={item.id} value={item.id}>
                      ID {item.id} - {item.user_nama} - {item.alat_nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Kembali</label>
                <input
                  type="date"
                  required
                  value={formData.tanggal_kembali}
                  onChange={(e) => setFormData({ ...formData, tanggal_kembali: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kondisi</label>
                <select
                  value={formData.kondisi}
                  onChange={(e) => setFormData({ ...formData, kondisi: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="baik">Baik</option>
                  <option value="rusak_ringan">Rusak Ringan</option>
                  <option value="rusak_berat">Rusak Berat</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Denda</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.denda}
                  onChange={(e) => setFormData({ ...formData, denda: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catatan</label>
                <textarea
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPengembalian(null);
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