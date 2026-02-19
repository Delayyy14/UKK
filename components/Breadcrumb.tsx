'use client';

import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface BreadcrumbProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function Breadcrumb({ title, description, icon: Icon }: BreadcrumbProps) {
  return (
    <Card className="mb-6 print:hidden border-none shadow-none bg-transparent sm:bg-card sm:border sm:shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="hidden sm:block">
            <div className="bg-primary/10 rounded-full p-3">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}