import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  breadcrumbItems: { label: string; href: string }[];
  imageSrc?: string;
  className?: string;
  description?: string;
}

export default function PageHeader({
  title,
  breadcrumbItems,
  imageSrc = '/login-bg.jpg', 
  className,
  description,
}: PageHeaderProps) {
  return (
    <div 
      className={cn(
        "relative w-full h-[300px] flex flex-col items-center justify-center text-center text-white",
        className
      )}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${imageSrc})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
          {title}
        </h1>
        <p>{description}</p>
        
        <nav className="flex items-center justify-center space-x-2 text-sm md:text-base font-medium">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;

            return (
              <div key={item.href} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 mx-2 text-white/60" />
                )}
                
                {isLast ? (
                  <span className="text-primary font-bold">{item.label}</span>
                ) : (
                  <Link 
                    href={item.href} 
                    className="text-white hover:text-primary transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
