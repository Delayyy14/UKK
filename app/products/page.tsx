import MainNavbar from '@/components/MainNavbar';
import pool from '@/lib/db';
import ProductCatalog from '@/components/ProductCatalog';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';

async function getProducts() {
  try {
    const res = await pool.query(`
      SELECT a.*, k.nama as kategori_nama 
      FROM alat a 
      LEFT JOIN kategori k ON a.kategori_id = k.id 
      ORDER BY a.nama ASC
    `);
    return res.rows;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getCategories() {
  try {
    const res = await pool.query('SELECT * FROM kategori ORDER BY nama ASC');
    return res.rows;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16">
      <MainNavbar />
      
      <PageHeader 
        title="Katalog Peralatan" 
        description="Mari Temukan Barang yang sedang anda cari!"
        breadcrumbItems={[
          { label: 'Beranda', href: '/' },
          { label: 'Katalog', href: '/products' },
        ]}
      />

      <div className="container mx-auto py-12 px-6">
        <ProductCatalog 
          products={products} 
          categories={categories} 
        />
      </div>
      
       {/* Footer */}
      <Footer />
    </div>
  );
}
