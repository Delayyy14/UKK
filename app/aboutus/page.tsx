'use client';

import Image from 'next/image';
import MainNavbar from '@/components/MainNavbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col pt-16">
      <MainNavbar />

      <PageHeader 
        title="Tentang Kami" 
        description="Informasi mengenai latar belakang dan misi PinjamLe."
        breadcrumbItems={[
          { label: 'Beranda', href: '/' },
          { label: 'Tentang Kami', href: '/aboutus' },
        ]}
      />

      <section className="py-24 bg-white overflow-hidden flex-1 relative">
        {/* Background Decorative Elements */}
        <div className="absolute -top-10 -right-10 w-[450px] h-[450px] opacity-20 pointer-events-none z-0">
          <Image 
            src="/images/illustration/Group-2.png" 
            alt="Decoration Top Right" 
            fill 
            className="object-contain select-none"
          />
        </div>
        <div className="absolute -bottom-10 -left-10 w-[450px] h-[450px] opacity-20 pointer-events-none z-0">
          <Image 
            src="/images/illustration/Group-2.png" 
            alt="Decoration Bottom Left" 
            fill 
            className="object-contain rotate-180 select-none"
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 relative z-10">

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Logo Image */}
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/5 rounded-[60px] translate-x-4 translate-y-4 -z-10 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform" />
              <div className="aspect-[4/3] relative overflow-hidden rounded-[40px] bg-white flex items-center justify-center p-8">
                <Image 
                  src="/images/illustration/Logo-bg.png" 
                  alt="PinjamLe Logo" 
                  fill 
                  className="object-contain p-12 transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Description Text */}
            <div className="space-y-8">
              <div className="space-y-6">
                
                <p className="text-gray-600 text-lg leading-relaxed font-medium">
                  PinjamLe, platform penyewaan alat outdoor terkemuka, lahir dari visi inovatif untuk memberdayakan para petualang. Didirikan sebagai bagian dari tugas sekolah UKK, PinjamLe awalnya berupa dashboard admin petugas dan pengguna. Namun, Naufal, sang pendiri, melihat potensi luar biasa dari platform ini dan bertekad untuk mengembangkannya menjadi portofolio yang lebih keren dan modern.
                </p>
                
                <p className="text-gray-600 text-lg leading-relaxed font-medium">
                  Misi kami adalah mempermudah akses ke peralatan berkualitas tinggi, kuat, dan terpercaya bagi semua orang. PinjamLe bercita-cita untuk meningkatkan semangat eksplorasi dalam komunitas pendaki, memberikan pengalaman mendaki terbaik yang tak terlupakan. Dengan sistem terintegrasi dan pengalaman di lapangan, kami memberikan layanan penyewaan yang lebih dari sekadar transaksi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
