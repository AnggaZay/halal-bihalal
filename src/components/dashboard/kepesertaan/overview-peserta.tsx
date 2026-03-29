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

export default function OverviewPeserta({ onNavigate }: OverviewPesertaProps) {
  const totalKursi = 40; // Di-fix menjadi 40 kursi
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
  const [pesertaBelumHadir, setPesertaBelumHadir] = useState<{
    id: number | string;
    nama: string;
    periode: string;
    asisten: string;
    parkiran: string;
  }[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Ambil semua data dari tabel invitations
        const { data, error } = await supabase
          .from("invitations")
          .select("*");

        if (error) throw error;

        if (data) {
          // LOG DATA: Cek console (F12) di browser untuk melihat nama kolom asli dari Supabase-mu!
          console.log("Data mentah Supabase:", data);

          // 1. Terbooking = Jumlah total tamu (Dihitung per kepala dari koma di kolom full_name)
          const jumlahTerbooking = data.reduce((sum, item) => {
            const count = item.full_name ? item.full_name.split(",").length : 1;
            return sum + count;
          }, 0);
          setTerbooking(jumlahTerbooking);

          // 2. Kehadiran = Peserta yang is_present-nya true (sudah check-in)
          // Kursi Kosong otomatis dihitung di atas: totalKursi (40) - kehadiran
          const dataHadir = data.filter(item => item.is_present === true);
          const jumlahKehadiran = dataHadir.reduce((sum, item) => {
            const count = item.full_name ? item.full_name.split(",").length : 1;
            return sum + count;
          }, 0);
          setKehadiran(jumlahKehadiran);

          // 3. Filter Periode Belum Booking (Periode yang belum ada di tabel)
          const periodeSudahBooking = Array.from(
            new Set(data.map((item) => item.periode).filter(Boolean))
          );
          const sisaPeriode = semuaPeriode.filter(
            (p) => !periodeSudahBooking.includes(p)
          );
          setPeriodeBelumBooking(sisaPeriode);

          // 4. Filter Peserta Belum Hadir
          // (Udah booking tapi is_present belum true. Di-split karena 1 baris bisa berisi 2+ tamu!)
          const belumHadirList: {
            id: string;
            nama: string;
            periode: string;
            asisten: string;
            parkiran: string;
          }[] = [];

          data
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
        }
      } catch (error) {
        console.error("Gagal menarik data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pastikan loading selesai sebelum menampilkan status "Luar Biasa!"
  const isSemuaHadirDanBooking = !isLoading && periodeBelumBooking.length === 0 && pesertaBelumHadir.length === 0;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50/50 pb-10">
      {/* --- HEADER --- */}
      <div className="bg-white px-5 py-6 rounded-b-3xl shadow-sm border-b border-gray-100 mb-6">
        <div className="flex items-center gap-3">
          {/* Placeholder Logo */}
          <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-[#A6824A] to-[#D4AF37] flex items-center justify-center shadow-md border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          {/* Judul & Tahun */}
          <div className="flex flex-col">
            <h1 className="flex items-baseline gap-1.5 text-[#101111]">
              <span className={`${parisienne.className} text-3xl text-[#A6824A] leading-none`}>
                Halal Bihalal
              </span>
              <span className="text-xl font-bold tracking-tight">2026</span>
            </h1>
            <p className="text-[11px] text-gray-500 font-medium tracking-wide uppercase mt-0.5">
              Dashboard Kepesertaan
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-8">
        {/* --- 3 CARD INSIGHT (No Horizontal Scroll) --- */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Card 1: Terbooking */}
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
            <span className="text-[10px] sm:text-xs text-gray-500 font-semibold mb-1 leading-tight">Terbooking</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-bold text-[#A6824A]">{isLoading ? "..." : terbooking}</span>
              <span className="text-[10px] text-gray-400">/{totalKursi}</span>
            </div>
          </div>

          {/* Card 2: Kursi Kosong */}
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
            <span className="text-[10px] sm:text-xs text-gray-500 font-semibold mb-1 leading-tight">Kursi Kosong</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-bold text-gray-700">{isLoading ? "..." : kursiKosong}</span>
              <span className="text-[10px] text-gray-400">/{totalKursi}</span>
            </div>
          </div>

          {/* Card 3: Periode Blm Booking */}
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
            <span className="text-[10px] sm:text-xs text-gray-500 font-semibold mb-1 leading-tight">Sisa Periode</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-bold text-red-500">{isLoading ? "..." : periodeBelumBooking.length}</span>
              <span className="text-[10px] text-gray-400">/{semuaPeriode.length}</span>
            </div>
          </div>
        </div>

        {/* --- 3 MENU CIRCLE --- */}
        <div className="grid grid-cols-3 gap-4 py-2">
          {/* Menu Data Master */}
          <button onClick={() => onNavigate("data")} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100 group-hover:scale-105 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <span className="text-[11px] font-bold text-gray-700 text-center">Data Master</span>
          </button>

          {/* Menu Kehadiran */}
          <button onClick={() => onNavigate("kehadiran")} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center shadow-sm border border-green-100 group-hover:scale-105 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-[11px] font-bold text-gray-700 text-center">Kehadiran</span>
          </button>

          {/* Menu Parkiran */}
          <button onClick={() => onNavigate("fasilitas")} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm border border-purple-100 group-hover:scale-105 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </div>
            <span className="text-[11px] font-bold text-gray-700 text-center">Parkiran</span>
          </button>
        </div>

        {/* --- DAFTAR PERIODE BELUM BOOKING --- */}
        {!isLoading && periodeBelumBooking.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-red-50 rounded-lg text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Periode Belum Booking</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Segera hubungi perwakilan periode di bawah ini</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {periodeBelumBooking.map((periode, index) => (
                <div 
                  key={index} 
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></div>
                  {periode}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- DAFTAR PESERTA BELUM HADIR --- */}
        {!isLoading && pesertaBelumHadir.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-orange-50 rounded-lg text-orange-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Peserta Belum Hadir</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Daftar peserta yang belum melakukan presensi</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2.5">
              {pesertaBelumHadir.map((peserta) => (
                <div 
                  key={peserta.id} 
                  className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex flex-col gap-1"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-gray-700">{peserta.nama}</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded-md font-medium">{peserta.periode}</span>
                  </div>
                  <div className="flex flex-col gap-1 mt-1 text-[10px] text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Asisten: <span className="font-semibold text-gray-600">{peserta.asisten}</span></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l-1.5 1.5A2.5 2.5 0 003 13.268V19a1 1 0 001 1h1m14-10l1.5 1.5A2.5 2.5 0 0121 13.268V19a1 1 0 01-1 1h-1M5 10V8a3 3 0 013-3h8a3 3 0 013 3v2M5 10h14" />
                      </svg>
                      <span>Parkiran: <span className="font-semibold text-gray-600">{peserta.parkiran}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- KONDISI SEMUA HADIR & BOOKING --- */}
        {isSemuaHadirDanBooking && (
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-md text-white text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold">Luar Biasa!</h3>
              <p className="text-xs text-green-100 mt-1">Semua periode telah booking dan seluruh peserta telah hadir.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}