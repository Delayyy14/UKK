'use client';

import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { useEffect, useState } from 'react';
import { Newspaper, Pencil, Trash, Plus, Search, Tag } from 'lucide-react';
import Link from 'next/link';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface KategoriBerita {
  id: number;
  nama: string;
}

interface Berita {
  id: number;
  judul: string;
  konten: string;
  foto: string;
  penulis: string;
  slug: string;
  kategori_id: number;
  kategori_nama?: string;
  created_at: string;
}

export default function BeritaAdminPage() {
  const [berita, setBerita] = useState<Berita[]>([]);
  const [kategori, setKategori] = useState<KategoriBerita[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingBerita, setEditingBerita] = useState<Berita | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const [formData, setFormData] = useState({
    judul: '',
    konten: '',
    foto: '',
    penulis: '',
    slug: '',
    kategori_id: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBerita();
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
      console.error('Error fetching kategori:', error);
    }
  };

  const fetchBerita = async () => {
    try {
      const res = await fetch('/api/admin/berita');
      const data = await res.json();
      if (res.ok) {
        setBerita(data);
      }
    } catch (error) {
      console.error('Error fetching berita:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let fotoUrl = formData.foto;

      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);

        const uploadRes = await fetch('/api/admin/berita/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          toast({ title: 'Gagal', description: errorData.error || 'Gagal mengupload foto', variant: 'destructive' });
          setUploading(false);
          return;
        }

        const uploadData = await uploadRes.json();
        fotoUrl = uploadData.fileUrl;
      }

      const url = editingBerita ? `/api/admin/berita/${editingBerita.id}` : '/api/admin/berita';
      const method = editingBerita ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        foto: fotoUrl,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowDialog(false);
        setEditingBerita(null);
        setFormData({ judul: '', konten: '', foto: '', penulis: '', slug: '', kategori_id: '' });
        setSelectedFile(null);
        setPreviewImage(null);
        fetchBerita();
        toast({ title: 'Berhasil', description: 'Berita berhasil disimpan', variant: 'success' });
      } else {
        toast({ title: 'Gagal', description: 'Gagal menyimpan berita', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Terjadi kesalahan sistem', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (item: Berita) => {
    setEditingBerita(item);
    setFormData({
      judul: item.judul,
      konten: item.konten,
      foto: item.foto || '',
      penulis: item.penulis || '',
      slug: item.slug || '',
      kategori_id: item.kategori_id?.toString() || '',
    });
    setPreviewImage(item.foto || null);
    setSelectedFile(null);
    setShowDialog(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Apakah anda yakin?',
      text: "Berita yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/admin/berita/${id}`, { method: 'DELETE' });
          if (res.ok) {
            fetchBerita();
            toast({ title: 'Berhasil', description: 'Berita berhasil dihapus', variant: 'success' });
          } else {
            const data = await res.json();
            toast({ title: 'Gagal', description: data.error || 'Gagal menghapus berita', variant: 'destructive' });
          }
        } catch (error) {
          toast({ title: 'Error', description: 'Terjadi kesalahan sistem', variant: 'destructive' });
        }
      }
    });
  };

  if (loading) return <Layout><div className="flex justify-center p-8">Loading...</div></Layout>;

  const filteredBerita = berita.filter((item) =>
    item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.konten.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.penulis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBerita.length / ITEMS_PER_PAGE);
  const paginatedBerita = filteredBerita.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasNoData = berita.length === 0;

  return (
    <Layout>
      <Breadcrumb
        title="Manajemen Berita"
        description="Kelola artikel berita dan artikel informasi terbaru."
        icon={Newspaper}
      />
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Cari berita..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-8"
            />
        </div>

        <div className="flex gap-2">
            <Link href="/admin/berita/kategori">
                <Button variant="outline">
                    <Tag className="mr-2 h-4 w-4" /> Kelola Kategori
                </Button>
            </Link>
            <Button onClick={() => {
                setEditingBerita(null);
                setFormData({ judul: '', konten: '', foto: '', penulis: '', slug: '', kategori_id: '' });
                setSelectedFile(null);
                setPreviewImage(null);
                setShowDialog(true);
            }}>
               <Plus className="mr-2 h-4 w-4" /> Tambah Berita
            </Button>
        </div>
      </div>

      <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Foto</TableHead>
              <TableHead>Judul Berita</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Penulis</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBerita.length > 0 ? (
                paginatedBerita.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                         <div className="w-16 h-10 bg-muted rounded overflow-hidden">
                            {item.foto ? (
                              <img src={item.foto} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Newspaper className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                         </div>
                      </TableCell>
                      <TableCell className="font-medium">
                         <div className="max-w-[300px] truncate">{item.judul}</div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-zinc-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                          {item.kategori_nama || 'Umum'}
                        </span>
                      </TableCell>
                      <TableCell>{item.penulis}</TableCell>
                      <TableCell>{new Date(item.created_at).toLocaleDateString('id-ID')}</TableCell>
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
                    <TableCell colSpan={5} className="h-24 text-center p-0 border-none hover:bg-transparent">
                        <EmptyState type={hasNoData ? "data" : "search"} />
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4 text-center sm:text-left">
            <span className="text-sm text-muted-foreground">
              Menampilkan {paginatedBerita.length} dari {filteredBerita.length} Berita.
            </span>
            
            <Pagination
               currentPage={currentPage}
               totalPages={totalPages}
               onPageChange={setCurrentPage}
            />
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBerita ? 'Edit Berita' : 'Tambah Berita'}</DialogTitle>
            <DialogDescription>
               Tulis dan publikasikan informasi terbaru untuk semua pengguna.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                  <Label htmlFor="judul">Judul Berita</Label>
                  <Input
                      id="judul"
                      value={formData.judul}
                      onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                      placeholder="Contoh: Peresmian Gedung Baru"
                      required
                  />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="penulis">Penulis</Label>
                  <Input
                      id="penulis"
                      value={formData.penulis}
                      onChange={(e) => setFormData({ ...formData, penulis: e.target.value })}
                      placeholder="Contoh: Admin"
                  />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="slug">Slug URL (Opsional)</Label>
                  <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="Contoh: peresmian-gedung-baru"
                  />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="kategori">Kategori</Label>
                  <Select 
                      value={formData.kategori_id} 
                      onValueChange={(val) => setFormData({ ...formData, kategori_id: val })}
                  >
                      <SelectTrigger>
                          <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                          {kategori.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                  {cat.nama}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2 col-span-2">
                  <Label htmlFor="foto">Foto Banner</Label>
                  <Input
                      id="foto"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                  />
                  {(previewImage || formData.foto) && (
                      <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-xl border-2 border-zinc-100 shadow-sm">
                          <img
                              src={previewImage || formData.foto}
                              alt="Preview"
                              className="object-cover w-full h-full"
                          />
                      </div>
                  )}
              </div>
              <div className="space-y-2 col-span-2">
                  <Label htmlFor="konten">Konten Berita</Label>
                  <Textarea
                      id="konten"
                      value={formData.konten}
                      onChange={(e) => setFormData({ ...formData, konten: e.target.value })}
                      placeholder="Tulis artikel lengkap di sini..."
                      rows={10}
                      required
                  />
              </div>
            </div>
            
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Batal
                </Button>
                <Button type="submit" disabled={uploading}>
                    {uploading ? 'Menyimpan...' : 'Simpan Berita'}
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
