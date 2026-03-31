"use client";

import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface PartnershipItem {
  id: string;
  nama: string;
  keterangan: string;
  tahap: 'Pengajuan' | 'Verifikasi' | 'Diterima' | 'Ditolak';
  updated_at: string;
}

export default function Partnership() {
  const [items, setItems] = useState<PartnershipItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Form Tambah
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ nama: "", keterangan: "" });

  // Fetch Data & Berlangganan Realtime
  useEffect(() => {
    const fetchData = async (isInitial = false) => {
      if (isInitial) setIsLoading(true);
      const { data, error } = await supabase
        .from("partnership")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (data) setItems(data as PartnershipItem[]);
      if (isInitial) setIsLoading(false);
    };

    fetchData(true);

    const channel = supabase.channel("realtime-partnership")
      .on(
        "postgres_changes", 
        { event: "*", schema: "public", table: "partnership" }, 
        (payload) => {
          // Full Stream: Suntikkan perubahan langsung ke state tanpa fetch ulang
          setItems((prev) => {
            if (payload.eventType === 'INSERT') {
              return [payload.new as PartnershipItem, ...prev];
            }
            if (payload.eventType === 'UPDATE') {
              return prev.map((item) => (item.id === payload.new.id ? (payload.new as PartnershipItem) : item));
            }
            if (payload.eventType === 'DELETE') {
              return prev.filter((item) => item.id !== (payload.old as { id: string }).id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Kalkulasi Statistik
  const totalItems = items.length;
  const selesaiItems = useMemo(() => items.filter(i => i.tahap === 'Diterima' || i.tahap === 'Ditolak'), [items]);
  const belumItems = useMemo(() => items.filter(i => i.tahap === 'Pengajuan' || i.tahap === 'Verifikasi'), [items]);
  
  // Persentase
  const progressSelesai = totalItems > 0 ? Math.round((selesaiItems.length / totalItems) * 100) : 0;
  const progressBelum = totalItems > 0 ? 100 - progressSelesai : 0;

  // Handler Update Tahap (Inline)
  const updateTahap = async (id: string, nama: string, tahapBaru: PartnershipItem['tahap']) => {
    let confirmMsg = "";
    if (tahapBaru === 'Verifikasi') {
      confirmMsg = `Konfirmasi: Apakah pengajuan/proposal ke pihak "${nama}" sudah diserahkan dan saat ini sedang diverifikasi oleh mereka?`;
    } else if (tahapBaru === 'Diterima') {
      confirmMsg = `Kabar Baik: Apakah pihak "${nama}" telah memberikan keputusan resmi MENERIMA kerja sama ini?`;
    } else if (tahapBaru === 'Ditolak') {
      confirmMsg = `Informasi: Apakah pihak "${nama}" memberikan keputusan MENOLAK kerja sama ini?`;
    }
    
    if (!window.confirm(confirmMsg)) return;

    const { error } = await supabase.from('partnership').update({
      tahap: tahapBaru,
      updated_at: new Date().toISOString().split('T')[0]
    }).eq('id', id);
    if (error) alert("Gagal update tahap: " + error.message);
  };

  // Handler Hapus
  const handleDelete = async (id: string, nama: string) => {
    if (window.confirm(`Hapus data partnership "${nama}"?`)) {
      const { error } = await supabase.from('partnership').delete().eq('id', id);
      if (error) alert("Gagal menghapus data: " + error.message);
    }
  };

  // Handler Submit Tambah
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.from('partnership').insert([{
      nama: formData.nama,
      keterangan: formData.keterangan,
      tahap: 'Pengajuan',
    }]);

    if (error) alert("Gagal tambah partnership: " + error.message);

    setIsSubmitting(false);
    setIsModalOpen(false);
    setFormData({ nama: "", keterangan: "" });
  };

  // Fungsi untuk mendapatkan warna berdasarkan tahap
  const getTahapColor = (tahap: string) => {
    switch(tahap) {
      case 'Pengajuan': return { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', bar: 'bg-yellow-400', w: 'w-1/3' };
      case 'Verifikasi': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', bar: 'bg-blue-400', w: 'w-2/3' };
      case 'Diterima': return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', bar: 'bg-green-500', w: 'w-full' };
      case 'Ditolak': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', bar: 'bg-red-500', w: 'w-full' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', bar: 'bg-gray-400', w: 'w-0' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  };

  return (
    <div className="w-full space-y-6 md:space-y-8">
      
      {/* --- HEADER --- */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Sumber Daya</h1>
        <p className="text-[11px] md:text-sm text-purple-600 font-bold uppercase tracking-widest mt-0.5 md:mt-1">Partnership</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        
        {/* --- KOLOM KIRI (Insight Cards) --- */}
        <div className="w-full md:w-5/12 lg:w-4/12 xl:w-1/3 space-y-4 md:space-y-6">
          
          {/* 1. Card Progress Keseluruhan */}
          <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-xl overflow-hidden group">
            {/* Ornamen Background */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-500/20 rounded-full mix-blend-overlay filter blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-400/30 rounded-full mix-blend-overlay filter blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <p className="text-sm font-medium text-purple-100 uppercase tracking-wider mb-4">Progress Kemitraan</p>
              
              {/* Custom Circular Progress */}
              <div className="relative w-36 h-36 flex items-center justify-center mb-6">
                 <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="18" r="15.9155" fill="none" className="stroke-white/20" strokeWidth="3" />
                    <circle 
                      cx="18" cy="18" r="15.9155" fill="none" className="stroke-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" 
                      strokeWidth="3.5" strokeDasharray="100" strokeDashoffset={100 - progressSelesai} strokeLinecap="round" 
                      style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} 
                    />
                 </svg>
                 <div className="absolute flex flex-col items-center justify-center">
                   <span className="text-4xl lg:text-5xl font-black tracking-tighter">{progressSelesai}%</span>
                 </div>
              </div>
              
              <div className="bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10">
                <p className="text-xs font-medium text-purple-50">{selesaiItems.length} dari {totalItems} Kemitraan Selesai</p>
              </div>
            </div>
          </div>

          {/* 2. Card Berjejeran (Selesai & Belum) */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {/* Card Selesai */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-green-100 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden group hover:border-green-200 transition-all">
              <div className="absolute -right-3 -bottom-3 text-green-50 transform group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              </div>
              <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest relative z-10 mb-1">Sudah Selesai</p>
              <p className="text-2xl md:text-3xl font-black text-green-600 relative z-10">{progressSelesai}%</p>
            </div>
            
            {/* Card Belum Selesai */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-yellow-100 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden group hover:border-yellow-200 transition-all">
               <div className="absolute -right-3 -bottom-3 text-yellow-50 transform group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              </div>
              <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest relative z-10 mb-1">Belum Selesai</p>
              <p className="text-2xl md:text-3xl font-black text-yellow-500 relative z-10">{progressBelum}%</p>
            </div>
          </div>
        </div>

        {/* --- KOLOM KANAN (Daftar & Aksi) --- */}
        <div className="w-full md:w-7/12 lg:w-8/12 xl:w-2/3 bg-white p-4 md:p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col">
          
          {/* Header List & Tombol Tambah */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
             <div>
               <h3 className="text-lg font-bold text-gray-800">Daftar Partnership</h3>
               <p className="text-xs text-gray-500">Kelola progress kemitraan dan sponsorship</p>
             </div>
             <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto px-4 py-2.5 text-xs md:text-sm font-bold text-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Tambah Mitra
             </button>
          </div>

          {/* Daftar Item */}
          <div className="flex-1 max-h-[55vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
             {isLoading ? (
               <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100 animate-pulse">Memuat data partnership...</div>
             ) : items.length === 0 ? (
               <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                 Belum ada data partnership.
               </div>
             ) : (
                items.map((item) => {
                  const tColor = getTahapColor(item.tahap);
                  return (
                   <div key={item.id} className="p-4 bg-white border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all rounded-2xl group flex flex-col gap-3">
                      
                      {/* Baris 1: Info Mitra & Status Badge */}
                      <div className="flex justify-between items-start gap-4">
                         <div className="flex items-center gap-3">
                            <div className="hidden sm:flex w-10 h-10 shrink-0 bg-purple-50 text-purple-600 rounded-full items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <div>
                              <h4 className="text-sm md:text-base font-bold text-gray-800">{item.nama}</h4>
                              <p className="text-xs text-gray-500 font-medium">{item.keterangan}</p>
                            </div>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className={`px-2 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-md border ${tColor.bg} ${tColor.text} ${tColor.border}`}>
                              {item.tahap}
                            </span>
                            <span className="text-[10px] text-gray-400 mt-1">{formatDate(item.updated_at)}</span>
                         </div>
                      </div>

                      {/* Baris 2: Progress Bar */}
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
                         <div className={`h-1.5 rounded-full transition-all duration-500 ${tColor.bar} ${tColor.w}`}></div>
                      </div>

                      {/* Baris 3: Aksi/Tombol Update Status Inline */}
                      <div className="flex justify-between items-center mt-2">
                         
                         {/* Action Buttons Container */}
                         <div className="flex items-center gap-2">
                            {item.tahap === 'Pengajuan' && (
                               <button onClick={() => updateTahap(item.id, item.nama, 'Verifikasi')} className="text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                 Sedang Diverifikasi <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                               </button>
                            )}
                            {item.tahap === 'Verifikasi' && (
                               <>
                                 <button onClick={() => updateTahap(item.id, item.nama, 'Diterima')} className="text-xs font-bold bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Diterima
                                 </button>
                                 <button onClick={() => updateTahap(item.id, item.nama, 'Ditolak')} className="text-xs font-bold bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> Ditolak
                                 </button>
                               </>
                            )}
                            {(item.tahap === 'Diterima' || item.tahap === 'Ditolak') && (
                               <span className="text-xs text-gray-400 italic">Selesai diproses.</span>
                            )}
                         </div>

                         {/* Delete Button (Visible on Hover) */}
                         <button onClick={() => handleDelete(item.id, item.nama)} className="text-gray-300 hover:text-red-500 transition-colors p-1.5 md:opacity-0 group-hover:opacity-100 focus:opacity-100 rounded-md hover:bg-red-50" title="Hapus Kemitraan">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                      </div>

                   </div>
                );
              })
             )}
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH DATA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b flex items-center justify-between bg-purple-50 border-purple-100 text-purple-800">
              <h3 className="font-bold text-lg">Tambah Partnership Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nama Instansi/Mitra</label>
                <input type="text" required placeholder="Contoh: PT. ABC, Toko Kue..." value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Keterangan / Target Sponsorship</label>
                <input type="text" required placeholder="Contoh: Bantuan Dana, Snack, Minuman..." value={formData.keterangan} onChange={(e) => setFormData({...formData, keterangan: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all" />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl font-bold text-white shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-700">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}} />
    </div>
  );
}