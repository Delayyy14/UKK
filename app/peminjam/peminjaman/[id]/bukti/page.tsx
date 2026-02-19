'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Printer } from 'lucide-react';

interface PeminjamanDetail {
  id: number;
  user_nama: string;
  user_username: string;
  user_email: string;
  alat_nama: string;
  alat_deskripsi: string;
  alat_foto?: string;
  kategori_nama?: string;
  jumlah: number;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  status: string;
  alasan?: string;
  created_at: string;
}

function BuktiTemplate({ data, type }: { data: PeminjamanDetail; type: 'PETUGAS' | 'PEMINJAM' }) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    // Gunakan strip atau format pendek untuk muat di titik-titik
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="p-6 mb-8 relative font-serif text-black h-[13cm] overflow-hidden bg-white">
      {/* Header */}
      <div className="flex border-b-2 border-black pb-2 mb-4">
        {/* Logo Placeholder */}
        <div className="w-20 h-20 flex items-center justify-center mr-4">
           {/* Menggunakan teks jika tidak ada logo aset */}
           <div className="w-16 h-16 border border-black rounded-full flex items-center justify-center text-xs text-center font-bold">
             LOGO
           </div>
        </div>
        <div className="flex-1 text-center">
          <h2 className="text-xl font-bold uppercase tracking-wider">PEMINJAMAN ALATKU</h2>
          <p className="text-xs">Jl. Niken Gandini No.98 Setono, Jenangan, Ponorogo 63492</p>
          <p className="text-xs">Telp/Fax : (0352) 481236 Email : naufalazkaannahl@gmail.com</p>
        </div>
        {/* Kotak Jenis Arsip */}
        <div className="w-32 ml-4 flex flex-col">
            <div className="border-2 border-black p-2 text-center text-xs font-bold uppercase">
                {type === 'PETUGAS' ? 'ARSIP PETUGAS' : 'ARSIP PEMINJAM'}
            </div>
            {/* Stamp/Circle imitation if needed */}
        </div>
      </div>

      {/* Judul */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold uppercase underline decoration-2 underline-offset-4">
            BUKTI PEMINJAMAN ALAT
        </h1>
      </div>

      {/* Isi Form */}
      <div className="space-y-2 text-sm leading-relaxed">
        {/* Nama Peminjam */}
        <div className="flex items-end">
             <span className="w-48">Nama Peminjam</span>
             <span className="mr-2">:</span>
             <div className="flex-1 border-b border-dotted border-black px-2 font-bold">{data.user_nama}</div>
        </div>

        {/* Nomor Induk / Username */}
        <div className="flex items-end">
             <span className="w-48">ID / Username</span>
             <span className="mr-2">:</span>
             <div className="flex-1 border-b border-dotted border-black px-2">{data.user_id} / {data.user_username}</div>
        </div>

        {/* Alat */}
         <div className="flex items-end">
             <span className="w-48">Nama Alat</span>
             <span className="mr-2">:</span>
             <div className="flex-1 border-b border-dotted border-black px-2 font-bold">{data.alat_nama}</div>
        </div>

        {/* Jumlah */}
        <div className="flex items-end">
             <span className="w-48">Jumlah</span>
             <span className="mr-2">:</span>
             <div className="flex-1 border-b border-dotted border-black px-2">{data.jumlah} unit</div>
        </div>

        {/* Tanggal */}
        <div className="flex items-end">
             <span className="w-48">Tanggal Pinjam s/d Kembali</span>
             <span className="mr-2">:</span>
             <div className="flex-1 border-b border-dotted border-black px-2">
                {formatDate(data.tanggal_pinjam)} s/d {formatDate(data.tanggal_kembali)}
             </div>
        </div>

        {/* Alasan */}
        <div className="flex items-end">
             <span className="w-48">Keperluan / Alasan</span>
             <span className="mr-2">:</span>
             <div className="flex-1 border-b border-dotted border-black px-2 italic">{data.alasan || '-'}</div>
        </div>

         {/* Status */}
         <div className="flex items-end">
             <span className="w-48">Status Peminjaman</span>
             <span className="mr-2">:</span>
             <div className={`flex-1 border-b border-dotted border-black px-2 font-bold uppercase ${
                data.status === 'disetujui' ? 'text-black' : 'text-gray-600'
             }`}>
                {data.status}
             </div>
        </div>
      </div>

      {/* Tanda Tangan */}
      <div className="flex justify-between mt-8 text-sm">
        <div className="text-center w-1/3">
           <p className="mb-2">Mengetahui,<br/>Petugas</p> {/* Space for signature */}
           <p className="border-b border-black inline-block font-bold">(....................................)</p>
        </div>

        <div className="text-center w-1/3">
<p className="mb-2">Mengetahui,<br/>Peminjam</p> {/* Space for signature */}
           <p className="border-b border-black inline-block font-bold">(....................................)</p>
        </div>
      </div>
    </div>
  );  
}

function BuktiPageContent() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<PeminjamanDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/peminjam/peminjaman/${params.id}`);
      const peminjamanData = await res.json();
      if (res.ok) {
        setData(peminjamanData);
      } else {
        alert('Peminjaman tidak ditemukan');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-gray-50">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-blue-600 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">Memuat data...</p>
      </div>
    );
  }
  if (!data) return <div className="min-h-screen flex items-center justify-center">Data tidak ditemukan</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Tombol Back & Print */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between print:hidden">
        <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-black">← Kembali</button>
        <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 flex items-center gap-2">
            <Printer size={18} /> Cetak Bukti
        </button>
      </div>

      {/* Screen Preview - Shows 1 Copy */}
      <div className="max-w-3xl mx-auto bg-white shadow-xl p-8 print:hidden">
        <div className="text-center mb-4 text-gray-500 italic">Preview (Tampilan Layar)</div>
        <BuktiTemplate data={data} type="PEMINJAM" />
      </div>

      {/* Print Layout - Shows 2 Copies */}
      <div className="hidden print:block print:w-full">
        <BuktiTemplate data={data} type="PETUGAS" />
        <div className="border-b-2 border-dashed border-gray-400 my-8"></div>
        <BuktiTemplate data={data} type="PEMINJAM" />
      </div>

      <style jsx global>{`
        @media print {
            body { background: white; }
            @page { margin: 0.5cm; size: A4; }
        }
      `}</style>
    </div>
  );
}

export default function BuktiPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-gray-50">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-blue-600 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">Memuat data...</p>
      </div>
    }>
      <BuktiPageContent />
    </Suspense>
  );
}
