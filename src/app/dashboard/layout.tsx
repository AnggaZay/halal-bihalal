import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Statis (Hanya contoh visual) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-blue-600">EventHub</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {/* Link navigasi bisa ditambahkan di sini nantinya */}
          <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md font-medium">
            Overview
          </div>
          <div className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer transition-colors">
            Pengaturan
          </div>
        </nav>
      </aside>

      {/* Area Konten Utama */}
      <main className="flex-1 overflow-y-auto">
        {/* Konten dari src/app/dashboard/page.tsx akan otomatis dirender di sini */}
        {children}
      </main>
    </div>
  );
}
