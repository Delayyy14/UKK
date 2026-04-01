import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Banner {
  id: string;
  title: string;
  paragraph: string;
  background_url: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { banners, loading, error, refetch: fetchBanners };
}