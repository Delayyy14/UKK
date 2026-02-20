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
}

interface Category {
  id: number;
  nama: string;
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
    setIsDialogOpen(false);
  };

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
            onChange={(e) => setSearch(e.target.value)}
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
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            <DialogFooter className="flex-col sm:flex-row gap-2">
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
            <Badge variant="secondary" className="gap-1 animate-in fade-in zoom-in duration-300">
              Kategori: {categoryFilter}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors" 
                onClick={() => setCategoryFilter('all')}
              />
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1 animate-in fade-in zoom-in duration-300">
              Status: {statusFilter === 'tersedia' ? 'Tersedia' : 'Habis'}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors" 
                onClick={() => setStatusFilter('all')}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
               <Search className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold">Tidak ditemukan</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              Maaf, tidak ada alat yang cocok dengan pencarian atau filter Anda. Coba kata kunci lain atau reset filter.
            </p>
            <Button variant="outline" onClick={clearFilters} className="mt-6">
              Lihat Semua Produk
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
