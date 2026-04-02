import MainNavbar from '@/components/MainNavbar';
import Link from 'next/link';
import Image from 'next/image';
import dynamicImport from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Clock, Shield, MapPin, Users, Package, Calendar, Heart, Newspaper } from 'lucide-react';
import pool from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import BeritaCard from '@/components/BeritaCard';
import HeroSection from '@/components/HeroSection';
const ContactSection = dynamicImport(() => import('@/components/ContactSection'), { ssr: false });
const TestimonialSection = dynamicImport(() => import('@/components/TestimonialSection'), { ssr: false });
const InstagramGallery = dynamicImport(() => import('@/components/InstagramGallery'), { ssr: false });
const Footer = dynamicImport(() => import('@/components/Footer'), { ssr: false });

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

async function getLatestNews() {
  try {
    const res = await pool.query(`
      SELECT * FROM berita 
      ORDER BY created_at DESC 
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
  const [products, news] = await Promise.all([
    getFeaturedProducts(),
    getLatestNews()
  ]);

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
      <HeroSection />

      {/* About / Introduction Section (Replacing Features) */}
      <section id="about" className="relative py-32 px-6 md:px-12 lg:px-24 bg-white overflow-hidden">
        {/* Background Text Effect (Fore Coffee Style) */}
        <div className="absolute top-5 left-0 w-full whitespace-nowrap opacity-[0.05] select-none pointer-events-none">
          <h2 className="text-[120px] md:text-[200px] font-black tracking-tighter text-transparent" style={{ WebkitTextStroke: '3px #2563eb' }}>
            PinjamLe PinjamLe PinjamLe PinjamLe
          </h2>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-12 relative">
             <h2 className="text-6xl md:text-8xl font-black text-blue-600 tracking-tighter">PINJAMLE</h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image 
                  src="/images/illustration/Logo-bg.png" 
                  alt="PinjamLe Logo" 
                  fill 
                  className="object-contain transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-6">
                <p className="text-gray-600 text-lg leading-relaxed font-medium">
                  Berawal dari proyek sekolah UKK untuk tugas portfolio, PinjamLe lahir dari visi untuk mempermudah akses alat outdoor berkualitas bagi para petualang.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed font-medium">
                  Berawal dari proyek sekolah UKK untuk portofolio, PinjamLe lahir sebagai solusi untuk mempermudah para petualang mengakses peralatan outdoor berkualitas tinggi, kuat, dan terpercaya.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed font-medium">
                  Kami berkomitmen memberikan peralatan pendakian terbaik, kuat, dan terpercaya, serta terus berinovasi untuk mendukung semangat eksplorasi di komunitas pendaki.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* How it Works Section */}
      <section id="how-it-works" className="relative py-24 px-6 md:px-12 lg:px-24 bg-gray-50/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <div className="space-y-2">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Bagaimana Cara Memulainya?</h2>
                <p className="text-gray-500 font-light text-lg">Hanya butuh 4 langkah mudah untuk mendapatkan peralatan impianmu.</p>
              </div>

              <div className="space-y-12">
                {[
                  { step: '01', title: 'Pilih Alat', desc: 'Buka katalog dan pilih peralatan yang kamu butuhkan.', icon: Package },
                  { step: '02', title: 'Tentukan Tanggal', desc: 'Pilih jadwal pendakianmu melalui sistem kalender kami.', icon: Calendar },
                  { step: '03', title: 'Konfirmasi Bayar', desc: 'Admin akan mengecek pesananmu secepat kilat.', icon: Shield },
                  { step: '04', title: 'Ambil & Berangkat', desc: 'Tunjukkan bukti digital saat mengambil alat di toko.', icon: MapPin },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-start group">
                    <div className="text-4xl font-black text-blue-100 transition-colors group-hover:text-blue-500 duration-300">{item.step}</div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-gray-900">{item.title}</h4>
                      <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative order-1 lg:order-2 flex justify-start">
               <div className="aspect-[4/5] w-full max-w-lg rounded-r-[120px] overflow-hidden relative">
                  <Image 
                    src="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070&auto=format&fit=crop" 
                    alt="Adventure Background" 
                    fill 
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  {/* Left Side Fade Effect */}
                  <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-gray-50 via-gray-50/40 to-transparent z-10" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section className="relative py-32 bg-white overflow-hidden">
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

        <div className="px-6 md:px-12 lg:px-24">
          <div className="flex flex-col items-start md:flex-row justify-between md:items-end mb-16 max-w-7xl mx-auto gap-4 relative z-10">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-6xl font-black text-blue-600 tracking-tighter uppercase">Peralatan Pilihan</h2>
              <p className="text-gray-500 text-lg font-medium tracking-wide">Gear berkualitas untuk petualangan tanpa batas.</p>
            </div>

            <Button size="lg" variant="ghost" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 group font-bold">
              <Link href="/products" className="flex items-center">
                Lihat Semua Katalog <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto relative z-10">
            {products.length > 0 ? (
              products.map((item: any) => (
                <ProductCard key={item.id} item={item} />
              ))
            ) : (
              <div className="col-span-3 text-center py-24 rounded-3xl bg-gray-50 border border-dashed border-gray-200">
                <div className="text-gray-300 mb-2">
                  <Package size={48} className="mx-auto opacity-20 mb-4" />
                </div>
                <p className="text-gray-400 font-medium">Belum ada data alat saat ini.</p>
                <p className="text-xs text-gray-400 mt-1 italic">Silakan hubungi kami untuk ketersediaan manual.</p>
              </div>
            )}
          </div>
        </div>
      </section>

{/* News Preview Section */}
      <section className="relative py-40 bg-gray-50/10 overflow-hidden">
        {/* Background Text Effect (Fore News Style) */}
        <div className="absolute top-10 left-0 w-full whitespace-nowrap opacity-[0.1] select-none pointer-events-none">
          <h2 className="text-[120px] md:text-[200px] font-black tracking-tighter text-transparent" style={{ WebkitTextStroke: '3px #2563eb' }}>
            BERITA
          </h2>
        </div>

        <div className="px-6 md:px-12 lg:px-24 relative z-10">
          <div className="flex flex-col items-start md:flex-row justify-between md:items-end mb-24 max-w-7xl mx-auto gap-12">
            <div className="space-y-2">
              <h2 className="text-6xl md:text-8xl font-black text-blue-600 tracking-tighter leading-none">Berita<br/>Terbaru</h2>
            </div>

            <div className="md:text-right max-w-md">
              <p className="text-gray-400 text-xl md:text-2xl font-medium leading-relaxed">
                Dapatkan berita terbaru dan informasi menarik dari kami!
              </p>
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {news.length > 0 ? (
              news.map((item: any) => (
                <BeritaCard key={item.id} item={item} />
              ))
            ) : (
               <div className="col-span-3 text-center py-20 rounded-[40px] bg-gray-50 border border-dashed border-gray-200">
                  <Newspaper size={48} className="mx-auto opacity-10 mb-4" />
                  <p className="text-gray-400 font-medium italic">Belum ada berita terbaru saat ini.</p>
               </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <TestimonialSection />

      {/* Instagram Gallery Section */}
      <InstagramGallery />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
