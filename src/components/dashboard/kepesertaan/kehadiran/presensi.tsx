"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";

// Interface untuk data yang sudah di-preteli (flatten) per orang
interface FlattenedData {
  id: string;
  name: string;
  periode: string;
  seat: string;
  asisten: string;
  is_present: boolean;
}

interface Invitation {
  id: string;
  email: string;
  full_name: string;
  periode: string;
  seat_number: string;
  is_present: boolean;
  created_at: string;
  food_menu: string;
  drink_menu: string;
  vehicle: string;
  jenis_parkiran?: string;
  nama_asisten?: string;
}

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

// --- Komponen ListItem dipindah ke LUAR agar tidak re-render terus menerus ---
const ListItem = ({ name, detail, isPresent }: { name: string, detail: string, isPresent: boolean }) => (
  <div className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
    <div className="flex flex-col">
      <span className="text-sm font-bold text-gray-800">{name}</span>
      <span className="text-xs text-gray-500">{detail}</span>
    </div>
    {isPresent ? (
      <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-800 px-2 py-1 rounded-full shadow-sm border border-green-200">Hadir</span>
    ) : (
      <span className="text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full shadow-sm border border-yellow-200">Pending</span>
    )}
  </div>
);

export default function Kehadiran() {
  const [overlayState, setOverlayState] = useState<"none" | "welcome" | "seat">("none");
  const [scannedData, setScannedData] = useState<QRPayload | null>(null);
  const [isScannerFullScreen, setIsScannerFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [activeMainMode, setActiveMainMode] = useState<"presensi" | "asisten">("presensi");
  const [activeAsistenMode, setActiveAsistenMode] = useState<"Amri" | "Fikri" | "Taufiq">("Amri");
  
  // Menggunakan ref agar state ini tidak menyebabkan komponen re-render saat kamera berjalan
  const isProcessing = useRef(false);

  // --- EFFECT 1: FETCH DATA & REALTIME SUBSCRIPTION ---
  useEffect(() => {
    const fetchInvitations = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (!error && data) setInvitations(data as Invitation[]);
      setIsLoading(false);
    };
    fetchInvitations();

    const channel = supabase
      .channel("realtime-kehadiran")
      .on("postgres_changes", { event: "*", schema: "public", table: "invitations" }, 
        (payload) => {
          setInvitations((prev) => {
            if (payload.eventType === 'INSERT') return [payload.new as Invitation, ...prev];
            if (payload.eventType === 'UPDATE') return prev.map((inv) => (inv.id === payload.new.id ? (payload.new as Invitation) : inv));
            if (payload.eventType === 'DELETE') {
              const oldRecord = payload.old as { id: string };
              return prev.filter((inv) => inv.id !== oldRecord.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- EFFECT 2: INISIALISASI SCANNER ---
  useEffect(() => {
    // Logic untuk scanner
    if (!isScannerFullScreen) return;

    // Inisialisasi Engine Scanner
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }, // ✨ KEMBALIKAN KE KOTAK PASTI: Area dinamis bikin koordinat meleset di mesin ZXing!
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        // ✨ RAHASIA NGEBUT: Fokus 100% pencarian ke QR Code saja (abaikan barcode minimarket dll)
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        // Mencegah scanner stuck di kamera terakhir yang digunakan
        rememberLastUsedCamera: false
      },
      false // Matikan mode verbose (log berisik di console)
    );

    scanner.render(
      async (decodedText) => {
        console.log("RAW HASIL SCAN:", decodedText);

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
          console.error("Gagal membaca JSON QR:", error);
          console.log("Isi teks yang gagal di-parse:", decodedText);
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

  // --- LOGIC PENGOLAHAN DATA ---
  const getAsistenByPeriode = (periodeStr: string | undefined) => {
    if (!periodeStr) return "M. Fikri Al-Khasani";
    const tuaPeriods = ["1999/2001", "2001/2003", "2003/2005", "2005/2007"];
    const agakTuaPeriods = ["2007/2009", "2009/2011", "2011/2013", "2013/2015"];
    if (tuaPeriods.includes(periodeStr)) return "M. Amri Albani";
    if (agakTuaPeriods.includes(periodeStr)) return "M. Taufiqurrahman";
    return "M. Fikri Al-Khasani";
  };

  const flattenedData: FlattenedData[] = useMemo(() => invitations.flatMap((inv) => {
    const names = inv.full_name ? inv.full_name.split(",").map(n => n.trim()) : ["Tanpa Nama"];
    const seats = inv.seat_number ? inv.seat_number.split(",").map(s => s.trim()) : [];
    const asisten = inv.nama_asisten || getAsistenByPeriode(inv.periode);

    return names.map((name, idx) => ({
      id: `${inv.id}-${idx}`,
      name: name,
      periode: inv.periode || '-',
      seat: seats[idx] || seats[0] || 'N/A',
      asisten: asisten,
      is_present: !!inv.is_present, // Paksa menjadi tipe boolean
    }));
  }), [invitations]); // Dependency array sudah aman

  const totalHadir = useMemo(() => flattenedData.filter((p) => p.is_present).length, [flattenedData]);
  const totalPeserta = flattenedData.length;

  // Hitung jumlah Hadir/Total untuk masing-masing asisten
  const asistenStats = useMemo(() => {
    const stats = {
      Amri: { total: 0, hadir: 0 },
      Fikri: { total: 0, hadir: 0 },
      Taufiq: { total: 0, hadir: 0 },
    };
    flattenedData.forEach((p) => {
      const asistenStr = (p.asisten || "").toLowerCase();
      if (asistenStr.includes("amri")) { stats.Amri.total++; if (p.is_present) stats.Amri.hadir++; }
      else if (asistenStr.includes("fikri")) { stats.Fikri.total++; if (p.is_present) stats.Fikri.hadir++; }
      else if (asistenStr.includes("taufiq")) { stats.Taufiq.total++; if (p.is_present) stats.Taufiq.hadir++; }
    });
    return stats;
  }, [flattenedData]);

  // Urutkan daftar utama Presensi: Pending selalu di atas
  const sortedPresensi = useMemo(() => {
    return [...flattenedData].sort((a, b) => {
      if (a.is_present === b.is_present) return a.name.localeCompare(b.name);
      return a.is_present ? 1 : -1;
    });
  }, [flattenedData]);

  const filteredAsisten = useMemo(() => {
    return flattenedData
      .filter((p) => {
        const asistenStr = (p.asisten || "").toLowerCase();
        return asistenStr.includes(activeAsistenMode.toLowerCase());
      })
      .sort((a, b) => {
        if (a.is_present === b.is_present) return a.name.localeCompare(b.name);
        return a.is_present ? 1 : -1;
      });
  }, [flattenedData, activeAsistenMode]);

  return (
    <div className="w-full h-full">
      
      {/* KONDISI 1: CARD STANDBY DI DASHBOARD */}
      {!isScannerFullScreen ? (
        <div className="w-full space-y-6 md:space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Kehadiran</h1>
            <p className="text-sm text-gray-500 mt-1">Pantau & catat kehadiran tamu secara realtime.</p>
          </div>

          {/* Layout Desktop: 2 Kolom */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Kolom Kiri (Desktop) / Atas (Mobile) */}
            <div className="w-full md:w-1/3 lg:w-1/4 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-start relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-bl from-[#A6824A]/10 to-transparent rounded-full z-0"></div>
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="w-12 h-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Telah Hadir</p>
                    <p className="text-2xl font-bold text-gray-800">{isLoading ? '...' : `${totalHadir} / ${totalPeserta}`}</p>
                  </div>
                </div>
                <button onClick={() => setIsScannerFullScreen(true)} className="w-full mt-2 px-4 py-3 bg-[#A6824A] hover:bg-[#8a6a3b] text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#A6824A]/30 transition-all active:scale-95 hover:-translate-y-0.5 flex items-center justify-center gap-2 relative z-10">
                  Scan QR
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>

            {/* Kolom Kanan (Desktop) / Bawah (Mobile) */}
            <div className="w-full md:w-2/3 lg:w-3/4 bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm">
              {/* Switch Mode Utama */}
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg mb-4">
                <button onClick={() => setActiveMainMode("presensi")} className={`w-full py-2 text-sm font-bold rounded-md transition-colors ${activeMainMode === 'presensi' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>Daftar Presensi</button>
                <button onClick={() => setActiveMainMode("asisten")} className={`w-full py-2 text-sm font-bold rounded-md transition-colors ${activeMainMode === 'asisten' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>Per Asisten</button>
              </div>

              {/* Konten Berdasarkan Mode */}
              {activeMainMode === 'presensi' ? (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                  {isLoading ? <p className="text-center text-gray-500 p-8 animate-pulse">Memuat...</p> : sortedPresensi.map(p => <ListItem key={p.id} name={p.name} detail={`Periode ${p.periode}`} isPresent={p.is_present} />)}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg mb-4">
                    <button onClick={() => setActiveAsistenMode("Amri")} className={`w-full py-1.5 text-xs font-bold rounded-md transition-colors ${activeAsistenMode === 'Amri' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>Amri ({asistenStats.Amri.hadir}/{asistenStats.Amri.total})</button>
                    <button onClick={() => setActiveAsistenMode("Fikri")} className={`w-full py-1.5 text-xs font-bold rounded-md transition-colors ${activeAsistenMode === 'Fikri' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>Fikri ({asistenStats.Fikri.hadir}/{asistenStats.Fikri.total})</button>
                    <button onClick={() => setActiveAsistenMode("Taufiq")} className={`w-full py-1.5 text-xs font-bold rounded-md transition-colors ${activeAsistenMode === 'Taufiq' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>Taufiq ({asistenStats.Taufiq.hadir}/{asistenStats.Taufiq.total})</button>
                  </div>
                  <div className="max-h-[55vh] overflow-y-auto pr-2 space-y-6 pb-4">
                    {isLoading ? (
                      <p className="text-center text-gray-500 p-8 animate-pulse">Memuat...</p>
                    ) : (
                      <>
                        {/* Kelompok Belum Hadir (Pending) */}
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                            <span>⏳ Belum Hadir (Pending)</span>
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-[10px]">{filteredAsisten.filter(p => !p.is_present).length}</span>
                          </h4>
                          {filteredAsisten.filter(p => !p.is_present).length === 0 ? (
                            <p className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">Semua tamu sudah hadir.</p>
                          ) : (
                            filteredAsisten.filter(p => !p.is_present).map(p => <ListItem key={p.id} name={p.name} detail={`Periode ${p.periode} • Kursi ${p.seat}`} isPresent={p.is_present} />)
                          )}
                        </div>

                        {/* Kelompok Sudah Hadir */}
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                            <span>✅ Sudah Hadir</span>
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-[10px]">{filteredAsisten.filter(p => p.is_present).length}</span>
                          </h4>
                          {filteredAsisten.filter(p => p.is_present).length === 0 ? (
                            <p className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">Belum ada tamu yang hadir.</p>
                          ) : (
                            filteredAsisten.filter(p => p.is_present).map(p => <ListItem key={p.id} name={p.name} detail={`Periode ${p.periode} • Kursi ${p.seat}`} isPresent={p.is_present} />)
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
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
        
        /* ✨ HAPUS OVERRIDE CSS PADA VIDEO: Biarkan library mengatur ukuran aslinya agar area 'crop' sinkron dengan visual kotak pembidik! */
        #qr-reader__scan_region { flex: 1; display: flex; align-items: center; justify-content: center; position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 10; background: #000; overflow: hidden; }
        
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