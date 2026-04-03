"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";

interface Invitation {
  id: string;
  full_name: string;
  vehicle: string;
  seat_number: string;
  jenis_parkiran: string;
  is_present: boolean;
  created_at: string;
}

interface FlattenedParkir {
  id: string;
  name: string;
  vehicle: string;
  parking: string;
  is_present: boolean;
}

export default function Fasilitas() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchInvitations = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from("invitations").select("*").order("created_at", { ascending: false });

      if (!error && data) {
        setInvitations(data);
      }
      setIsLoading(false);
    };

    fetchInvitations();

    const channel = supabase
      .channel("realtime-fasilitas")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "invitations" },
        (payload) => {
          setInvitations((prev) => {
            if (payload.eventType === 'INSERT') return [payload.new as Invitation, ...prev];
            if (payload.eventType === 'UPDATE') return prev.map((inv) => (inv.id === payload.new.id ? (payload.new as Invitation) : inv));
            if (payload.eventType === 'DELETE') {
              const oldRecord = payload.old as { id: string };
              return prev.filter((inv) => inv.id !== oldRecord.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Preteli data per orang
  const flattenedData: FlattenedParkir[] = useMemo(() => invitations.flatMap((inv) => {
    const names = inv.full_name ? inv.full_name.split(",").map(n => n.trim()) : ["Tanpa Nama"];
    const vehicles = inv.vehicle ? inv.vehicle.split(",").map(v => v.trim()) : [];
    const parkings = inv.jenis_parkiran ? inv.jenis_parkiran.split(",").map(p => p.trim()) : [];

    return names.map((name, idx) => ({
      id: `${inv.id}-${idx}`,
      name: name,
      vehicle: vehicles[idx] || vehicles[0] || 'Tanpa Kendaraan',
      parking: parkings[idx] || parkings[0] || 'Belum dialokasikan',
      is_present: !!inv.is_present,
    }));
  }), [invitations]);

  // Filter Pencarian & Sorting (Pending di Atas)
  const filteredData = useMemo(() => {
    return flattenedData
      .filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.parking.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (a.is_present === b.is_present) return a.name.localeCompare(b.name);
        return a.is_present ? 1 : -1;
      });
  }, [flattenedData, searchQuery]);

  // Hitung Statistik
  const stats = useMemo(() => {
    const warmindo = { total: 0, hadir: 0 };
    const mobil = { total: 0, hadir: 0 };
    const motor = { total: 0, hadir: 0 };

    flattenedData.forEach(p => {
      const isHadir = p.is_present;
      const parkirStr = p.parking.toLowerCase();
      const vehicleStr = p.vehicle.toLowerCase();

      if (parkirStr.includes('warmindo')) { warmindo.total++; if (isHadir) warmindo.hadir++; }

      if (vehicleStr.includes('mobil')) { mobil.total++; if (isHadir) mobil.hadir++; }
      else if (vehicleStr.includes('motor')) { motor.total++; if (isHadir) motor.hadir++; }
    });

    return { warmindo, mobil, motor };
  }, [flattenedData]);

  return (
    <div className="w-full space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Kepesertaan</h1>
        <p className="text-[11px] md:text-sm text-[#A6824A] font-bold uppercase tracking-widest mt-0.5 md:mt-1">Fasilitas & Parkiran</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        
        {/* KOLOM KIRI (Insight Cards) */}
        <div className="w-full md:w-5/12 lg:w-4/12 xl:w-1/3">
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-5">
            
            {/* Card: Warmindo 17 */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-red-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-red-50 group-hover:scale-110 transition-transform duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Warmindo 17</p>
                <div className="flex items-baseline gap-1 md:gap-2">
                  <span className="text-2xl md:text-4xl font-black text-red-600 tracking-tighter">{isLoading ? "..." : stats.warmindo.hadir}</span>
                  <span className="text-[10px] md:text-sm font-medium text-gray-400">/ {stats.warmindo.total}</span>
                </div>
                <div className="w-full bg-red-50 rounded-full h-1 md:h-1.5 mt-3">
                  <div className="bg-red-500 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.warmindo.total > 0 ? (stats.warmindo.hadir / stats.warmindo.total) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>

            {/* Card: Mobil */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-gray-100 group-hover:scale-110 transition-transform duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 10l-1.5 1.5A2.5 2.5 0 003 13.268V19a1 1 0 001 1h1m14-10l1.5 1.5A2.5 2.5 0 0121 13.268V19a1 1 0 01-1 1h-1M5 10V8a3 3 0 013-3h8a3 3 0 013 3v2M5 10h14" /></svg>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Mobil</p>
                <div className="flex items-baseline gap-1 md:gap-2">
                  <span className="text-2xl md:text-4xl font-black text-gray-700 tracking-tighter">{isLoading ? "..." : stats.mobil.hadir}</span>
                  <span className="text-[10px] md:text-sm font-medium text-gray-400">/ {stats.mobil.total}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1 md:h-1.5 mt-3">
                  <div className="bg-gray-600 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.mobil.total > 0 ? (stats.mobil.hadir / stats.mobil.total) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>

            {/* Card: Motor */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-green-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-green-50 group-hover:scale-110 transition-transform duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Motor</p>
                <div className="flex items-baseline gap-1 md:gap-2">
                  <span className="text-2xl md:text-4xl font-black text-green-600 tracking-tighter">{isLoading ? "..." : stats.motor.hadir}</span>
                  <span className="text-[10px] md:text-sm font-medium text-gray-400">/ {stats.motor.total}</span>
                </div>
                <div className="w-full bg-green-50 rounded-full h-1 md:h-1.5 mt-3">
                  <div className="bg-green-500 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.motor.total > 0 ? (stats.motor.hadir / stats.motor.total) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* KOLOM KANAN (List Area) */}
        <div className="w-full md:w-7/12 lg:w-8/12 xl:w-2/3 bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800">Daftar Kendaraan</h3>
              <p className="text-xs text-gray-500 mt-0.5">Pemetaan parkir berdasarkan kedatangan.</p>
            </div>
            <div className="w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Cari nama atau parkir..." 
                className="w-full sm:w-56 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#A6824A]/50 focus:border-[#A6824A] transition-all" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
          </div>

          <div className="flex-1 max-h-[60vh] overflow-y-auto pr-2 space-y-3">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500 animate-pulse bg-gray-50 rounded-xl border border-gray-100">Memuat data parkir...</div>
            ) : filteredData.length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-100">Tidak ada kendaraan ditemukan.</div>
            ) : (
              filteredData.map((item) => (
                <div key={item.id} className="p-3 md:p-4 bg-gray-50 hover:bg-gray-100/80 transition-colors border border-gray-100 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm md:text-base font-bold text-gray-800 truncate">{item.name}</span>
                      {item.is_present ? (
                        <span className="shrink-0 text-[9px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-green-200">✅ Tiba</span>
                      ) : (
                        <span className="shrink-0 text-[9px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-yellow-200">⏳ Otw</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] md:text-xs text-gray-500 font-medium mt-1.5">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l-1.5 1.5A2.5 2.5 0 003 13.268V19a1 1 0 001 1h1m14-10l1.5 1.5A2.5 2.5 0 0121 13.268V19a1 1 0 01-1 1h-1M5 10V8a3 3 0 013-3h8a3 3 0 013 3v2M5 10h14" /></svg>
                        {item.vehicle}
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {item.parking}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}