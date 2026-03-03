'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Mail, UserCircle, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Step = 'register' | 'verify';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStep = (searchParams.get('step') as Step) || 'register';
  const initialEmail = searchParams.get('email') || '';

  const [step, setStep] = useState<Step>(initialStep);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nama: '',
    email: initialEmail,
  });
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validasi
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak sama');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          nama: formData.nama,
          email: formData.email,
          role: 'peminjam',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: 'Berhasil', description: 'Silakan cek email Anda untuk kode verifikasi', variant: 'success' });
        setStep('verify');
        setCountdown(60);
      } else {
        setError(data.error || 'Registrasi gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat registrasi');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: otpCode,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: 'Berhasil', description: 'Email berhasil diverifikasi', variant: 'success' });
        router.push('/login');
      } else {
        setError(data.error || 'Verifikasi gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat verifikasi');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setError('');
    setResendLoading(true);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: 'Berhasil', description: 'Kode OTP baru telah dikirim', variant: 'default' });
        setCountdown(60);
      } else {
        setError(data.error || 'Gagal mengirim ulang OTP');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengirim ulang OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/3 flex flex-col justify-center px-8 lg:px-16 border-r border-border bg-card overflow-y-auto">
        <div className="max-w-md mx-auto w-full py-12 space-y-8">

          {/* Main Heading */}
          <div>
             <h2 className="text-3xl font-bold tracking-tight">
               {step === 'register' ? 'Buat Akun' : 'Verifikasi Email'}
             </h2>
             <p className="text-muted-foreground mt-2">
               {step === 'register' 
                ? 'Mulai pinjam alat dengan mudah' 
                : `Kode OTP dikirim ke ${formData.email}`}
             </p>
          </div>

          {step === 'register' ? (
            /* Registration Form */
            <form onSubmit={handleRegister} className="space-y-4">
               {/* Error Message */}
               {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Nama Lengkap */}
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <div className="relative">
                  <Input
                    id="nama"
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                    className="pl-10"
                    placeholder="Nama Lengkap"
                  />
                  <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="pl-10"
                    placeholder="Email Address"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="pl-10"
                    placeholder="Username"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    className="pl-10 pr-10"
                    placeholder="Password"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                    className="pl-10 pr-10"
                    placeholder="Konfirmasi Password"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full mt-6"
                disabled={loading}
                size="lg"
              >
                {loading ? 'Mendaftar...' : (
                  <>
                    Daftar Sekarang
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            /* OTP Verification Form */
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm">
                  Kami telah mengirimkan 6 digit kode verifikasi ke email Anda. Silakan masukkan kode tersebut di bawah ini.
                </p>
              </div>

              {/* OTP Input */}
              <div className="space-y-2">
                <Label htmlFor="otp">Kode OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                  className="text-center text-2xl tracking-[1em] h-14"
                  placeholder="000000"
                  autoFocus
                />
              </div>

              {/* Verification Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || otpCode.length !== 6}
                size="lg"
              >
                {loading ? 'Memverifikasi...' : 'Verifikasi Akun'}
              </Button>

              {/* Resend Link */}
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Tidak menerima kode?</p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendOTP}
                  disabled={resendLoading || countdown > 0}
                  className="text-primary font-medium"
                >
                  {countdown > 0 
                    ? `Kirim Ulang dalam ${countdown}s` 
                    : (resendLoading ? 'Mengirim...' : 'Kirim Ulang Kode')}
                </Button>
              </div>

              {/* Back to register */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('register')}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Ganti email atau kembali ke pendaftaran
                </button>
              </div>
            </form>
          )}

          {/* Login Link */}
          {step === 'register' && (
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Sudah punya akun? </span>
              <Link href="/login" className="font-medium text-primary hover:underline">
                Login di sini
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Image/Background */}
      <div className="hidden lg:flex lg:w-2/3 relative bg-muted">
         <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/login-bg.jpg)',
            backgroundColor: 'hsl(var(--primary))' 
          }}
        >
          <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground h-full w-full">
           <div className="space-y-4">
          </div>
          <div className="space-y-4 max-w-lg">
            <h3 className="text-4xl font-bold">
              {step === 'register' ? 'Bergabunglah Bersama Kami' : 'Verifikasi Akun Anda'}
            </h3>
            <p className="text-lg text-primary-foreground/80">
              {step === 'register' 
                ? 'Daftarkan diri Anda untuk mengakses berbagai alat yang tersedia. Proses cepat dan mudah untuk memulai peminjaman.'
                : 'Langkah terakhir untuk mengamankan akun Anda. Silakan masukkan kode yang telah kami kirimkan ke email Anda.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
