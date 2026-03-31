"use client";

import { useState, useEffect } from "react";
import { Parisienne } from "next/font/google";
import { supabase } from "@/lib/supabase"; // Sesuaikan jika path supabase kamu berbeda

// Inisialisasi Font Parisienne dari Google Fonts
const parisienne = Parisienne({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

interface OverviewPesertaProps {
  onNavigate: (tab: "overview" | "data" | "kehadiran" | "fasilitas" | "asisten") => void;
}

interface Invitation {
  id: string;
  full_name?: string;
  periode?: string;
  is_present?: boolean;
  jenis_parkiran?: string;
  nama_asisten?: string;
}

interface PesertaBelumHadir {
  id: string | number;
  nama: string;
  periode: string;
  asisten: string;
  parkiran: string;
}

export default function OverviewPeserta({ onNavigate }: OverviewPesertaProps) {
  const totalKursi = 40; // Di-fix menjadi 40 kursi
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [terbooking, setTerbooking] = useState(0);
  const [kehadiran, setKehadiran] = useState(0);
  const kursiKosong = totalKursi - kehadiran;
  const [isLoading, setIsLoading] = useState(true);

  const semuaPeriode = [
    "1999/2001", "2001/2003", "2003/2005", "2005/2007",
    "2007/2009", "2009/2011", "2011/2013", "2013/2015",
    "2015/2017", "2017/2019", "2019/2021", "2021/2023"
  ];
  
  const [periodeBelumBooking, setPeriodeBelumBooking] = useState<string[]>(semuaPeriode);
  const [pesertaBelumHadir, setPesertaBelumHadir] = useState<PesertaBelumHadir[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setInvitations(data);
      } else {
        console.error("Gagal menarik data:", error);
      }
      setIsLoading(false);
    };

    fetchDashboardData();

    const channel = supabase
      .channel("realtime-overview-peserta")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "invitations" },
        (payload) => {
          setInvitations((prev) => {
            if (payload.eventType === 'INSERT') return [payload.new as Invitation, ...prev];
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

  useEffect(() => {
    const jumlahTerbooking = invitations.reduce((sum, item) => {
      const count = item.full_name ? item.full_name.split(",").length : 1;
      return sum + count;
    }, 0);
    setTerbooking(jumlahTerbooking);

    const dataHadir = invitations.filter((item) => item.is_present === true);
    const jumlahKehadiran = dataHadir.reduce((sum, item) => {
      const count = item.full_name ? item.full_name.split(",").length : 1;
      return sum + count;
    }, 0);
    setKehadiran(jumlahKehadiran);

    const periodeSudahBooking = Array.from(
      new Set(invitations.map((item) => item.periode).filter(Boolean))
    );
    const sisaPeriode = semuaPeriode.filter((p) => !periodeSudahBooking.includes(p));
    setPeriodeBelumBooking(sisaPeriode);

    const belumHadirList: PesertaBelumHadir[] = [];
    invitations
      .filter((item) => item.is_present !== true)
      .forEach((item) => {
        const names = item.full_name ? item.full_name.split(",").map((n: string) => n.trim()) : ["Tanpa Nama"];
        const parkings = item.jenis_parkiran ? item.jenis_parkiran.split(",").map((p: string) => p.trim()) : [];
        
        names.forEach((nama: string, idx: number) => {
          belumHadirList.push({
            id: `${item.id}-${idx}`,
            nama: nama,
            periode: item.periode || "-",
            asisten: item.nama_asisten || "-",
            parkiran: parkings[idx] || parkings[0] || "Belum dialokasikan"
          });
        });
      });
    setPesertaBelumHadir(belumHadirList);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitations]);

  // Pastikan loading selesai sebelum menampilkan status "Luar Biasa!"
  const isSemuaHadirDanBooking = !isLoading && periodeBelumBooking.length === 0 && pesertaBelumHadir.length === 0;

  return (
    <div className="w-full min-h-screen bg-gray-50/50 pb-10 md:pb-16">
      <div className="w-full md:max-w-[1400px] mx-auto md:pt-4">
      {/* --- HEADER --- */}
      <div className="bg-white px-5 py-6 md:px-10 md:py-10 rounded-b-3xl md:rounded-3xl shadow-sm border-b md:border border-gray-100 mb-6 md:mt-4 md:mx-6 flex items-center justify-between relative overflow-hidden">
        {/* Background decorative for header on desktop */}
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#A6824A]/5 to-transparent"></div>
        <div className="hidden md:block absolute -right-4 -bottom-10 text-[#A6824A]/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-48 w-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 3.8l7.2 14.2H4.8L12 5.8z"/></svg>
        </div>
        
        <div className="flex items-center gap-3 md:gap-6 relative z-10">
          {/* Placeholder Logo */}
          <div className="w-12 h-12 md:w-20 md:h-20 shrink-0 rounded-full bg-gradient-to-br from-[#A6824A] to-[#D4AF37] flex items-center justify-center shadow-lg border-2 md:border-4 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-10 md:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          {/* Judul & Tahun */}
          <div className="flex flex-col">
            <h1 className="flex items-baseline gap-1.5 md:gap-3 text-[#101111]">
              <span className={`${parisienne.className} text-3xl md:text-4xl lg:text-5xl text-[#A6824A] leading-none drop-shadow-sm`}>
                Halal Bihalal
              </span>
              <span className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">2026</span>
            </h1>
            <p className="text-[11px] md:text-xs lg:text-sm text-gray-500 font-bold md:font-semibold tracking-widest uppercase mt-0.5 md:mt-1">
              Dashboard Kepesertaan
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 flex flex-col gap-6 md:gap-8 w-full">
        
        {/* --- 3 CARD INSIGHT (No Horizontal Scroll) --- */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6 w-full">
          {/* Card 1: Terbooking */}
          <div className="bg-white p-3 md:p-5 lg:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center md:items-start text-center md:text-left relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="hidden md:block absolute -right-6 -bottom-6 text-[#A6824A]/5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 transform group-hover:scale-110 transition-transform duration-500" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            </div>
            <div className="hidden md:flex w-10 h-10 lg:w-12 lg:h-12 bg-[#A6824A]/10 rounded-xl items-center justify-center text-[#A6824A] mb-3 relative z-10 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div className="relative z-10 w-full">
              <span className="text-[10px] sm:text-xs md:text-xs lg:text-sm text-gray-500 font-bold mb-1 block leading-tight uppercase tracking-wider md:tracking-widest">Terbooking</span>
              <div className="flex items-baseline gap-0.5 md:gap-2 justify-center md:justify-start">
                <span className="text-lg md:text-3xl lg:text-4xl font-black text-[#A6824A] tracking-tighter">{isLoading ? "..." : terbooking}</span>
                <span className="text-[10px] md:text-xs lg:text-sm text-gray-400 font-medium">/{totalKursi}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Kursi Kosong */}
          <div className="bg-white p-3 md:p-5 lg:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center md:items-start text-center md:text-left relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="hidden md:block absolute -right-6 -bottom-6 text-gray-900/5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 transform group-hover:scale-110 transition-transform duration-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <div className="hidden md:flex w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-xl items-center justify-center text-gray-600 mb-3 relative z-10 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <div className="relative z-10 w-full">
              <span className="text-[10px] sm:text-xs md:text-xs lg:text-sm text-gray-500 font-bold mb-1 block leading-tight uppercase tracking-wider md:tracking-widest">Kursi Kosong</span>
              <div className="flex items-baseline gap-0.5 md:gap-2 justify-center md:justify-start">
                <span className="text-lg md:text-3xl lg:text-4xl font-black text-gray-700 tracking-tighter">{isLoading ? "..." : kursiKosong}</span>
                <span className="text-[10px] md:text-xs lg:text-sm text-gray-400 font-medium">/{totalKursi}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Periode Blm Booking */}
          <div className="bg-white p-3 md:p-5 lg:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center md:items-start text-center md:text-left relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="hidden md:block absolute -right-6 -bottom-6 text-red-500/5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 transform group-hover:scale-110 transition-transform duration-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="hidden md:flex w-10 h-10 lg:w-12 lg:h-12 bg-red-50 rounded-xl items-center justify-center text-red-500 mb-3 relative z-10 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="relative z-10 w-full">
              <span className="text-[10px] sm:text-xs md:text-xs lg:text-sm text-gray-500 font-bold mb-1 block leading-tight uppercase tracking-wider md:tracking-widest">Sisa Periode</span>
              <div className="flex items-baseline gap-0.5 md:gap-2 justify-center md:justify-start">
                <span className="text-lg md:text-3xl lg:text-4xl font-black text-red-500 tracking-tighter">{isLoading ? "..." : periodeBelumBooking.length}</span>
                <span className="text-[10px] md:text-xs lg:text-sm text-gray-400 font-medium">/{semuaPeriode.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- 3 MENU CIRCLE --- */}
        <div className="grid grid-cols-3 gap-4 py-2 md:py-0 md:gap-4 lg:gap-6 w-full">
          {/* Menu Data Master */}
          <button onClick={() => onNavigate("data")} className="flex flex-col items-center gap-2 md:gap-3 group md:bg-white md:p-4 lg:p-6 md:rounded-3xl md:border md:border-blue-50 md:shadow-sm md:hover:shadow-xl md:hover:-translate-y-1 transition-all w-full relative overflow-hidden">
            <div className="hidden md:block absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full z-0 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100 group-hover:scale-105 md:group-hover:scale-110 md:group-hover:bg-blue-600 md:group-hover:text-white md:group-hover:border-blue-600 transition-all duration-300 relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <div className="flex flex-col items-center relative z-10 mt-1">
              <span className="text-[11px] md:text-xs lg:text-sm font-bold text-gray-700 md:text-gray-900 text-center tracking-wide group-hover:text-blue-600 transition-colors">Data Master</span>
              <span className="hidden md:block text-[10px] lg:text-xs text-gray-500 text-center mt-1.5 font-medium">Kelola & Edit Peserta</span>
            </div>
          </button>

          {/* Menu Kehadiran */}
          <button onClick={() => onNavigate("kehadiran")} className="flex flex-col items-center gap-2 md:gap-3 group md:bg-white md:p-4 lg:p-6 md:rounded-3xl md:border md:border-green-50 md:shadow-sm md:hover:shadow-xl md:hover:-translate-y-1 transition-all w-full relative overflow-hidden">
            <div className="hidden md:block absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-bl from-green-100/50 to-transparent rounded-full z-0 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full bg-green-50 text-green-600 flex items-center justify-center shadow-sm border border-green-100 group-hover:scale-105 md:group-hover:scale-110 md:group-hover:bg-green-600 md:group-hover:text-white md:group-hover:border-green-600 transition-all duration-300 relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="flex flex-col items-center relative z-10 mt-1">
              <span className="text-[11px] md:text-xs lg:text-sm font-bold text-gray-700 md:text-gray-900 text-center tracking-wide group-hover:text-green-600 transition-colors">Kehadiran</span>
              <span className="hidden md:block text-[10px] lg:text-xs text-gray-500 text-center mt-1.5 font-medium">Scan QR Tiket</span>
            </div>
          </button>

          {/* Menu Parkiran */}
          <button onClick={() => onNavigate("fasilitas")} className="flex flex-col items-center gap-2 md:gap-3 group md:bg-white md:p-4 lg:p-6 md:rounded-3xl md:border md:border-purple-50 md:shadow-sm md:hover:shadow-xl md:hover:-translate-y-1 transition-all w-full relative overflow-hidden">
            <div className="hidden md:block absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-bl from-purple-100/50 to-transparent rounded-full z-0 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm border border-purple-100 group-hover:scale-105 md:group-hover:scale-110 md:group-hover:bg-purple-600 md:group-hover:text-white md:group-hover:border-purple-600 transition-all duration-300 relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </div>
            <div className="flex flex-col items-center relative z-10 mt-1">
              <span className="text-[11px] md:text-xs lg:text-sm font-bold text-gray-700 md:text-gray-900 text-center tracking-wide group-hover:text-purple-600 transition-colors">Fasilitas</span>
              <span className="hidden md:block text-[10px] lg:text-xs text-gray-500 text-center mt-1.5 font-medium">Cek Parkir & Kursi</span>
            </div>
          </button>
        </div>

        {/* --- DAFTAR PERIODE BELUM BOOKING --- */}
        {!isLoading && periodeBelumBooking.length > 0 && (
          <div className="bg-white rounded-2xl p-5 md:p-6 lg:p-8 border border-red-100 shadow-sm md:shadow-md relative overflow-hidden group w-full">
            {/* Decorative Background Desktop */}
            <div className="hidden md:block absolute -right-10 -top-10 text-red-50 opacity-50 transform group-hover:rotate-12 transition-transform duration-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-64 w-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>

            <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6 relative z-10">
              <div className="p-1.5 md:p-3 bg-red-50 rounded-lg md:rounded-xl text-red-500 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm md:text-lg lg:text-xl font-black text-gray-800 tracking-tight">Periode Belum Booking</h3>
                <p className="text-[10px] md:text-xs lg:text-sm text-gray-500 mt-0.5 md:mt-1 font-medium">Segera hubungi perwakilan periode di bawah ini</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 md:gap-3 lg:gap-4 relative z-10">
              {periodeBelumBooking.map((periode, index) => (
                <div 
                  key={index} 
                  className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-50 hover:bg-red-50 md:bg-white transition-colors border border-gray-200 md:border-red-100 text-gray-600 md:text-red-700 rounded-lg text-xs md:text-sm lg:text-sm font-bold shadow-sm hover:-translate-y-0.5 transform flex items-center gap-1.5 md:gap-2 cursor-default"
                >
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-400 animate-pulse md:shadow-[0_0_8px_rgba(248,113,113,0.8)]"></div>
                  {periode}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- DAFTAR PESERTA BELUM HADIR --- */}
        {!isLoading && pesertaBelumHadir.length > 0 && (
          <div className="bg-white rounded-2xl p-5 md:p-6 lg:p-8 border border-orange-100 shadow-sm md:shadow-md w-full relative overflow-hidden group">
            {/* Decorative Background Desktop */}
            <div className="hidden md:block absolute -right-10 -top-10 text-orange-50 opacity-40 transform group-hover:scale-110 transition-transform duration-1000">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-64 w-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>

            <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6 relative z-10">
              <div className="p-1.5 md:p-3 bg-orange-50 rounded-lg md:rounded-xl text-orange-500 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm md:text-lg lg:text-xl font-black text-gray-800 tracking-tight">Peserta Belum Hadir</h3>
                <p className="text-[10px] md:text-xs lg:text-sm text-gray-500 mt-0.5 md:mt-1 font-medium">Daftar peserta yang belum melakukan presensi</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 relative z-10 w-full">
              {pesertaBelumHadir.map((peserta) => (
                <div 
                  key={peserta.id} 
                  className="p-3 md:p-4 lg:p-5 bg-gray-50 md:bg-white md:hover:bg-orange-50/50 transition-colors border border-gray-100 md:border-orange-100 rounded-xl md:rounded-xl flex flex-col gap-1 md:gap-3 md:shadow-sm hover:-translate-y-1 md:hover:shadow-md transform duration-300"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs md:text-sm font-bold text-gray-700 md:text-gray-900 leading-tight md:tracking-tight">{peserta.nama}</span>
                    <span className="text-[9px] md:text-[10px] lg:text-[11px] px-1.5 py-0.5 md:px-2 md:py-1 bg-gray-200 md:bg-orange-100 text-gray-600 md:text-orange-800 rounded-md font-bold uppercase tracking-wider shrink-0">{peserta.periode}</span>
                  </div>
                  <div className="flex flex-col gap-1 md:gap-2 mt-1 md:mt-2 text-[10px] md:text-[11px] lg:text-xs text-gray-500">
                    <div className="flex items-center gap-1 md:gap-2">
                      <div className="md:p-1.5 md:bg-gray-50 md:rounded-md text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-3.5 md:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      </div>
                      <span className="flex-1 font-medium">Asisten: <span className="font-bold text-gray-700">{peserta.asisten}</span></span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <div className="md:p-1.5 md:bg-gray-50 md:rounded-md text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-3.5 md:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l-1.5 1.5A2.5 2.5 0 003 13.268V19a1 1 0 001 1h1m14-10l1.5 1.5A2.5 2.5 0 0121 13.268V19a1 1 0 01-1 1h-1M5 10V8a3 3 0 013-3h8a3 3 0 013 3v2M5 10h14" />
                      </svg>
                      </div>
                      <span className="flex-1 font-medium">Parkiran: <span className="font-bold text-gray-700">{peserta.parkiran}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- KONDISI SEMUA HADIR & BOOKING --- */}
        {isSemuaHadirDanBooking && (
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 md:p-12 shadow-md md:shadow-xl text-white text-center flex flex-col items-center justify-center gap-3 md:gap-6 w-full relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('/images/wall-texture.webp')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute -right-10 -top-10 text-white/10 transform group-hover:rotate-12 transition-transform duration-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-64 w-64" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="w-12 h-12 md:w-24 md:h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative z-10 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-12 md:w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="relative z-10">
              <h3 className="text-lg md:text-3xl font-black tracking-tight mb-1 md:mb-2">Luar Biasa!</h3>
              <p className="text-xs md:text-sm lg:text-base text-green-100 mt-1 md:font-medium max-w-md mx-auto leading-relaxed">Semua periode telah booking dan seluruh peserta telah hadir. Acara siap dimulai!</p>
            </div>
          </div>
        )}

      </div>
    </div>
    </div>
  );
}