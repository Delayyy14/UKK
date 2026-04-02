'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Newspaper, User, Calendar, ArrowRight } from 'lucide-react';

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
      className="group flex flex-col h-full bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100"
    >
      {/* Image Container - Top Aligned */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {item.foto ? (
          <Image 
            src={item.foto} 
            alt={item.judul} 
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out p-3 rounded-[32px]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200">
            <Newspaper className="h-12 w-12 opacity-20" />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-8 flex flex-col flex-1">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
          {item.judul}
        </h3>

        {/* Short Content / Info Excerpt */}
        <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">
          {item.konten ? item.konten.replace(/<[^>]*>?/gm, '').substring(0, 100) : 'Informasi terbaru dari kami untuk Anda.'}...
        </p>
        
        {/* Separator & Date at Bottom */}
        <div className="mt-auto pt-6 border-t border-gray-100">
           <span className="text-gray-400 text-sm italic font-medium">
              {formattedDate}
           </span>
        </div>
      </div>
    </Link>
  );
}


