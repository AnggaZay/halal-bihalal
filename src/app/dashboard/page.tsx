"use client";

import React from 'react';
import StatCard from '@/components/dashboard/StatCard';
import Badge from '@/components/dashboard/Badge';

export default function DashboardOverview() {
  return (
    <div className="space-y-8 pb-8">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold text-[#101111]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Dashboard Overview
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">Ringkasan data live acara Halal Bihalal saat ini.</p>
      </div>

      {/* Kartu Ringkasan (Stat Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Kehadiran"
          value="128"
          description="Tamu telah check-in"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="Sisa Kursi"
          value="42"
          description="Dari total 170 kursi"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatCard
          title="Kapasitas Parkir Area"
          value="85%"
          description="Warmindo 17 hampir penuh"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l.8 4.8a2 2 0 001.97 1.67H16.23a2 2 0 001.97-1.67L19 10m-14 0h14M5 10V8a2 2 0 012-2h10a2 2 0 012 2v2m-14 0h14m-10 6v3m4-3v3" />
            </svg>
          }
        />
        <StatCard
          title="RSVP Tertunda"
          value="15"
          description="Belum menentukan kursi"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Area Tabel Zebra Striping (Contoh Data Terbaru) */}
      <div className="bg-[#FFFFFF] border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-[#F3F4F6]/30">
          <h2 className="text-sm font-semibold text-[#101111] uppercase tracking-wide">Aktivitas RSVP Terkini</h2>
          <button className="text-xs font-bold text-[#A6824A] hover:text-[#5D1E21] transition-colors uppercase tracking-widest">Lihat Semua</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-[#F3F4F6] text-[#6B7280] text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Nama Tamu</th>
                <th className="px-6 py-4">Periode</th>
                <th className="px-6 py-4">Nomor Kursi</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#101111]">
              <tr className="hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-4 font-medium">M. Amri Albani</td>
                <td className="px-6 py-4 text-[#6B7280]">2002 - 2004</td>
                <td className="px-6 py-4 font-mono font-medium text-[#A6824A]">A-01</td>
                <td className="px-6 py-4"><Badge status="success">Hadir</Badge></td>
              </tr>
              <tr className="bg-gray-50/40 hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-4 font-medium">M. Taufiqurrahman</td>
                <td className="px-6 py-4 text-[#6B7280]">2010 - 2012</td>
                <td className="px-6 py-4 font-mono font-medium text-[#A6824A]">B-12</td>
                <td className="px-6 py-4"><Badge status="success">Hadir</Badge></td>
              </tr>
              <tr className="hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-4 font-medium">M. Fikri Al-Khasani</td>
                <td className="px-6 py-4 text-[#6B7280]">2020 - 2022</td>
                <td className="px-6 py-4 font-mono text-[#6B7280]">-</td>
                <td className="px-6 py-4"><Badge status="warning">Pending</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}