'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle, Loader2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ContactSection() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const sectionRef = useRef<HTMLDivElement>(null);
  const leftSideRef = useRef<HTMLDivElement>(null);
  const rightSideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData(prev => ({
        ...prev,
        name: parsedUser.nama || '',
        email: parsedUser.email || '',
      }));
    }

    const ctx = gsap.context(() => {
      gsap.from(leftSideRef.current, {
        scrollTrigger: {
          trigger: leftSideRef.current,
          start: "top 80%",
        },
        x: -50,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
      });

      gsap.from(rightSideRef.current, {
        scrollTrigger: {
          trigger: rightSideRef.current,
          start: "top 80%",
        },
        x: 50,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Something went wrong');
      
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 5000); 
    } catch (err) {
      setError('Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section ref={sectionRef} id="contact" className="relative py-32 px-4 sm:px-6 lg:px-8 bg-white text-gray-900 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-blue-100/60 blur-[100px]" />
        <div className="absolute top-[30%] -right-[10%] w-[35%] h-[35%] rounded-full bg-purple-100/60 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-pink-100/50 blur-[80px]" />
      </div>

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Left Side: Content */}
        <div ref={leftSideRef} className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter uppercase">
              Hubungi<br/><span className="text-blue-600">Kami</span>
            </h2>
            <p className="text-gray-500 text-xl leading-relaxed max-w-lg font-medium">
              Punya pertanyaan atau saran? Kami ingin mendengar dari Anda. Kirimkan pesan kepada kami dan kami akan merespons secepat mungkin.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-6 p-6 rounded-3xl bg-gray-50/50 border border-gray-100 backdrop-blur-sm group hover:bg-white transition-all duration-500 shadow-sm">
              <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest">Email Kami</h3>
                <p className="text-gray-900 text-lg font-bold">naufalazkaannahl@gmail.com</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 p-6 rounded-3xl bg-gray-50/50 border border-gray-100 backdrop-blur-sm group hover:bg-white transition-all duration-500 shadow-sm">
              <div className="p-4 rounded-2xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest">Kunjungi Kami</h3>
                <p className="text-gray-900 text-lg font-bold">Ponorogo, Jawa Timur, Indonesia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div ref={rightSideRef} className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/50 to-purple-100/50 rounded-[40px] transform rotate-3 scale-[1.02] blur-xl opacity-50" />
          
          <div className="relative bg-white border border-gray-100 rounded-[40px] p-10 md:p-14 shadow-2xl shadow-gray-200/50">
            <h3 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Kirim Pesan</h3>
            
            <form onSubmit={handleSubmit} className="space-y-8 relative">
              {!user && (
                <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[4px] rounded-3xl flex flex-col items-center justify-center p-6 text-center">
                  <div className="bg-white p-10 rounded-[32px] shadow-2xl border border-gray-100 max-w-[320px]">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Login Diperlukan</h4>
                    <p className="text-sm text-gray-500 mb-8">
                      Silakan masuk ke akun Anda terlebih dahulu untuk Mengirimkan Pesan.
                    </p>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center w-full px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg hover:shadow-blue-200"
                    >
                      Masuk Sekarang
                    </Link>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Nama</label>
                  <input
                    id="name"
                    type="text"
                    required
                    disabled={!user}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
                    placeholder="Nama Anda"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    disabled={!user}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Subjek</label>
                <input
                  id="subject"
                  type="text"
                  required
                  disabled={!user}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
                  placeholder="Ada yang bisa kami bantu?"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Pesan</label>
                <textarea
                  id="message"
                  required
                  disabled={!user}
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white resize-none disabled:opacity-50 transition-all"
                  placeholder="Tulis pesan Anda di sini..."
                />
              </div>

              {error && (
                <div className="p-6 rounded-2xl bg-red-50 border border-red-100 text-red-600 font-bold text-sm">
                  {error}
                </div>
              )}

              {success ? (
                <div className="flex items-center justify-center space-x-3 w-full py-5 rounded-2xl bg-green-50 text-green-600 font-bold border border-green-100 animate-in zoom-in duration-300">
                  <CheckCircle className="w-6 h-6" />
                  <span>Pesan Berhasil Dikirim!</span>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !user}
                  className="w-full group relative flex items-center justify-center space-x-3 py-5 rounded-2xl bg-gray-900 hover:bg-blue-600 text-white font-bold transition-all shadow-xl hover:shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span>Kirim Pesan</span>
                      <Send className="w-6 h-6 group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
