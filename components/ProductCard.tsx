'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  item: any;
}

export default function ProductCard({ item }: ProductCardProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleBooking = () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    // Redirect to booking page with selected items
    router.push(`/peminjam/pinjam?alat_id=${item.id}&jumlah_booking=1`);
  };

  return (
    <>
      <Card className="overflow-hidden group hover:shadow-lg transition-all border-none shadow-sm bg-card/50">
        <div className="aspect-video bg-muted relative overflow-hidden rounded-t-lg">
          {item.foto ? (
            <Image 
              src={item.foto} 
              alt={item.nama}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-secondary">
              No Image
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant={item.jumlah_tersedia > 0 ? "default" : "destructive"}>
              {item.jumlah_tersedia > 0 ? "Tersedia" : "Habis"}
            </Badge>
          </div>
        </div>
        <CardHeader className="p-4 pb-2">
          <Badge variant="outline" className="w-fit mb-2 text-xs">{item.kategori_nama || 'Umum'}</Badge>
          <CardTitle className="text-lg line-clamp-1">{item.nama}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {item.deskripsi || "Tidak ada deskripsi."}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm font-medium gap-2">
          <span className="text-muted-foreground">Harga: {item.harga_per_hari} / Hari</span>
          <Button 
            size="sm" 
            variant="default"
            disabled={item.jumlah_tersedia === 0}
            onClick={handleBooking}
          >
            {item.jumlah_tersedia > 0 ? "Booking Alat" : "Stok Habis"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eits, Login dulu yuk!</DialogTitle>
            <DialogDescription>
              Kamu harus login terlebih dahulu untuk melakukan booking alat.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4 justify-center">
             <Button variant="outline" onClick={() => setShowLoginDialog(false)}>Batal</Button>
             <Button asChild>
                <Link href="/login">Login Sekarang</Link>
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
