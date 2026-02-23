'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { FileUp, Download, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ImportExcelProps {
  apiUrl: string;
  onSuccess: () => void;
  title: string;
  templateData: any[];
  fileName: string;
}

export default function ImportExcel({ apiUrl, onSuccess, title, templateData, fileName }: ImportExcelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `${fileName}_template.xlsx`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const processedData = XLSX.utils.sheet_to_json(ws);
        
        if (processedData.length === 0) {
          setError("File Excel kosong atau tidak memiliki data yang valid.");
          setData([]);
          return;
        }

        setData(processedData);
        setError(null);
      } catch (err) {
        setError("Gagal membaca file Excel. Pastikan format file benar.");
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (data.length === 0) return;
    
    setLoading(true);
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: data }),
      });

      if (res.ok) {
        toast({
          title: "Berhasil!",
          description: `${data.length} data berhasil diimport.`,
          variant: "success",
        });
        setOpen(false);
        setData([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onSuccess();
      } else {
        const errData = await res.json();
        setError(errData.error || "Gagal mengimport data.");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem saat mengimport data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
            setData([]);
            setError(null);
        }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FileUp size={16} />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Data {title}</DialogTitle>
          <DialogDescription>
            Silakan unduh template Excel terlebih dahulu untuk memastikan format data sesuai.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Button 
            variant="secondary" 
            className="w-full flex items-center gap-2 justify-center"
            onClick={handleDownloadTemplate}
          >
            <Download size={16} />
            Unduh Template Excel
          </Button>

          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              id="excel-upload"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <label htmlFor="excel-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                  <FileUp size={24} />
                </div>
                <div className="text-sm font-medium">
                  {data.length > 0 ? (
                    <span className="text-blue-600">{data.length} baris data terdeteksi</span>
                  ) : (
                    "Klik atau tarik file Excel ke sini"
                  )}
                </div>
                <p className="text-xs text-gray-400">Hanya file .xlsx atau .xls</p>
              </div>
            </label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {data.length > 0 && !error && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">File SIAP Diimport</p>
                <p className="text-xs text-emerald-600">Terdeteksi {data.length} baris data yang akan dimasukkan ke sistem.</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Batal
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={data.length === 0 || loading || !!error}
            className="flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Import Sekarang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
