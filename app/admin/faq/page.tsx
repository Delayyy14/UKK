'use client';

import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { useEffect, useState } from 'react';
import { HelpCircle, Pencil, Trash, Plus, Search } from 'lucide-react';
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

interface FAQ {
  id: number;
  pertanyaan: string;
  jawaban: string;
  urutan: number;
}

export default function FAQAdminPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [formData, setFormData] = useState({
    pertanyaan: '',
    jawaban: '',
    urutan: 0,
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/admin/faq');
      const data = await res.json();
      if (res.ok) {
        setFaqs(data);
      }
    } catch (error) {
      console.error('Error fetching FAQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingFaq ? `/api/admin/faq/${editingFaq.id}` : '/api/admin/faq';
      const method = editingFaq ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowDialog(false);
        setEditingFaq(null);
        setFormData({ pertanyaan: '', jawaban: '', urutan: 0 });
        fetchFaqs();
        toast({ title: 'Berhasil', description: 'FAQ berhasil disimpan', variant: 'success' });
      } else {
        toast({ title: 'Gagal', description: 'Gagal menyimpan FAQ', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Terjadi kesalahan sistem', variant: 'destructive' });
    }
  };

  const handleEdit = (item: FAQ) => {
    setEditingFaq(item);
    setFormData({
      pertanyaan: item.pertanyaan,
      jawaban: item.jawaban,
      urutan: item.urutan,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Apakah anda yakin?',
      text: "FAQ yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/admin/faq/${id}`, { method: 'DELETE' });
          if (res.ok) {
            fetchFaqs();
            toast({ title: 'Berhasil', description: 'FAQ berhasil dihapus', variant: 'success' });
          } else {
            toast({ title: 'Gagal', description: 'Gagal menghapus FAQ', variant: 'destructive' });
          }
        } catch (error) {
          toast({ title: 'Error', description: 'Terjadi kesalahan sistem', variant: 'destructive' });
        }
      }
    });
  };

  if (loading) return <Layout><div className="flex justify-center p-8">Loading...</div></Layout>;

  const filteredFaqs = faqs.filter((item) =>
    item.pertanyaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.jawaban.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFaqs.length / ITEMS_PER_PAGE);
  const paginatedFaqs = filteredFaqs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasNoData = faqs.length === 0;

  return (
    <Layout>
      <Breadcrumb
        title="Manajemen FAQ"
        description="Kelola pertanyaan yang sering diajukan untuk pengguna."
        icon={HelpCircle}
      />
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Cari FAQ..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-8"
            />
        </div>

        <Button onClick={() => {
            setEditingFaq(null);
            setFormData({ pertanyaan: '', jawaban: '', urutan: faqs.length });
            setShowDialog(true);
        }}>
           <Plus className="mr-2 h-4 w-4" /> Tambah FAQ
        </Button>
      </div>

      <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Order</TableHead>
              <TableHead>Pertanyaan</TableHead>
              <TableHead className="hidden md:table-cell">Jawaban</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedFaqs.length > 0 ? (
                paginatedFaqs.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-center">{item.urutan}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate md:max-w-none">{item.pertanyaan}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-[300px] truncate text-muted-foreground">{item.jawaban}</TableCell>
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
              Menampilkan {paginatedFaqs.length} dari {filteredFaqs.length} FAQ.
            </span>
            
            <Pagination
               currentPage={currentPage}
               totalPages={totalPages}
               onPageChange={setCurrentPage}
            />
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Tambah FAQ'}</DialogTitle>
            <DialogDescription>
              Isi formulir di bawah ini untuk {editingFaq ? 'memperbarui' : 'menambahkan'} FAQ.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="pertanyaan">Pertanyaan</Label>
                <Input
                    id="pertanyaan"
                    value={formData.pertanyaan}
                    onChange={(e) => setFormData({ ...formData, pertanyaan: e.target.value })}
                    placeholder="Contoh: Bagaimana cara meminjam alat?"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="jawaban">Jawaban</Label>
                <Textarea
                    id="jawaban"
                    value={formData.jawaban}
                    onChange={(e) => setFormData({ ...formData, jawaban: e.target.value })}
                    placeholder="Tulis jawaban lengkap di sini..."
                    rows={5}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="urutan">Urutan Tampil (Opsional)</Label>
                <Input
                    id="urutan"
                    type="number"
                    value={formData.urutan}
                    onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) })}
                />
            </div>
            
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Batal
                </Button>
                <Button type="submit">
                    Simpan FAQ
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
