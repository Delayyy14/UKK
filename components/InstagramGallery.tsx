'use client';

import Image from 'next/image';
import { Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';

const images = [
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1533580905277-379a2628f4c4?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=2073&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=2076&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1496080174650-637e3f22fa03?q=80&w=1906&auto=format&fit=crop"
];

export default function InstagramGallery() {
  return (
    <section className="relative py-40 bg-white overflow-hidden">
      {/* Curved Top Divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[300px] bg-white rounded-[50%] -translate-y-[80%] z-20 shadow-[0_-50px_100px_-20px_rgba(0,0,0,0.03)]" />

      <div className="max-w-7xl mx-auto px-6 text-center mb-16 relative z-30">
        <p className="text-blue-600 font-bold text-sm uppercase tracking-[0.2em] mb-4">Follow kami!</p>
        <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-8 lowercase">@pinjamle.outdoor</h2>
        
        <Button variant="outline" className="rounded-full px-8 py-6 border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-all gap-2">
          <Instagram className="w-5 h-5" />
          Follow
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-2">
        {images.map((src, i) => (
          <div key={i} className="aspect-square relative overflow-hidden group cursor-pointer">
            <Image 
              src={src} 
              alt={`Gallery image ${i}`} 
              fill 
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <Instagram className="text-white w-8 h-8 scale-0 group-hover:scale-100 transition-transform duration-500" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
