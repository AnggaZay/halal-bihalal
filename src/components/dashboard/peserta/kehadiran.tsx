"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from "html5-qrcode";
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
  const [isScannerFullScreen, setIsScannerFullScreen] = useState(false);
  
  // Menggunakan ref agar state ini tidak menyebabkan komponen re-render saat kamera berjalan
  const isProcessing = useRef(false);

  useEffect(() => {
    if (!isScannerFullScreen) return;

    // Inisialisasi Engine Scanner
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 30, // ✨ Ditingkatkan ke 30 frame per detik agar 3x lebih responsif
        // ✨ Hapus qrbox dan aspectRatio agar area scan menjadi FULL Layar (tanpa bingkai pembatas kotak)
        // Fokus hanya kamera, hapus opsi "Upload Gambar" agar UI rapi
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        // ✨ RAHASIA NGEBUT: Fokus 100% pencarian ke QR Code saja (abaikan barcode minimarket dll)
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        // ✨ RAHASIA RESOLUSI: Minta resolusi ideal tanpa batasan max agar iPad memakai lensa paling tajamnya
        videoConstraints: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
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
  }, [isScannerFullScreen]);

  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 w-full h-full">
      
      {/* KONDISI 1: CARD STANDBY DI DASHBOARD */}
      {!isScannerFullScreen ? (
        <div className="p-8 md:p-12 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] text-center">
          <div className="w-20 h-20 bg-[#A6824A]/10 rounded-full flex items-center justify-center mb-6 text-[#A6824A] ring-8 ring-[#A6824A]/5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Scanner Presensi</h2>
          <p className="text-gray-500 mb-10 max-w-md">Tekan tombol di bawah untuk membuka kamera dalam mode layar penuh (Full Screen) dan mulai memindai tiket tamu.</p>
          <button 
            onClick={() => setIsScannerFullScreen(true)}
            className="px-8 py-4 bg-[#A6824A] hover:bg-[#8a6a3b] text-white rounded-xl font-bold uppercase tracking-wider shadow-[0_10px_25px_rgba(166,130,74,0.4)] transition-all active:scale-95 hover:-translate-y-1 flex items-center gap-3"
          >
            Buka Scanner Full Screen
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
          </button>
        </div>
      ) : (
        /* KONDISI 2: FULL SCREEN OVERLAY KAMERA (Seolah Halaman Baru) */
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center w-screen h-[100dvh] overflow-hidden">
          
          {/* Tombol Tutup Kamera di Pojok Kanan Atas */}
          <button 
            onClick={() => setIsScannerFullScreen(false)} 
            className="absolute top-6 right-6 md:top-8 md:right-8 z-[1000] p-3 bg-[#101111]/60 text-white rounded-full hover:bg-red-600 backdrop-blur-md transition-all border border-white/10 shadow-xl"
            title="Tutup Kamera"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {/* LAYER 1: KAMERA STANDBY (Background Full Edge-to-Edge) */}
          <div className="absolute inset-0 z-10 flex flex-col">
             <div id="qr-reader" className="w-full h-full"></div>
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
        #qr-reader { border: none !important; width: 100vw !important; height: 100dvh !important; display: flex; flex-direction: column; background: #000; }
        
        /* Control Panel di Pindah ke Bawah (Bottom) agar tidak menghalangi kamera */
        #qr-reader__dashboard_section { padding: 1.5rem; padding-bottom: 2.5rem; background: rgba(16, 17, 17, 0.85); backdrop-filter: blur(10px); position: absolute; bottom: 0; left: 0; right: 0; z-index: 30; border-top: 1px solid rgba(166, 130, 74, 0.3); display: flex; flex-direction: column; align-items: center; }
        
        /* Bikin Video Cover Seluruh Layar (Full View Tepi ke Tepi) */
        #qr-reader__scan_region { flex: 1; width: 100vw !important; height: 100dvh !important; min-height: 100%; position: fixed; top: 0; left: 0; z-index: 10; overflow: hidden; }
        #qr-reader__scan_region video { object-fit: cover !important; width: 100vw !important; height: 100dvh !important; position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
        
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
        #qr-reader__dashboard_section_csr span { color: #E6E2DA !important; font-weight: 600; font-size: 14px; }
        #qr-reader__camera_selection { 
          margin-bottom: 12px !important; 
          padding: 10px !important; 
          border-radius: 8px !important; 
          border: 1px solid #A6824A !important; 
          width: 100%; 
          background: #101111;
          color: #E6E2DA;
        }
        #qr-reader a { display: none !important; } /* Hilangkan link sponsor html5-qrcode */
      `}} />
        </div>
      )}
    </div>
  );
}