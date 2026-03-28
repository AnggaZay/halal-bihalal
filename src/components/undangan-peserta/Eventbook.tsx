"use client";

import { Parisienne } from 'next/font/google';
import { HalalBihalalData } from '@/data/invitation';

const parisienne = Parisienne({
  subsets: ['latin'],
  weight: ['400'],
});

interface EventBookProps {
  data: typeof HalalBihalalData.events;
}

export default function EventBook({ data }: EventBookProps) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-start w-full h-full pt-[28%] px-4 pointer-events-none">
      
      <div className="w-[85%] flex flex-col items-center justify-center pointer-events-auto">
              
        <div className="w-full flex flex-col items-center justify-start text-center px-2">
          <h3 className={`text-2xl text-[#5D1E21] drop-shadow-sm mb-1 ${parisienne.className}`}>Halal Bihalal</h3>
                
          <div className="flex flex-col items-center space-y-1.5 text-[8px] text-[#101111] leading-relaxed">
            <div className="flex flex-col items-center">
              <span className="font-bold text-[#5D1E21]">Hari, Tanggal</span>
              <span>Ahad, 05 April 2026</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-[#5D1E21]">Waktu</span>
              <span>18.30 - 21.30 WIB</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-[#5D1E21]">Tempat</span>
              <span className="text-center">Warmindo 17, Pekajangan,<br/>Pekalongan</span>
            </div>
          </div>
        </div>
      </div>

      <a 
        href={data.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 px-5 py-2 bg-[#5D1E21] text-[#E6E2DA] text-[8px] font-medium tracking-[0.2em] uppercase rounded shadow-lg shadow-[#5D1E21]/30 hover:bg-[#5D1E21]/90 active:scale-95 transition-all pointer-events-auto"
      >
        Google Maps
      </a>
    </div>
  );
}