'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Newspaper, User, Calendar } from 'lucide-react';

interface Berita {
  id: number;
  judul: string;
  konten?: string;
  foto?: string;
  penulis?: string;
  slug?: string;
  kategori?: string;
  kategori_nama?: string;
  created_at: string;
}

export default function BeritaCard({ item }: { item: Berita }) {
  const formattedDate = new Date(item.created_at).toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <Link 
      href={`/berita/${item.slug || item.id}`}
      className="group flex flex-col h-full bg-white rounded-[40px] p-6 shadow-xl shadow-gray-100/50 border border-gray-50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] mb-6">
        <div className="w-full h-full rounded-[30px] overflow-hidden relative shadow-sm group-hover:shadow-lg transition-all duration-500">
          {item.foto ? (
            <Image 
              src={item.foto} 
              alt={item.judul} 
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200">
              <Newspaper className="h-16 w-16" />
            </div>
          )}
        </div>
        
        {/* Overlapping Date Badge */}
        <div className="absolute -bottom-6 left-6 bg-white rounded-xl shadow-lg px-6 py-4 border border-gray-50 z-20">
          <p className="text-sm font-black text-gray-900 whitespace-nowrap">
            {item.kategori_nama}
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-8 px-2 flex flex-col flex-1">
        {/* Author Line */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full overflow-hidden relative border border-blue-100 bg-white/50 backdrop-blur-sm shadow-inner">
            <Image 
              src="/images/illustration/Logo-bg.png" 
              alt={item.penulis || 'Author'} 
              fill 
              className="object-contain p-1.5 transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
            BY {item.penulis || 'ADMIN'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-gray-900 mb-4 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
          {item.judul}
        </h3>

        {/* Short Content Excerpt */}
        {item.konten && (
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 font-medium opacity-80">
            {item.konten.replace(/<[^>]*>?/gm, '').substring(0, 120)}...
          </p>
        )}
      </div>
    </Link>
  );
}


