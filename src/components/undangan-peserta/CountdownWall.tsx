"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { HalalBihalalData } from '@/data/invitation';
import { Orbitron, Parisienne } from 'next/font/google';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-orbitron',
});

const parisienne = Parisienne({
  subsets: ['latin'],
  weight: ['400'], // Parisienne cuma punya weight 400
});

export default function CountdownWall({ data }: { data: typeof HalalBihalalData }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  


  useEffect(() => {
    const target = new Date(data.events.mainEvent.date).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff < 0) return clearInterval(interval);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [data.events.mainEvent.date]);

  return (
    <div className="relative flex flex-col items-center gap-4 w-full -translate-y-8 md:-translate-y-24">
      {/* ✨ CUSTOM POSISI: -translate-y-16 menarik seluruh blok kalender ke atas agar area bawah lega */}
      
      {/* 1. KALENDER */}
      <motion.div 
        className="relative w-[240px] aspect-[3/4]"
        initial={{ rotateY: -10 }}
        animate={{ rotateY: 0 }}
        transition={{ duration: 1.5 }}
      >
        <Image
          src="/images/kalender.webp"
          alt="Kalender April"
          fill
          className="object-contain"
          priority
        />
      </motion.div>

      {/* 2. JAM DIGITAL */}
      {/* Beri font variable Orbitron di container jam */}
      <div className={`relative z-20 w-[340px] h-[110px] mt-1 ${orbitron.variable}`}>
  
  <Image
    src="/images/jam-digital.webp"
    alt="Frame Jam"
    fill
    className="object-contain z-10"
    priority
  />

  {/* Layar Angka (Teks Merah) */}
  {/* Kita pakai Flexbox dengan Gap agar gampang geser-geser posisinya */}
  {/* px-12 = Jarak kiri-kanan, pb-3 = Jarak atas-bawah biar pas di tengah frame */}
  <div className="absolute inset-0 z-20 flex items-center justify-between px-12 pb-3 pt-2 font-mono drop-shadow-[0_0_10px_rgba(166,130,74,0.7)]">
    
    <DigitUnit value={timeLeft.days} label="DAYS" />
    <span className="text-[#A6824A]/80 text-xl font-bold -mt-3 animate-pulse">:</span>
    
    <DigitUnit value={timeLeft.hours} label="HRS" />
    <span className="text-[#A6824A]/80 text-xl font-bold -mt-3 animate-pulse">:</span>
    
    <DigitUnit value={timeLeft.minutes} label="MIN" />
    <span className="text-[#A6824A]/80 text-xl font-bold -mt-3 animate-pulse">:</span>
    
    <DigitUnit value={timeLeft.seconds} label="SEC" />

  </div>

  {/* Efek Glow Merah di belakang Jam (Mantul ke Tembok) */}
  <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 h-8 bg-[#A6824A]/20 blur-[40px] z-0 rounded-full" />
</div>

      {/* 3. SAVE THE DATE TEXT */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
        // ✨ Panggil class font Parisienne langsung di wrapper-nya
        className={`relative z-30 -mt-10 flex items-center justify-center gap-3 drop-shadow-lg ${parisienne.className}`}
      >
        <span className="text-6xl text-[#E6E2DA]">Save</span>
        <span className="text-5xl text-[#A6824A] mt-4">the</span>
        <span className="text-6xl text-[#E6E2DA]">Date</span>
      </motion.div>

    </div>
  );
}

function DigitUnit({ value, label }: { value: number, label: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-12 pt-1">
      {/* Gunakan font Orbitron untuk angkanya */}
      <span className="text-2xl font-orbitron font-bold text-[#A6824A] tabular-nums tracking-tighter drop-shadow-[0_0_8px_rgba(166,130,74,0.7)] leading-none">
        {value.toString().padStart(2, '0')}
      </span>
      {/* Label Kecil di bawah Angka (Days, Hrs, Min, Sec) */}
      <span className="text-[7px] font-medium text-[#E6E2DA]/70 uppercase tracking-widest mt-1">
        {label}
      </span>
    </div>
  );
}