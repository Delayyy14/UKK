'use client';

import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PeminjamanDetail {
  id: number;
  jumlah: number;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  status: string;
  peminjam_nama: string;
  peminjam_username: string;
  alat_nama: string;
  alat_deskripsi?: string;
  kategori_nama?: string;
}

interface ReportData {
  totalPeminjaman: number;
  totalPengembalian: number;
  peminjamanAktif: number;
  peminjamanPending: number;
  detailPeminjaman?: PeminjamanDetail[];
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    totalPeminjaman: 0,
    totalPengembalian: 0,
    peminjamanAktif: 0,
    peminjamanPending: 0,
    detailPeminjaman: [],
  });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [selectedMonth, selectedYear]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedMonth) queryParams.append('month', selectedMonth);
      if (selectedYear) queryParams.append('year', selectedYear);

      const res = await fetch(`/api/petugas/reports?${queryParams.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setReportData(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'Pending',
      disetujui: 'Disetujui',
      ditolak: 'Ditolak',
      sedang_dipinjam: 'Sedang Dipinjam',
      selesai: 'Selesai',
    };
    return statusMap[status] || status;
  };

  if (loading) return <Layout><div className="flex justify-center p-8">Loading...</div></Layout>;

  return (
    <>
      <Layout>
        <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4 no-print">
          <div className="flex gap-4 w-full md:w-auto">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full md:w-48"
            >
              <option value="">Semua Bulan</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {new Date(0, month - 1).toLocaleString('id-ID', { month: 'long' })}
                </option>
              ))}
            </select>
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full md:w-32"
            >
              <option value="">Semua Tahun</option>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full md:w-auto flex items-center justify-center gap-2"
          >
            <Printer size={20} />
            <span>Cetak Laporan</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 print-container">
          <div className="print-header mb-6">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">LAPORAN PEMINJAMAN ALAT</h1>
              <div className="w-32 h-1 bg-blue-600 mx-auto mb-3"></div>
              <p className="text-lg text-gray-600 mb-2">Sistem Aplikasi Peminjaman Alat</p>
              {(selectedMonth || selectedYear) && (
                <p className="text-md font-semibold text-gray-700 border-2 border-gray-200 inline-block px-4 py-1 rounded-full bg-gray-50">
                  Periode: {selectedMonth ? new Date(0, parseInt(selectedMonth) - 1).toLocaleString('id-ID', { month: 'long' }) : ''} {selectedYear}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div className="text-left">
                <p className="text-gray-600 mb-1"><strong>Tanggal Cetak:</strong></p>
                <p className="text-gray-800">{new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 mb-1"><strong>Dicetak Oleh:</strong></p>
                <p className="text-gray-800 font-semibold">{currentUser?.nama || '-'}</p>
                <p className="text-gray-600 text-xs">({currentUser?.role === 'admin' ? 'Administrator' : 
                  currentUser?.role === 'petugas' ? 'Petugas' : 'Peminjam'})</p>
              </div>
            </div>
          </div>

          <div className="print-content">
            {/* Statistik */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Ringkasan Statistik</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-sm text-gray-700 font-semibold mb-2">Total Peminjaman</h4>
                  <p className="text-3xl font-bold text-blue-600">{reportData.totalPeminjaman}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="text-sm text-gray-700 font-semibold mb-2">Total Pengembalian</h4>
                  <p className="text-3xl font-bold text-green-600">{reportData.totalPengembalian}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="text-sm text-gray-700 font-semibold mb-2">Peminjaman Aktif</h4>
                  <p className="text-3xl font-bold text-yellow-600">{reportData.peminjamanAktif}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="text-sm text-gray-700 font-semibold mb-2">Pending</h4>
                  <p className="text-3xl font-bold text-orange-600">{reportData.peminjamanPending}</p>
                </div>
              </div>
            </div>

            {/* Tabel Detail Peminjaman */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Detail Peminjaman Barang</h2>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="border border-gray-300 font-semibold text-gray-700">No</TableHead>
                    <TableHead className="border border-gray-300 font-semibold text-gray-700">Peminjam</TableHead>
                    <TableHead className="border border-gray-300 font-semibold text-gray-700">Alat / Barang</TableHead>
                    <TableHead className="border border-gray-300 font-semibold text-gray-700">Kategori</TableHead>
                    <TableHead className="border border-gray-300 font-semibold text-gray-700 text-center">Jumlah</TableHead>
                    <TableHead className="border border-gray-300 font-semibold text-gray-700">Tanggal Pinjam</TableHead>
                    <TableHead className="border border-gray-300 font-semibold text-gray-700">Tanggal Kembali</TableHead>
                    <TableHead className="border border-gray-300 font-semibold text-gray-700 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.detailPeminjaman && reportData.detailPeminjaman.length > 0 ? (
                    reportData.detailPeminjaman.map((item: any, index: number) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="border border-gray-300 text-gray-700">{index + 1}</TableCell>
                        <TableCell className="border border-gray-300 text-gray-700">
                          <div>
                            <div className="font-medium">{item.peminjam_nama}</div>
                            <div className="text-xs text-gray-500">@{item.peminjam_username}</div>
                          </div>
                        </TableCell>
                        <TableCell className="border border-gray-300 text-gray-700">
                          <div>
                            <div className="font-medium">{item.alat_nama}</div>
                            {item.alat_deskripsi && (
                              <div className="text-xs text-gray-500">{item.alat_deskripsi.substring(0, 50)}...</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="border border-gray-300 text-gray-700">{item.kategori_nama || '-'}</TableCell>
                        <TableCell className="border border-gray-300 text-gray-700 text-center">{item.jumlah}</TableCell>
                        <TableCell className="border border-gray-300 text-gray-700">{formatDate(item.tanggal_pinjam)}</TableCell>
                        <TableCell className="border border-gray-300 text-gray-700">{formatDate(item.tanggal_kembali)}</TableCell>
                        <TableCell className="border border-gray-300 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.status === 'selesai' ? 'bg-green-100 text-green-800' :
                            item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            item.status === 'disetujui' || item.status === 'sedang_dipinjam' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getStatusLabel(item.status)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center border border-gray-300 text-gray-500 font-medium">
                        Tidak ada data peminjaman
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="print-footer mt-8 pt-4 border-t border-gray-300">
              <p className="text-sm text-gray-600 text-center">
                Laporan ini dibuat secara otomatis oleh sistem Aplikasi Peminjaman Alat
              </p>
            </div>
          </div>
        </div>
      </Layout>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 2cm;
          }

          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Sembunyikan sidebar, navbar, breadcrumb, dan tombol */
          .no-print,
          nav,
          aside,
          [class*="sidebar"],
          [class*="Sidebar"],
          [class*="Navbar"],
          [class*="Breadcrumb"],
          button {
            display: none !important;
          }

          /* Layout untuk print */
          .flex {
            display: block !important;
          }

          .ml-64 {
            margin-left: 0 !important;
          }

          /* Container print */
          .print-container {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          /* Header print */
          .print-header {
            margin-bottom: 2rem !important;
          }

          .print-header h1 {
            font-size: 28px !important;
            margin-bottom: 0.5rem !important;
          }

          /* Content print */
          .print-content {
            page-break-inside: avoid;
          }

          .print-content .grid {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 1rem !important;
          }

          /* Card statistik */
          .print-content > div > div {
            page-break-inside: avoid;
          }

          /* Tabel */
          .print-content table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }

          .print-content table th,
          .print-content table td {
            border: 1px solid #e5e7eb !important;
            padding: 8px !important;
          }

          .print-content table thead th {
            background-color: #f3f4f6 !important;
            font-weight: 600;
          }

          .print-content table tbody tr {
            page-break-inside: avoid;
          }

          /* Heading section */
          .print-content h2 {
            font-size: 18px !important;
            margin-bottom: 1rem !important;
            margin-top: 1.5rem !important;
            page-break-after: avoid;
          }

          /* Footer print */
          .print-footer {
            margin-top: 2rem !important;
            padding-top: 1rem !important;
          }

          /* Warna tetap muncul saat print */
          .bg-blue-50,
          .bg-green-50,
          .bg-yellow-50,
          .bg-orange-50 {
            background-color: #f0f9ff !important;
          }

          .bg-green-50 {
            background-color: #f0fdf4 !important;
          }

          .bg-yellow-50 {
            background-color: #fefce8 !important;
          }

          .bg-orange-50 {
            background-color: #fff7ed !important;
          }
        }

        /* Tampilan normal */
        @media screen {
          .print-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 2rem;
          }
        }
      `}</style>
    </>
  );
}