'use client';

import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { useEffect, useState } from 'react';
import { Tag, Pencil, Trash, Plus, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Swal from 'sweetalert2';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface KategoriBerita {
  id: number;
  nama: string;
  deskripsi: string;
}

export default function KategoriBeritaPage() {
  const [kategori, setKategori] = useState<KategoriBerita[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingKategori, setEditingKategori] = useState<KategoriBerita | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
  });

  useEffect(() => {
    fetchKategori();
  }, []);

  const fetchKategori = async () => {
    try {
      const res = await fetch('/api/admin/berita/kategori');
      const data = await res.json();
      if (res.ok) {
        setKategori(data);
      }
    } catch (error) {
      console.error('Error fetching kategori berita:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingKategori ? `/api/admin/berita/kategori/${editingKategori.id}` : '/api/admin/berita/kategori';
      const method = editingKategori ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowDialog(false);
        setEditingKategori(null);
        setFormData({ nama: '', deskripsi: '' });
        fetchKategori();
        toast({ title: 'Berhasil', description: 'Kategori berhasil disimpan', variant: 'success' });
      } else {
        const errorData = await res.json();
        toast({ title: 'Gagal', description: errorData.error || 'Gagal menyimpan kategori', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Terjadi kesalahan sistem', variant: 'destructive' });
    }
  };

  const handleEdit = (item: KategoriBerita) => {
    setEditingKategori(item);
    setFormData({
      nama: item.nama,
      deskripsi: item.deskripsi || '',
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Apakah anda yakin?',
      text: "Pastikan tidak ada berita yang menggunakan kategori ini!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/admin/berita/kategori/${id}`, { method: 'DELETE' });
          if (res.ok) {
            fetchKategori();
            toast({ title: 'Berhasil', description: 'Kategori berhasil dihapus', variant: 'success' });
          } else {
            const data = await res.json();
            toast({ title: 'Gagal', description: data.error || 'Gagal menghapus kategori', variant: 'destructive' });
          }
        } catch (error) {
          toast({ title: 'Error', description: 'Terjadi kesalahan sistem', variant: 'destructive' });
        }
      }
    });
  };

  if (loading) return <Layout><div className="flex justify-center p-8">Loading...</div></Layout>;

  const filteredKategori = kategori.filter((item) =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredKategori.length / ITEMS_PER_PAGE);
  const paginatedKategori = filteredKategori.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasNoData = kategori.length === 0;

  return (
    <Layout>
      <Breadcrumb
        title="Kategori Berita"
        description="Kelola kategori untuk artikel berita."
        icon={Tag}
      />
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Cari kategori..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-8"
            />
        </div>

        <Button onClick={() => {
            setEditingKategori(null);
            setFormData({ nama: '', deskripsi: '' });
            setShowDialog(true);
        }}>
           <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
        </Button>
      </div>

      <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Nama Kategori</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedKategori.length > 0 ? (
                paginatedKategori.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">#{item.id}</TableCell>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell>{item.deskripsi || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                           <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                <Pencil className="h-4 w-4" />
                           </Button>
                           <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                                <Trash className="h-4 w-4" />
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center p-0 border-none hover:bg-transparent">
                        <EmptyState type={hasNoData ? "data" : "search"} />
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4 text-center sm:text-left">
            <span className="text-sm text-muted-foreground">
              Menampilkan {paginatedKategori.length} dari {filteredKategori.length} Kategori.
            </span>
            
            <Pagination
               currentPage={currentPage}
               totalPages={totalPages}
               onPageChange={setCurrentPage}
            />
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingKategori ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
            <DialogDescription>
               Gunakan kategori untuk mengelompokkan artikel berita Anda.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="nama">Nama Kategori</Label>
                <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                    placeholder="Contoh: Tips Mendaki"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Textarea
                    id="deskripsi"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    rows={3}
                    placeholder="Penjelasan singkat tentang kategori ini..."
                />
            </div>
            
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Batal
                </Button>
                <Button type="submit">
                    Simpan Kategori
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
