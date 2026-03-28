import React from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#FFFFFF] border-r border-gray-200 flex-shrink-0 md:min-h-screen">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-[#5D1E21]" style={{ fontFamily: "'Playfair Display', serif" }}>Panitia Halal Bihalal</h1>
          <p className="text-xs text-[#6B7280] mt-1">Sistem Informasi Eksekutif</p>
        </div>
        <nav className="p-4 space-y-2">
          <Link href="/dashboard" className="block px-4 py-3 rounded-lg text-sm font-medium bg-[#A6824A]/10 text-[#A6824A]">
            Overview
          </Link>
          <Link href="/dashboard/peserta" className="block px-4 py-3 rounded-lg text-sm font-medium text-[#101111] hover:bg-[#F3F4F6] hover:text-[#A6824A] transition-colors">
            Peserta
          </Link>
          <Link href="/dashboard/dokumen" className="block px-4 py-3 rounded-lg text-sm font-medium text-[#101111] hover:bg-[#F3F4F6] hover:text-[#A6824A] transition-colors">
            Dokumen
          </Link>
          <Link href="/dashboard/sumber-daya" className="block px-4 py-3 rounded-lg text-sm font-medium text-[#101111] hover:bg-[#F3F4F6] hover:text-[#A6824A] transition-colors">
            Sumber Daya
          </Link>
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="bg-[#FFFFFF] border-b border-gray-200 p-4 px-6 flex justify-between items-center flex-shrink-0">
          <h2 className="text-sm font-semibold text-[#101111] uppercase tracking-wider">Mode Administrator</h2>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span></span>
            <span className="text-xs text-[#6B7280] font-medium">Realtime Active</span>
          </div>
        </header>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}