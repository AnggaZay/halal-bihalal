"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Invitation {
  id: string;
  full_name: string;
  seat_number: string;
  is_present: boolean;
  vehicle: string;
}

interface OverviewPesertaProps {
  onNavigate?: (tab: "overview" | "data" | "kehadiran" | "fasilitas" | "asisten") => void;
}

export default function OverviewPeserta({ onNavigate }: OverviewPesertaProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvitations = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("invitations")
        .select("id, full_name, seat_number, is_present, vehicle");

      if (!error && data) {
        setInvitations(data);
      }
      setIsLoading(false);
    };

    fetchInvitations();

    // Berlangganan Realtime Data
    const channel = supabase
      .channel("realtime-overview-peserta")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "invitations" },
        (payload) => {
          setInvitations((prev) => {
            if (payload.eventType === 'INSERT') return [...prev, payload.new as Invitation];
            if (payload.eventType === 'UPDATE') return prev.map((inv) => (inv.id === payload.new.id ? (payload.new as Invitation) : inv));
            if (payload.eventType === 'DELETE') return prev.filter((inv) => inv.id !== payload.old.id);
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Proses Kalkulasi Rekap Data
  let totalPeserta = 0;
  let hadirPeserta = 0;
  let kursiTerisi = 0;
  let totalMobil = 0;
  let totalMotor = 0;

  invitations.forEach(inv => {
    // Hitung berdasarkan per individu (karena 1 baris/form bisa >1 orang)
    const names = inv.full_name ? inv.full_name.split(', ') : [];
    const count = names.length;
    totalPeserta += count;
    if (inv.is_present) hadirPeserta += count;

    // Hitung kursi
    const seats = inv.seat_number ? inv.seat_number.split(', ') : [];
    seats.forEach(s => {
      if (s && s !== 'null' && s.trim() !== '') kursiTerisi++;
    });

    // Hitung kendaraan
    const vehicles = inv.vehicle ? inv.vehicle.split(', ') : [];
    vehicles.forEach(v => {
      if (v.toLowerCase().includes('mobil')) totalMobil++;
      if (v.toLowerCase().includes('motor')) totalMotor++;
    });
  });

  const persentaseHadir = totalPeserta > 0 ? Math.round((hadirPeserta / totalPeserta) * 100) : 0;
  const persentaseKursi = Math.round((kursiTerisi / 40) * 100);

  return (
    <div className="space-y-4">
      {/* Banner Pesan Tambahan (Pindah ke Atas ala M-Banking) */}
      <div className="bg-gradient-to-r from-[#A6824A] to-[#8a6a3b] rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-lg mb-1">Halo, Panitia Kesekretariatan! 👋</h3>
            <p className="text-white/80 text-sm max-w-lg">Pastikan selalu mengecek menu Scan untuk presensi di lokasi dan menyapa tamu yang hadir dengan senyuman terbaik.</p>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-20 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-48 w-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
        </div>
      </div>

      {/* MENU UTAMA (M-Banking Style) */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Menu Utama Kesekretariatan</h3>
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          {/* Menu Data */}
          <button onClick={() => onNavigate?.("data")} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <span className="text-[10px] md:text-xs font-medium text-gray-600 text-center leading-tight">Master Data</span>
          </button>
          {/* Menu Scan */}
          <button onClick={() => onNavigate?.("kehadiran")} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-[#A6824A]/10 text-[#A6824A] rounded-2xl flex items-center justify-center group-hover:bg-[#A6824A]/20 transition-colors shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <span className="text-[10px] md:text-xs font-medium text-gray-600 text-center leading-tight">Scan Hadir</span>
          </button>
          {/* Menu Fasilitas */}
          <button onClick={() => onNavigate?.("fasilitas")} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:bg-green-100 transition-colors shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
            </div>
            <span className="text-[10px] md:text-xs font-medium text-gray-600 text-center leading-tight">Fasilitas</span>
          </button>
          {/* Menu PIC Asisten */}
          <button onClick={() => onNavigate?.("asisten")} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:bg-purple-100 transition-colors shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <span className="text-[10px] md:text-xs font-medium text-gray-600 text-center leading-tight">PIC Asisten</span>
          </button>
        </div>
      </div>

      {/* KARTU INSIGHT (Rekap Data) */}
      {isLoading && (
        <div className="absolute top-0 right-0 m-4">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A6824A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#A6824A]"></span>
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: Total Pendaftar RSVP */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
          </div>
          <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Tamu RSVP</h4>
          <h2 className="text-3xl font-bold text-[#101111]">{totalPeserta} <span className="text-sm font-normal text-gray-500">Orang</span></h2>
        </div>

        {/* CARD 2: Peserta Hadir (Check-In) */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-green-50 p-2 rounded-lg text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">{persentaseHadir}%</span>
          </div>
          <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Sudah Hadir (Scan)</h4>
          <h2 className="text-3xl font-bold text-[#101111]">{hadirPeserta} <span className="text-sm font-normal text-gray-500">/ {totalPeserta}</span></h2>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${persentaseHadir}%` }}></div>
          </div>
        </div>

        {/* CARD 3: Kapasitas Kursi */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-[#A6824A]/10 p-2 rounded-lg text-[#A6824A]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <span className="text-xs font-bold text-[#A6824A] bg-[#A6824A]/10 px-2 py-1 rounded-md">{persentaseKursi}%</span>
          </div>
          <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Kursi Ter-Booking</h4>
          <h2 className="text-3xl font-bold text-[#101111]">{kursiTerisi} <span className="text-sm font-normal text-gray-500">/ 40</span></h2>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
            <div className="bg-[#A6824A] h-1.5 rounded-full" style={{ width: `${persentaseKursi}%` }}></div>
          </div>
        </div>

        {/* CARD 4: Data Kendaraan Logistik */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <div className="bg-[#5D1E21]/10 p-2 rounded-lg text-[#5D1E21]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
          </div>
          <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Kendaraan</h4>
          <div className="flex items-end gap-3 mt-1">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[#101111]">{totalMobil}</span>
              <span className="text-[10px] text-gray-500 uppercase font-medium tracking-wider">Mobil 🚗</span>
            </div>
            <div className="w-px h-8 bg-gray-200 mb-1"></div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[#101111]">{totalMotor}</span>
              <span className="text-[10px] text-gray-500 uppercase font-medium tracking-wider">Motor 🏍️</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}