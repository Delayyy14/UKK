import MainNavbar from '@/components/MainNavbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Clock, Shield } from 'lucide-react';
import pool from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import ContactSection from '@/components/ContactSection';
import TestimonialSection from '@/components/TestimonialSection';

async function getFeaturedProducts() {
  try {
    const res = await pool.query(`
      SELECT a.*, k.nama as kategori_nama 
      FROM alat a 
      LEFT JOIN kategori k ON a.kategori_id = k.id 
      WHERE a.status = 'tersedia'
      ORDER BY a.id DESC 
      LIMIT 3
    `);
    return res.rows;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const products = await getFeaturedProducts();

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Global Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-blue-50/50 to-transparent" />
        <div className="absolute top-[10%] -left-[10%] w-[600px] h-[600px] rounded-full bg-blue-100/40 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-purple-100/40 blur-[100px]" />
        <div className="absolute bottom-[20%] left-[20%] w-[700px] h-[700px] rounded-full bg-pink-50/40 blur-[150px]" />
      </div>

      <MainNavbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 md:px-12 lg:px-24 pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Text */}
          <div className="flex flex-col items-start text-left space-y-8 animate-in slide-in-from-left-8 duration-1000 z-10">
            <h1 className="text-5xl md:text-7xl lg:text-7xl font-serif font-medium tracking-tight text-gray-900 leading-[1.1]">
              Pinjam Peralatan Pendakian dengan <br className="hidden lg:block"/>
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Mudah & Cepat</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-xl font-light leading-relaxed">
              Platform digital modern untuk mempermudah akses peminjaman inventaris sekolah. 
              Efisien, transparan, dan terintegrasi penuh.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
              <Button size="lg" className="rounded-full px-10 h-14 text-lg bg-gray-900 text-white hover:bg-gray-800 transition-all font-medium w-full sm:w-auto shadow-xl hover:shadow-2xl hover:-translate-y-1" asChild>
                <Link href="/products">
                  Lihat Katalog <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="relative w-full aspect-square lg:aspect-auto lg:h-[600px] flex items-center justify-center animate-in slide-in-from-right-8 duration-1000 delay-200 z-10">
             {/* Decorative blob behind image */}
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/30 to-purple-200/30 rounded-full blur-3xl transform scale-90" />
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img 
               src="/images/svg/svg-1.1.png" 
               alt="Hero Illustration" 
               className="w-full h-full object-contain drop-shadow-2xl relative z-20"
             />
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-6 md:px-12 lg:px-24">
        <div className="text-center mb-16 relative z-10">
         
          <h2 className="text-4xl font-bold tracking-tight mb-4 text-gray-900">Mengapa Menggunakan Pinjamin?</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Kami menghadirkan fitur-fitur terbaik untuk memastikan pengalaman peminjaman yang lancar dan menyenangkan.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10">
          {[
            {
              icon: Clock,
              title: "Efisiensi Waktu",
              desc: "Proses pengajuan yang cepat tanpa antri manual. Hemat waktu berharga Anda.",
              color: "text-blue-600",
              bg: "bg-blue-50"
            },
            {
              icon: Shield,
              title: "Aman & Terdata",
              desc: "Setiap peminjaman tercatat sistematis dan aman dalam database terenkripsi.",
              color: "text-purple-600",
              bg: "bg-purple-50"
            },
            {
              icon: CheckCircle,
              title: "Ketersediaan Realtime",
              desc: "Cek stok alat langsung darimana saja tanpa perlu datang ke lokasi.",
              color: "text-pink-600",
              bg: "bg-pink-50"
            },
          ].map((feature, i) => (
            <div key={i} className="group p-8 rounded-3xl bg-white border border-gray-100/50 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product Preview Section */}
      <section className="relative py-24 px-6 md:px-12 lg:px-24 bg-white/50 backdrop-blur-sm">
        <div className="flex justify-between items-end mb-12 max-w-6xl mx-auto">
          <div>
            <h2 className="text-4xl font-bold tracking-tight mb-2 text-gray-900">Peralatan Pilihan</h2>
            <p className="text-gray-500 text-lg">Jelajahi inventaris terbaru yang siap menemani petualanganmu.</p>
          </div>
          <Button variant="ghost" asChild className="hidden md:flex text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            <Link href="/products">Lihat Semua <ArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.length > 0 ? (
            products.map((item: any) => (
              <ProductCard key={item.id} item={item} />
            ))
          ) : (
            <div className="col-span-3 text-center py-20 rounded-3xl bg-gray-50 border border-dashed border-gray-200">
              <div className="text-gray-400 mb-2">Belum ada data alat saat ini.</div>
              <p className="text-sm text-gray-400">Silakan cek kembali nanti.</p>
            </div>
          )}
        </div>
        
        <div className="mt-12 text-center md:hidden">
          <Button variant="outline" size="lg" asChild className="w-full rounded-xl border-gray-200">
            <Link href="/products">Lihat Semua Katalog</Link>
          </Button>
        </div>
      </section>



      {/* Testimonial Section */}
      <TestimonialSection />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}