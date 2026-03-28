"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Definisikan layout kursi di sini
// ✨ Layout baru: Meja besar di tengah, kursi mengelilingi bentuk U
const SEAT_LAYOUT: Record<string, string[]> = {
  "SAYAP KIRI": Array.from({ length: 18 }, (_, i) => `L${i + 1}`),
  "DASAR U": Array.from({ length: 4 }, (_, i) => `B${i + 1}`),
  "SAYAP KANAN": Array.from({ length: 18 }, (_, i) => `R${i + 1}`),
};

interface SeatSelectionProps {
  invitationId: string;
  guestCount: number;
  onBookingComplete: (updatedInvitation: unknown) => void;
}

export default function SeatSelection({ invitationId, guestCount, onBookingComplete }: SeatSelectionProps) {
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBookedSeats = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("invitations")
        .select("seat_number")
        .not("seat_number", "is", null);

      if (data) {
        const allBooked = data.flatMap((item: { seat_number?: string | null }) => item.seat_number ? String(item.seat_number).split(', ') : []);
        setBookedSeats(allBooked);
      }
      setIsLoading(false);
    };

    fetchBookedSeats();
  }, []);

  const handleSeatClick = (seatId: string) => {
    if (bookedSeats.includes(seatId)) return;

    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(s => s !== seatId);
      } else {
        if (prev.length < guestCount) {
          return [...prev, seatId];
        }
        return prev;
      }
    });
  };

  const handleSubmitBooking = async () => {
    if (selectedSeats.length !== guestCount) {
      alert(`Anda harus memilih ${guestCount} kursi.`);
      return;
    }

    setIsSubmitting(true);
    const seatNumberString = selectedSeats.sort().join(', ');

    const { data, error } = await supabase
      .from('invitations')
      .update({ seat_number: seatNumberString })
      .eq('id', invitationId)
      .select()
      .single();

    setIsSubmitting(false);

    if (error) {
      alert("Gagal mem-booking kursi. Mungkin kursi baru saja diambil. Halaman akan dimuat ulang.");
      window.location.reload();
    } else {
      onBookingComplete(data);
    }
  };

  if (isLoading) {
    return <div className="text-center text-[#E6E2DA] animate-pulse">Memuat denah kursi...</div>;
  }

  const renderTable = (tableName: string) => {
    const seats = SEAT_LAYOUT[tableName];
    if (!seats) return null;
    
    // ✨ Diubah: Sayap Kiri/Kanan menjadi 3 kolom (grid-cols-3), Dasar U menjadi 2 kolom (grid-cols-2) agar bentuknya persegi/grid.
    const gridCols = tableName === "DASAR U" ? 'grid-cols-2' : 'grid-cols-3';

    return (
      <div key={tableName} className="bg-[#101111]/40 border border-[#A6824A]/60 p-2 rounded-xl shadow-inner">
        <div className="text-[#E6E2DA] text-[10px] font-bold pb-2 text-center tracking-wider">{tableName}</div>
        <div className={`grid ${gridCols} gap-2 place-items-center`}>
          {seats.map(seatId => {
            const isBooked = bookedSeats.includes(seatId);
            const isSelected = selectedSeats.includes(seatId);
            return (
              <button key={seatId} disabled={isBooked} onClick={() => handleSeatClick(seatId)} className={`rounded-lg font-bold text-[10px] flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed aspect-square w-full ${isBooked ? 'bg-red-500/30 text-red-200/30' : isSelected ? 'bg-[#A6824A] text-[#101111] ring-2 ring-offset-2 ring-offset-[#101111] ring-[#A6824A] scale-110 shadow-lg z-10' : 'bg-[#5D1E21]/30 text-[#E6E2DA] hover:bg-[#A6824A]/60 hover:scale-105'}`}>
                {seatId}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-bold text-[#A6824A] mb-2 text-center">Pilih Tempat Duduk</h2>
        <p className="text-center text-[#E6E2DA]/80 text-sm mb-8">Silakan pilih {guestCount} kursi yang tersedia.</p>

        <div className="p-4 rounded-2xl bg-[#101111]/20 border border-[#A6824A]/50 shadow-2xl backdrop-blur-sm relative">
          
          {/* Label Panggung */}
          <div className="w-full text-center text-[#A6824A]/50 text-[10px] mb-6 font-bold tracking-[0.3em] border-b border-[#A6824A]/30 pb-3 uppercase flex items-center justify-center gap-2">
            <span className="w-8 h-[1px] bg-[#A6824A]/50"></span>
            Area Panggung
            <span className="w-8 h-[1px] bg-[#A6824A]/50"></span>
          </div>

          <div className="flex flex-col items-center w-full relative z-10">
            {/* Bagian Atas U (Sayap Kiri dan Kanan) */}
            <div className="flex justify-between w-full">
              {/* Sayap Kiri */}
              <div className="w-[45%]">
                {renderTable("SAYAP KIRI")}
              </div>

              {/* Area Tengah (Meja Besar) */}
              <div className="w-[10%] flex flex-col items-center justify-center text-[#A6824A]/50 text-[10px] font-bold uppercase tracking-[0.3em] text-center">
                Meja<br/>Besar
              </div>

              {/* Sayap Kanan */}
              <div className="w-[45%]">
                {renderTable("SAYAP KANAN")}
              </div>
            </div>

            {/* Bagian Dasar U */}
            <div className="w-[35%] flex justify-center mt-4">
              {renderTable("DASAR U")}
            </div>
          </div>
        </div>

        <p className="text-[10px] text-[#E6E2DA]/60 text-center mt-5 mb-1 px-4 italic leading-relaxed">
          *Catatan: Layout dan letak kursi dapat berubah sewaktu-waktu menyesuaikan kondisi aktual di lokasi acara.
        </p>

        <button onClick={handleSubmitBooking} disabled={isSubmitting || selectedSeats.length !== guestCount}
          className="w-full bg-[#A6824A] hover:bg-[#5D1E21] text-[#101111] p-4 rounded-xl font-bold tracking-wider uppercase transition-colors mt-5 shadow-lg shadow-[#A6824A]/20 disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? "Mem-booking..." : "Konfirmasi Kursi"}
        </button>
      </motion.div>
    </div>
  );
}
