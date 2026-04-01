import { Star, Quote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    name: "Andi Pratama",
    initials: "AP",
    badge: "Pelanggan Setia",
    content:
      "Sewa tenda dan carrier di sini gampang banget! Barangnya bersih, wangi, dan kondisinya masih sangat bagus. Siap buat nanjak lagi!",
    variant: "dark" as const,
  },
  {
    name: "Siti Nurhaliza",
    initials: "SN",
    badge: "Local Guide · 478 Ulasan",
    content:
      "Pilihan alatnya lengkap banget, mulai dari sepatu sampai sleeping bag deep sleep. Harga sewa terjangkau buat kantong mahasiswa. Recommended!",
    variant: "light" as const,
  },
  {
    name: "Budi Santoso",
    initials: "BS",
    badge: "Kalcer Boys",
    content:
      "Pelayanan ramah dan proses pengambilannya cepat. Ga perlu ribet nunggu lama. Fix jadi langganan buat trip selanjutnya.",
    variant: "muted" as const,
  },
];

const variantStyles = {
  dark: {
    card: "bg-[#2563eb] text-white", // Vibrant Royal Blue
    quote: "text-white/20",
    star: "text-yellow-400",
    text: "text-blue-50",
    avatar: "bg-white text-[#2563eb]",
    name: "text-white",
    badge: "text-blue-200",
    border: "border-transparent"
  },
  light: {
    card: "bg-white text-[#1e293b] border border-blue-100",
    quote: "text-blue-600/10",
    star: "text-blue-500",
    text: "text-slate-600",
    avatar: "bg-blue-600 text-white",
    name: "text-slate-900",
    badge: "text-blue-600",
    border: "border-blue-100"
  },
  muted: {
    card: "bg-[#eff6ff] text-[#1e293b]", // Very light blue tint
    quote: "text-blue-600/10",
    star: "text-blue-500",
    text: "text-slate-600",
    avatar: "bg-blue-100 text-blue-700",
    name: "text-slate-900",
    badge: "text-blue-500",
    border: "border-transparent"
  },
};

export default function TestimonialSection() {
  return (
    <section className="relative py-32 px-6 md:px-12 lg:px-24 overflow-hidden">
      
      {/* Background image */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <Image
          src="/images/svg/background-1.jpeg"
          alt="Background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]" />
      </div>

      {/* Decorative SVG */}
      <div className="absolute top-0 left-0 pointer-events-none -z-10 hidden md:block opacity-60">
        <svg
          width="400"
          height="400"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-blue-300"
        >
          <path
            d="M-50 200 C-50 100, 50 0, 150 0"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M-50 240 C-50 140, 50 40, 150 40"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M-50 280 C-50 180, 50 80, 150 80"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Header */}
      <div className="text-center mb-24 relative z-10">
        <h1 className="text-6xl md:text-8xl font-black text-blue-600/10 tracking-tighter mb-[-2rem] md:mb-[-3rem] uppercase select-none">
          TESTIMONIALS
        </h1>
        <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Apa Kata Mereka{" "}
          <span className="relative inline-block px-2">
            <span className="relative z-10">Tentang Kami</span>
            <Image
              src="/images/svg/effect-water-brush.png"
              alt="brush"
              width={260}
              height={60}
              className="absolute -bottom-8 left-0 w-full h-10 -z-10 opacity-60 scale-110"
            />
          </span>
        </h2>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start max-w-7xl mx-auto">
        {testimonials.map((item, idx) => {
          const style = variantStyles[item.variant];
          
          return (
            <div 
              key={idx}
              className={cn(
                "p-10 shadow-xl relative group hover:-translate-y-2 transition-all duration-500",
                style.card,
                idx % 2 === 0 ? "rounded-[60px_20px_60px_20px]" : "rounded-[20px_60px_20px_60px]",
                idx === 0 && "lg:mt-12",
                idx === 2 && "lg:mt-24"
              )}
            >
              <Quote className={cn("absolute top-8 right-10 w-12 h-12 transition-opacity", style.quote)} />
              
              <div className="space-y-6 relative z-10">
                <div className={cn("flex gap-1", style.star)}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>

                <p className={cn("text-xl font-medium leading-relaxed italic", style.text)}>
                  "{item.content}"
                </p>

                <div className={cn("flex items-center gap-4 pt-6 border-t", style.border === 'border-transparent' ? 'border-white/10' : style.border)}>
                  <div className={cn("w-14 h-14 rounded-full flex items-center justify-center font-black text-lg", style.avatar)}>
                    {item.initials}
                  </div>
                  <div>
                    <h4 className={cn("font-bold text-lg leading-tight", style.name)}>{item.name}</h4>
                    <p className={cn("text-xs uppercase tracking-[0.15em] font-bold mt-1", style.badge)}>
                      {item.badge}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
