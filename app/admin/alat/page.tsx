'use client';

import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { useEffect, useState } from 'react';
import { Wrench, Plus, Search, Edit, Trash2 } from 'lucide-react';
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
import { Badge } from "@/components/ui/badge"
import Pagination from '@/components/Pagination';

interface Kategori {
  id: number;
  nama: string;
}

interface Alat {
  id: number;
  nama: string;
  deskripsi: string;
  kategori_id: number;
  kategori_nama?: string;
  jumlah: number;
  jumlah_tersedia: number;
  status: string;
  harga_per_hari: number;
  foto?: string;
}

export default function AlatPage() {
  const [alat, setAlat] = useState<Alat[]>([]);
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAlat, setEditingAlat] = useState<Alat | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    kategori_id: '',
    jumlah: 0,
    status: 'tersedia',
    harga_per_hari: 0,
    foto: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAlat();
    fetchKategori();
  }, []);

  const fetchAlat = async () => {
    try {
      const res = await fetch('/api/admin/alat');
      const data = await res.json();
      if (res.ok) {
        setAlat(data);
      }
    } catch (error) {
      console.error('Error fetching alat:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKategori = async () => {
    try {
      const res = await fetch('/api/admin/kategori');
      const data = await res.json();
      if (res.ok) {
        setKategori(data);
      }
    } catch (error) {
      console.error('Error fetching kategori:', error);
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

        const uploadRes = await fetch('/api/admin/alat/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          alert(errorData.error || 'Gagal mengupload foto');
          setUploading(false);
          return;
        }

        const uploadData = await uploadRes.json();
        fotoUrl = uploadData.fileUrl;
      }

      const url = editingAlat ? `/api/admin/alat/${editingAlat.id}` : '/api/admin/alat';
      const method = editingAlat ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        foto: fotoUrl,
        kategori_id: formData.kategori_id ? parseInt(formData.kategori_id) : null,
        jumlah: parseInt(formData.jumlah.toString()),
        harga_per_hari: parseFloat(formData.harga_per_hari.toString()) || 0,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowDialog(false);
        setEditingAlat(null);
        setFormData({ nama: '', deskripsi: '', kategori_id: '', jumlah: 0, status: 'tersedia', harga_per_hari: 0, foto: '' });
        setSelectedFile(null);
        setPreviewImage(null);
        fetchAlat();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Gagal menyimpan alat');
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (item: Alat) => {
    setEditingAlat(item);
    setFormData({
      nama: item.nama,
      deskripsi: item.deskripsi || '',
      kategori_id: item.kategori_id?.toString() || '',
      jumlah: item.jumlah,
      status: item.status,
      harga_per_hari: item.harga_per_hari || 0,
      foto: item.foto || '',
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
    if (!confirm('Yakin ingin menghapus alat ini?')) return;

    try {
      const res = await fetch(`/api/admin/alat/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAlat();
      } else {
        alert('Gagal menghapus alat');
      }
    } catch (error) {
      alert('Terjadi kesalahan');
    }
  };

  if (loading) return <Layout><div className="flex justify-center p-8">Loading...</div></Layout>;

  const filteredAlat = alat.filter((item) => {
    const matchesSearch = 
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kategori_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toString().includes(searchTerm);
    
    const matchesFilter = filterStatus === 'semua' || item.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredAlat.length / ITEMS_PER_PAGE);
  const paginatedAlat = filteredAlat.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Layout>
      <Breadcrumb
        title="Alat"
        description="Kelola data alat/peralatan yang tersedia untuk dipinjam."
        icon={Wrench}
      />
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full sm:w-auto">
          <div className="relative flex-1">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
                type="search"
                placeholder="Cari alat..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-8"
             />
          </div>
          <div className="w-full sm:w-[180px]">
            <Select value={filterStatus} onValueChange={(val) => { setFilterStatus(val); setCurrentPage(1); }}>
                <SelectTrigger>
                    <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="semua">Semua Status</SelectItem>
                    <SelectItem value="tersedia">Tersedia</SelectItem>
                    <SelectItem value="tidak_tersedia">Tidak Tersedia</SelectItem>
                    <SelectItem value="rusak">Rusak</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={() => {
            setEditingAlat(null);
            setFormData({ nama: '', deskripsi: '', kategori_id: '', jumlah: 0, status: 'tersedia', harga_per_hari: 0, foto: '' });
            setSelectedFile(null);
            setPreviewImage(null);
            setShowDialog(true);
        }}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Alat
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead className="w-[80px]">Foto</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Tersedia</TableHead>
              <TableHead>Harga/Hari</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAlat.length > 0 ? (
                paginatedAlat.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>
                        {item.foto ? (
                          <img
                            src={item.foto}
                            alt={item.nama}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                            -
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell>{item.kategori_nama || '-'}</TableCell>
                      <TableCell>{item.jumlah}</TableCell>
                      <TableCell>{item.jumlah_tersedia}</TableCell>
                      <TableCell>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.harga_per_hari || 0)}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'tersedia' ? 'default' : item.status === 'rusak' ? 'destructive' : 'secondary'}>
                            {item.status === 'tersedia' ? 'Tersedia' : item.status === 'rusak' ? 'Rusak' : 'Tidak Tersedia'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                           <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                <Edit className="h-4 w-4" />
                           </Button>
                           <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
            ) : (
                <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                        Tidak ada data.
                    </TableCell>
                </TableRow>
            )}
            
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between mt-4">
              Menampilkan {paginatedAlat.length} dari {alat.length} data alat.
            
      
            <Pagination
               currentPage={currentPage}
               totalPages={totalPages}
               onPageChange={setCurrentPage}
            />
            </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAlat ? 'Edit Alat' : 'Tambah Alat Baru'}</DialogTitle>
            <DialogDescription>
              Isi formulir di bawah ini untuk {editingAlat ? 'memperbarui' : 'menambahkan'} data alat.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="nama">Nama Alat</Label>
                <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                    placeholder="Contoh: Laptop Asus ROG"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Textarea
                    id="deskripsi"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    placeholder="Deskripsi singkat alat..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                            {kategori.map((kat) => (
                                <SelectItem key={kat.id} value={kat.id.toString()}>
                                    {kat.nama}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="jumlah">Jumlah Total</Label>
                    <Input
                        id="jumlah"
                        type="text"
                        value={formData.jumlah === 0 ? '' : formData.jumlah.toString()}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setFormData({ ...formData, jumlah: parseInt(val) || 0 });
                        }}
                        required
                        placeholder="0"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                    value={formData.status} 
                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="tersedia">Tersedia</SelectItem>
                        <SelectItem value="tidak_tersedia">Tidak Tersedia</SelectItem>
                        <SelectItem value="rusak">Rusak</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="harga_per_hari">Harga Sewa per Hari (Rp)</Label>
                <Input
                    id="harga_per_hari"
                    type="text"
                    value={formData.harga_per_hari === 0 ? '' : formData.harga_per_hari.toString()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, harga_per_hari: parseInt(val) || 0 });
                    }}
                    required
                    placeholder="Contoh: 50000"
                    className="font-medium"
                />
                <p className="text-[10px] text-muted-foreground italic">Input angka saja tanpa titik/koma (Contoh: 50000)</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="foto">Foto Alat</Label>
                <Input
                    id="foto"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                />
                {(previewImage || formData.foto) && (
                    <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-md border">
                        <img
                            src={previewImage || formData.foto}
                            alt="Preview"
                            className="object-cover w-full h-full"
                        />
                    </div>
                )}
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Batal
                </Button>
                <Button type="submit" disabled={uploading}>
                    {uploading ? 'Menyimpan...' : 'Simpan'}
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}