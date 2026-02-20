'use client';

import { useState } from 'react';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
    <section id="contact" className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white text-gray-900 overflow-hidden">
      {/* Background decorations - Clean white with soft faded circles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Soft pastel faded circles */}
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-blue-100/60 blur-[100px]" />
        <div className="absolute top-[30%] -right-[10%] w-[35%] h-[35%] rounded-full bg-purple-100/60 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-pink-100/50 blur-[80px]" />
      </div>

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Content */}
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Hubungi Kami
            </h2>
            <p className="mt-4 text-gray-600 text-lg leading-relaxed max-w-lg">
              Punya pertanyaan atau saran? Kami ingin mendengar dari Anda. Kirimkan pesan kepada kami dan kami akan merespons secepat mungkin.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold">Email Kami</h3>
                <p className="text-gray-500">support@example.com</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="p-3 rounded-full bg-purple-50 text-purple-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold">Kunjungi Kami</h3>
                <p className="text-gray-500">Jl. Raya Ponorogo No. 123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="relative">
          {/* Subtle decoration behind the form */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-purple-50 rounded-3xl transform rotate-2 scale-[1.02]" />
          
          <div className="relative bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-xl shadow-gray-100/50">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Kirim Pesan</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">Nama</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:bg-white"
                    placeholder="Nama Anda"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:bg-white"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-gray-700">Subjek</label>
                <input
                  id="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:bg-white"
                  placeholder="Ada yang bisa kami bantu?"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-gray-700">Pesan</label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:bg-white resize-none"
                  placeholder="Tulis pesan Anda di sini..."
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {success ? (
                <div className="flex items-center justify-center space-x-2 w-full py-4 rounded-xl bg-green-50 text-green-600 font-medium border border-green-100">
                  <CheckCircle className="w-5 h-5" />
                  <span>Pesan Berhasil Dikirim!</span>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group relative flex items-center justify-center space-x-2 py-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Kirim Pesan</span>
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
