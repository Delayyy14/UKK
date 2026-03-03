'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  value, 
  size = 256, 
  level = 'M', 
  includeMargin = true 
}) => {
  return (
    <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-primary/20">
      <QRCodeSVG 
        value={value} 
        size={size} 
        level={level} 
        includeMargin={includeMargin} 
        className="rounded-lg"
      />
      <div className="mt-4 text-xs font-mono font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded select-all">
        {value}
      </div>
    </div>
  );
};

export default QRCodeGenerator;
