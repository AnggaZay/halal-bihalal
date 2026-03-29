"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Invitation {
  id: string;
  full_name: string;
  vehicle: string;
  seat_number: string;
  is_present: boolean;
  created_at: string;
}

export default function Fasilitas() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchInvitations = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("invitations")
        .select("id, full_name, vehicle, seat_number, is_present, created_at")
        .order("created_at", { ascending: false });

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

  // Filter Pencarian
  const filteredData = invitations.filter((inv) =>
    inv.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.vehicle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.seat_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Kalkulasi Insight Fasilitas
  let totalPeserta = 0;
  let hadirPeserta = 0;
  let warmindoBooked = 0;
  let warmindoHadir = 0;
  let umppBooked = 0;
  let umppHadir = 0;
  let seatsBooked = 0;

  invitations.forEach(inv => {
    // Hitung berdasarkan per individu (karena 1 baris bisa >1 orang)
    const names = inv.full_name ? inv.full_name.split(', ') : [];
    const count = names.length;
    totalPeserta += count;
    if (inv.is_present) hadirPeserta += count;

    // Hitung kendaraan
    const vehicles = inv.vehicle ? inv.vehicle.split(', ') : [];
    vehicles.forEach(v => {
      if (v.includes('Warmindo')) {
        warmindoBooked++;
        if (inv.is_present) warmindoHadir++;
      }
      if (v.includes('UMPP')) {
        umppBooked++;
        if (inv.is_present) umppHadir++;
      }
    });

    // Hitung kursi
    const seats = inv.seat_number ? inv.seat_number.split(', ') : [];
    seats.forEach(s => {
      if (s && s !== 'null' && s.trim() !== '') seatsBooked++;
    });
  });

  return (
    <div className="space-y-6">
      
      {/* KARTU OVERVIEW INSIGHT */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Welcome Drink */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-[#A6824A]/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v2H4zm2 3h12l-1.5 14h-9z"/></svg>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Welcome Drink</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#101111]">{hadirPeserta}</span>
              <span className="text-sm font-medium text-gray-500">/ {totalPeserta} Diambil</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
              <div className="bg-[#A6824A] h-1.5 rounded-full" style={{ width: `${totalPeserta > 0 ? (hadirPeserta / totalPeserta) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 2: Meja / Kursi */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-[#A6824A]/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Meja & Kursi</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#101111]">{seatsBooked}</span>
              <span className="text-sm font-medium text-gray-500">/ 40 Terisi</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
              <div className="bg-[#A6824A] h-1.5 rounded-full" style={{ width: `${(seatsBooked / 40) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 3: Parkir Warmindo */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-[#5D1E21]/5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Parkir Warmindo 17</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#101111]">{warmindoHadir}</span>
              <span className="text-sm font-medium text-gray-500">/ {warmindoBooked} Tiba (Max 20)</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
              <div className={`h-1.5 rounded-full ${warmindoBooked > 18 ? 'bg-[#5D1E21]' : 'bg-[#A6824A]'}`} style={{ width: `${(warmindoBooked / 20) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 4: Parkir UMPP */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-[#5D1E21]/5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Parkir UMPP</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#101111]">{umppHadir}</span>
              <span className="text-sm font-medium text-gray-500">/ {umppBooked} Tiba</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
              <div className="bg-gray-300 h-1.5 rounded-full w-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* LIST DATA FASILITAS */}
      <div className="bg-[#FFFFFF] rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#101111]">Data Distribusi Fasilitas</h3>
          </div>
          <div className="w-full sm:w-auto">
            <input type="text" placeholder="Cari peserta/kursi..." className="w-full sm:w-64 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#A6824A]/50 focus:border-[#A6824A] transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {/* Desktop View: Table */}
        <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-[#F3F4F6] text-[#101111]">
              <tr>
                <th className="py-2.5 px-4 font-bold uppercase tracking-wider border-b border-gray-200 text-xs">Peserta</th>
                <th className="py-2.5 px-4 font-bold uppercase tracking-wider border-b border-gray-200 text-xs text-center">Kursi</th>
                <th className="py-2.5 px-4 font-bold uppercase tracking-wider border-b border-gray-200 text-xs">Kendaraan & Lokasi Parkir</th>
                <th className="py-2.5 px-4 font-bold uppercase tracking-wider border-b border-gray-200 text-xs text-center">Welcome Drink</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (<tr><td colSpan={4} className="py-8 text-center text-[#6B7280] animate-pulse">Memuat data...</td></tr>) : filteredData.length === 0 ? (<tr><td colSpan={4} className="py-8 text-center text-[#6B7280]">Tidak ada data ditemukan.</td></tr>) : (
                filteredData.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors even:bg-gray-50/50">
                    <td className="py-3 px-4 font-bold text-[#101111]">
                      {(inv.full_name || '-').split(', ').map((name, idx) => (<div key={idx}>{name}</div>))}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {(inv.seat_number || 'Belum Pilih').split(', ').map((seat, idx) => (<span key={idx} className="font-mono text-xs font-bold text-[#5D1E21] bg-[#5D1E21]/5 border border-[#5D1E21]/20 rounded px-2 py-0.5">{seat}</span>))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-gray-700">
                      {(inv.vehicle || '-').split(', ').map((v, idx) => (<div key={idx} className="mb-0.5">🚗 {v.replace('(Parkir: ', '— ').replace(')', '')}</div>))}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {inv.is_present ? (<span className="inline-block px-3 py-1 bg-green-100 text-green-800 border border-green-200 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">✅ Diberikan</span>) : (<span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 border border-gray-200 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">⏳ Menunggu</span>)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Card (No Horizontal Scroll) */}
        <div className="block lg:hidden space-y-3 mt-2">
          {isLoading ? (<div className="p-6 text-center text-[#6B7280] animate-pulse bg-gray-50 rounded-xl border border-gray-200">Memuat data...</div>) : filteredData.length === 0 ? (<div className="p-6 text-center text-[#6B7280] bg-gray-50 rounded-xl border border-gray-200">Tidak ada data ditemukan.</div>) : (
            filteredData.map((inv) => (
              <div key={inv.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative">
                <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                  <div className="font-bold text-[#101111] text-sm">
                    {(inv.full_name || '-').split(', ').map((name, idx) => (<div key={idx}>{name}</div>))}
                  </div>
                  <div className="shrink-0 text-right">
                    {inv.is_present ? (<span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 border border-green-200 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm">✅ Drink OK</span>) : (<span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm">⏳ Menunggu</span>)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="block text-gray-500 mb-1">Kursi</span>
                    <div className="flex flex-wrap gap-1">{(inv.seat_number || 'Belum Pilih').split(', ').map((seat, idx) => (<span key={idx} className="font-mono font-bold text-[#5D1E21] bg-[#5D1E21]/5 border border-[#5D1E21]/20 rounded px-1.5 py-0.5">{seat}</span>))}</div>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Kendaraan & Parkir</span>
                    <div className="text-gray-700 font-medium flex flex-col gap-0.5">{(inv.vehicle || '-').split(', ').map((v, idx) => (<span key={idx}>🚗 {v.replace('(Parkir: ', '- ').replace(')', '')}</span>))}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}