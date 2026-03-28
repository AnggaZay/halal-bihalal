"use client";

import Image from "next/image";
import { Cormorant_Garamond } from "next/font/google";
import { motion } from "framer-motion";

export interface CoverProps {
  onOpen: () => void;
}

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600"],
});

export default function Cover({ onOpen }: CoverProps) {
  return (
    <div className="relative w-full h-[100dvh] bg-[#101111] flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background Image - NO OVERLAY */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/cover-cover.webp"
          alt="Halal Bihalal Cover"
          fill
          className="object-cover"
          priority
        />
        {/* Layer gelap (Overlay) sudah dihapus sesuai request */}
      </div>

      {/* Content Area - Button Only */}
      <div className="relative z-10 flex flex-col items-center justify-end w-full h-full pb-20 px-6">
        
        <motion.button
          onClick={onOpen}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            px-6 py-3 
            bg-[#A6824A] text-[#101111] 
            rounded-full 
            text-[10px] 
            font-bold uppercase 
            tracking-[0.2em] 
            shadow-[0_0_15px_rgba(166,130,74,0.3)]
            ${cormorant.className}
          `}
        >
          Buka Undangan
        </motion.button>
      </div>
      
    </div>
  );
}