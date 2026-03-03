'use client';

import React from 'react';

interface EmptyStateProps {
  type: 'search' | 'data';
  title?: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, title, description }) => {
  const isSearch = type === 'search';
  const defaultTitle = isSearch ? "Oops! Data Tidak Ditemukan" : "Oops! Data tidak di temukan";
  const defaultDescription = isSearch 
    ? "Coba periksa kembali kata kunci pencarian Anda atau gunakan kata kunci lain untuk menemukan data yang sesuai."
    : "Sepertinya belum ada data yang tersedia saat ini. Silakan tambahkan data baru atau hubungi administrator.";
  
  const imagePath = isSearch ? "/images/illustration/nosearch.png" : "/images/illustration/nodata.png";

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-6">
        <div className="absolute -inset-4 bg-primary/5 rounded-full blur-2xl" />
        <img 
          src={imagePath} 
          alt={isSearch ? "No Search Results" : "No Data"} 
          className="relative w-64 h-auto object-contain drop-shadow-xl"
        />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {title || defaultTitle}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
        {description || defaultDescription}
      </p>
    </div>
  );
};

export default EmptyState;
