'use client';

import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { useEffect, useState } from 'react';
import { Users, Pencil, Trash2, Plus, Search, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ImportExcel from '@/components/ImportExcel';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Pagination from '@/components/Pagination';

interface User {
  id: number;
  username: string;
  nama: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nama: '',
    email: '',
    role: 'peminjam',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowDialog(false);
        setEditingUser(null);
        setFormData({ username: '', password: '', nama: '', email: '', role: 'peminjam' });
        fetchUsers();
        toast({ title: 'Berhasil', description: 'Data berhasil di simpan', variant: 'success' });
      } else {
        toast({ title: 'Gagal', description: 'Gagal menyimpan user', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Terjadi kesalahan sistem', variant: 'destructive' });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      nama: user.nama,
      email: user.email || '',
      role: user.role,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
        toast({ title: 'Berhasil', description: 'Data berhasil di hapus', variant: 'success' });
      } else {
        toast({ title: 'Gagal', description: 'Gagal menghapus user', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Terjadi kesalahan sistem', variant: 'destructive' });
    }
  };

  if (loading) return <Layout><div className="flex justify-center p-8">Loading...</div></Layout>;

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Layout>
      <Breadcrumb
        title="Users"
        description="Kelola data pengguna sistem."
        icon={Users}
      />
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Cari username, nama, email..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-8"
            />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
            <ImportExcel 
                title="Users"
                apiUrl="/api/admin/users/bulk"
                onSuccess={fetchUsers}
                fileName="users"
                templateData={[
                    { username: 'john_doe', password: 'password123', nama: 'John Doe', email: 'john@example.com', role: 'peminjam' },
                    { username: 'jane_smith', password: 'password456', nama: 'Jane Smith', email: 'jane@example.com', role: 'petugas' }
                ]}
            />
            <Button onClick={() => {
                setEditingUser(null);
                setFormData({ username: '', password: '', nama: '', email: '', role: 'peminjam' });
                setShowDialog(true);
            }}>
                <Plus className="mr-2 h-4 w-4" /> Tambah User
            </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.nama}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(user.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        Tidak ada data users.
                    </TableCell>
                </TableRow>
            )}
            
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between mt-4">
        Menampilkan {paginatedUsers.length} dari {users.length} data users.
      

      <Pagination
         currentPage={currentPage}
         totalPages={totalPages}
         onPageChange={setCurrentPage}
      />
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Tambah User Baru'}</DialogTitle>
            <DialogDescription>
              Isi formulir di bawah ini untuk {editingUser ? 'memperbarui' : 'menambahkan'} data user.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="password">
                    Password {editingUser && <span className="text-muted-foreground font-normal">(kosongkan jika tidak ubah)</span>}
                </Label>
                <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                    value={formData.role} 
                    onValueChange={(val) => setFormData({ ...formData, role: val })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="petugas">Petugas</SelectItem>
                        <SelectItem value="peminjam">Peminjam</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Batal
                </Button>
                <Button type="submit">
                    Simpan
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}