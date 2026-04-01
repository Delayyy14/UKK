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

      {/* Stats Section */}
      <section className="py-12 px-6 bg-white/40 border-y border-gray-100 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Total Alat', value: '150+', icon: Package },
              { label: 'Peminjam Aktif', value: '450+', icon: Users },
              { label: 'Transaksi Sukses', value: '1.2K', icon: CheckCircle },
              { label: 'Kepuasan Peminjam', value: '4.9/5', icon: Heart },
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="flex justify-center">
                  <stat.icon className="h-5 w-5 text-blue-600/50" />
                </div>
                <div className="text-3xl font-black text-gray-900">{stat.value}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-6 md:px-12 lg:px-24">
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900">Mengapa Harus Di Sini?</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto relative z-10">
          {[
            {
              icon: Clock,
              title: "Serba Instan",
              desc: "Proses cepat tanpa ribet manual. Klik, bayar, berangkat.",
              color: "text-blue-600",
              bg: "bg-blue-50"
            },
            {
              icon: Shield,
              title: "Kualitas Terjamin",
              desc: "Alat disterilkan & diperiksa kondisinya sebelum dipinjamkan.",
              color: "text-purple-600",
              bg: "bg-purple-50"
            },
            {
              icon: CheckCircle,
              title: "Stok Akurat",
              desc: "Data stok real-time, tidak perlu takut alat habis saat di toko.",
              color: "text-pink-600",
              bg: "bg-pink-50"
            },
            {
              icon: MapPin,
              title: "Lokasi Strategis",
              desc: "Dekat dengan jalur utama pendakian, mudah diakses kendaraan.",
              color: "text-indigo-600",
              bg: "bg-indigo-50"
            }
          ].map((feature, i) => (
            <div key={i} className="group p-8 rounded-[40px] bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:border-blue-100 hover:-translate-y-2 transition-all duration-500">
              <div className={`w-16 h-16 rounded-3xl ${feature.bg} flex items-center justify-center mb-8 ${feature.color} group-hover:rotate-12 transition-all duration-500 shadow-inner`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">{feature.desc}</p>
            </div>
          ))}
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

            <div className="relative order-1 lg:order-2">
               <div className="aspect-square rounded-[60px] bg-gradient-to-br from-blue-600 to-purple-700 shadow-2xl overflow-hidden relative group">
                  <Image 
                    src="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070&auto=format&fit=crop" 
                    alt="Adventure Background" 
                    fill 
                    className="object-cover mix-blend-overlay opacity-60 group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center space-y-4">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-4">
                      <ArrowRight className="w-10 h-10 rotate-[-45deg]" />
                    </div>
                    <h3 className="text-3xl font-bold uppercase tracking-tighter">Your Adventure Starts Here</h3>
                    <p className="text-blue-100 font-light">Kami temani langkahmu sampai puncak tertinggi.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section className="relative py-32 px-6 md:px-12 lg:px-24 bg-white">
        <div className="flex flex-col items-start md:flex-row justify-between md:items-end mb-16 max-w-7xl mx-auto gap-4">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">Peralatan Pilihan</h2>
            <p className="text-gray-500 text-lg font-light tracking-wide italic">"Quality tools for quality hike."</p>
          </div>

          <Button size="lg" variant="ghost" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 group font-bold">
            <Link href="/products" className="flex items-center">
              Lihat Semua Katalog <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
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
      </section>

{/* News Preview Section */}
      <section className="relative py-32 px-6 md:px-12 lg:px-24 bg-gray-50/30">
        <div className="flex flex-col items-start md:flex-row justify-between md:items-end mb-16 max-w-7xl mx-auto gap-4">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">Berita Terbaru</h2>
            <p className="text-gray-500 text-lg font-light tracking-wide italic">"Stay updated with our latest stories."</p>
          </div>

          <Button size="lg" variant="ghost" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 group font-bold">
            <Link href="/berita" className="flex items-center">
              Lihat Semua Berita <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </Button>
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
