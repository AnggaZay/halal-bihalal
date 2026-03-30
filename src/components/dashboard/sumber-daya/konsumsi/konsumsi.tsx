"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

interface Invitation {
  id: string;
  full_name: string;
  seat_number: string;
  food_menu: string;
  drink_menu: string;
  is_sweet_drink?: boolean | null;
}

interface FlattenedKonsumsi {
  id: string;
  name: string;
  seat: string;
  food: string;
  drink: string;
}

export default function Konsumsi() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const MAX_KURSI = 40;

  // Daftar Menu Standar
  const foodList = [
    "Rice Bowl Original", "Rice Bowl Hot Lava", "Rice Bowl Teriyaki", 
    "Rice Bowl Lada Hitam", "Nasi Ayam Bali", "Nasi Goreng"
  ];
  const drinkList = ["Es Teh Manis", "Es Teh Tawar", "Air Mineral"];

  useEffect(() => {
    const fetchData = async (isInitial = false) => {
      if (isInitial) setIsLoading(true);
      const { data, error } = await supabase
        .from("invitations")
        .select("id, full_name, seat_number, food_menu, drink_menu, is_sweet_drink")
        .order("created_at", { ascending: false });
      
      if (data) setInvitations(data as Invitation[]);
      if (isInitial) setIsLoading(false);
    };

    fetchData(true);

    const channel = supabase.channel("realtime-konsumsi")
      .on("postgres_changes", { event: "*", schema: "public", table: "invitations" }, (payload) => {
        setInvitations((prev) => {
          if (payload.eventType === 'INSERT') return [payload.new as Invitation, ...prev];
          if (payload.eventType === 'UPDATE') return prev.map((inv) => (inv.id === payload.new.id ? (payload.new as Invitation) : inv));
          if (payload.eventType === 'DELETE') return prev.filter((inv) => inv.id !== payload.old.id);
          return prev;
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Preteli Data Per-Individu
  const flattenedData: FlattenedKonsumsi[] = useMemo(() => {
    return invitations.flatMap((inv) => {
      const names = inv.full_name ? inv.full_name.split(",").map(n => n.trim()) : ["Tanpa Nama"];
      const seats = inv.seat_number ? inv.seat_number.split(",").map(s => s.trim()) : [];
      const foods = inv.food_menu ? inv.food_menu.split(",").map(f => f.trim()) : [];
      const drinks = inv.drink_menu ? inv.drink_menu.split(",").map(d => d.trim()) : [];

      return names.map((name, idx) => {
        let drink = drinks[idx] || drinks[0] || "-";
        // Handle format lama (is_sweet_drink boolean) jika ada
        if (idx === 0 && inv.is_sweet_drink !== null && inv.is_sweet_drink !== undefined) {
           if (drink === "-" || drink === "") {
             drink = inv.is_sweet_drink ? "Es Teh Manis" : "Es Teh Tawar";
           }
        }
        return {
          id: `${inv.id}-${idx}`,
          name: name || "-",
          seat: seats[idx] || seats[0] || "Belum Pilih",
          food: foods[idx] || foods[0] || "-",
          drink: drink
        };
      });
    });
  }, [invitations]);

  const totalPesanan = flattenedData.length;
  const progressKonsumsi = Math.round((totalPesanan / MAX_KURSI) * 100);

  // Hitung Rekap Makanan & Minuman
  const foodStats = useMemo(() => {
    const stats: Record<string, number> = {};
    foodList.forEach(f => stats[f] = 0);
    flattenedData.forEach(item => {
      // Cari kecocokan menu terdekat, abaikan case & spasi ekstra
      const matched = foodList.find(f => item.food.toLowerCase().includes(f.toLowerCase()));
      if (matched) stats[matched]++;
      else if (item.food !== "-") {
        stats["Lainnya"] = (stats["Lainnya"] || 0) + 1;
      }
    });
    return stats;
  }, [flattenedData]);

  const drinkStats = useMemo(() => {
    const stats: Record<string, number> = {};
    drinkList.forEach(d => stats[d] = 0);
    flattenedData.forEach(item => {
      const matched = drinkList.find(d => item.drink.toLowerCase().includes(d.toLowerCase()));
      if (matched) stats[matched]++;
      else if (item.drink !== "-") {
        stats["Lainnya"] = (stats["Lainnya"] || 0) + 1;
      }
    });
    return stats;
  }, [flattenedData]);

  return (
    <div className="w-full space-y-6 md:space-y-8">
      
      {/* --- HEADER --- */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Sumber Daya</h1>
        <p className="text-[11px] md:text-sm text-orange-600 font-bold uppercase tracking-widest mt-0.5 md:mt-1">Konsumsi (Garda Boga)</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        
        {/* --- KOLOM KIRI (Insight & Ringkasan) --- */}
        <div className="w-full md:w-5/12 lg:w-4/12 space-y-4 md:space-y-6">
          
          {/* 1. Card Total Konsumsi Input vs Max Kursi */}
          <div className="relative bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-xl overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full mix-blend-overlay filter blur-xl group-hover:scale-125 transition-transform duration-700"></div>
            <div className="relative z-10 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                </div>
                <p className="text-sm font-bold uppercase tracking-wider text-orange-50">Data Konsumsi</p>
              </div>
              
              <div className="flex items-end gap-2 mb-2">
                 <h3 className="text-5xl font-black">{totalPesanan}</h3>
                 <span className="text-orange-200 font-medium mb-1">/ {MAX_KURSI} Porsi</span>
              </div>
              
              <div className="w-full bg-black/20 rounded-full h-1.5 mt-2 overflow-hidden backdrop-blur-sm">
                 <div className="bg-white h-1.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{width: `${Math.min(progressKonsumsi, 100)}%`}}></div>
              </div>
              <p className="text-[10px] text-orange-100 mt-2 font-medium">{progressKonsumsi}% kuota porsi telah diinput</p>
            </div>
          </div>

          {/* 2. Card Welcome Drink */}
          <div className="bg-white rounded-2xl p-5 border border-cyan-100 shadow-sm flex items-center justify-between group hover:border-cyan-300 transition-colors">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 mb-1">Welcome Drink (Siap Saji)</p>
              <h3 className="text-3xl font-black text-gray-800">{totalPesanan} <span className="text-sm font-medium text-gray-400">Gelas</span></h3>
            </div>
            <div className="w-14 h-14 bg-cyan-50 rounded-full flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5h18z" /></svg>
            </div>
          </div>

          {/* 3. Rekap Makanan */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
             <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-orange-500">🍱</span> Rekap Makanan
             </h4>
             <div className="grid grid-cols-2 gap-3">
                {Object.entries(foodStats).map(([menu, jumlah]) => (
                   <div key={menu} className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex flex-col justify-center">
                      <span className="text-[10px] text-gray-500 font-bold mb-1 line-clamp-2">{menu}</span>
                      <span className="text-xl font-black text-gray-800">{jumlah}</span>
                   </div>
                ))}
             </div>
          </div>

          {/* 4. Rekap Minuman */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
             <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-blue-500">🥤</span> Rekap Minuman
             </h4>
             <div className="grid grid-cols-2 gap-3">
                {Object.entries(drinkStats).map(([menu, jumlah]) => (
                   <div key={menu} className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex flex-col justify-center">
                      <span className="text-[10px] text-blue-600 font-bold mb-1 line-clamp-1">{menu}</span>
                      <span className="text-xl font-black text-blue-900">{jumlah}</span>
                   </div>
                ))}
             </div>
          </div>

        </div>

        {/* --- KOLOM KANAN (Daftar Pesanan Detail) --- */}
        <div className="w-full md:w-7/12 lg:w-8/12 bg-white p-4 md:p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800">Detail Pesanan Per Meja</h3>
            <p className="text-xs text-gray-500">Daftar konsumsi untuk panduan distribusi ke meja tamu.</p>
          </div>

          {/* Tampilan Desktop (Tabel) */}
          <div className="hidden md:block flex-1 overflow-y-auto custom-scrollbar border border-gray-100 rounded-xl max-h-[65vh]">
             <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 shadow-sm">
                   <tr>
                      <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider border-b border-gray-200 w-12 text-center">No</th>
                      <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider border-b border-gray-200">Nama Tamu</th>
                      <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider border-b border-gray-200 text-center">Kursi</th>
                      <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider border-b border-gray-200">Menu Makanan</th>
                      <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider border-b border-gray-200">Pilihan Minuman</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {isLoading ? (
                      <tr><td colSpan={5} className="py-8 text-center text-gray-400 animate-pulse">Memuat data konsumsi...</td></tr>
                   ) : flattenedData.length === 0 ? (
                      <tr><td colSpan={5} className="py-8 text-center text-gray-400">Belum ada pesanan konsumsi.</td></tr>
                   ) : (
                      flattenedData.map((item, i) => (
                         <tr key={item.id} className="hover:bg-orange-50/30 transition-colors">
                            <td className="py-3 px-4 text-center text-gray-400 font-medium">{i + 1}</td>
                            <td className="py-3 px-4 font-bold text-gray-800">{item.name}</td>
                            <td className="py-3 px-4 text-center">
                               <span className="font-mono text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded px-2 py-1">{item.seat}</span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 font-medium">🍱 {item.food}</td>
                            <td className="py-3 px-4 text-gray-600 font-medium">🥤 {item.drink}</td>
                         </tr>
                      ))
                   )}
                </tbody>
             </table>
          </div>

          {/* Tampilan Mobile (List Card) */}
          <div className="block md:hidden space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
             {isLoading ? (
                <div className="p-8 text-center text-gray-400 animate-pulse bg-gray-50 rounded-xl border border-gray-100">Memuat data konsumsi...</div>
             ) : flattenedData.length === 0 ? (
                <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-gray-100">Belum ada pesanan konsumsi.</div>
             ) : (
                flattenedData.map((item, i) => (
                   <div key={item.id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                         <div>
                            <span className="text-[10px] font-bold text-gray-400 mb-0.5 block">#{i + 1}</span>
                            <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                         </div>
                         <span className="font-mono text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded px-2 py-1">
                            Meja {item.seat}
                         </span>
                      </div>
                      <div className="flex flex-col gap-1.5 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs">
                         <div className="flex items-start gap-2">
                            <span className="shrink-0">🍱</span>
                            <span className="font-medium text-gray-700">{item.food}</span>
                         </div>
                         <div className="flex items-start gap-2">
                            <span className="shrink-0">🥤</span>
                            <span className="font-medium text-gray-700">{item.drink}</span>
                         </div>
                      </div>
                   </div>
                ))
             )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}} />
    </div>
  );
}