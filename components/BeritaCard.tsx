'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Newspaper } from 'lucide-react';

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
  return (
    <Link 
      href={`/berita/${item.slug || item.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full border border-zinc-100"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-50">
        {item.foto ? (
          <Image 
            src={item.foto} 
            alt={item.judul} 
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Newspaper className="h-10 w-10 text-zinc-200" />
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
           <span className="px-2 py-1 bg-white/95 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-wider text-zinc-900 border border-zinc-200/50">
              {item.kategori_nama || item.kategori || 'Berita'}
           </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-bold text-zinc-900 mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
          {item.judul}
        </h3>
        <p className="text-xs text-zinc-400 mt-auto">
          {new Date(item.created_at).toLocaleDateString('id-ID', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          })}
        </p>
      </div>
    </Link>
  );
}
