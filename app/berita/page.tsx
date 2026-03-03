'use client';

import MainNavbar from '@/components/MainNavbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import { useEffect, useState } from 'react';
import { Calendar, User, ArrowRight, Newspaper } from 'lucide-react';
import Link from 'next/link';
import EmptyState from '@/components/EmptyState';
import BeritaCard from '@/components/BeritaCard';

interface Berita {
  id: number;
  judul: string;
  konten: string;
  foto: string;
  penulis: string;
  slug: string;
  created_at: string;
}

export default function BeritaPage() {
  const [berita, setBerita] = useState<Berita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBerita();
  }, []);

  const fetchBerita = async () => {
    try {
      const res = await fetch('/api/berita');
      const data = await res.json();
      if (res.ok) {
        setBerita(data);
      }
    } catch (error) {
      console.error('Error fetching berita:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16">
      <MainNavbar />
      
      <PageHeader 
        title="Berita & Artikel" 
        breadcrumbItems={[
          { label: 'Beranda', href: '/' },
          { label: 'Berita', href: '/berita' },
        ]}
      />

      <div className="container mx-auto py-16 px-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-zinc-50 rounded-[40px] h-[450px]" />
            ))}
          </div>
        ) : berita.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {berita.map((item) => (
              <BeritaCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="py-20">
            <EmptyState type="data" />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
