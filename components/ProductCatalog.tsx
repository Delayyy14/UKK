'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
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
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';

interface Product {
  id: number;
  nama: string;
  deskripsi: string;
  kategori_id: number;
  jumlah: number;
  jumlah_tersedia: number;
  status: string;
  foto: string;
  kategori_nama: string;
  harga_per_hari: number;
}

interface Category {
  id: number;
  nama: string;
  harga_per_hari: number;
}

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
}

export default function ProductCatalog({ products, categories }: ProductCatalogProps) {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q');
  
  const [search, setSearch] = useState(queryParam || '');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Derive filtered products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.nama.toLowerCase().includes(search.toLowerCase()) || 
                          (product.deskripsi && product.deskripsi.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || product.kategori_nama === categoryFilter;
    
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'tersedia' && product.jumlah_tersedia > 0) ||
                          (statusFilter === 'habis' && product.jumlah_tersedia === 0);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const clearFilters = () => {
    setCategoryFilter('all');
    setStatusFilter('all');
    setSearch('');
    setCurrentPage(1);
    setIsDialogOpen(false);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasNoData = products.length === 0;
  const activeFiltersCount = (categoryFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0);

  return (
    <div className="space-y-8">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Cari nama alat atau deskripsi..." 
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
              <DialogTitle className="text-xl font-black">Filter Produk</DialogTitle>
              <DialogDescription className="text-zinc-500 font-medium">
                Sesuaikan kriteria pencarian untuk menemukan alat yang Anda butuhkan.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="space-y-3">
                <Label htmlFor="category" className="text-sm font-bold text-zinc-900 ml-1">Kategori</Label>
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
              <div className="space-y-3">
                <Label htmlFor="status" className="text-sm font-bold text-zinc-900 ml-1">Status Ketersediaan</Label>
                <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
                  <SelectTrigger id="status" className="h-12 rounded-xl border-zinc-200">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="tersedia">Tersedia</SelectItem>
                    <SelectItem value="habis">Habis</SelectItem>
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
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-bold text-xs">
              Status: {statusFilter === 'tersedia' ? 'Tersedia' : 'Habis'}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-blue-900 transition-colors" 
                onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
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

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedProducts.length > 0 ? (
          paginatedProducts.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState type={hasNoData ? "data" : "search"} />
            {!hasNoData && (
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Lihat Semua Produk
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination component */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-4">
        <p className="text-sm text-muted-foreground">
          Menampilkan {paginatedProducts.length} dari {filteredProducts.length} produk
        </p>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    </div>
  );
}
