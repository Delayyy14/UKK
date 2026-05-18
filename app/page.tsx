import MainNavbar from '@/components/MainNavbar';
import Link from 'next/link';
import Image from 'next/image';
import dynamicImport from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Clock, Shield, MapPin, Users, Package, Calendar, Heart, Newspaper } from 'lucide-react';
import pool from '@/lib/db';
import LandingContent from '@/components/LandingContent';

async function getFeaturedProducts() {
  try {
    const res = await pool.query(`
      SELECT a.*, k.nama as kategori_nama 
      FROM alat a 
      LEFT JOIN kategori k ON a.kategori_id = k.id 
      WHERE a.status = 'tersedia'
      ORDER BY a.id DESC 
      LIMIT 3
    `);
    return res.rows;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getLatestNews() {
  try {
    const res = await pool.query(`
      SELECT * FROM berita 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    return res.rows;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const [products, news] = await Promise.all([
    getFeaturedProducts(),
    getLatestNews()
  ]);

  return <LandingContent products={products} news={news} />;
}
