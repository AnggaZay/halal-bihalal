"use client";

import Image from 'next/image';
import { Parisienne } from 'next/font/google';

const parisienne = Parisienne({
  subsets: ['latin'],
  weight: ['400'],
});

interface ProfileTableProps {
  type: "host" | "coHost";
  data: {
    fullName: string;
    shortName: string;
    parents: string;
    photo: string;
    address: string;
  };
}

export default function ProfileTable({ type, data }: ProfileTableProps) {
  const isHost = type === "host";

  const frameContent = (
    <Image
      src={isHost ? "/images/bingkai-1.webp" : "/images/bingkai-2.webp"}
      alt={data.fullName}
      fill
      className="object-contain"
      sizes="300px"
    />
  );

  return (
    <div className={`relative flex-shrink-0 w-screen h-[100dvh] flex items-center overflow-hidden ${
      // ✨ CUSTOM DI SINI: pr-2 (padding kanan untuk Host), pl-2 (padding kiri untuk Co-Host)
      isHost ? "justify-end pr-2" : "justify-start pl-2"
    }`}>

      {/* Tema Acara di Pojok Atas */}
      <div className={`absolute top-8 z-10 w-40 text-center text-[9px] uppercase tracking-widest text-[#A6824A]/80 font-semibold leading-relaxed ${
          isHost 
            ? "right-6 rotate-6" 
            : "left-6 -rotate-6"
        }`}>
        {isHost 
          ? "Silaturahmi 11 Pimpinan Alumni" 
          : <>
              Mengembalikan Eksistensi
              <br />
              Organisasi External
            </>
        }
      </div>

      {/* ✨ INFORMASI HOST */}
      <div 
        className={`absolute top-[8vh] md:top-[12vh] z-30 flex flex-col ${
          isHost 
            ? "left-6 md:left-24 items-start text-left host-info-item opacity-0" 
            : "right-6 md:right-24 items-end text-right cohost-info-item" // Co-Host langsung auto-scroll
        }`}
      >
        {/* Label Badge dengan Frame Decorative */}
        {/* ✨ ANTI-LAG: Hilangkan backdrop-blur, ganti ke warna pekat agar HP kentang tetap 60fps */}
        <div className="relative bg-[#5D1E21]/95 text-[#E6E2DA] text-[9px] md:text-xs uppercase tracking-[0.3em] px-4 py-1.5 mb-3 shadow-xl">
          <span className="relative z-10">{isHost ? "Tuan Rumah" : "Co-Host"}</span>
          {/* Garis outline offset (Efek shape menumpuk) */}
          <div className="absolute top-1 left-1 w-full h-full border border-[#A6824A]/50 pointer-events-none" />
        </div>
        
        {/* Nama (Parisienne) dengan Highlight Nama Panggilan */}
        <h2 className={`text-5xl md:text-7xl text-[#E6E2DA] mb-2 max-w-[260px] md:max-w-md leading-tight drop-shadow-lg ${parisienne.className}`}>
          {data.fullName.split(new RegExp(`(${data.shortName})`, 'gi')).map((part, i) => 
            part.toLowerCase() === data.shortName.toLowerCase() ? (
              <span key={i} className="text-[#A6824A]">{part}</span>
            ) : (
              part
            )
          )}
        </h2>
        
        {/* Detail Orang Tua & Alamat */}
        <div className={`flex flex-col gap-2 mt-1 ${
          isHost ? "pl-3 border-l-[2px] border-[#A6824A]/60 items-start" : "pr-3 border-r-[2px] border-[#A6824A]/60 items-end"
        }`}>
          <p className="text-[10px] md:text-xs font-bold text-[#E6E2DA] tracking-widest uppercase drop-shadow-md">
            {data.parents}
          </p>
          
          {/* Shape Gelap Sorot Alamat */}
          <div className="bg-[#101111]/95 px-3 py-2 rounded-sm border border-[#A6824A]/30 shadow-lg max-w-[220px] md:max-w-xs">
            <p className="text-[9px] md:text-[11px] text-[#E6E2DA]/90 italic font-medium leading-relaxed">
              {data.address}
            </p>
          </div>
        </div>
      </div>

      {/* WRAPPER LUAR: Mengatur posisi dasar (translate-y) agar aman dari tertimpa GSAP/Framer */}
      <div className={`relative z-20 w-full max-w-[280px] aspect-[3/4] ${isHost ? 'translate-y-48' : 'translate-y-32'}`}>
        
        {isHost ? (
          /* GSAP ANIMATION (Dijalankan dari page.tsx agar urutannya sempurna) */
          <div className="host-photo-item relative w-full h-full opacity-0">
            {frameContent}
          </div>
        ) : (
          /* NATURAL SCROLL (Masuk manual mengikuti geseran meja tanpa animasi tambahan) */
          <div className="relative w-full h-full">
            {frameContent}
          </div>
        )}
      </div>
    </div>
  );
}