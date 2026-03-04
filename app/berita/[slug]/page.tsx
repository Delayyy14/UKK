'use client';

import MainNavbar from '@/components/MainNavbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import { useEffect, useState } from 'react';
import { Calendar, User, Newspaper, ArrowLeft, Share2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Berita {
  id: number;
  judul: string;
  konten: string;
  foto: string;
  penulis: string;
  slug: string;
  kategori: string;
  kategori_nama: string;
  created_at: string;
}

export default function BeritaDetailPage({ params }: { params: { slug: string } }) {
  const [berita, setBerita] = useState<Berita | null>(null);
  const [otherBerita, setOtherBerita] = useState<Berita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBerita();
  }, [params.slug]);

  const fetchBerita = async () => {
    try {
      const res = await fetch('/api/berita');
      const data = await res.json();
      if (res.ok) {
        const item = data.find((b: Berita) => b.slug === params.slug || b.id.toString() === params.slug);
        setBerita(item || null);
        
        // Filter out current news and get max 5 others
        const others = data
          .filter((b: Berita) => b.id !== item?.id)
          .sort(() => 0.5 - Math.random()) // Randomize
          .slice(0, 5);
        setOtherBerita(others);
      }
    } catch (error) {
      console.error('Error fetching berita detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col pt-16">
      <MainNavbar />
      <div className="container mx-auto py-32 px-6 text-center text-zinc-400 font-medium">Memuat berita...</div>
      <Footer />
    </div>
  );

  if (!berita) return (
    <div className="min-h-screen bg-white flex flex-col pt-16">
      <MainNavbar />
      <div className="container mx-auto py-32 px-6 max-w-4xl text-center">
        <h2 className="text-3xl font-bold mb-4">Berita Tidak Ditemukan</h2>
        <Link href="/berita" className="text-blue-600 hover:underline flex items-center justify-center gap-2 font-bold">
           <ArrowLeft className="h-4 w-4" /> Kembali ke Berita
        </Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col pt-16">
      <MainNavbar />
      <div className="container mx-auto py-16 px-6">
        <div className="flex flex-col lg:flex-row gap-16 max-w-7xl mx-auto">
          
          {/* Main Content Area */}
          <div className="flex-1 max-w-4xl">
             <Link href="/berita" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-8 text-sm font-bold group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Kembali ke Berita
             </Link>

             <article>
                <div className="mb-4">
                   <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
                      {berita.kategori_nama || berita.kategori || 'Umum'}
                   </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight mb-8 leading-[1.2]">
                   {berita.judul}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 mb-10 text-sm text-zinc-400">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-400 text-xs">
                         {berita.penulis ? berita.penulis.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <span className="font-bold text-zinc-900">{berita.penulis || 'Admin'}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(berita.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                   </div>
                   <button className="flex items-center gap-2 hover:text-zinc-900 transition-colors ml-auto group font-bold">
                      <Share2 className="h-4 w-4" /> 
                      <span className="hidden sm:inline">Bagikan</span>
                   </button>
                </div>

                {berita.foto && (
                   <div className="rounded-[30px] overflow-hidden mb-10 shadow-sm border border-zinc-100">
                      <img 
                        src={berita.foto} 
                        alt={berita.judul} 
                        className="w-full h-auto object-cover max-h-[350px]" 
                      />
                   </div>
                )}
                
                <div className="text-black text-md leading-[1.8] whitespace-pre-wrap font-medium">
                   {berita.konten}
                </div>
             </article>
          </div>

          {/* Sidebar Area: Recommended/Random News */}
          <aside className="w-full lg:w-[350px] space-y-10">
             <div>
                <h3 className="text-xl font-black text-zinc-900 mb-8 flex items-center gap-3">
                   <div className="w-2 h-6 bg-blue-600 rounded-full" />
                   Berita Lainnya
                </h3>
                
                <div className="space-y-8">
                   {otherBerita.length > 0 ? (
                      otherBerita.map((item) => (
                         <Link 
                            key={item.id} 
                            href={`/berita/${item.slug || item.id}`}
                            className="group flex flex-col gap-4"
                         >
                            <div className="relative rounded-2xl overflow-hidden border border-zinc-100 shadow-sm">
                               {item.foto ? (
                                  <img 
                                    src={item.foto} 
                                    alt={item.judul} 
                                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500" 
                                  />
                               ) : (
                                  <div className="w-full h-32 bg-zinc-50 flex items-center justify-center">
                                     <Newspaper className="h-6 w-6 text-zinc-200" />
                                  </div>
                               )}
                            </div>
                            <div className="space-y-2">
                               <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                  {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                               </p>
                               <h4 className="text-sm font-bold text-zinc-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                                  {item.judul}
                               </h4>
                            </div>
                         </Link>
                      ))
                   ) : (
                      <div className="text-zinc-400 text-sm py-4 border border-dashed border-zinc-200 rounded-3xl text-center">
                         Tidak ada berita lain.
                      </div>
                   )}
                </div>
             </div>
          </aside>

        </div>
      </div>

      <Footer />
    </div>
  );
}
