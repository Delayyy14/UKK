"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useBanners, Banner } from "@/hooks/useBanners";
import { cn } from "@/lib/utils";
import gsap from "gsap";

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

const SLIDE_INTERVAL = 5000; // Increased interval for better visibility of animations

export default function HeroSection() {
  const { banners, loading } = useBanners();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayBanners = !loading && banners.length > 0 ? banners : FALLBACK_BANNERS;
  const total = displayBanners.length;

  const animateIn = useCallback(() => {
    const tl = gsap.timeline();
    tl.fromTo(titleRef.current, 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1, ease: "power4.out" }
    );
    tl.fromTo(paraRef.current, 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
      "-=0.7"
    );
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (transitioning) return;
      setTransitioning(true);
      
      // Animate out current text
      gsap.to([titleRef.current, paraRef.current], {
        y: -30,
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          setCurrent((index + total) % total);
          setTransitioning(false);
        }
      });
    },
    [total, transitioning]
  );

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  useEffect(() => {
    animateIn();
  }, [current, animateIn]);

  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(() => {
      next();
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, total, next]);

  const banner = displayBanners[current];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images */}
      {displayBanners.map((b, i) => (
        <div
          key={b.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <Image
            src={b.background_url}
            alt={b.title}
            fill
            priority={i === 0}
            className={cn(
              "object-cover transition-transform duration-[5000ms] ease-linear",
              i === current ? "scale-110" : "scale-100"
            )}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 z-20" />

      {/* Center Content */}
      <div className="relative z-30 flex flex-col items-center justify-center text-center px-6 md:px-16 max-w-5xl mx-auto">
        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tighter uppercase drop-shadow-2xl"
        >
          {banner.title}
        </h1>
        <p
          ref={paraRef}
          className="mt-8 text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed font-medium drop-shadow-lg"
        >
          {banner.paragraph}
        </p>
      </div>

      {/* Arrow Left */}
      {total > 1 && (
        <button
          onClick={prev}
          className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 group"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
      )}

      {/* Arrow Right */}
      {total > 1 && (
        <button
          onClick={next}
          className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 group"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {/* Bottom Decoration */}
      <div className="absolute bottom-12 left-0 right-0 z-30 flex flex-col items-center gap-6">
        {total > 1 && (
          <div className="flex items-center gap-3">
            {displayBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "h-1.5 transition-all duration-500 rounded-full",
                  i === current
                    ? "w-12 bg-white"
                    : "w-3 bg-white/30 hover:bg-white/60"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}