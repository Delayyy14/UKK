'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, Trash, Pencil, Reply, Send } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Swal from 'sweetalert2';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
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
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'unreplied' | 'replied'>('all');
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = () => {
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
  }

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Apakah anda yakin?',
      text: "Pesan ini akan dihapus secara permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/api/messages/${id}`, {
          method: 'DELETE',
        })
          .then((res) => res.json())
          .then(() => {
            setMessages(messages.filter((msg) => msg.id !== id));
            toast({ title: 'Berhasil', description: 'Pesan berhasil dihapus', variant: 'success' });
          })
          .catch((err) => {
            console.error('Failed to delete message', err);
            toast({ title: 'Error', description: 'Gagal menghapus pesan', variant: 'destructive' });
          });
      }
    });
  };

  const handleEdit = async (id: number) => {
    const message = messages.find((msg) => msg.id === id);
    if (message) {
      setSelectedMessage(message);
      setIsEditModalOpen(true);
      
      // Mark as read automatically if it's currently unread
      if (message.status === 'unread') {
        try {
          const updatedMessage = { ...message, status: 'read' as const };
          await fetch(`/api/messages/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedMessage),
          });
          setMessages(prev => prev.map(m => m.id === id ? updatedMessage : m));
        } catch (err) {
          console.error("Failed to mark as read", err);
        }
      }
    }
  }

  const handleOpenReply = (message: Message) => {
    setSelectedMessage(message);
    setReplyText('');
    setIsReplyModalOpen(true);
  }

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setIsReplying(true);
    try {
      const res = await fetch(`/api/messages/${selectedMessage.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: 'Berhasil', description: 'Balasan terkirim ke email user', variant: 'success' });
        setIsReplyModalOpen(false);
        fetchMessages(); // Refresh to update status
      } else {
        toast({ title: 'Gagal', description: data.error || 'Gagal mengirim balasan', variant: 'destructive' });
      }
    } catch (err) {
      console.error('Reply error:', err);
      toast({ title: 'Error', description: 'Terjadi kesalahan sistem', variant: 'destructive' });
    } finally {
      setIsReplying(false);
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
          setMessages(messages.map((msg) => msg.id === selectedMessage.id ? (selectedMessage as Message) : msg));
          setIsEditModalOpen(false);
          setSelectedMessage(null);
          toast({ title: 'Berhasil', description: 'Pesan berhasil diperbarui', variant: 'success' });
        } else {
          console.error("Gagal update pesan:", data.error);
        }
      })
      .catch((err) => console.error("Failed to update message", err));
  };

  const filteredMessages = messages.filter((msg) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'replied') return msg.status === 'replied';
    if (statusFilter === 'unreplied') return msg.status === 'unread' || msg.status === 'read';
    return true;
  });

  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * messagesPerPage,
    currentPage * messagesPerPage
  );

  return (
    <Layout>
      <Breadcrumb 
        title="Pesan Masuk" 
        description="Lihat dan kelola pesan dari users melalui halaman kontak."
        icon={Mail}
      />
      
      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Daftar Pesan</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={(value: any) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter Pesan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Pesan</SelectItem>
                  <SelectItem value="unreplied">Belum Terbalas</SelectItem>
                  <SelectItem value="replied">Terbalas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subjek/Pesan</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMessages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Belum ada pesan masuk.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMessages.map((msg) => (
                    <TableRow key={msg.id}>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(msg.created_at).toLocaleDateString('id-ID')} <br/>
                        {new Date(msg.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{msg.name}</div>
                        <div className="text-xs text-muted-foreground">{msg.email}</div>
                      </TableCell>
                      <TableCell>
                        {msg.status === 'replied' ? (
                          <Badge variant="success" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Terbalas</Badge>
                        ) : msg.status === 'read' ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100">Sudah Dibaca</Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-red-100 text-red-600 hover:bg-red-100 border-red-200">Belum Dibaca</Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="font-bold text-xs uppercase text-blue-600 mb-1">{msg.subject}</div>
                        <div className="truncate text-sm" title={msg.message}>{msg.message}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleOpenReply(msg)} title="Balas via Email">
                            <Reply className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleEdit(msg.id)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(msg.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Menampilkan {paginatedMessages.length} dari {filteredMessages.length} pesan
              </p>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredMessages.length / messagesPerPage)}
              onPageChange={setCurrentPage}
            />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
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
                  onChange={(e) => setSelectedMessage({ ...selectedMessage, name: e.target.value } as Message)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={selectedMessage.email}
                  onChange={(e) => setSelectedMessage({ ...selectedMessage, email: e.target.value } as Message)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subjek</Label>
                <Input
                  id="subject"
                  value={selectedMessage.subject}
                  onChange={(e) => setSelectedMessage({ ...selectedMessage, subject: e.target.value } as Message)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Pesan</Label>
                <Textarea
                  id="message"
                  className="resize-none"
                  rows={4}
                  value={selectedMessage.message}
                  onChange={(e) => setSelectedMessage({ ...selectedMessage, message: e.target.value } as Message)}
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

      {/* Reply Modal */}
      <Dialog open={isReplyModalOpen} onOpenChange={setIsReplyModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Reply className="h-5 w-5 text-blue-600" />
              Balas Pesan
            </DialogTitle>
            <DialogDescription>
              Tulis balasan yang akan dikirim langsung ke email <strong>{selectedMessage?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg text-sm italic border-l-4 border-blue-400">
               <p className="font-bold text-xs uppercase mb-1">Pesan dari {selectedMessage?.name}:</p>
               "{selectedMessage?.message}"
            </div>

            <div className="space-y-2">
              <Label htmlFor="reply-text">Pesan Balasan</Label>
              <Textarea
                id="reply-text"
                placeholder="Tulis jawaban atau solusi di sini..."
                className="min-h-[150px] resize-none"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyModalOpen(false)} disabled={isReplying}>
              Batal
            </Button>
            <Button 
                onClick={handleSendReply} 
                disabled={isReplying || !replyText.trim()}
                className="bg-blue-600 hover:bg-blue-700"
            >
              {isReplying ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...</>
              ) : (
                <><Send className="mr-2 h-4 w-4" /> Kirim Balasan</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

