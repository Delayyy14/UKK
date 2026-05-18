"use client";

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, Loader2, Lightbulb, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: any}[]>([
    {
      role: 'ai',
      content: {
        type: 'text',
        text: 'Halo! Saya AI Assistant PinjamLe. Ceritakan rencana aktivitas outdoor Anda (misal: "Camping 2 hari di gunung Prau, cuaca hujan, 3 orang"), dan saya akan merekomendasikan perlengkapan yang tepat!'
      }
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isLoading) return;

    const userQuery = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: { type: 'text', text: userQuery } }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userQuery })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');

      setMessages(prev => [...prev, { role: 'ai', content: { type: 'recommendation', data } }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'ai', content: { type: 'text', text: error.message || 'Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.' } }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl transition-all duration-300 z-50 bg-gray-900 hover:bg-black hover:scale-105 active:scale-95 text-white flex items-center justify-center border-4 border-white",
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        )}
      >
        <Bot className="h-7 w-7" />
      </Button>

      <div
        className={cn(
          "fixed bottom-6 right-6 w-[400px] max-w-[calc(100vw-3rem)] h-[650px] max-h-[calc(100vh-3rem)] bg-white rounded-3xl shadow-2xl flex flex-col z-50 transition-all duration-300 origin-bottom-right overflow-hidden border border-gray-100",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-white p-5 flex items-center justify-between border-b border-gray-100 relative">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-sm">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">AI Gear Assistant</h3>
              <p className="text-gray-500 text-xs font-medium">Asisten Cerdas PinjamLe</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 h-9 w-9 rounded-full transition-colors" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#f8fafc]">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-3 max-w-[90%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
              <div className={cn("flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-sm", msg.role === 'user' ? "bg-gray-900 text-white" : "bg-blue-600 text-white")}>
                {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>
              <div className={cn("p-4 rounded-2xl text-sm shadow-sm", msg.role === 'user' ? "bg-gray-900 text-white rounded-tr-sm" : "bg-white border border-gray-100 rounded-tl-sm text-gray-700")}>
                {msg.content.type === 'text' ? (
                  <p className="leading-relaxed">{msg.content.text}</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold uppercase tracking-wider">{msg.content.data.trip_type}</span>
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold uppercase tracking-wider">{msg.content.data.difficulty}</span>
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold uppercase tracking-wider">{msg.content.data.weather}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="font-bold text-gray-900 text-xs uppercase tracking-wider border-b pb-2 border-gray-100">Rekomendasi Alat</p>
                      {msg.content.data.recommendations?.map((rec: any, idx: number) => (
                        <div key={idx} className="bg-[#f8fafc] p-3 rounded-xl border border-gray-100 transition-colors hover:border-blue-200 hover:bg-blue-50/30">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{rec.name}</p>
                              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1.5 mt-0.5">{rec.category}</p>
                            </div>
                            <Link href={`/products?q=${encodeURIComponent(rec.name)}`} onClick={() => setIsOpen(false)}>
                              <Button size="sm" variant="outline" className="h-7 text-[10px] px-2.5 rounded-lg bg-white border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 shadow-sm transition-all flex items-center gap-1 font-bold">
                                <Search className="w-3 h-3" /> Cari
                              </Button>
                            </Link>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed mt-1">{rec.reason}</p>
                        </div>
                      ))}
                    </div>

                    {msg.content.data.tips && (
                      <div className="mt-4 bg-blue-50/80 p-3.5 rounded-xl border border-blue-100 text-blue-900 text-xs">
                        <span className="font-bold mb-1.5 flex items-center gap-1.5 text-blue-700">
                          <Lightbulb className="w-4 h-4" /> Tips Penting
                        </span> 
                        <span className="text-blue-800/90 leading-relaxed block">{msg.content.data.tips}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-sm text-gray-500 font-medium">Menganalisa kebutuhan...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik rencana aktivitas Anda..."
              className="flex-1 bg-[#f8fafc] border border-gray-200 rounded-full px-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:font-normal"
              disabled={isLoading}
            />
            <Button type="submit" disabled={!query.trim() || isLoading} className="rounded-full w-12 h-12 p-0 flex-shrink-0 bg-gray-900 hover:bg-black transition-colors shadow-sm">
              <Send className="h-5 w-5 ml-1" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
