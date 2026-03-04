'use client';

import { useEffect, useState } from 'react';
import MainNavbar from '@/components/MainNavbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import BeritaCatalog from '@/components/BeritaCatalog';

export default function BeritaPage() {
  const [berita, setBerita] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchBerita(), fetchCategories()]).finally(() => {
      setLoading(false);
    });
  }, []);

  const fetchBerita = async () => {
    try {
      const res = await fetch('/api/berita');
      if (res.ok) {
        const data = await res.json();
        setBerita(data);
      }
    } catch (error) {
      console.error('Error fetching berita:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/berita/kategori');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching berita categories:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pt-16">
      <MainNavbar />
      
      <PageHeader 
        title="Berita & Artikel" 
        description="Temukan berita dan artikel terbaru"
        breadcrumbItems={[
          { label: 'Beranda', href: '/' },
          { label: 'Berita', href: '/berita' },
        ]}
      />

      <div className="container mx-auto py-16 px-6">
        {loading ? (
          <div className="space-y-12">
             <div className="flex flex-col sm:flex-row gap-4">
                <div className="h-12 bg-zinc-50 rounded-2xl flex-1 animate-pulse" />
                <div className="h-12 bg-zinc-50 rounded-2xl w-32 animate-pulse" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {[1, 2, 3, 4, 5, 6].map(i => (
                 <div key={i} className="bg-zinc-50 rounded-[30px] h-[400px] animate-pulse" />
               ))}
             </div>
          </div>
        ) : (
          <BeritaCatalog berita={berita} categories={categories} />
        )}
      </div>

      <Footer />
    </div>
  );
}
