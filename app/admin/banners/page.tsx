'use client';

import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { useEffect, useState } from 'react';
import { ImageIcon, Trash2, Plus, Search, Edit, X, Upload, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Swal from 'sweetalert2';
import EmptyState from '@/components/EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Pagination from '@/components/Pagination';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface Banner {
  id: string;
  title: string;
  paragraph: string;
  background_url: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

interface BannerFormRow {
  title: string;
  paragraph: string;
  background_url: string;
  order_index: number;
  is_active: boolean;
  uploading: boolean;
  preview: string;
}

const EMPTY_ROW = (): BannerFormRow => ({
  title: '',
  paragraph: '',
  background_url: '',
  order_index: 0,
  is_active: true,
  uploading: false,
  preview: '',
});

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const ITEMS_PER_PAGE = 8;

  // Multi-row state (tambah banyak sekaligus)
  const [rows, setRows] = useState<BannerFormRow[]>([EMPTY_ROW()]);

  // Single state (edit)
  const [editForm, setEditForm] = useState<BannerFormRow>(EMPTY_ROW());

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/banners');
      if (!res.ok) throw new Error('Gagal mengambil data');
      const data = await res.json();
      setBanners(data || []);
    } catch (error: any) {
      toast({ title: 'Gagal', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // ─── Upload helper ────────────────────────────────────────
  const handleUpload = async (file: File, isEdit: boolean, rowIndex?: number) => {
    const ext = file.name.split('.').pop();
    const fileName = `banner-${Date.now()}.${ext}`;

    if (isEdit) {
      setEditForm((f) => ({ ...f, uploading: true }));
    } else {
      setRows((prev) =>
        prev.map((r, i) => (i === rowIndex ? { ...r, uploading: true } : r))
      );
    }

    const { error } = await supabase.storage
      .from('banners')
      .upload(fileName, file, { upsert: true });

    if (error) {
      toast({ title: 'Gagal upload', description: error.message, variant: 'destructive' });
      if (isEdit) setEditForm((f) => ({ ...f, uploading: false }));
      else setRows((prev) => prev.map((r, i) => (i === rowIndex ? { ...r, uploading: false } : r)));
      return;
    }

    const { data: urlData } = supabase.storage.from('banners').getPublicUrl(fileName);
    const url = urlData.publicUrl;
    const preview = URL.createObjectURL(file);

    if (isEdit) {
      setEditForm((f) => ({ ...f, background_url: url, preview, uploading: false }));
    } else {
      setRows((prev) =>
        prev.map((r, i) =>
          i === rowIndex ? { ...r, background_url: url, preview, uploading: false } : r
        )
      );
    }
  };

  // ─── Multi-row helpers ────────────────────────────────────
  const addRow = () => setRows((prev) => [...prev, EMPTY_ROW()]);
  const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));

  // ─── Submit Tambah ────────────────────────────────────────
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = rows.some((r) => !r.title.trim() || !r.background_url.trim());
    if (invalid) {
      toast({ title: 'Validasi gagal', description: 'Judul dan gambar wajib diisi untuk setiap banner.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload = rows.map((r) => ({
        title: r.title,
        paragraph: r.paragraph,
        background_url: r.background_url,
        order_index: r.order_index,
        is_active: r.is_active,
      }));

      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Terjadi kesalahan saat menyimpan');
      }

      toast({ title: 'Berhasil', description: `${rows.length} banner berhasil ditambahkan.`, variant: 'success' });
      setShowDialog(false);
      setRows([EMPTY_ROW()]);
      fetchBanners();
    } catch (error: any) {
      toast({ title: 'Gagal', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ─── Submit Edit ──────────────────────────────────────────
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    if (!editForm.title.trim() || !editForm.background_url.trim()) {
      toast({ title: 'Validasi gagal', description: 'Judul dan gambar wajib diisi.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/banners/${editingBanner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          paragraph: editForm.paragraph,
          background_url: editForm.background_url,
          order_index: editForm.order_index,
          is_active: editForm.is_active,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal memperbarui banner');
      }

      toast({ title: 'Berhasil', description: 'Banner berhasil diperbarui.', variant: 'success' });
      setShowDialog(false);
      setEditingBanner(null);
      fetchBanners();
    } catch (error: any) {
      toast({ title: 'Gagal', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ─── Edit handler ─────────────────────────────────────────
  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setEditForm({
      title: banner.title,
      paragraph: banner.paragraph,
      background_url: banner.background_url,
      order_index: banner.order_index,
      is_active: banner.is_active,
      uploading: false,
      preview: banner.background_url,
    });
    setShowDialog(true);
  };

  // ─── Delete handler ───────────────────────────────────────
  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Apakah anda yakin?',
      text: 'Data yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/admin/banners/${id}`, {
            method: 'DELETE',
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Gagal menghapus banner');
          }

          fetchBanners();
          toast({ title: 'Berhasil', description: 'Banner berhasil dihapus.', variant: 'success' });
        } catch (error: any) {
          toast({ title: 'Gagal', description: error.message, variant: 'destructive' });
        }
      }
    });
  };

  if (loading) return <Layout><div className="flex justify-center p-8">Loading...</div></Layout>;

  const filteredBanners = banners.filter((b) =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.paragraph?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBanners.length / ITEMS_PER_PAGE);
  const paginatedBanners = filteredBanners.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasNoData = banners.length === 0;

  return (
    <Layout>
      <Breadcrumb
        title="Banner"
        description="Kelola banner hero section website."
        icon={ImageIcon}
      />

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari judul atau paragraf..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-8"
          />
        </div>
        <Button onClick={() => {
          setEditingBanner(null);
          setRows([EMPTY_ROW()]);
          setShowDialog(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Banner
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">No</TableHead>
            <TableHead className="w-[80px]">Gambar</TableHead>
            <TableHead>Judul</TableHead>
            <TableHead>Paragraf</TableHead>
            <TableHead>Urutan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedBanners.length > 0 ? (
            paginatedBanners.map((banner, idx) => (
              <TableRow key={banner.id}>
                <TableCell className="font-medium">
                  {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                </TableCell>
                <TableCell>
                  <div className="relative w-14 h-10 rounded-md overflow-hidden bg-muted">
                    {banner.background_url && (
                      <Image
                        src={banner.background_url}
                        alt={banner.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium max-w-[180px] truncate">{banner.title}</TableCell>
                <TableCell className="max-w-[220px] truncate text-muted-foreground text-sm">
                  {banner.paragraph || '-'}
                </TableCell>
                <TableCell>{banner.order_index}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {banner.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(banner.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center p-0 border-none hover:bg-transparent">
                <EmptyState type={hasNoData ? 'data' : 'search'} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4 text-center sm:text-left">
        <p className="text-sm text-muted-foreground">
          Menampilkan {paginatedBanners.length} dari {filteredBanners.length} data banner.
        </p>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ─── Dialog Tambah / Edit ─── */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        if (!open) { setShowDialog(false); setEditingBanner(null); }
      }}>
        <DialogContent className={editingBanner ? 'sm:max-w-[480px]' : 'sm:max-w-[600px]'}>
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Edit Banner' : 'Tambah Banner'}</DialogTitle>
            <DialogDescription>
              {editingBanner
                ? 'Perbarui data banner yang dipilih.'
                : 'Isi data banner. Klik "+ Tambah Baris" untuk menambah beberapa banner sekaligus.'}
            </DialogDescription>
          </DialogHeader>

          {/* ── EDIT ── */}
          {editingBanner ? (
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <BannerFields
                form={editForm}
                onChange={setEditForm}
                onUpload={(file) => handleUpload(file, true)}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setShowDialog(false); setEditingBanner(null); }}>
                  Batal
                </Button>
                <Button type="submit" disabled={saving || editForm.uploading}>
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : 'Simpan'}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            /* ── TAMBAH MULTI-ROW ── */
            <form onSubmit={handleSubmitAdd}>
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1 pb-1">
                {rows.map((row, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Banner #{index + 1}
                      </span>
                      {rows.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => removeRow(index)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <BannerFields
                      form={row}
                      onChange={(updated) =>
                        setRows((prev) => prev.map((r, i) => (i === index ? updated : r)))
                      }
                      onUpload={(file) => handleUpload(file, false, index)}
                    />
                  </div>
                ))}
              </div>

              {/* Tambah baris */}
              <Button
                type="button"
                variant="outline"
                className="w-full mt-3 border-dashed"
                onClick={addRow}
              >
                <Plus className="mr-2 h-4 w-4" /> Tambah Baris Banner
              </Button>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => { setShowDialog(false); setRows([EMPTY_ROW()]); }}>
                  Batal
                </Button>
                <Button type="submit" disabled={saving || rows.some((r) => r.uploading)}>
                  {saving
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>
                    : `Simpan ${rows.length > 1 ? `${rows.length} Banner` : 'Banner'}`}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

// ─── Reusable field group ─────────────────────────────────
interface BannerFieldsProps {
  form: BannerFormRow;
  onChange: (updated: BannerFormRow) => void;
  onUpload: (file: File) => void;
}

function BannerFields({ form, onChange, onUpload }: BannerFieldsProps) {
  return (
    <div className="space-y-3">
      {/* Title */}
      <div className="space-y-1.5">
        <Label>Judul <span className="text-destructive">*</span></Label>
        <Input
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
          placeholder="Contoh: Eksplorasi Alam Tanpa Batas"
          required
        />
      </div>

      {/* Paragraph */}
      <div className="space-y-1.5">
        <Label>Paragraf</Label>
        <Input
          value={form.paragraph}
          onChange={(e) => onChange({ ...form, paragraph: e.target.value })}
          placeholder="Deskripsi singkat untuk banner ini..."
        />
      </div>

      {/* Background Image */}
      <div className="space-y-1.5">
        <Label>Gambar Background <span className="text-destructive">*</span></Label>

        {/* Preview */}
        {(form.preview || form.background_url) && (
          <div className="relative w-full h-24 rounded-md overflow-hidden bg-muted">
            <Image
              src={form.preview || form.background_url}
              alt="preview"
              fill
              className="object-cover"
              sizes="500px"
            />
          </div>
        )}

        {/* Upload */}
        <label className="block">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }}
          />
          <div className="flex items-center justify-center gap-2 border border-dashed border-input rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent cursor-pointer transition-colors">
            {form.uploading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Mengupload...</>
              : <><Upload className="h-4 w-4" /> {form.background_url ? 'Ganti Gambar' : 'Upload Gambar'}</>
            }
          </div>
        </label>

        {/* Manual URL */}
        <Input
          value={form.background_url}
          onChange={(e) => onChange({ ...form, background_url: e.target.value, preview: e.target.value })}
          placeholder="Atau masukkan URL gambar langsung..."
          className="text-xs"
        />
      </div>

      {/* Urutan + Status */}
      <div className="flex gap-3">
        <div className="space-y-1.5 flex-1">
          <Label>Urutan Tampil</Label>
          <Input
            type="number"
            min={0}
            value={form.order_index}
            onChange={(e) => onChange({ ...form, order_index: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-1.5 flex-1">
          <Label>Status</Label>
          <button
            type="button"
            onClick={() => onChange({ ...form, is_active: !form.is_active })}
            className={`w-full flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
              form.is_active
                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                : 'bg-muted border-input text-muted-foreground hover:bg-accent'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${form.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
            {form.is_active ? 'Aktif' : 'Nonaktif'}
          </button>
        </div>
      </div>
    </div>
  );
}