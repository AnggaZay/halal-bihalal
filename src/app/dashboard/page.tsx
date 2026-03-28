'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type InvitationState = {
  id: string;
  full_name: string;
  periode: string;
  is_present: boolean;
  seat_number: string | null;
};

export default function CitraWicaraDashboard() {
  const [invitations, setInvitations] = useState<InvitationState[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data, error } = await supabase.from('invitations').select('id, full_name, periode, is_present, seat_number');
    if (data) setInvitations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Mengaktifkan Realtime Database. Begitu tamu ngisi data, dashboard terupdate!
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invitations' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const asistenData = [
    {
      nama: "M. Amri Albani",
      periode: ["2002 - 2004", "2004 - 2006", "2006 - 2008", "2008 - 2010"],
      wa: "+6289604795602"
    },
    {
      nama: "M. Taufiqurrahman",
      periode: ["2010 - 2012", "2012 - 2014", "2014 - 2016", "2016 - 2018"],
      wa: "+6285800061638"
    },
    {
      nama: "M. Fikri Al-Khasani",
      periode: ["2018 - 2020", "2020 - 2022", "2022 - 2024"],
      wa: "+6285137436224"
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#A6824A]/30 border-t-[#A6824A] rounded-full animate-spin mb-4"></div>
        <p className="text-[#6B7280] text-sm font-medium animate-pulse">Menghubungkan ke Database...</p>
      </div>
    );
  }

  // Algoritma menghitung jumlah kepala (Tamu) yang akan hadir
  const totalRSVP = invitations.length;
  const totalTamu = invitations.reduce((acc, curr) => {
    const count = curr.full_name ? curr.full_name.split(',').length : 0;
    return acc + count;
  }, 0);
  const totalPilihKursi = invitations.filter(i => i.seat_number && i.seat_number !== 'null').length;

  return (
    <div className="max-w-6xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-[#101111] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Dashboard Garda Citra Wicara</h1>
        <p className="text-[#6B7280] text-sm">Pemantauan progres penyebaran undangan dan pembagian asisten pertemuan.</p>
      </div>

      {/* AGENDA 1: MEMASTIKAN UNDANGAN */}
      <section>
        <h2 className="text-lg font-bold text-[#5D1E21] mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#5D1E21] text-white flex items-center justify-center text-xs">1</span>
          Agenda 1: Kepastian Undangan (RSVP Masuk)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#FFFFFF] p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-[#6B7280] text-sm mb-1 font-medium">Total Akun Mengisi Form</p>
            <h3 className="text-4xl font-bold text-[#101111]">{totalRSVP}</h3>
            <p className="text-xs text-[#A6824A] mt-2 font-medium">Form / Grup Keluarga yang mendaftar</p>
          </div>
          <div className="bg-[#FFFFFF] p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-[#6B7280] text-sm mb-1 font-medium">Estimasi Hadir (Kepala)</p>
            <h3 className="text-4xl font-bold text-[#101111]">{totalTamu}</h3>
            <p className="text-xs text-[#A6824A] mt-2 font-medium">Individu yang memakan porsi konsumsi</p>
          </div>
          <div className="bg-[#FFFFFF] p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-[#6B7280] text-sm mb-1 font-medium">Selesai Pilih Kursi</p>
            <h3 className="text-4xl font-bold text-[#101111]">{totalPilihKursi}</h3>
            <p className="text-xs text-green-600 mt-2 font-medium">Tamu yang tiketnya sudah siap cetak</p>
          </div>
        </div>
      </section>

      {/* AGENDA 2: ASISTEN PERTEMUAN */}
      <section>
        <h2 className="text-lg font-bold text-[#5D1E21] mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#5D1E21] text-white flex items-center justify-center text-xs">2</span>
          Agenda 2: Asisten Pertemuan (Pendampingan)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {asistenData.map((asisten, idx) => {
            // Filter data khusus untuk Asisten ini berdasarkan periode tanggung jawabnya
            const filteredInvs = invitations.filter(i => asisten.periode.includes(i.periode));
            const countRSVP = filteredInvs.length;
            const countTamu = filteredInvs.reduce((acc, curr) => acc + (curr.full_name ? curr.full_name.split(',').length : 0), 0);

            return (
              <div key={idx} className="bg-[#FFFFFF] p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#A6824A]/5 rounded-bl-[100px] -z-10"></div>
                
                <div className="w-12 h-12 bg-[#A6824A]/10 rounded-full flex items-center justify-center text-[#A6824A] mb-4 text-xl border border-[#A6824A]/20">👨‍💼</div>
                <h3 className="font-bold text-[#101111] text-lg mb-1">{asisten.nama}</h3>
                <div className="flex flex-wrap gap-1 mb-5">
                  {asisten.periode.map(p => (
                    <span key={p} className="text-[10px] bg-[#F3F4F6] text-[#6B7280] px-2 py-1 rounded-md font-medium">{p}</span>
                  ))}
                </div>

                <div className="flex justify-between items-center bg-[#F3F4F6] p-3 rounded-lg border border-gray-200 mb-6">
                  <div className="text-center w-1/2 border-r border-gray-300">
                    <p className="text-xs text-[#6B7280] font-medium">Keluarga RSVP</p>
                    <p className="font-bold text-[#101111] text-xl">{countRSVP}</p>
                  </div>
                  <div className="text-center w-1/2">
                    <p className="text-xs text-[#6B7280] font-medium">Orang Hadir</p>
                    <p className="font-bold text-[#5D1E21] text-xl">{countTamu}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}