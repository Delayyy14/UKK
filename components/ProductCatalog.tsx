'use client';

import { useState } from 'react';
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
  const [search, setSearch] = useState('');
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
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Cari nama alat atau deskripsi..." 
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 min-w-[100px]">
              <SlidersHorizontal className="h-4 w-4" />
              Filter
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 rounded-full text-[10px] flex items-center justify-center">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Filter Produk</DialogTitle>
              <DialogDescription>
                Sesuaikan kriteria pencarian untuk menemukan alat yang Anda butuhkan.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select value={categoryFilter} onValueChange={(val) => { setCategoryFilter(val); setCurrentPage(1); }}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.nama}>
                        {cat.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status Ketersediaan</Label>
                <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="tersedia">Tersedia</SelectItem>
                    <SelectItem value="habis">Habis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 text-center sm:text-left">
              <Button variant="ghost" onClick={clearFilters} className="w-full sm:w-auto">
                Reset Filter
              </Button>
              <Button type="submit" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                Terapkan Filter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

       {/* Active Filters Display */}
       {activeFiltersCount > 0 && (
        <div className="flex gap-2 flex-wrap text-sm">
          {categoryFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Kategori: {categoryFilter}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors" 
                onClick={() => { setCategoryFilter('all'); setCurrentPage(1); }}
              />
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {statusFilter === 'tersedia' ? 'Tersedia' : 'Habis'}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors" 
                onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
              />
            </Badge>
          )}
          <Button 
            variant="link" 
            size="sm" 
            className="h-auto p-0 text-muted-foreground hover:text-destructive text-xs"
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
