import React from 'react';
import { notFound } from 'next/navigation';

// Mock data, in a real app this would come from a database (e.g., Supabase)
const guestList: { [key: string]: { name: string; group?: string } } = {
  'budi-santoso': { name: 'Bapak Budi Santoso & Keluarga' },
  'divisi-marketing': { name: 'Rekan-rekan Divisi Marketing', group: 'Rekan Kerja' },
  'alumni-2010': { name: 'Sahabat Angkatan 2010', group: 'Alumni SMA' },
  'warga-rt-05': { name: 'Seluruh Warga RT 05 / RW 02' },
};

export default function UndanganPage({ params }: { params: { slug: string } }) {
  const guest = guestList[params.slug];

  // If the slug doesn't match any guest, show a 404 page
  if (!guest) {
    notFound();
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-[#E6E2DA] shadow-2xl rounded-2xl p-8 m-4 text-center relative overflow-hidden border-t-8 border-[#A6824A] animate-in fade-in zoom-in-95 duration-500">
      <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#A6824A]/20 rounded-full"></div>
      <div className="absolute -bottom-24 -right-16 w-56 h-56 bg-[#A6824A]/20 rounded-full"></div>
      
      <p className="text-lg text-[#101111]/80 mb-2 tracking-widest">UNDANGAN HALAL BIHALAL</p>
      <h1 className="text-4xl font-bold text-[#101111] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
        Ikatan Pelajar Muhammadiyah (IPM)
      </h1>

      <div className="my-10 border-t border-b border-[#A6824A]/20 py-6 relative">
        <p className="text-sm text-[#101111]/70 mb-2">Kepada Yth.</p>
        <h2 className="text-2xl font-semibold text-[#5D1E21]">{guest.name}</h2>
        {guest.group && <p className="text-sm text-[#101111]/70 mt-1">({guest.group})</p>}
      </div>

      <p className="text-[#101111] mb-4 leading-relaxed">
        Dalam rangka silaturahmi dan penguatan eksistensi Ikatan Pelajar Muhammadiyah (IPM), kami mengundang 11 angkatan alumni untuk hadir dalam acara Halal Bihalal yang akan diselenggarakan pada:
      </p>

      <div className="my-8 text-lg font-semibold text-[#101111] space-y-2">
        <p>🗓️ Minggu, 5 April 2026</p>
        <p>⏰ Pukul 18.30 WIB</p>
        <p>📍 Warmindo 17, Pekajangan, Kab. Pekalongan</p>
      </div>

      <p className="text-sm text-[#101111]/80 mt-10">
        Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Saudara/i berkenan hadir untuk mempererat tali persaudaraan di antara alumni IPM.
      </p>

      <p className="mt-10 font-bold text-lg text-[#101111]">Hormat kami,</p>
      <p className="mt-1 text-[#101111]">Panitia Halal Bihalal IPM</p>
    </div>
  );
}