'use client';

import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';
import { useEffect, useState } from 'react';
import { Settings, User, Mail, Lock, Camera, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    foto: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const userData = JSON.parse(userStr);
      const res = await fetch('/api/profile');


      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setFormData({
          nama: data.nama || '',
          email: data.email || '',
          password: '',
          foto: data.foto || '',
        });
        setPreviewImage(data.foto || null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setErrorMessage('Anda harus login');
        setSaving(false);
        return;
      }

      const userData = JSON.parse(userStr);
      let fotoUrl = formData.foto;

      // Upload new file if selected
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);

        const uploadRes = await fetch('/api/profile/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          setErrorMessage(errorData.error || 'Gagal mengupload foto. Pastikan file adalah gambar dan maksimal 5MB.');
          setSaving(false);
          return;
        }

        const uploadData = await uploadRes.json();
        fotoUrl = uploadData.fileUrl;
      }

      // Update profile
      const updateData: any = {
        nama: formData.nama,
        email: formData.email,
        foto: fotoUrl,
      };

      // Only include password if it's not empty
      if (formData.password) {
        if (formData.password.length < 6) {
          setErrorMessage('Password minimal 6 karakter');
          setSaving(false);
          return;
        }
        updateData.password = formData.password;
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });


      if (res.ok) {
        const updatedUser = await res.json();
        // Update localStorage
        const updatedUserData = {
          ...userData,
          nama: updatedUser.nama,
          email: updatedUser.email,
          foto: updatedUser.foto,
        };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        setUser(updatedUser);
        setFormData({ ...formData, password: '', foto: fotoUrl });
        setSelectedFile(null);
        setSuccessMessage('Profile berhasil diperbarui!');
        
        // Auto hide success message and reload after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.error || 'Gagal memperbarui profile. Silakan coba lagi.');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setErrorMessage(error.message || 'Terjadi kesalahan saat memperbarui profile. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Layout><div className="text-center py-8">Loading...</div></Layout>;
  }

  return (
  <Layout>

    <div className="flex gap-6 max-w-6xl">

      {/* CONTENT */}
      <div className="flex-1 bg-card text-card-foreground border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-6">Informasi Profil</h2>

        {/* FOTO PROFIL */}
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden border border-border">
              {previewImage ? (
                <img src={previewImage} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <User size={40} className="text-muted-foreground" />
                </div>
              )}
            </div>

            {/* ICON CAMERA */}
            <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer shadow">
              <Camera size={16} className="text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <p className="font-medium text-foreground">{formData.nama}</p>
            <p className="text-sm text-muted-foreground">{formData.email}</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md text-sm border border-red-200 flex items-start gap-2">
            <div>
              <span className="font-semibold block mb-1">Terjadi Kesalahan</span>
              {errorMessage}
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-md text-sm border border-green-200">
            {successMessage}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Nama */}
          <div>
            <label className="text-sm font-medium">Nama Lengkap</label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full border border-input bg-background rounded px-4 py-2 mt-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-input bg-background rounded px-4 py-2 mt-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium">Password Baru</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border border-input bg-background rounded px-4 py-2 mt-1 pr-10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="text-sm font-medium">Username</label>
            <input
              disabled
              value={user?.username}
              className="w-full border border-input rounded px-4 py-2 mt-1 bg-secondary text-muted-foreground"
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-sm font-medium">Role</label>
            <input
              disabled
              value={user?.role}
              className="w-full border border-input rounded px-4 py-2 mt-1 bg-secondary text-muted-foreground"
            />
          </div>

          {/* BUTTON */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-primary-foreground px-6 py-2 rounded hover:bg-primary/90 transition-colors"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-secondary text-secondary-foreground px-6 py-2 rounded hover:bg-secondary/80 transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  </Layout>
);
}