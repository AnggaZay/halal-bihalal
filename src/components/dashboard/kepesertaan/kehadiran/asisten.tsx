"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Invitation {
  id: string;
  full_name: string;
  periode: string;
  seat_number: string;
  is_present: boolean;
  created_at: string;
}

interface AsistenData {
  nama: string;
  tugas: string;
  totalTamu: number;
  tamuHadir: number;
  daftarTamu: { nama: string; periode: string; is_present: boolean; kursi: string }[];
}

export default function Asisten() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvitations = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("invitations")
        .select("id, full_name, periode, seat_number, is_present, created_at")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setInvitations(data);
      }
      setIsLoading(false);
    };

    fetchInvitations();

    const channel = supabase
      .channel("realtime-asisten")
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

  // Pengelompokan Data Asisten
  const asistenList: Record<string, AsistenData> = {
    amri: { nama: "M. Amri Albani", tugas: "Periode Sepuh (1999 - 2007)", totalTamu: 0, tamuHadir: 0, daftarTamu: [] },
    taufiq: { nama: "M. Taufiqurrahman", tugas: "Periode Pertengahan (2007 - 2015)", totalTamu: 0, tamuHadir: 0, daftarTamu: [] },
    fikri: { nama: "M. Fikri Al-Khasani", tugas: "Periode Muda (2015 - 2026)", totalTamu: 0, tamuHadir: 0, daftarTamu: [] },
  };

  const tuaPeriods = ["1999/2001", "2001/2003", "2003/2005", "2005/2007"];
  const agakTuaPeriods = ["2007/2009", "2009/2011", "2011/2013", "2013/2015"];

  invitations.forEach((inv) => {
    const names = inv.full_name ? inv.full_name.split(', ') : [];
    const seats = inv.seat_number ? inv.seat_number.split(', ') : [];
    
    let targetAsisten = asistenList.fikri;
    if (tuaPeriods.includes(inv.periode)) targetAsisten = asistenList.amri;
    else if (agakTuaPeriods.includes(inv.periode)) targetAsisten = asistenList.taufiq;

    names.forEach((name, i) => {
      if (name.trim()) {
        targetAsisten.totalTamu++;
        if (inv.is_present) targetAsisten.tamuHadir++;
        
        targetAsisten.daftarTamu.push({
          nama: name,
          periode: inv.periode || "-",
          is_present: inv.is_present,
          kursi: seats[i] || seats[0] || "Belum Pilih"
        });
      }
    });
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Distribusi Tamu PIC Asisten</h2>
          <p className="text-sm text-gray-500">Pantau progres kedatangan tamu berdasarkan asisten yang mendampingi.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-10 text-center text-gray-500 animate-pulse bg-white rounded-xl border border-gray-200">Memuat data asisten...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.values(asistenList).map((asisten, idx) => {
            const percent = asisten.totalTamu > 0 ? Math.round((asisten.tamuHadir / asisten.totalTamu) * 100) : 0;
            
            return (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                {/* Header Card Asisten */}
                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-lg text-gray-800">{asisten.nama}</h3>
                  <p className="text-xs text-gray-500 mt-1 mb-4">{asisten.tugas}</p>
                  
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="text-2xl font-bold text-[#101111]">{asisten.tamuHadir}</span>
                      <span className="text-sm text-gray-500"> / {asisten.totalTamu} Hadir</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-white border border-gray-200 rounded-md text-gray-700">{percent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#A6824A] h-2 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>

                {/* Daftar Tamu (Bisa di-scroll jika panjang) */}
                <div className="flex-1 p-4 max-h-[400px] overflow-y-auto space-y-3 custom-scrollbar">
                  {asisten.daftarTamu.length === 0 ? (
                    <p className="text-sm text-center text-gray-400 py-4 italic">Belum ada tamu terdaftar.</p>
                  ) : (
                    asisten.daftarTamu.map((tamu, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-[#A6824A]/30 transition-colors">
                        <div className="flex-1 pr-2">
                          <p className="text-sm font-bold text-gray-800 leading-tight">{tamu.nama}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{tamu.periode}</span>
                            <span className="text-[9px] font-mono text-[#5D1E21] bg-[#5D1E21]/5 px-1.5 py-0.5 rounded">Meja: {tamu.kursi}</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {tamu.is_present ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full uppercase tracking-wider">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                              Hadir
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-wider">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}} />
    </div>
  );
}