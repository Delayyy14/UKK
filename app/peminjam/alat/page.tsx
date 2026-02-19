"use client";

import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { useEffect, useState } from "react";
import { Package, ClipboardList  } from "lucide-react";

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

  const filteredAlat = alat.filter(
    (item) =>
      item.nama.toLowerCase().includes(filter.toLowerCase()) ||
      item.kategori_nama?.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading)
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );

  return (
    <Layout>
      <Breadcrumb
        title="Daftar Alat"
        description="Lihat semua alat yang tersedia untuk dipinjam. Cari alat berdasarkan nama atau kategori, dan lihat ketersediaannya."
        icon={Package}
      />
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari alat atau kategori..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlat.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            {/* Foto Alat */}
            <div className="w-full h-48 bg-gray-200 overflow-hidden">
              {item.foto ? (
                <img
                  src={item.foto}
                  alt={item.nama}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package size={48} />
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{item.nama}</h3>
              <p className="text-sm text-gray-500 mb-2">
                {item.kategori_nama || "Tanpa Kategori"}
              </p>
              <p className="text-gray-700 mb-4 line-clamp-2">
                {item.deskripsi || "Tidak ada deskripsi"}
              </p>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-600">Total: {item.jumlah}</p>
                  <p
                    className={`text-sm font-semibold ${
                      item.jumlah_tersedia > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    Tersedia: {item.jumlah_tersedia}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.jumlah_tersedia === 0
                      ? "bg-red-100 text-red-600"
                      : item.status === "tersedia"
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {item.jumlah_tersedia === 0 ? "Stok Habis" : item.status}
                </span>
              </div>
              <button
  onClick={() =>
    (window.location.href = `/peminjam/pinjam?alat_id=${item.id}`)
  }
  disabled={item.jumlah_tersedia === 0 || item.status !== "tersedia"}
  className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition ${
    item.jumlah_tersedia > 0 && item.status === "tersedia"
      ? "bg-gray-700 text-white hover:bg-gray-600"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"
  }`}
>
  {/* ICON */}
  <ClipboardList size={18} />

  {/* TEXT */}
  {item.jumlah_tersedia === 0
    ? "Stok Habis"
    : item.status !== "tersedia"
    ? "Tidak Tersedia"
    : "Pinjam Sekarang"}
</button>
            </div>
          </div>
        ))}
      </div>
      {filteredAlat.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Tidak ada alat yang ditemukan
        </div>
      )}
    </Layout>
  );
}
