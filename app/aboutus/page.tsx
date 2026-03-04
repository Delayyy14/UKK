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
        description="Informasi tentang website Pinjamin"
        breadcrumbItems={[
          { label: 'Beranda', href: '/' },
          { label: 'Tentang Kami', href: '/aboutus' },
        ]}
      />

      <div className="container mx-auto py-12 px-6 max-w-4xl">
        <div className="relative inline-block mb-4">
          <p className='text-left text-black text-4xl font-bold relative z-10 italic'>
            Tentang Kami
          </p>
          <img
            src="/images/svg/effect-water-brush.png"
            alt="brush"
            className="absolute -bottom-4 -left-1 w-[120%] h-12 -z-10 opacity-60"
          />
        </div>
        <p className='text-left text-muted-foreground mb-8 italic'>
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