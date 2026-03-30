"use client";

import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Pemasukan {
  id: string;
  tanggal: string;
  nama: string;
  nominal: number;
}

interface Pengeluaran {
  id: string;
  tanggal: string;
  nama: string;
  jumlah: string;
  nominal: number;
}

export default function Keuangan() {
  const [activeMode, setActiveMode] = useState<"pemasukan" | "pengeluaran">("pemasukan");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [pemasukanData, setPemasukanData] = useState<Pemasukan[]>([]);
  const [pengeluaranData, setPengeluaranData] = useState<Pengeluaran[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    nama: "",
    nominal: "", // Tetap string untuk input, di-parse saat submit
    jumlah_angka: "1",
    jumlah_unit: "Pcs",
  });

  // Fetch Data & Berlangganan Realtime
  useEffect(() => {
    const fetchData = async (isInitial = false) => {
      if (isInitial) setIsLoading(true);
      const [pemRes, pengRes] = await Promise.all([
        supabase.from("pemasukan").select("*").order("tanggal", { ascending: false }),
        supabase.from("pengeluaran").select("*").order("tanggal", { ascending: false })
      ]);
      if (pemRes.data) setPemasukanData(pemRes.data);
      if (pengRes.data) setPengeluaranData(pengRes.data);
      if (isInitial) setIsLoading(false);
    };

    fetchData(true);

    const channelPem = supabase.channel("realtime-pem").on("postgres_changes", { event: "*", schema: "public", table: "pemasukan" }, () => fetchData(false)).subscribe();
    const channelPeng = supabase.channel("realtime-peng").on("postgres_changes", { event: "*", schema: "public", table: "pengeluaran" }, () => fetchData(false)).subscribe();

    return () => {
      supabase.removeChannel(channelPem);
      supabase.removeChannel(channelPeng);
    };
  }, []);

  // Handler Simpan Data (Insert)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const nominalValue = parseInt(formData.nominal) || 0;

    if (activeMode === "pemasukan") {
      const { error } = await supabase.from("pemasukan").insert([{ tanggal: formData.tanggal, nama: formData.nama, nominal: nominalValue }]);
      if (error) alert("Gagal tambah pemasukan: " + error.message);
    } else {
      const jumlahString = `${formData.jumlah_angka} ${formData.jumlah_unit}`;
      const { error } = await supabase.from("pengeluaran").insert([{ tanggal: formData.tanggal, nama: formData.nama, jumlah: jumlahString, nominal: nominalValue }]);
      if (error) alert("Gagal tambah pengeluaran: " + error.message);
    }

    setIsSubmitting(false);
    setIsModalOpen(false);
    setFormData({ tanggal: new Date().toISOString().split("T")[0], nama: "", nominal: "", jumlah_angka: "1", jumlah_unit: "Pcs" });
  };

  // Handler Hapus Data
  const handleDelete = async (id: string, mode: "pemasukan" | "pengeluaran") => {
    if (!window.confirm(`Yakin ingin menghapus riwayat ${mode} ini?`)) return;
    const { error } = await supabase.from(mode).delete().eq("id", id);
    if (error) alert("Gagal menghapus data: " + error.message);
  };

  // Kalkulasi Total
  const totalPemasukan = useMemo(() => pemasukanData.reduce((acc, curr) => acc + curr.nominal, 0), [pemasukanData]);
  const totalPengeluaran = useMemo(() => pengeluaranData.reduce((acc, curr) => acc + curr.nominal, 0), [pengeluaranData]);
  const sisaSaldo = totalPemasukan - totalPengeluaran;

  // Filter & Format Data
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  };

  const filteredPemasukan = useMemo(() => 
    pemasukanData.filter(item => item.nama.toLowerCase().includes(searchQuery.toLowerCase())), 
  [searchQuery, pemasukanData]);

  const filteredPengeluaran = useMemo(() => 
    pengeluaranData.filter(item => item.nama.toLowerCase().includes(searchQuery.toLowerCase())), 
  [searchQuery, pengeluaranData]);

  return (
    <div className="w-full space-y-6 md:space-y-8">
      
      {/* --- HEADER --- */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Sumber Daya</h1>
        <p className="text-[11px] md:text-sm text-emerald-600 font-bold uppercase tracking-widest mt-0.5 md:mt-1">Keuangan</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        
        {/* --- KOLOM KIRI (Insight Cards) --- */}
        <div className="w-full md:w-5/12 lg:w-4/12 xl:w-1/3 space-y-4 md:space-y-6">
          
          {/* 1. Card Sisa Saldo (Hero Card) */}
          <div className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-3xl p-6 md:p-8 text-white shadow-2xl overflow-hidden group">
            {/* Ornamen Glow */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 rounded-full mix-blend-lighten filter blur-3xl opacity-80 group-hover:opacity-100 transition-all duration-700"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full mix-blend-lighten filter blur-3xl opacity-80 group-hover:opacity-100 transition-all duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                  <p className="text-xs md:text-sm font-medium text-gray-300 uppercase tracking-wider">Sisa Saldo Kas</p>
                </div>
              </div>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mt-4 mb-6">
                <span className="text-emerald-400/80 mr-1 text-2xl md:text-3xl">Rp</span>
                {sisaSaldo.toLocaleString('id-ID')}
              </h3>
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-[10px] md:text-xs text-gray-400">Total Akumulasi Realtime</span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
            </div>
          </div>

          {/* 2. Card Berjejeran (Pemasukan & Pengeluaran) */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {/* Card Pemasukan */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer" onClick={() => setActiveMode("pemasukan")}>
              <div className="absolute -right-4 -bottom-4 text-emerald-50 transform group-hover:scale-110 transition-transform duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8z"/><path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4z"/></svg>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-2 md:mb-3">
                  <div className="p-1 bg-emerald-50 text-emerald-600 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
                  </div>
                  <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Pemasukan</p>
                </div>
                <p className="text-sm md:text-lg lg:text-xl font-black text-gray-800 tracking-tight">
                  {formatRupiah(totalPemasukan).replace(',00', '')}
                </p>
              </div>
            </div>

            {/* Card Pengeluaran */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-red-100 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:border-red-200 transition-all cursor-pointer" onClick={() => setActiveMode("pengeluaran")}>
              <div className="absolute -right-4 -bottom-4 text-red-50 transform group-hover:scale-110 transition-transform duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8z"/><path d="M17 11H7v2h10z"/></svg>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-2 md:mb-3">
                  <div className="p-1 bg-red-50 text-red-600 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
                  </div>
                  <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Pengeluaran</p>
                </div>
                <p className="text-sm md:text-lg lg:text-xl font-black text-gray-800 tracking-tight">
                  {formatRupiah(totalPengeluaran).replace(',00', '')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- KOLOM KANAN (Switch, Actions & List) --- */}
        <div className="w-full md:w-7/12 lg:w-8/12 xl:w-2/3 bg-white p-4 md:p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col">
          
          {/* Area Atas Kanan: Switch Mode & Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            
            {/* Switch Mode */}
            <div className="flex items-center bg-gray-100 p-1.5 rounded-xl w-full sm:w-auto">
              <button 
                onClick={() => setActiveMode("pemasukan")} 
                className={`flex-1 sm:flex-none px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all duration-200 ${activeMode === 'pemasukan' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Pemasukan
              </button>
              <button 
                onClick={() => setActiveMode("pengeluaran")} 
                className={`flex-1 sm:flex-none px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all duration-200 ${activeMode === 'pengeluaran' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Pengeluaran
              </button>
            </div>

            {/* Tombol Tambah Dinamis */}
            <button onClick={() => setIsModalOpen(true)} className={`w-full sm:w-auto px-4 py-2 text-xs md:text-sm font-bold text-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 ${activeMode === 'pemasukan' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Tambah {activeMode === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
            </button>
          </div>

          {/* Pencarian (Search Bar) */}
          <div className="mb-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder={`Cari riwayat ${activeMode}...`} 
                className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#A6824A]/50 focus:border-[#A6824A] transition-all" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          {/* Daftar Riwayat Berdasarkan Mode Aktif */}
          <div className="flex-1 max-h-[60vh] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            
            {/* TAMPILAN PEMASUKAN */}
            {activeMode === "pemasukan" && (
              isLoading ? (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100 animate-pulse">Memuat data pemasukan...</div>
              ) : filteredPemasukan.length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100">Belum ada riwayat pemasukan.</div>
              ) : (
                filteredPemasukan.map((item) => (
                  <div key={item.id} className="p-3 md:p-4 bg-white hover:bg-emerald-50/30 transition-colors border border-gray-100 hover:border-emerald-100 rounded-xl flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                      <div className="hidden sm:flex w-10 h-10 shrink-0 bg-emerald-100 text-emerald-600 rounded-full items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] md:text-xs text-gray-400 font-medium mb-0.5">{formatDate(item.tanggal)}</p>
                        <p className="text-sm md:text-base font-bold text-gray-800 truncate">{item.nama}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right flex items-center gap-3">
                      <p className="text-sm md:text-base font-black text-emerald-600">+ {formatRupiah(item.nominal).replace(',00', '')}</p>
                      <button onClick={() => handleDelete(item.id, "pemasukan")} className="text-gray-300 hover:text-red-500 transition-colors p-1 md:opacity-0 group-hover:opacity-100 focus:opacity-100 rounded-md hover:bg-red-50" title="Hapus Riwayat">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))
              )
            )}

            {/* TAMPILAN PENGELUARAN */}
            {activeMode === "pengeluaran" && (
              isLoading ? (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100 animate-pulse">Memuat data pengeluaran...</div>
              ) : filteredPengeluaran.length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100">Belum ada riwayat pengeluaran.</div>
              ) : (
                filteredPengeluaran.map((item) => (
                  <div key={item.id} className="p-3 md:p-4 bg-white hover:bg-red-50/30 transition-colors border border-gray-100 hover:border-red-100 rounded-xl flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                      <div className="hidden sm:flex w-10 h-10 shrink-0 bg-red-100 text-red-600 rounded-full items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
                      </div>
                      <div className="min-w-0 flex flex-col">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[10px] md:text-xs text-gray-400 font-medium">{formatDate(item.tanggal)}</p>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-[9px] md:text-[10px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{item.jumlah}</span>
                        </div>
                        <p className="text-sm md:text-base font-bold text-gray-800 truncate">{item.nama}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right flex items-center gap-3">
                      <p className="text-sm md:text-base font-black text-red-600">- {formatRupiah(item.nominal).replace(',00', '')}</p>
                      <button onClick={() => handleDelete(item.id, "pengeluaran")} className="text-gray-300 hover:text-red-500 transition-colors p-1 md:opacity-0 group-hover:opacity-100 focus:opacity-100 rounded-md hover:bg-red-50" title="Hapus Riwayat">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))
              )
            )}
          </div>

        </div>
      </div>

      {/* MODAL TAMBAH DATA (Pop-up) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className={`p-5 border-b flex items-center justify-between ${activeMode === 'pemasukan' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
              <h3 className="font-bold text-lg">Tambah {activeMode === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tanggal</label>
                <input type="date" required value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A6824A]/50 focus:border-[#A6824A] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nama / Keterangan</label>
                <input type="text" required placeholder={activeMode === 'pemasukan' ? "Contoh: Donasi Hamba Allah..." : "Contoh: DP Sewa Kursi..."} value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A6824A]/50 focus:border-[#A6824A] transition-all" />
              </div>
              {activeMode === "pengeluaran" && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Jumlah</label>
                  <div className="flex gap-2">
                    <input type="number" inputMode="numeric" required placeholder="1" value={formData.jumlah_angka} onChange={(e) => setFormData({...formData, jumlah_angka: e.target.value})} className="w-1/3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A6824A]/50 focus:border-[#A6824A] transition-all" />
                    <div className="relative w-2/3">
                      <select required value={formData.jumlah_unit} onChange={(e) => setFormData({...formData, jumlah_unit: e.target.value})} className="w-full appearance-none px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A6824A]/50 focus:border-[#A6824A] transition-all">
                        <option>Pcs</option>
                        <option>Kotak</option>
                        <option>Unit</option>
                        <option>Paket</option>
                        <option>Buah</option>
                        <option>Meter</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nominal Uang (Rp)</label>
                <input type="number" inputMode="numeric" required placeholder="Contoh: 500000" value={formData.nominal} onChange={(e) => setFormData({...formData, nominal: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A6824A]/50 focus:border-[#A6824A] transition-all" />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className={`w-full py-3 rounded-xl font-bold text-white shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${activeMode === 'pemasukan' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSS Tambahan untuk Scrollbar Custom di List */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}} />
    </div>
  );
}