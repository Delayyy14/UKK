'use client';

import { useState } from 'react';
import BeritaCard from '@/components/BeritaCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';

interface Berita {
  id: number;
  judul: string;
  konten: string;
  foto: string;
  penulis: string;
  slug: string;
  kategori_id: number;
  kategori_nama: string;
  created_at: string;
}

interface Category {
  id: number;
  nama: string;
}

interface BeritaCatalogProps {
  berita: Berita[];
  categories: Category[];
}

export default function BeritaCatalog({ berita, categories }: BeritaCatalogProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Filter logic
  const filteredBerita = berita.filter((item) => {
    const matchesSearch = item.judul.toLowerCase().includes(search.toLowerCase()) || 
                          (item.konten && item.konten.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || item.kategori_nama === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const clearFilters = () => {
    setCategoryFilter('all');
    setSearch('');
    setCurrentPage(1);
    setIsDialogOpen(false);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredBerita.length / ITEMS_PER_PAGE);
  const paginatedBerita = filteredBerita.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasNoData = berita.length === 0;
  const activeFiltersCount = (categoryFilter !== 'all' ? 1 : 0);

  return (
    <div className="space-y-8">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Cari judul atau isi berita..." 
            className="pl-12 h-12 rounded-2xl border-zinc-200 focus:ring-blue-500/20"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-12 px-6 rounded-2xl gap-2 border-zinc-200 hover:bg-zinc-50 font-bold transition-all">
              <SlidersHorizontal className="h-4 w-4" />
              Filter
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 rounded-full text-[10px] flex items-center justify-center bg-blue-600 text-white border-none">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[30px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">Filter Berita</DialogTitle>
              <DialogDescription className="text-zinc-500 font-medium">
                Sesuaikan kriteria untuk menemukan artikel yang relevan.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="space-y-3">
                <Label htmlFor="category" className="text-sm font-bold text-zinc-900 ml-1">Kategori Berita</Label>
                <Select value={categoryFilter} onValueChange={(val) => { setCategoryFilter(val); setCurrentPage(1); }}>
                  <SelectTrigger id="category" className="h-12 rounded-xl border-zinc-200">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.nama}>
                        {cat.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-3 pt-2">
              <Button variant="ghost" onClick={clearFilters} className="w-full sm:w-auto rounded-xl font-bold">
                Reset Filter
              </Button>
              <Button type="submit" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto rounded-xl font-bold bg-blue-600 hover:bg-blue-700">
                Terapkan Filter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

       {/* Active Filters Display */}
       {activeFiltersCount > 0 && (
        <div className="flex gap-2 flex-wrap items-center">
          {categoryFilter !== 'all' && (
            <Badge variant="secondary" className="gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-bold text-xs">
              Kategori: {categoryFilter}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-blue-900 transition-colors" 
                onClick={() => { setCategoryFilter('all'); setCurrentPage(1); }}
              />
            </Badge>
          )}
          <Button 
            variant="link" 
            size="sm" 
            className="h-auto p-0 text-zinc-400 hover:text-red-500 text-xs font-bold transition-colors"
            onClick={clearFilters}
          >
            Hapus Semua
          </Button>
        </div>
      )}

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedBerita.length > 0 ? (
          paginatedBerita.map((item) => (
            <BeritaCard key={item.id} item={item} />
          ))
        ) : (
          <div className="col-span-full py-12">
            <EmptyState type={hasNoData ? "data" : "search"} />
            {!hasNoData && (
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={clearFilters} className="rounded-xl font-bold">
                  Lihat Semua Berita
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination component */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-6 bg-zinc-50 p-6 rounded-[30px] border border-zinc-100">
          <p className="text-sm text-zinc-500 font-bold">
            Menampilkan <span className="text-zinc-900">{paginatedBerita.length}</span> dari <span className="text-zinc-900">{filteredBerita.length}</span> berita
          </p>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
          />
        </div>
      )}
    </div>
  );
}
