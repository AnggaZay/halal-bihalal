"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";

interface QRPayload {
  id: string;
  nama: string;
  periode: string;
  meja: string;
  makanan: string;
  minuman: string;
  kendaraan: string;
  parkir: string;
  asisten: string;
}

export default function Kehadiran() {
  const [overlayState, setOverlayState] = useState<"none" | "welcome" | "seat">("none");
  const [scannedData, setScannedData] = useState<QRPayload | null>(null);
  
  // Menggunakan ref agar state ini tidak menyebabkan komponen re-render saat kamera berjalan
  const isProcessing = useRef(false);

  useEffect(() => {
    // Inisialisasi Engine Scanner
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 400, height: 400 }, // ✨ Perbesar area scan
        aspectRatio: 1.0,
        // Fokus hanya kamera, hapus opsi "Upload Gambar" agar UI rapi
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        // ✨ KUNCI UTAMA: Minta resolusi kamera setinggi mungkin (Full HD)
        videoConstraints: {
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          // Pastikan selalu pakai kamera belakang
          facingMode: "environment"
        }
      },
      false // Matikan mode verbose (log berisik di console)
    );

    scanner.render(
      async (decodedText) => {
        // Jika sedang memproses data/animasi jalan, abaikan scan baru
        if (isProcessing.current) return;

        try {
          // Parsing JSON dari QR Code yang dibuat di page.tsx
          const payload: QRPayload = JSON.parse(decodedText);
          if (!payload.id || !payload.nama) return;

          // 1. KUNCI SCANNER: Cegah scan ganda
          isProcessing.current = true;
          setScannedData(payload);

          // 2. UPDATE DATABASE DI LATAR BELAKANG (Check-in = true)
          supabase.from("invitations").update({ is_present: true }).eq("id", payload.id).then();

          // 3. MULAI SEQUENS ANIMASI: Munculkan layar "Selamat Datang"
          setOverlayState("welcome");

          // 4. SETELAH 3 DETIK: Ganti ke layar "Duduk di Meja..."
          setTimeout(() => {
            setOverlayState("seat");
            
            // 5. SETELAH 4 DETIK KEMUDIAN: Tutup layar, siap scan tamu berikutnya
            setTimeout(() => {
              setOverlayState("none");
              setScannedData(null);
              
              // Beri jeda 1 detik sebelum membuka kunci kamera agar kartu QR yg sama tidak ke-scan 2x
              setTimeout(() => {
                isProcessing.current = false;
              }, 1000);
            }, 4000);
          }, 3000);

        } catch (error) {
          // Jika bukan format JSON / bukan QR dari sistem kita, diamkan saja
          console.log("Format QR tidak dikenali");
        }
      },
      (err) => {
        // ignore scan errors (biasanya hanya peringatan saat QR belum pas di kotak)
      }
    );

    // Bersihkan (unmount) kamera jika panitia pindah tab ke Master Data / lainnya
    return () => {
      scanner.clear().catch(e => console.error("Gagal mematikan kamera:", e));
    };
  }, []);

  return (
    <div className="relative w-full bg-[#101111] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center justify-center col-span-1 md:col-span-2 lg:col-span-3">
      
      {/* LAYER 1: KAMERA STANDBY (Background) */}
      <div className="w-full h-full flex flex-col items-center justify-center p-4 z-10">
        <div className="mb-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#A6824A] mb-2 tracking-wide">Kamera Presensi</h2>
          <p className="text-[#E6E2DA]/60 text-sm">Gunakan layar iPad ini untuk memindai Tiket QR Tamu.</p>
        </div>

        {/* Wadah Render html5-qrcode */}
        <div className="bg-white p-3 rounded-2xl w-full max-w-md shadow-[0_0_30px_rgba(166,130,74,0.15)] ring-4 ring-[#A6824A]/20">
           <div id="qr-reader" className="w-full rounded-xl overflow-hidden bg-white"></div>
        </div>
      </div>

      {/* LAYER 2: OVERLAY SAMBUTAN (Animasi Pop-up) */}
      <AnimatePresence>
        {overlayState !== "none" && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 0.4 }}
             className="absolute inset-0 z-50 bg-[#101111]/95 backdrop-blur-xl flex flex-col items-center justify-center"
           >
             <AnimatePresence mode="wait">
               {/* ANIMASI 1: SELAMAT DATANG */}
               {overlayState === "welcome" && (
                 <motion.div
                   key="welcome"
                   initial={{ scale: 0.8, opacity: 0, y: 20 }}
                   animate={{ scale: 1, opacity: 1, y: 0 }}
                   exit={{ scale: 1.1, opacity: 0, y: -20 }}
                   transition={{ duration: 0.6, ease: "easeOut" }}
                   className="text-center p-8 w-full max-w-4xl"
                 >
                    <p className="text-2xl md:text-4xl text-[#E6E2DA]/90 font-medium mb-4">Selamat Datang,</p>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#A6824A] mb-8 drop-shadow-[0_0_25px_rgba(166,130,74,0.5)] leading-tight">
                      {scannedData?.nama}
                    </h1>
                    <p className="text-xl md:text-3xl text-[#E6E2DA] font-light leading-relaxed">
                      di Halal Bihalal<br />
                      <span className="font-bold text-[#A6824A]">PD IPM Kabupaten Pekalongan 2026</span>
                    </p>
                 </motion.div>
               )}

               {/* ANIMASI 2: DUDUK DI MEJA */}
               {overlayState === "seat" && (
                 <motion.div
                   key="seat"
                   initial={{ scale: 0.8, opacity: 0, y: 20 }}
                   animate={{ scale: 1, opacity: 1, y: 0 }}
                   exit={{ scale: 1.1, opacity: 0, y: -20 }}
                   transition={{ duration: 0.6, ease: "easeOut" }}
                   className="text-center p-8 w-full"
                 >
                    <p className="text-3xl md:text-5xl text-[#E6E2DA]/90 font-medium mb-6">Silakan</p>
                    <h2 className="text-4xl md:text-6xl font-bold text-[#E6E2DA] mb-8">
                      Duduk di Meja
                    </h2>
                    <div className="text-8xl md:text-[12rem] font-bold text-[#A6824A] drop-shadow-[0_0_40px_rgba(166,130,74,0.7)] leading-none inline-block bg-[#A6824A]/10 px-12 py-8 rounded-3xl border border-[#A6824A]/30">
                      {scannedData?.meja}
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
           </motion.div>
        )}
      </AnimatePresence>

      {/* CSS KHUSUS UNTUK MEMPERCANTIK UI BAWAAN HTML5-QRCODE */}
      <style dangerouslySetInnerHTML={{__html: `
        #qr-reader { border: none !important; }
        #qr-reader button {
          background-color: #A6824A !important;
          color: #101111 !important;
          border: none !important;
          padding: 10px 20px !important;
          border-radius: 8px !important;
          font-weight: bold !important;
          cursor: pointer !important;
          margin-top: 16px !important;
          margin-bottom: 8px !important;
          transition: all 0.2s;
        }
        #qr-reader button:hover { opacity: 0.8; }
        #qr-reader__dashboard_section_csr span { color: #101111 !important; font-weight: 600; font-size: 14px; }
        #qr-reader__camera_selection { 
          margin-bottom: 12px !important; 
          padding: 10px !important; 
          border-radius: 8px !important; 
          border: 1px solid #d1d5db !important; 
          width: 100%; 
          background: #f9fafb;
        }
        #qr-reader a { display: none !important; } /* Hilangkan link sponsor html5-qrcode */
      `}} />
    </div>
  );
}