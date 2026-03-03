import MainNavbar from '@/components/MainNavbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Clock, Shield, MapPin, Users, Package, Calendar, Heart, Newspaper } from 'lucide-react';
import pool from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import ContactSection from '@/components/ContactSection';
import TestimonialSection from '@/components/TestimonialSection';
import BeritaCard from '@/components/BeritaCard';

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
      <section className="relative min-h-[95vh] flex items-center justify-center px-6 md:px-12 lg:px-24 pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Text */}
          <div className="flex flex-col items-start text-left space-y-8 animate-in slide-in-from-left-8 duration-1000 z-10">

            <h1 className="text-5xl md:text-7xl lg:text-7xl font-serif font-medium tracking-tight text-gray-900 leading-[1.1]">
              Eksplorasi Alam Tanpa <br className="hidden lg:block"/>
              <span className="italic text-transparent bg-clip-text bg-blue-600">Batas & Kendala</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-xl font-light leading-relaxed">
              Lengkapi petualanganmu dengan peralatan pendakian kualitas premium. 
              Booking online, ambil di lokasi, dan nikmati perjalananmu dengan tenang.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
              <Button size="lg" className="rounded-full px-10 h-14 text-lg bg-gray-900 text-white hover:bg-gray-800 transition-all font-medium w-full sm:w-auto shadow-xl hover:shadow-2xl hover:-translate-y-1" asChild>
                <Link href="/products">
                  Mulai Pinjam Sekarang <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-10 h-14 text-lg border-gray-200 hover:bg-gray-50 font-medium w-full sm:w-auto" asChild>
                <Link href="#how-it-works">Cara Kerja</Link>
              </Button>
            </div>

            <div className="flex items-center gap-4 pt-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 font-medium">
                <span className="text-gray-900 font-bold">500+</span> Pendaki telah bergabung
              </p>
            </div>
          </div>

          {/* Right Column: Image - HIDDEN ON MOBILE */}
          <div className="relative w-full rounded-3xl overflow-hidden aspect-square lg:aspect-auto lg:h-[600px] hidden lg:flex items-center justify-center animate-in slide-in-from-right-8 duration-1000 delay-200 z-10">

  {/* Decorative blob */}
  <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/40 to-purple-200/40 blur-[100px] transform scale-110 animate-pulse" />

  <img 
    src="/images/person/hiking-image.jpeg" 
    alt="Hiking Image" 
    className="w-full h-full object-cover drop-shadow-2xl relative z-20 hover:scale-105 transition-transform duration-700"
  />
</div>
        </div>
      </section>

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
          <p className="text-gray-500 text-lg max-w-2xl mx-auto italic font-light">Kami memahami setiap langkah pendakianmu berharga.</p>
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
                <Badge className="bg-blue-600">Step by Step</Badge>
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
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-60 group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center space-y-4">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-4">
                      <ArrowRight className="w-10 h-10 rotate-[-45deg]" />
                    </div>
                    <h3 className="text-3xl font-bold uppercase tracking-tighter">Your Adventure Starts Here</h3>
                    <p className="text-blue-100 font-light">Kami temani langkahmu sampai puncak tertinggi.</p>
                  </div>
               </div>
               {/* Floating elements */}
               <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hidden md:block">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mari Menjelajah</p>
                      <p className="text-sm font-black text-gray-900">Persiapkan Diri Anda!</p>
                    </div>
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
