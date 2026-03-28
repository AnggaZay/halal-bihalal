"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

// ✨ Kita buatkan Interface khusus agar TypeScript paham persis isi state form-nya
interface FormDataState {
  nama: string;
  ucapan: string;
  kehadiran: string;
  jumlahTamu: string;
}

// ✨ Bikin guestName opsional (?) agar komponen tidak error jika dipanggil kosongan di halaman lain
export default function GuestbookSection({ guestName }: { guestName?: string | null }) {
  const [formData, setFormData] = useState<FormDataState>({
    nama: guestName || '', // ✨ Langsung inisialisasi dari awal (Aman & Lebih Cepat)
    ucapan: '',
    kehadiran: '',
    jumlahTamu: '1' // Default 1 orang
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // ✨ State untuk pop-up sukses

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from('guestbook')
      .insert([
        {
          nama: formData.nama,
          kehadiran: formData.kehadiran,
          // ✨ Jaga-jaga kalau parseInt gagal karena input aneh, kita set default 0
          jumlah_tamu: parseInt(formData.jumlahTamu) || 0, 
          ucapan: formData.ucapan
        }
      ]);

    setIsSubmitting(false);

    if (error) {
      // ✨ TAMPILKAN ERROR ASLI DARI SUPABASE DI ALERT
      alert(`Gagal: ${error.message || "Unknown error"}`);
      console.error("Supabase Error:", error);
    } else {
      setShowSuccess(true); // ✨ Tampilkan pop-up sukses custom
      // ✨ Reset form, tapi JANGAN hapus nama tamu jika datang dari URL
      setFormData({
        nama: guestName || '',
        ucapan: '',
        kehadiran: '',
        jumlahTamu: '1'
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto pt-4 pb-12 px-4 flex flex-col items-center">
      
      {/* ✨ POP-UP SUKSES KIRIM UCAPAN */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-[#101111]/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#E6E2DA] rounded-3xl p-6 md:p-8 max-w-[320px] w-full shadow-2xl border border-[#A6824A]/30 text-center relative"
            >
              <div className="w-16 h-16 bg-[#A6824A]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner border border-[#A6824A]/30">
                🎉
              </div>
              <h3 className="font-serif text-xl text-[#5D1E21] mb-2">Terima Kasih!</h3>
              <p className="text-[11px] md:text-xs text-[#101111]/70 mb-6 leading-relaxed px-2">
                Doa restu dan ucapan Anda telah kami terima. Kehadiran Anda akan menjadi kebahagiaan bagi kami.
              </p>
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full py-3.5 bg-[#5D1E21] text-[#E6E2DA] rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold shadow-lg shadow-[#5D1E21]/20 active:scale-95 transition-all"
              >
                Sama-sama! ❤️
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1. HEADER MINIMALIS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-serif text-[#E6E2DA] mb-4 tracking-tight">Buku Tamu</h2>
        <div className="h-[1px] w-12 bg-[#A6824A] mx-auto mb-4" />
        <p className="text-xs text-[#E6E2DA]/80 uppercase tracking-[0.2em] leading-relaxed">
          Sampaikan doa restu & konfirmasi kehadiran Anda
        </p>
      </motion.div>

      {/* 2. FORM PENGISIAN */}
      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full space-y-6"
      >
        {/* Input Nama */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-[#E6E2DA] ml-1">Nama Tamu</label>
          <input 
            type="text"
            required
            placeholder="Tuliskan nama Anda"
            value={formData.nama}
            className="w-full p-4 bg-[#101111]/50 border border-[#A6824A]/50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#A6824A] transition-all text-[#E6E2DA] placeholder:text-[#E6E2DA]/50"
            onChange={(e) => setFormData({...formData, nama: e.target.value})}
          />
        </div>

        {/* Dropdown Kehadiran */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-[#E6E2DA]/80 ml-1">Konfirmasi Kehadiran</label>
          <div className="relative">
            <select 
              required
              value={formData.kehadiran}
              className="w-full p-4 bg-[#E6E2DA] border border-[#A6824A]/50 rounded-xl text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-[#5D1E21] transition-all text-[#101111]"
              onChange={(e) => setFormData({...formData, kehadiran: e.target.value})}
            >
              <option value="">Pilih Kehadiran</option>
              <option value="hadir">Hadir</option>
              <option value="tidak_hadir">Tidak Hadir</option>
            </select>
            {/* Custom Arrow Icon */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#5D1E21]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* ✨ KONDISIONAL: Opsi Jumlah Tamu akan pop-up jika memilih Hadir */}
        <AnimatePresence>
          {formData.kehadiran === 'hadir' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <label className="text-[10px] uppercase tracking-widest text-[#E6E2DA] ml-1">Jumlah Kehadiran</label>
              <div className="relative">
                <select 
                  required
                  className="w-full p-4 bg-[#101111]/50 border border-[#A6824A]/50 rounded-xl text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-[#A6824A] transition-all text-[#E6E2DA]"
                  onChange={(e) => setFormData({...formData, jumlahTamu: e.target.value})}
                  value={formData.jumlahTamu}
                >
                  <option value="1">1 Orang</option>
                  <option value="2">2 Orang (Berpasangan)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#A6824A]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Textarea Ucapan */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-[#E6E2DA] ml-1">Doa & Ucapan</label>
          <textarea 
            rows={4}
            required
            placeholder="Tuliskan pesan manis untuk kedua mempelai..."
            value={formData.ucapan}
            className="w-full p-4 bg-[#101111]/50 border border-[#A6824A]/50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#A6824A] transition-all text-[#E6E2DA] placeholder:text-[#E6E2DA]/50 resize-none"
            onChange={(e) => setFormData({...formData, ucapan: e.target.value})}
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-[#5D1E21] text-[#E6E2DA] rounded-xl text-xs uppercase tracking-[0.3em] font-bold shadow-lg shadow-[#5D1E21]/40 active:scale-95 transition-all mt-4 disabled:opacity-50"
        >
          {isSubmitting ? "Mengirim..." : "Kirim Ucapan"}
        </button>
      </motion.form>

    </div>
  );
}