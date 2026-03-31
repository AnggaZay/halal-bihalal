"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Parisienne } from "next/font/google";

const parisienne = Parisienne({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

interface OverviewSumberDayaProps {
  onNavigate: (tab: "keuangan" | "perlengkapan" | "partnership" | "konsumsi") => void;
}

// Definisikan tipe data untuk kejelasan
interface Pengeluaran {
  id: string;
  nama: string;
  jumlah: string;
  nominal: number;
}

interface InsightPerlengkapan {
  nama: string;
  jenis: string;
  jumlah: string;
  status: string;
  statusColor: string;
}

interface InsightPartnership {
  nama: string;
  tahap: string;
  tanggal: string;
  status: string;
  statusColor: string;
}

interface PerlengkapanData {
  id: string;
  nama: string;
  jenis: string;
  jumlah: string;
  status: 'belum' | 'sudah';
}

interface PartnershipData {
  id: string;
  nama: string;
  keterangan: string;
  tahap: 'Pengajuan' | 'Verifikasi' | 'Diterima' | 'Ditolak';
  updated_at: string;
}

export default function OverviewSumberDaya({ onNavigate }: OverviewSumberDayaProps) {
  // Raw Data States untuk Full Stream
  const [pemasukanData, setPemasukanData] = useState<{id: string, nominal: number}[]>([]);
  const [pengeluaranData, setPengeluaranData] = useState<Pengeluaran[]>([]);
  const [perlengkapanData, setPerlengkapanData] = useState<PerlengkapanData[]>([]);
  const [partnershipData, setPartnershipData] = useState<PartnershipData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // FULL STREAM: Fetch data keuangan Realtime
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      const [pemRes, pengRes, perlRes, partRes] = await Promise.all([
        supabase.from("pemasukan").select("id, nominal"),
        supabase.from("pengeluaran").select("*").order("created_at", { ascending: false }),
        supabase.from("perlengkapan").select("*").order("created_at", { ascending: false }),
        supabase.from("partnership").select("*").order("created_at", { ascending: false }),
      ]);

      if (pemRes.data) setPemasukanData(pemRes.data);
      if (pengRes.data) setPengeluaranData(pengRes.data as Pengeluaran[]);
      if (perlRes.data) setPerlengkapanData(perlRes.data as PerlengkapanData[]);
      if (partRes.data) setPartnershipData(partRes.data as PartnershipData[]);
      
      setIsLoading(false);
    };
    fetchData();

    const channel = supabase.channel("realtime-overview-sumberdaya")
      .on("postgres_changes", { event: "*", schema: "public", table: "pemasukan" }, (payload) => {
        setPemasukanData((prev) => {
          if (payload.eventType === 'INSERT') return [payload.new as {id: string, nominal: number}, ...prev];
          if (payload.eventType === 'UPDATE') return prev.map((item) => item.id === payload.new.id ? payload.new as {id: string, nominal: number} : item);
          if (payload.eventType === 'DELETE') return prev.filter((item) => item.id !== (payload.old as {id: string}).id);
          return prev;
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "pengeluaran" }, (payload) => {
        setPengeluaranData((prev) => {
          if (payload.eventType === 'INSERT') return [payload.new as Pengeluaran, ...prev];
          if (payload.eventType === 'UPDATE') return prev.map((item) => item.id === payload.new.id ? payload.new as Pengeluaran : item);
          if (payload.eventType === 'DELETE') return prev.filter((item) => item.id !== (payload.old as {id: string}).id);
          return prev;
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "perlengkapan" }, (payload) => {
        setPerlengkapanData((prev) => {
          if (payload.eventType === 'INSERT') return [payload.new as PerlengkapanData, ...prev];
          if (payload.eventType === 'UPDATE') return prev.map((item) => item.id === payload.new.id ? payload.new as PerlengkapanData : item);
          if (payload.eventType === 'DELETE') return prev.filter((item) => item.id !== (payload.old as {id: string}).id);
          return prev;
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "partnership" }, (payload) => {
        setPartnershipData((prev) => {
          if (payload.eventType === 'INSERT') return [payload.new as PartnershipData, ...prev];
          if (payload.eventType === 'UPDATE') return prev.map((item) => item.id === payload.new.id ? payload.new as PartnershipData : item);
          if (payload.eventType === 'DELETE') return prev.filter((item) => item.id !== (payload.old as {id: string}).id);
          return prev;
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- KALKULASI TURUNAN (Derived State) ---
  const sisaSaldo = useMemo(() => {
    const totalPem = pemasukanData.reduce((acc, curr) => acc + (curr.nominal || 0), 0);
    const totalPeng = pengeluaranData.reduce((acc, curr) => acc + (curr.nominal || 0), 0);
    return totalPem - totalPeng;
  }, [pemasukanData, pengeluaranData]);

  const recentPengeluaran = useMemo(() => pengeluaranData.slice(0, 3), [pengeluaranData]);

  const progressPerlengkapan = useMemo(() => {
    const total = perlengkapanData.length;
    if (total === 0) return 0;
    const sudah = perlengkapanData.filter(p => p.status === 'sudah').length;
    return Math.round((sudah / total) * 100);
  }, [perlengkapanData]);

  const insightPerlengkapan = useMemo<InsightPerlengkapan[]>(() => {
    return perlengkapanData
      .filter(p => p.status === 'belum')
      .slice(0, 3)
      .map(item => ({
        nama: item.nama, jenis: item.jenis, jumlah: item.jumlah, status: 'Belum Siap', statusColor: 'yellow'
      }));
  }, [perlengkapanData]);

  const progressPartnership = useMemo(() => {
    const total = partnershipData.length;
    if (total === 0) return 0;
    const selesai = partnershipData.filter(p => p.tahap === 'Diterima' || p.tahap === 'Ditolak').length;
    return Math.round((selesai / total) * 100);
  }, [partnershipData]);

  const insightPartnership = useMemo<InsightPartnership[]>(() => {
    return partnershipData
      .filter(p => p.tahap === 'Pengajuan' || p.tahap === 'Verifikasi')
      .slice(0, 3)
      .map(item => ({
        nama: item.nama,
        tahap: item.tahap,
        tanggal: item.updated_at ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(item.updated_at)) : '-',
        status: item.tahap === 'Pengajuan' ? 'Follow Up' : 'Verifikasi',
        statusColor: item.tahap === 'Pengajuan' ? 'yellow' : 'blue'
      }));
  }, [partnershipData]);

  // Kondisi untuk menampilkan tabel list insight jika progress belum 100% DAN datanya ada
  const showInsightPerlengkapan = progressPerlengkapan < 100 && insightPerlengkapan.length > 0;
  const showInsightPartnership = progressPartnership < 100 && insightPartnership.length > 0;

  return (
    <div className="w-full min-h-screen bg-gray-50/50 pb-10 md:pb-16">
      <div className="w-full md:max-w-[1400px] mx-auto md:pt-4">
        {/* --- HEADER --- */}
        <div className="bg-white px-5 py-6 md:px-10 md:py-10 rounded-b-3xl md:rounded-3xl shadow-sm border-b md:border border-gray-100 mb-6 md:mt-4 md:mx-6 flex items-center justify-between relative overflow-hidden">
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-500/5 to-transparent"></div>
          <div className="hidden md:block absolute -right-4 -bottom-10 text-blue-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-48 w-48" fill="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6 relative z-10">
            <div className="w-12 h-12 md:w-20 md:h-20 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg border-2 md:border-4 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-10 md:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <div className="flex flex-col">
              <h1 className="flex items-baseline gap-1.5 md:gap-3 text-[#101111]">
                <span className={`${parisienne.className} text-3xl md:text-4xl lg:text-5xl text-[#A6824A] leading-none drop-shadow-sm`}>
                  Halal Bihalal
                </span>
                <span className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">2026</span>
              </h1>
              <p className="text-[11px] md:text-xs lg:text-sm text-gray-500 font-bold md:font-semibold tracking-widest uppercase mt-0.5 md:mt-1">
                Dashboard Sumber Daya
              </p>
            </div>
          </div>
        </div>

        <main className="px-4 md:px-6 space-y-6 md:space-y-8">

            {/* Card Saldo Uang */}
            <div className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl p-6 text-white shadow-xl overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/20 rounded-full mix-blend-lighten filter blur-2xl opacity-80 group-hover:opacity-100 transition-all"></div>
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500/20 rounded-full mix-blend-lighten filter blur-2xl opacity-80 group-hover:opacity-100 transition-all"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-gray-300">Sisa Saldo Uang</p>
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Rp {isLoading ? "..." : sisaSaldo.toLocaleString('id-ID')}</h3>
                    <div className="text-xs text-emerald-300 font-medium bg-emerald-400/10 inline-block px-2 py-1 rounded-md border border-emerald-400/20">
                        Terakhir diupdate: Hari ini
                    </div>
                </div>
            </div>

            {/* Card Progress (Berjejeran) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>
                        <p className="text-xs md:text-sm text-gray-500 font-semibold">Progress Perlengkapan</p>
                    </div>
                    <span className="text-2xl md:text-3xl font-bold text-gray-800">{progressPerlengkapan}%</span>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: `${progressPerlengkapan}%`}}></div></div>
                </div>
                <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center hover:border-purple-200 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg></div>
                        <p className="text-xs md:text-sm text-gray-500 font-semibold">Progress Partnership</p>
                    </div>
                    <span className="text-2xl md:text-3xl font-bold text-gray-800">{progressPartnership}%</span>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-2"><div className="bg-purple-500 h-2 rounded-full" style={{width: `${progressPartnership}%`}}></div></div>
                </div>
            </div>

            {/* 4 Menu Aksi */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 py-2">
                <button onClick={() => onNavigate("keuangan")} className="flex flex-col items-center justify-center p-3 md:p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all group">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg></div>
                    <span className="text-xs md:text-sm font-semibold text-gray-700">Keuangan</span>
                </button>
                <button onClick={() => onNavigate("perlengkapan")} className="flex flex-col items-center justify-center p-3 md:p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-all group">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg></div>
                    <span className="text-xs md:text-sm font-semibold text-gray-700">Perlengkapan</span>
                </button>
                <button onClick={() => onNavigate("partnership")} className="flex flex-col items-center justify-center p-3 md:p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-purple-50 hover:border-purple-200 transition-all group">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg></div>
                    <span className="text-xs md:text-sm font-semibold text-gray-700">Partnership</span>
                </button>
                <button onClick={() => onNavigate("konsumsi")} className="flex flex-col items-center justify-center p-3 md:p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-orange-50 hover:border-orange-200 transition-all group">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5h18z"></path></svg></div>
                    <span className="text-xs md:text-sm font-semibold text-gray-700">Konsumsi</span>
                </button>
            </div>

            {/* BAGIAN INSIGHTS (Desktop: Grid 3 kolom, Mobile: Stack kebawah) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                {/* TIPS: Bungkus div ini dengan statement if(progress_perlengkapan < 100) di kodemu nanti */}
                {showInsightPerlengkapan && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80 flex items-center gap-2"><h3 className="font-bold text-gray-800 text-sm md:text-base">Insight Perlengkapan</h3></div>
                        <ul className="divide-y divide-gray-100 flex-1">{insightPerlengkapan.map((item, i) => <li key={i} className="p-4 flex flex-col gap-2 hover:bg-gray-50/80 transition"><div className="flex justify-between items-start"><p className="font-bold text-gray-800 text-sm">{item.nama}</p><span className={`px-2 py-1 ${item.statusColor === 'red' ? 'bg-red-100 text-red-700' : item.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'} text-[10px] font-bold uppercase rounded-md tracking-wider`}>{item.status}</span></div><div className="flex justify-between items-center text-xs text-gray-500"><span className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${item.jenis === 'Sewa' ? 'bg-blue-400' : item.jenis === 'Pinjam' ? 'bg-purple-400' : 'bg-green-400'}`}></span>{item.jenis}</span><span>{item.jumlah}</span></div></li>)}</ul>
                    </div>
                )}
                {/* TIPS: Bungkus div ini dengan statement if(progress_partnership < 100) */}
                {showInsightPartnership && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80 flex items-center gap-2"><h3 className="font-bold text-gray-800 text-sm md:text-base">Insight Partnership</h3></div>
                        <ul className="divide-y divide-gray-100 flex-1">{insightPartnership.map((item, i) => <li key={i} className="p-4 flex flex-col gap-2 hover:bg-gray-50/80 transition"><div className="flex justify-between items-start"><p className="font-bold text-gray-800 text-sm">{item.nama}</p><span className={`px-2 py-1 ${item.statusColor === 'green' ? 'bg-green-100 text-green-700' : item.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'} text-[10px] font-bold uppercase rounded-md tracking-wider`}>{item.status}</span></div><div className="flex justify-between items-center text-xs text-gray-500"><span>Tahap: <span className="font-semibold text-gray-700">{item.tahap}</span></span><span>{item.tanggal}</span></div></li>)}</ul>
                    </div>
                )}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:col-span-1">
                    <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80 flex items-center gap-2"><h3 className="font-bold text-gray-800 text-sm md:text-base">Pengeluaran Terbaru</h3></div>
                    <ul className="divide-y divide-gray-100 flex-1">
                        {isLoading ? (
                            <li className="p-4 text-center text-sm text-gray-500 animate-pulse">Memuat...</li>
                        ) : recentPengeluaran.length === 0 ? (
                            <li className="p-4 text-center text-sm text-gray-500">Belum ada pengeluaran.</li>
                        ) : (
                            recentPengeluaran.map((item) => <li key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50/80 transition"><div><p className="font-bold text-gray-800 text-sm">{item.nama}</p><p className="text-xs text-gray-500">{item.jumlah}</p></div><span className="font-bold text-red-600">- Rp {item.nominal.toLocaleString('id-ID')}</span></li>)
                        )}
                    </ul>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}