'use client'

import MainNavbar from '@/components/MainNavbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col pt-16">
      <MainNavbar />

      <PageHeader 
        title="Tentang Kami" 
        breadcrumbItems={[
          { label: 'Beranda', href: '/' },
          { label: 'Tentang Kami', href: '/aboutus' },
        ]}
      />

      <div className="container mx-auto py-12 px-6 max-w-4xl">
        <p className='text-left text-black text-2xl font-bold'>
          Tentang Kami
        </p>
        <p className='text-left text-muted-foreground mb-8'>
          Informasi tentang aplikasi Pinjamin.
        </p>

        <p className="text-lg leading-relaxed text-foreground">
          <b>Pinjamin</b> adalah aplikasi peminjaman alat berbasis web yang dibangun pada tahun <b>2026 </b> 
          sebagai solusi digital untuk mengelola proses peminjaman dan pengembalian barang secara efisien. 
          Aplikasi ini dikembangkan untuk menggantikan sistem manual yang rentan terhadap kesalahan pencatatan 
          dan keterlambatan informasi.  
          <br /><br />
          Dengan fitur manajemen alat, pengajuan peminjaman, persetujuan petugas, serta pencatatan riwayat aktivitas, 
          Pinjamin membantu pengguna, petugas, dan administrator dalam mengelola inventaris alat secara terstruktur, 
          transparan, dan mudah diakses kapan saja.
        </p>        
      </div>

      <Footer />
    </div>
  );
}