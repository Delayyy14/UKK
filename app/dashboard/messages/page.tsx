'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, Trash, Pencil } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [messagesPerPage] = useState(10);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/messages')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
             console.error("Invalid data format", data);
        }
      })
      .catch(err => console.error("Failed to fetch messages", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
     return <Layout><div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div></Layout>;
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus pesan ini?')) {
      fetch(`/api/messages/${id}`, {
        method: 'DELETE',
      })
        .then((res) => res.json())
        .then(() => {
          setMessages(messages.filter((msg) => msg.id !== id));
        })
        .catch((err) => console.error('Failed to delete message', err));
    }
  };

  const handleEdit = (id: number) => {
    const message = messages.find((msg) => msg.id === id);
    if (message) {
      setSelectedMessage(message);
      setIsEditModalOpen(true);
    }
  }

  const handleUpdate = () => {
    if (!selectedMessage) return;

    fetch(`/api/messages/${selectedMessage.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedMessage),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessages(messages.map((msg) => msg.id === selectedMessage.id ? selectedMessage : msg));
          setIsEditModalOpen(false);
          setSelectedMessage(null);
        } else {
          console.error("Gagal update pesan:", data.error);
        }
      })
      .catch((err) => console.error("Failed to update message", err));
  };

  return (
    <Layout>
      <Breadcrumb 
        title="Pesan Masuk" 
        description="Lihat dan kelola pesan dari users melalui halaman kontak."
        icon={Mail}
      />
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pesan</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subjek</TableHead>
                  <TableHead>Pesan</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Belum ada pesan masuk.
                    </TableCell>
                  </TableRow>
                ) : (
                  messages.map((msg) => (
                    <TableRow key={msg.id}>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(msg.created_at).toLocaleDateString('id-ID')} {new Date(msg.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                      </TableCell>
                      <TableCell className="font-medium">{msg.name}</TableCell>
                      <TableCell>{msg.email}</TableCell>
                      <TableCell>{msg.subject}</TableCell>
                      <TableCell className="max-w-md truncate" title={msg.message}>{msg.message}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(msg.id)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(msg.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-between">
              <p className="text-sm text-muted-foreground">
                Menampilkan {messages.length} dari {messages.length} pesan
              </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Pesan</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  value={selectedMessage.name}
                  onChange={(e) => setSelectedMessage({ ...selectedMessage, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={selectedMessage.email}
                  onChange={(e) => setSelectedMessage({ ...selectedMessage, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subjek</Label>
                <Input
                  id="subject"
                  value={selectedMessage.subject}
                  onChange={(e) => setSelectedMessage({ ...selectedMessage, subject: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Pesan</Label>
                <Textarea
                  id="message"
                  className="resize-none"
                  rows={4}
                  value={selectedMessage.message}
                  onChange={(e) => setSelectedMessage({ ...selectedMessage, message: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
            <Button onClick={handleUpdate}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
