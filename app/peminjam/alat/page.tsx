"use client";

import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Package, ClipboardList, Filter, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react";
import EmptyState from "@/components/EmptyState";

interface Alat {
  id: number;
  nama: string;
  deskripsi: string;
  kategori_nama?: string;
  jumlah: number;
  jumlah_tersedia: number;
  status: string;
  foto?: string;
}

export default function AlatListPage() {
  const [alat, setAlat] = useState<Alat[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [selectedStatus, setSelectedStatus] = useState("semua");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Temporary state for dialog
  const [tempCategory, setTempCategory] = useState("semua");
  const [tempStatus, setTempStatus] = useState("semua");

  useEffect(() => {
    fetchAlat();
  }, []);

  const fetchAlat = async () => {
    try {
      const res = await fetch("/api/peminjam/alat");
      const data = await res.json();
      if (res.ok) {
        setAlat(data);
      }
    } catch (error) {
      console.error("Error fetching alat:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlat = alat.filter((item) => {
    const matchesSearch = 
      item.nama.toLowerCase().includes(filter.toLowerCase()) ||
      item.deskripsi?.toLowerCase().includes(filter.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "semua" || 
      item.kategori_nama === selectedCategory;

    const matchesStatus = 
      selectedStatus === "semua" || 
      (selectedStatus === "tersedia" ? item.jumlah_tersedia > 0 : item.jumlah_tersedia === 0);
      
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ["semua", ...Array.from(new Set(alat.map(item => item.kategori_nama).filter(Boolean)))];

  const handleApplyFilter = () => {
    setSelectedCategory(tempCategory);
    setSelectedStatus(tempStatus);
    setIsDialogOpen(false);
  };

  const handleResetFilter = () => {
    setTempCategory("semua");
    setTempStatus("semua");
    setSelectedCategory("semua");
    setSelectedStatus("semua");
    setIsDialogOpen(false);
  };

  if (loading)
    return (
      <Layout>
        <div className="flex justify-center p-8">Loading...</div>
      </Layout>
    );

  const hasNoData = alat.length === 0;

  return (
    <Layout>
      <Breadcrumb
        title="Daftar Alat"
        description="Lihat semua alat yang tersedia untuk dipinjam. Cari alat berdasarkan nama atau kategori, dan lihat ketersediaannya."
        icon={Package}
      />
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Cari alat yang Anda butuhkan..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
                    <Filter size={18} className="text-primary" />
                    Filter
                    {(selectedCategory !== 'semua' || selectedStatus !== 'semua') && (
                        <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                            { (selectedCategory !== 'semua' ? 1 : 0) + (selectedStatus !== 'semua' ? 1 : 0) }
                        </Badge>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Filter Produk</h2>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Sesuaikan kriteria pencarian untuk menemukan alat yang Anda butuhkan.
                        </p>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-gray-700">Kategori</Label>
                            <Select value={tempCategory} onValueChange={setTempCategory}>
                                <SelectTrigger className="w-full h-12 rounded-xl border-gray-200 focus:ring-blue-500 transition-all">
                                    <SelectValue placeholder="Semua Kategori" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat || ""} className="capitalize py-3">
                                            {cat === "semua" ? "Semua Kategori" : cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-gray-700">Status Ketersediaan</Label>
                            <Select value={tempStatus} onValueChange={setTempStatus}>
                                <SelectTrigger className="w-full h-12 rounded-xl border-gray-200 focus:ring-blue-500 transition-all">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                    <SelectItem value="semua" className="py-3">Semua Status</SelectItem>
                                    <SelectItem value="tersedia" className="py-3">Tersedia</SelectItem>
                                    <SelectItem value="habis" className="py-3">Stok Habis</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50/50 p-6 flex items-center justify-end gap-3 border-t border-gray-100">
                    <Button 
                        variant="ghost" 
                        onClick={handleResetFilter}
                        className="font-bold text-gray-500 hover:text-gray-700 hover:bg-transparent"
                    >
                        Reset Filter
                    </Button>
                    <Button 
                        onClick={handleApplyFilter}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded-xl h-11 transition-all shadow-lg shadow-blue-200"
                    >
                        Terapkan Filter
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlat.length > 0 ? (
          filteredAlat.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow overflow-hidden group hover:shadow-lg transition-shadow duration-300"
            >
              {/* Foto Alat */}
              <div className="w-full h-48 bg-gray-200 overflow-hidden">
                {item.foto ? (
                  <img
                    src={item.foto}
                    alt={item.nama}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package size={48} />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 leading-tight group-hover:text-primary transition-colors">{item.nama}</h3>
                <p className="text-sm text-gray-500 mb-2 font-medium">
                  {item.kategori_nama || "Tanpa Kategori"}
                </p>
                <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                  {item.deskripsi || "Tidak ada deskripsi"}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Stok</p>
                    <p
                      className={`text-sm font-bold ${
                        item.jumlah_tersedia > 0
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      Tersedia: {item.jumlah_tersedia} / {item.jumlah}
                    </p>
                  </div>
                  <Badge
                    variant={
                      item.jumlah_tersedia === 0
                        ? "destructive"
                        : item.status === "tersedia"
                        ? "default"
                        : "secondary"
                    }
                    className="uppercase text-[10px] font-black tracking-tighter"
                  >
                    {item.jumlah_tersedia === 0 ? "Stok Habis" : item.status}
                  </Badge>
                </div>
                <button
                  onClick={() =>
                    (window.location.href = `/peminjam/pinjam?alat_id=${item.id}`)
                  }
                  disabled={item.jumlah_tersedia === 0 || item.status !== "tersedia"}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                    item.jumlah_tersedia > 0 && item.status === "tersedia"
                      ? "bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200 active:scale-[0.98]"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <ClipboardList size={18} />
                  {item.jumlah_tersedia === 0
                    ? "Stok Habis"
                    : item.status !== "tersedia"
                    ? "Tidak Tersedia"
                    : "Pinjam Sekarang"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3">
             <EmptyState type={hasNoData ? "data" : "search"} />
          </div>
        )}
      </div>
    </Layout>
  );
}
