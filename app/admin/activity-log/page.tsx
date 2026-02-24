'use client';

import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import Pagination from '@/components/Pagination';   
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ActivityLog {
  id: number;
  user_id: number;
  user_nama?: string;
  action: string;
  table_name: string;
  record_id: number;
  details: any;
  ip_address: string;
  created_at: string;
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/activity-log');
      const data = await res.json();
      if (res.ok) {
        setLogs(data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className="flex justify-center p-8">Loading...</div></Layout>;

  

  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
  const paginatedLogs = logs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Layout>
      <Breadcrumb
        title="Log Aktifitas"
        description="Lihat riwayat aktivitas sistem. Pantau semua aksi yang dilakukan oleh pengguna termasuk create, update, delete, dan aktivitas lainnya."
        icon={FileText}
      />

      <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Record ID</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Waktu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.id}</TableCell>
                <TableCell>{log.user_nama || log.user_id || 'System'}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.table_name || '-'}</TableCell>
                <TableCell>{log.record_id || '-'}</TableCell>
                <TableCell>{log.ip_address || '-'}</TableCell>
                <TableCell>
                  {new Date(log.created_at).toLocaleString('id-ID')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4 text-center sm:text-left">
        <span className="text-sm text-muted-foreground">
          Menampilkan {paginatedLogs.length} dari {logs.length} data logs.
        </span>
      

      <Pagination
         currentPage={currentPage}
         totalPages={totalPages}
         onPageChange={setCurrentPage}
      />
      </div>

    </Layout>
  );
}