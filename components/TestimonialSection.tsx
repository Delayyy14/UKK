'use client';

import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const testimonials = [
  {
    name: "Andi Pratama",
    content: "Sewa tenda dan carrier di sini gampang banget! Barangnya bersih, wangi, dan kondisinya masih sangat bagus. Siap buat nanjak lagi!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Andi"
  },
  {
    name: "Siti Nurhaliza",
    content: "Pilihan alatnya lengkap banget, mulai dari sepatu sampai sleeping bag deep sleep. Harga sewa terjangkau buat kantong mahasiswa. Recommended!",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti"
  },
  {
    name: "Budi Santoso",
    content: "Pelayanan ramah dan proses pengambilannya cepat. Ga perlu ribet nunggu lama. Fix jadi langganan buat trip selanjutnya.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi"
  }
];

export default function TestimonialSection() {
  return (
    <section className="relative py-24 px-6 md:px-12 lg:px-24 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
                src="/images/svg/background-1.jpeg" 
                alt="Background" 
                className="w-full h-full object-cover"
            />
            {/* White overlay to ensure text readability while showing the background */}
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
        </div>

        {/* Decorative Lines - Concentric Arcs */}
        <div className="absolute top-0 left-0 pointer-events-none -z-10 hidden md:block opacity-60">
             <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-200">
                <path d="M-50 200 C-50 100, 50 0, 150 0" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M-50 240 C-50 140, 50 40, 150 40" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M-50 280 C-50 180, 50 80, 150 80" stroke="currentColor" strokeWidth="2" fill="none" />
             </svg>
        </div>

      <div className="text-center mb-16 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-600 tracking-tight mb-4">TESTIMONIALS</h1>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">What Our Clients Say About Us</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10">
        {testimonials.map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col justify-between hover:-translate-y-2 transition-transform duration-300">
            <div>
                <p className="text-gray-600 leading-relaxed mb-6">
                "{item.content}"
                </p>
            </div>
            
            <div>
                <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 leading-none mb-1">{item.name}</h4>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
