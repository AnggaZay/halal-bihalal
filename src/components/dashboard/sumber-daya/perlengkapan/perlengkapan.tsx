"use client";

import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface ItemPerlengkapan {
  id: string;
  nama: string;
  jenis: 'Beli' | 'Sewa' | 'Pinjam';
  jumlah: string;
  status: 'belum' | 'sudah';
  tanggal_penyelesaian?: string;
}

export default function Perlengkapan() {
  const [activeMode, setActiveMode] = useState<"belum" | "sudah">("belum");
  const [items, setItems] = useState<ItemPerlengkapan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk Modal Form Tambah Data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    jenis: "Sewa",
    jumlah_angka: "1",
    jumlah_unit: "Unit",
  });

  // Fetch Data & Berlangganan Realtime
  useEffect(() => {
    const fetchData = async (isInitial = false) => {
      if (isInitial) setIsLoading(true);
      const { data, error } = await supabase
        .from("perlengkapan")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (data) setItems(data as ItemPerlengkapan[]);
      if (isInitial) setIsLoading(false);
    };

    fetchData(true);

    const channel = supabase.channel("realtime-perlengkapan")
      .on(
        "postgres_changes", 
        { event: "*", schema: "public", table: "perlengkapan" }, 
        (payload) => {
          setItems((prev) => {
            if (payload.eventType === 'INSERT') return [payload.new as ItemPerlengkapan, ...prev];
            if (payload.eventType === 'UPDATE') return prev.map((item) => (item.id === payload.new.id ? (payload.new as ItemPerlengkapan) : item));
            if (payload.eventType === 'DELETE') return prev.filter((item) => item.id !== (payload.old as { id: string }).id);
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Kalkulasi Data
  const belumItems = useMemo(() => items.filter(i => i.status === 'belum'), [items]);
  const sudahItems = useMemo(() => items.filter(i => i.status === 'sudah'), [items]);
  const totalItems = items.length;
  
  // Persentase
  const progressSudah = totalItems > 0 ? Math.round((sudahItems.length / totalItems) * 100) : 0;
  const progressBelum = totalItems > 0 ? 100 - progressSudah : 0;

  const displayedItems = activeMode === 'belum' ? belumItems : sudahItems;

  // Handler untuk mengkonfirmasi barang menjadi "sudah"
  const handleSelesaikan = async (id: string, nama: string) => {
    const confirm = window.confirm(`Peringatan: Apakah perlengkapan "${nama}" benar-benar sudah siap/beres?`);
    if (confirm) {
      const { error } = await supabase.from('perlengkapan').update({
        status: 'sudah',
        tanggal_penyelesaian: new Date().toISOString().split('T')[0]
      }).eq('id', id);
      
      if (error) alert("Gagal update status: " + error.message);
    }
  };

  // Handler untuk menghapus data
  const handleDelete = async (id: string, nama: string) => {
    if (!window.confirm(`Yakin ingin menghapus data perlengkapan "${nama}"?`)) return;
    const { error } = await supabase.from('perlengkapan').delete().eq('id', id);
    if (error) alert("Gagal menghapus data: " + error.message);
  };

  // Handler Simpan Data Baru
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const jumlahString = `${formData.jumlah_angka} ${formData.jumlah_unit}`;
    const { error } = await supabase.from('perlengkapan').insert([{
      nama: formData.nama,
      jenis: formData.jenis,
      jumlah: jumlahString,
      status: 'belum'
    }]);

    if (error) alert("Gagal tambah perlengkapan: " + error.message);
    
    setIsSubmitting(false);
    setIsModalOpen(false);
    setFormData({ nama: "", jenis: "Sewa", jumlah_angka: "1", jumlah_unit: "Unit" });
  };
  
  // Format Tanggal
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  };

  return (
    <div className="w-full space-y-6 md:space-y-8">
      
      {/* --- HEADER --- */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Sumber Daya</h1>
        <p className="text-[11px] md:text-sm text-blue-600 font-bold uppercase tracking-widest mt-0.5 md:mt-1">Perlengkapan</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        
        {/* --- KOLOM KIRI (Insight Cards) --- */}
        <div className="w-full md:w-5/12 lg:w-4/12 xl:w-1/3 space-y-4 md:space-y-6">
          
          {/* 1. Card Progress Utama */}
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-6 md:p-8 text-white shadow-xl overflow-hidden group">
            {/* Ornamen Background */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full mix-blend-overlay filter blur-xl group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-400/30 rounded-full mix-blend-overlay filter blur-xl group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <p className="text-sm font-medium text-blue-100 uppercase tracking-wider mb-4">Progress Kesiapan</p>
              
              {/* Custom SVG Circular Progress */}
              <div className="relative w-36 h-36 flex items-center justify-center mb-6">
                 <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                    {/* Background Circle */}
                    <circle cx="18" cy="18" r="15.9155" fill="none" className="stroke-white/20" strokeWidth="3" />
                    {/* Progress Circle (15.9155 radius creates exactly 100 circumference) */}
                    <circle 
                      cx="18" cy="18" r="15.9155" fill="none" className="stroke-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" 
                      strokeWidth="3.5" strokeDasharray="100" strokeDashoffset={100 - progressSudah} strokeLinecap="round" 
                      style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} 
                    />
                 </svg>
                 <div className="absolute flex flex-col items-center justify-center">
                   <span className="text-4xl lg:text-5xl font-black tracking-tighter">{progressSudah}%</span>
                 </div>
              </div>
              
              <div className="bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10">
                <p className="text-xs font-medium text-blue-50">{sudahItems.length} dari {totalItems} item sudah siap</p>
              </div>
            </div>
          </div>

          {/* 2. Card Berjejeran (Sudah & Belum Persentase) */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {/* Card Sudah */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-green-100 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden group">
              <div className="absolute -right-3 -bottom-3 text-green-50 transform group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z"/></svg>
              </div>
              <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest relative z-10 mb-1">Sudah Siap</p>
              <p className="text-2xl md:text-3xl font-black text-green-600 relative z-10">{progressSudah}%</p>
            </div>
            
            {/* Card Belum */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-orange-100 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden group">
               <div className="absolute -right-3 -bottom-3 text-orange-50 transform group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z"/></svg>
              </div>
              <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest relative z-10 mb-1">Belum Siap</p>
              <p className="text-2xl md:text-3xl font-black text-orange-500 relative z-10">{progressBelum}%</p>
            </div>
          </div>
        </div>

        {/* --- KOLOM KANAN (Switch & Daftar Item) --- */}
        <div className="w-full md:w-7/12 lg:w-8/12 xl:w-2/3 bg-white p-4 md:p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col">
          
          {/* Area Atas Kanan: Switch Mode & Tambah */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            
            {/* Switch Mode */}
             <div className="flex items-center bg-gray-100 p-1.5 rounded-xl w-full sm:w-auto">
               <button 
                 onClick={() => setActiveMode("belum")} 
                 className={`flex-1 sm:flex-none px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all duration-200 ${activeMode === 'belum' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 Belum ({belumItems.length})
               </button>
               <button 
                 onClick={() => setActiveMode("sudah")} 
                 className={`flex-1 sm:flex-none px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all duration-200 ${activeMode === 'sudah' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 Sudah ({sudahItems.length})
               </button>
             </div>

             {/* Tombol Tambah */}
             <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto px-4 py-2.5 text-xs md:text-sm font-bold text-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Tambah Perlengkapan
             </button>
          </div>

          {/* Daftar Item */}
          <div className="flex-1 max-h-[55vh] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
             {isLoading ? (
               <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100 animate-pulse">Memuat data perlengkapan...</div>
             ) : displayedItems.length === 0 ? (
               <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                 Tidak ada perlengkapan di mode ini.
               </div>
             ) : (
                displayedItems.map(item => (
                   <div key={item.id} className={`p-3 md:p-4 bg-white hover:bg-gray-50/50 transition-colors border ${activeMode === 'belum' ? 'border-gray-100 hover:border-orange-200' : 'border-gray-100 hover:border-green-200'} rounded-xl flex items-center justify-between gap-3 group`}>
                      <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                         {/* Ikon Jenis */}
                         <div className={`hidden sm:flex w-10 h-10 shrink-0 rounded-full items-center justify-center ${
                           item.jenis === 'Beli' ? 'bg-blue-100 text-blue-600' :
                           item.jenis === 'Sewa' ? 'bg-purple-100 text-purple-600' :
                           'bg-teal-100 text-teal-600'
                         }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                         </div>
                         {/* Info */}
                         <div className="min-w-0 flex flex-col">
                           <p className="text-sm md:text-base font-bold text-gray-800 truncate">{item.nama}</p>
                           <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                item.jenis === 'Beli' ? 'bg-blue-50 text-blue-600' :
                                item.jenis === 'Sewa' ? 'bg-purple-50 text-purple-600' :
                                'bg-teal-50 text-teal-600'
                              }`}>{item.jenis}</span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className="text-[10px] md:text-xs text-gray-500 font-medium">{item.jumlah}</span>
                           </div>
                         </div>
                      </div>
                      
                      {/* Action / Tanggal */}
                      <div className="shrink-0 flex items-center gap-2 text-right">
                        {activeMode === 'belum' ? (
                           <button onClick={() => handleSelesaikan(item.id, item.nama)} className="p-2 bg-gray-50 hover:bg-green-100 text-gray-400 hover:text-green-600 border border-transparent hover:border-green-200 rounded-lg transition-all active:scale-95 group/btn" title="Tandai Selesai">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 transform group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                           </button>
                        ) : (
                           <div className="flex flex-col items-end justify-center bg-green-50 px-2 py-1 md:px-3 md:py-1.5 rounded-lg border border-green-100">
                              <p className="text-[9px] md:text-[10px] text-green-600 font-bold uppercase tracking-wider mb-0.5">Diselesaikan</p>
                              <p className="text-[10px] md:text-xs font-semibold text-gray-700">{formatDate(item.tanggal_penyelesaian)}</p>
                           </div>
                        )}
                        
                        {/* Tombol Hapus */}
                        <button onClick={() => handleDelete(item.id, item.nama)} className="p-2 text-gray-300 hover:text-red-500 transition-colors md:opacity-0 group-hover:opacity-100 focus:opacity-100 rounded-md hover:bg-red-50" title="Hapus Data">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                   </div>
                ))
             )}
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH DATA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b flex items-center justify-between bg-blue-50 border-blue-100 text-blue-800">
              <h3 className="font-bold text-lg">Tambah Perlengkapan</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nama Perlengkapan</label>
                <input type="text" required placeholder="Contoh: Sound System, Tenda..." value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Jenis Pengadaan</label>
                <div className="relative">
                  <select required value={formData.jenis} onChange={(e) => setFormData({...formData, jenis: e.target.value})} className="w-full appearance-none px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all">
                    <option value="Sewa">Sewa</option>
                    <option value="Pinjam">Pinjam</option>
                    <option value="Beli">Beli Baru</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Jumlah Kebutuhan</label>
                <div className="flex gap-2">
                  <input type="number" inputMode="numeric" required placeholder="1" value={formData.jumlah_angka} onChange={(e) => setFormData({...formData, jumlah_angka: e.target.value})} className="w-1/3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" />
                  <div className="relative w-2/3">
                    <select required value={formData.jumlah_unit} onChange={(e) => setFormData({...formData, jumlah_unit: e.target.value})} className="w-full appearance-none px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all">
                      <option>Unit</option>
                      <option>Pcs</option>
                      <option>Set</option>
                      <option>Meter</option>
                      <option>Buah</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl font-bold text-white shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perlengkapan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}