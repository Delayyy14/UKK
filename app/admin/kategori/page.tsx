'use client';

import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { useEffect, useState } from 'react';
import { FolderOpen, Pencil, Trash, Plus, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ImportExcel from '@/components/ImportExcel';
import Pagination from '@/components/Pagination';
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

interface Kategori {
  id: number;
  nama: string;
  deskripsi: string;
}

export default function KategoriPage() {
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingKategori, setEditingKategori] = useState<Kategori | null>(null);
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
      const res = await fetch('/api/admin/kategori');
      const data = await res.json();
      if (res.ok) {
        setKategori(data);
      }
    } catch (error) {
      console.error('Error fetching kategori:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingKategori ? `/api/admin/kategori/${editingKategori.id}` : '/api/admin/kategori';
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
        toast({ title: 'Berhasil', description: 'Data berhasil di simpan', variant: 'success' });
      } else {
        toast({ title: 'Gagal', description: 'Gagal menyimpan kategori', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Terjadi kesalahan sistem', variant: 'destructive' });
    }
  };

  const handleEdit = (item: Kategori) => {
    setEditingKategori(item);
    setFormData({
      nama: item.nama,
      deskripsi: item.deskripsi || '',
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return;

    try {
      const res = await fetch(`/api/admin/kategori/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchKategori();
        toast({ title: 'Berhasil', description: 'Data berhasil di hapus', variant: 'success' });
      } else {
        toast({ title: 'Gagal', description: 'Gagal menghapus kategori', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Terjadi kesalahan sistem', variant: 'destructive' });
    }
  };

  if (loading) return <Layout><div className="flex justify-center p-8">Loading...</div></Layout>;

  const filteredKategori = kategori.filter((item) =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredKategori.length / ITEMS_PER_PAGE);
  const paginatedKategori = filteredKategori.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Layout>
      <Breadcrumb
        title="Kategori"
        description="Kelola kategori alat."
        icon={FolderOpen}
      />
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Search */}
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

        {/* Buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
            <ImportExcel 
                title="Kategori"
                apiUrl="/api/admin/kategori/bulk"
                onSuccess={fetchKategori}
                fileName="kategori"
                templateData={[
                    { nama: 'Elektronik', deskripsi: 'Alat-alat elektronik dan gadget' },
                    { nama: 'Pertukangan', deskripsi: 'Alat-alat pertukangan dan bengkel' }
                ]}
            />
            <Button onClick={() => {
                setEditingKategori(null);
                setFormData({ nama: '', deskripsi: '' });
                setShowDialog(true);
            }}>
               <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
            </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedKategori.length > 0 ? (
                paginatedKategori.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
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
                    <TableCell colSpan={4} className="h-24 text-center">
                        Tidak ada kategori.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between mt-4">
              Menampilkan {paginatedKategori.length} dari {kategori.length} data kategori.
            
      
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
              Isi formulir di bawah ini untuk {editingKategori ? 'memperbarui' : 'menambahkan'} kategori.
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
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Textarea
                    id="deskripsi"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    rows={3}
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