'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Step = 'email' | 'reset';

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRequestOTP = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: 'Berhasil', description: data.message, variant: 'success' });
        setStep('reset');
        setCountdown(60);
      } else {
        setError(data.error || 'Gagal mengirim OTP');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengirim OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: otpCode,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: 'Berhasil', description: 'Password berhasil direset. Silakan login kembali.', variant: 'success' });
        router.push('/login');
      } else {
        setError(data.error || 'Gagal mereset password');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mereset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast({ title: 'Berhasil', description: 'OTP baru telah dikirim', variant: 'default' });
        setCountdown(60);
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Gagal mengirim ulang OTP', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/3 flex flex-col justify-center px-8 lg:px-16 border-r border-border bg-card overflow-y-auto">
        <div className="max-w-md mx-auto w-full py-12 space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {step === 'email' ? 'Lupa Kata Sandi?' : 'Atur Ulang Kata Sandi'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {step === 'email' 
                ? 'Masukkan email Anda untuk mendapatkan kode OTP' 
                : 'Masukkan kode OTP dan kata sandi baru Anda'}
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'email' ? (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Alamat Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                    placeholder="nama@email.com"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? 'Memproses...' : (
                  <>
                    Kirim Kode OTP
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm">
                  Cek email <strong>{email}</strong> untuk kode OTP 6-digit.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Kode OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                  className="text-center text-2xl tracking-[1em] h-12"
                  placeholder="000000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Kata Sandi Baru</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 pr-10"
                    placeholder="Min. 6 karakter"
                  />
                  <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10 pr-10"
                    placeholder="Ulangi kata sandi"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full mt-4" disabled={loading} size="lg">
                {loading ? 'Memproses...' : 'Reset Kata Sandi'}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendOTP}
                  disabled={loading || countdown > 0}
                  className="text-xs"
                >
                  {countdown > 0 ? `Kirim Ulang Kode (${countdown}s)` : 'Tidak menerima kode? Kirim Ulang'}
                </Button>
              </div>
            </form>
          )}

          <div className="text-center pt-4">
            <Link href="/login" className="text-sm font-medium text-primary hover:underline group inline-flex items-center">
              <ArrowRight className="mr-2 h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>

      {/* Right Panel - Appearance */}
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
        
        <div className="relative z-10 flex flex-col justify-end p-12 text-primary-foreground h-full w-full">
          <div className="space-y-4 max-w-lg">
            <h3 className="text-4xl font-bold">Keamanan Akun Anda Adalah Prioritas</h3>
            <p className="text-lg text-primary-foreground/80">
              Jangan khawatir jika Anda lupa kata sandi. Ikuti langkah sederhana untuk memulihkan akses ke akun Anda dengan aman.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
