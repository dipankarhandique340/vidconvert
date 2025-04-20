"use client"

import React from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
