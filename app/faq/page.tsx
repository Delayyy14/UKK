'use client';

import MainNavbar from '@/components/MainNavbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import { useEffect, useState } from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import EmptyState from '@/components/EmptyState';

interface FAQ {
  id: number;
  pertanyaan: string;
  jawaban: string;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/faq');
      const data = await res.json();
      if (res.ok) {
        setFaqs(data);
      }
    } catch (error) {
      console.error('Error fetching FAQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.pertanyaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.jawaban.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16">
      <MainNavbar />
      
      <PageHeader 
        title="Frequently Asked Questions" 
        breadcrumbItems={[
          { label: 'Beranda', href: '/' },
          { label: 'FAQ', href: '/faq' },
        ]}
      />

      <div className="container mx-auto py-12 px-6 max-w-4xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Ada yang bisa kami bantu?</h2>
          <p className="text-muted-foreground">Cari jawaban untuk pertanyaan umum mengenai peminjaman alat di bawah ini.</p>
        </div>

        {/* Search FAQ */}
        <div className="relative mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            className="pl-12 h-14 text-lg rounded-2xl border-zinc-200 shadow-sm focus:ring-primary focus:border-primary"
            placeholder="Cari pertanyaan atau kata kunci..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredFaqs.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-4">
            {filteredFaqs.map((faq) => (
              <AccordionItem 
                key={faq.id} 
                value={`faq-${faq.id}`}
                className="bg-white border rounded-2xl px-6 py-2 shadow-sm transition-all hover:border-primary/50 overflow-hidden"
              >
                <AccordionTrigger className="text-left font-bold text-lg hover:no-underline py-4">
                  {faq.pertanyaan}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6 whitespace-pre-wrap">
                  {faq.jawaban}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="py-12">
             <EmptyState type={faqs.length === 0 ? "data" : "search"} />
             {faqs.length > 0 && (
                <div className="flex justify-center mt-6">
                   <button 
                      onClick={() => setSearchTerm('')}
                      className="text-primary font-bold hover:underline"
                    >
                      Tampilkan semua pertanyaan
                    </button>
                </div>
             )}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
