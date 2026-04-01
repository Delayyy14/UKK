"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useBanners, Banner } from "@/hooks/useBanners";
import { cn } from "@/lib/utils";

const FALLBACK_BANNERS: Banner[] = [
  {
    id: "fallback-1",
    title: "Eksplorasi Alam Tanpa Batas",
    paragraph:
      "Lengkapi petualanganmu dengan peralatan pendakian kualitas premium. Booking online, ambil di lokasi, nikmati perjalananmu.",
    background_url: "/images/person/hiking-image.jpeg",
    order_index: 0,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

const SLIDE_INTERVAL = 3000;

export default function HeroSection() {
  const { banners, loading } = useBanners();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const displayBanners = !loading && banners.length > 0 ? banners : FALLBACK_BANNERS;
  const total = displayBanners.length;

  const goTo = useCallback(
    (index: number) => {
      if (transitioning) return;
      setTransitioning(true);
      setPrevIndex(current);
      setCurrent((index + total) % total);
      setTimeout(() => {
        setPrevIndex(null);
        setTransitioning(false);
      }, 700);
    },
    [current, total, transitioning]
  );

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(() => {
      goTo(current + 1);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, current, total, goTo]);

  const banner = displayBanners[current];

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images */}
      {displayBanners.map((b, i) => (
        <div
          key={b.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-in-out",
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <Image
            src={b.background_url}
            alt={b.title}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 z-20" />

      {/* Center Content */}
      <div className="relative z-30 flex flex-col items-center justify-center text-center px-6 md:px-16 max-w-4xl mx-auto">
        <h1
          key={`title-${current}`}
          className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight uppercase animate-in fade-in duration-700"
        >
          {banner.title}
        </h1>
        <p
          key={`para-${current}`}
          className="mt-6 text-base md:text-lg text-white/80 max-w-2xl leading-relaxed animate-in fade-in duration-700 delay-150"
        >
          {banner.paragraph}
        </p>
      </div>

      {/* Arrow Left */}
      {total > 1 && (
        <button
          onClick={prev}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full border-2 border-white/70 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Arrow Right */}
      {total > 1 && (
        <button
          onClick={next}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full border-2 border-white/70 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Bottom: Dots + Chevron Down */}
      <div className="absolute bottom-8 left-0 right-0 z-30 flex flex-col items-center gap-4">
        {/* Dots */}
        {total > 1 && (
          <div className="flex items-center gap-2">
            {displayBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === current
                    ? "w-6 h-2 bg-white"
                    : "w-2 h-2 bg-white/40 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        )}

        {/* Chevron Down - no animation */}
        <ChevronDown className="w-7 h-7 text-white/80" />
      </div>
    </section>
  );
}