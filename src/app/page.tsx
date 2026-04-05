'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { supabase } from '@/lib/supabase';
import { QRCodeCanvas } from 'qrcode.react';
import { Parisienne } from 'next/font/google';

import Cover from '@/components/undangan-peserta/Cover';
import Countdown from '@/components/undangan-peserta/CountdownWall';
import Event from '@/components/undangan-peserta/Eventbook';
import Thanksgiving from '@/components/undangan-peserta/Thanksgiving';
import SeatSelection from './SeatSelection';
import { HalalBihalalData } from '@/data/invitation';

const parisienne = Parisienne({
  subsets: ['latin'],
  weight: ['400'],
});

if (typeof window !== "undefined") {
  // gsap.registerPlugin(ScrollTrigger);
}

type InvitationState = {
  id?: string;
  email: string;
  full_name?: string;
  periode?: string;
  food_menu?: string;
  drink_menu?: string;
  is_sweet_drink?: boolean | null;
  vehicle?: string;
  jenis_parkiran?: string;
  nama_asisten?: string;
  seat_number?: string | null;
  is_present?: boolean;
  isNew?: boolean;
};

export default function HalalBihalalPage() {
  const [isStarted, setIsStarted] = useState(false);
  const [isCoverMounted, setIsCoverMounted] = useState(true);
  const visualRoomsRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [invitation, setInvitation] = useState<InvitationState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  const isFormOpenRef = useRef(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    isFormOpenRef.current = showForm;
  }, [showForm]);

  useEffect(() => {
    const checkDeadline = () => {
      // Deadline: 03 April 2026, 23:59:59 WIB (+07:00)
      const deadline = new Date('2026-04-03T23:59:59+07:00').getTime();
      if (new Date().getTime() > deadline) setIsClosed(true);
    };
    checkDeadline();
    const interval = setInterval(checkDeadline, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
    }

    if (!isStarted) {
      document.body.style.overflow = "hidden";
      return;
    }

    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    if (!visualRoomsRef.current || !mainRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      // INITIAL STATE
      gsap.set(".visual-meja-group", { x: "50vw", y: 0, scale: 1.5, opacity: 0 });
      gsap.set(".visual-bingkai-1", { x: "30vw", y: 0, scale: 1.5, opacity: 0 });
      gsap.set(".visual-papan-group", { x: "80vw", y: "60vh", scale: 3.5, filter: "blur(30px)", opacity: 0 }); // ✨ Papan dari pojok kanan bawah, besar dan blur
      // ✨ Lantai & Bunga diset turun ke bawah (y: 50vh) dan kita siapkan X sejauh -100vw sebagai titik mulai
      gsap.set([".visual-lantai-papan", ".visual-bunga-lantai"], { x: "-100vw", y: "50vh", opacity: 0 });
      // ✨ Setup awal background texture (Zoom 2x di posisi Countdown)
      gsap.set(".visual-wall-texture", { scale: 2.0, y: "50%" }); // ✨ Geseran dimaksimalkan (50%) biar kamera beneran terasa mendongak dari atas

      tl.addLabel("step0");

      // STEP 1: Meja, Bunga Meja, dan Bingkai-1 muncul dari kanan
      tl.to(".step0-content", { opacity: 0, scale: 0.7, filter: "blur(15px)", y: "-50vh", duration: 0.8, ease: "power2.inOut" }, "step0+=0.1"); // ✨ Geser ke atas sejauh setengah layar (-50vh)
      tl.to(".visual-wall-texture", { scale: 1.5, y: "0%", duration: 1.2, ease: "power2.out" }, "step0+=0.3"); // ✨ Zoom out & dinding naik (Kamera menunduk ke meja)
      tl.to(".visual-meja-group", { x: 0, y: 0, scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" }, "step0+=0.3");
      tl.to(".visual-bingkai-1", { x: 0, y: 0, scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" }, "step0+=0.4");
      tl.to(".step1-content", { opacity: 1, y: 0, duration: 0.8 }, "step0+=1");
      tl.addLabel("step1");

      // STEP 2: Kamera geser horizontal ke bingkai-2
      tl.to(".step1-content", { opacity: 0, y: -30, duration: 0.6 }, "step1+=0.1");
      tl.to(".world", { x: "-100vw", duration: 1.5, ease: "power2.inOut" }, "step1+=0.3");
      tl.to(".visual-wall-texture", { x: "-2%", duration: 1.5, ease: "power2.inOut" }, "step1+=0.3"); // ✨ Efek Parallax: dinding geser sedikit
      tl.to(".step2-content", { opacity: 1, y: 0, duration: 0.8 }, "step1+=1.2");
      tl.addLabel("step2");

      // STEP 3: Papan dll muncul dari kanan bawah
      tl.to(".step2-content", { opacity: 0, y: -30, duration: 0.6 }, "step2+=0.1");
      tl.to(".world", { x: "-200vw", duration: 1.5, ease: "power2.inOut" }, "step2+=0.3");
      tl.to(".visual-wall-texture", { scale: 1.0, x: "0%", duration: 1.5, ease: "power2.inOut" }, "step2+=0.3"); // ✨ Zoom out ke 1x (normal)
      
      // ✨ Papan & Bunga Berdiri meluncur dari pojok kanan bawah (besar & blur ke normal)
      tl.to(".visual-papan-group", { opacity: 1, duration: 0.4, ease: "power1.inOut" }, "step2+=0.3"); // Opacity muncul kilat biar efek blur kelihatan
      tl.to(".visual-papan-group", { x: 0, y: 0, scale: 1, filter: "blur(0px)", duration: 1.5, ease: "power3.out" }, "step2+=0.3"); // Nyusut dari kanan bawah
      // ✨ Counter-movement horizontal yang berjalan serempak dengan pergerakan .world agar benda diam di tengah
      tl.to([".visual-lantai-papan", ".visual-bunga-lantai"], { x: 0, duration: 1.5, ease: "power2.inOut" }, "step2+=0.3"); 
      tl.to([".visual-lantai-papan", ".visual-bunga-lantai"], { y: 0, opacity: 1, duration: 1.2, ease: "power2.out" }, "step2+=0.4"); // Masuk vertikal (dari bawah)
      tl.to(".step3-content", { opacity: 1, y: 0, duration: 0.8 }, "step2+=1.2");
      tl.addLabel("step3");

      // STEP 4: Zoom in ke Papan
      tl.to(".step3-content", { opacity: 0, y: -30, duration: 0.6 }, "step3+=0.1");
      
      // 1. Kamera global zoom (titik fokus agak dinaikkan ke 65% agar papan lebih di tengah)
      tl.to(".world", { scale: 2.0, transformOrigin: "83.33% 60%", duration: 2, ease: "power2.inOut" }, "step3+=0.3");
      // ✨ Wall texture ikut nge-zoom sedikit bersama papan agar berasa 3D
      tl.to(".visual-wall-texture", { scale: 1.3, duration: 2, ease: "power2.inOut" }, "step3+=0.3");
      // 2. Lantai & Bunga Lantai turun ke bawah sampai hilang
      // ✨ Jarak (y) diperbesar jadi 250 agar tenggelam lebih ke bawah
      tl.to([".visual-lantai-papan", ".visual-bunga-lantai"], { y: 250, opacity: 0, duration: 1.5, ease: "power2.inOut" }, "step3+=0.3");
      // 3. Papan secara independen zoom sedikit lagi
      tl.to(".visual-papan", { scale: 1.02, y: 100, duration: 2, ease: "power2.inOut" }, "step3+=0.3");
      // 4. Bunga berdiri geser ke pojok kiri bawah sambil membesar
      tl.to(".visual-bunga-berdiri", { x: -40, y: 200, scale: 1.255, duration: 2, ease: "power2.inOut" }, "step3+=0.3");
      
      tl.to(".step4-content", { opacity: 1, y: 0, duration: 0.8 }, "step3+=1.8");
      tl.addLabel("step4");

      let currentStep = 0;
      let isAnimating = false;

      const changeStep = (direction: "next" | "prev") => {
        if (isAnimating) return;

        if (direction === "next" && currentStep < 4) {
          currentStep++;
          isAnimating = true;
          if (currentStep === 4) gsap.to(".scroll-indicator", { opacity: 0, duration: 0.5 });
          tl.tweenTo(`step${currentStep}`, {
            duration: 1.2,
            ease: "power2.inOut",
            onComplete: () => {
              isAnimating = false;
            }
          });
        } else if (direction === "prev" && currentStep > 0) {
          currentStep--;
          isAnimating = true;
          if (currentStep < 4) gsap.to(".scroll-indicator", { opacity: 1, duration: 0.5 });
          tl.tweenTo(`step${currentStep}`, {
            duration: 1.2,
            ease: "power2.inOut",
            onComplete: () => { isAnimating = false; }
          });
        }
      };

      const handleWheel = (e: WheelEvent) => {
        if (isFormOpenRef.current) return;
        
        if (currentStep < 4 && e.cancelable) e.preventDefault();
        if (e.deltaY > 15) {
          changeStep("next");
        } else if (e.deltaY < -15) {
          changeStep("prev");
        }
      };

      let touchStartY = 0;

      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches && e.touches.length > 0) {
          touchStartY = e.touches[0].clientY;
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (isFormOpenRef.current) return;
        if (!e.touches || e.touches.length === 0) return;
        const touchEndY = e.touches[0].clientY;
        const deltaY = touchStartY - touchEndY;

        if (Math.abs(deltaY) > 20) {
          if (deltaY > 0) {
            changeStep("next");
          } else {
            changeStep("prev");
          }
          touchStartY = touchEndY;
        }
      };

      window.addEventListener("wheel", handleWheel, { passive: false });
      window.addEventListener("touchstart", handleTouchStart, { passive: false });
      window.addEventListener("touchmove", handleTouchMove, { passive: false });

      return () => {
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
      };
    }, mainRef.current);

    return () => {
      ctx.revert();
    };
  }, [isStarted]);

  const handleOpenInvitation = () => {
    setIsStarted(true);
    setTimeout(() => {
      setIsCoverMounted(false);
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const inputEmail = formData.get('email') as string;

    const { data: existingData } = await supabase
      .from('invitations')
      .select('*')
      .eq('email', inputEmail)
      .maybeSingle();

    if (existingData) {
      setInvitation(existingData as InvitationState);
      setIsSubmitting(false);
      setTimeout(() => {
        document.getElementById('rsvp-modal')?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      return;
    }

    if (isClosed) {
      alert("Maaf, pendaftaran telah ditutup. Email Anda belum terdaftar.");
      setIsSubmitting(false);
      return;
    }

    // --- LOGIKA ASISTEN PERTEMUAN ---
    const periode = formData.get('periode') as string;
    let asistenNama = "";
    let asistenWA = "";

    const tuaPeriods = ["1999/2001", "2001/2003", "2003/2005", "2005/2007"];
    const agakTuaPeriods = ["2007/2009", "2009/2011", "2011/2013", "2013/2015"];
    // Sisanya (2015/2017 - 2024/2026) adalah muda

    if (tuaPeriods.includes(periode)) {
      asistenNama = "M. Amri Albani";
      asistenWA = "+6289604795602";
    } else if (agakTuaPeriods.includes(periode)) {
      asistenNama = "M. Taufiqurrahman";
      asistenWA = "+6285800061638";
    } else {
      asistenNama = "M. Fikri Al-Khasani";
      asistenWA = "+6285137436224";
    }

    // Kumpulkan data dinamis sesuai jumlah tamu yang dipilih
    const names: string[] = [];
    const foods: string[] = [];
    const drinks: string[] = [];
    const vehicles: string[] = [];
    const parkings: string[] = [];

    for (let i = 1; i <= guestCount; i++) {
      const nama = formData.get(`nama_${i}`) as string;
      if (nama && nama.trim() !== '') {
        names.push(nama.trim());
        foods.push(formData.get(`food_menu_${i}`) as string);
        
        const drinkChoice = formData.get(`drink_choice_${i}`) as string;
        if (drinkChoice === 'es_teh_manis') drinks.push('Es Teh Manis');
        else if (drinkChoice === 'es_teh_tawar') drinks.push('Es Teh Tawar');
        else if (drinkChoice === 'air_mineral') drinks.push('Air Mineral');

        const vehicleType = formData.get(`vehicle_${i}`) as string;
        
        // ✨ Semua tamu sekarang dipusatkan ke Warmindo 17
        const parkingLoc = "Warmindo 17";

        vehicles.push(vehicleType);
        parkings.push(parkingLoc);
      }
    }

    const newData: Partial<InvitationState> = {
      email: inputEmail,
      full_name: names.join(', '),
      periode: formData.get('periode') as string,
      food_menu: foods.join(', '),
      drink_menu: drinks.join(', '),
      is_sweet_drink: null, // Dinonaktifkan karena keterangan manis/tawar sudah nyatu di drink_menu
      vehicle: vehicles.join(', '),
      jenis_parkiran: parkings.join(', '),
      nama_asisten: asistenNama,
      seat_number: null,
      isNew: true, // ✨ Tambahkan flag ini untuk menandakan data belum masuk database
    };

    // ✨ Jangan langsung INSERT, simpan di state dulu untuk dilanjutkan ke pilih kursi
    setInvitation(newData as InvitationState);
    setTimeout(() => {
      document.getElementById('rsvp-modal')?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);

    setIsSubmitting(false);
  };

  const downloadQR = (canvasId: string, name: string) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `Tiket_${name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handleBookingComplete = (updatedInvitation: unknown) => {
    setInvitation(updatedInvitation as InvitationState);
  };

  // Fungsi bantuan untuk menentukan asisten berdasarkan periode dari data undangan yang sudah ada
  const getAsistenByPeriode = (periodeStr: string | undefined) => {
    if (!periodeStr) return { nama: "M. Fikri Al-Khasani", wa: "+6285137436224" };
    const tuaPeriods = ["1999/2001", "2001/2003", "2003/2005", "2005/2007"];
    const agakTuaPeriods = ["2007/2009", "2009/2011", "2011/2013", "2013/2015"];
    
    if (tuaPeriods.includes(periodeStr)) {
      return { nama: "M. Amri Albani", wa: "+6289604795602" };
    } else if (agakTuaPeriods.includes(periodeStr)) {
      return { nama: "M. Taufiqurrahman", wa: "+6285800061638" };
    } else {
      return { nama: "M. Fikri Al-Khasani", wa: "+6285137436224" };
    }
  };

  return (
    <>
      {/* Peringatan Desktop */}
      <div className="hidden md:flex fixed inset-0 z-[9999] bg-[#101111] items-center justify-center text-[#E6E2DA] p-8 text-center">
        <div className="max-w-md">
          <div className="text-6xl mb-6">📱</div>
          <h1 className="text-3xl font-bold mb-4 text-[#A6824A]">Akses Dibatasi</h1>
          <p className="text-lg text-[#E6E2DA]">Website ini hanya bisa diakses melalui mobile/smartphone. Silakan buka melalui HP Anda.</p>
        </div>
      </div>

      <main ref={mainRef} className="relative bg-[#101111] w-full min-h-screen md:hidden">
      
      {/* MENGHILANGKAN AnimatePresence YANG MEMBUAT BUG KLIK DI HP, GANTI KE CSS TRANSITION MURNI */}
      {isCoverMounted && (
        <div
          className={`fixed inset-0 z-[999999] h-[100dvh] w-full transition-all duration-700 ease-in-out origin-center ${
            isStarted ? "opacity-0 pointer-events-none scale-110" : "opacity-100 pointer-events-auto scale-100"
          }`}
        >
          <Cover onOpen={handleOpenInvitation} />
        </div>
      )}

      {isStarted && (
        <>
          <div ref={visualRoomsRef} className="fixed inset-0 w-full h-[100dvh] overflow-hidden z-50">
              <div className="visual-wall-texture absolute inset-0 bg-cover bg-center origin-center" style={{ backgroundImage: 'url(/images/wall-texture.webp)', willChange: 'transform' }} />

              {/* VISUAL WORLD (Scales & Moves) */}
              <div className="world absolute top-0 left-0 w-[300vw] h-[100dvh] origin-[83.33%_70%]" style={{ willChange: 'transform' }}>
                
                {/* ROOM 1: 0 - 100vw */}
                <img src="/images/bingkai-1.webp" alt="Bingkai 1" className="visual-bingkai-1 absolute bottom-[3%] left-[40vw] w-52 md:w-64 object-contain z-30" />
                
                {/* BOUNDARY: 100vw */}
                <div className="visual-meja-group absolute bottom-0 left-[100vw] -translate-x-1/2 w-[32rem] z-20 origin-bottom">
                  <img src="/images/meja.webp" alt="Meja" className="w-full object-bottom" />
                  <img src="/images/bunga-meja.webp" alt="Bunga Meja" className="absolute bottom-[25%] left-[45%] -translate-x-1/2 w-80" />
                </div>

                {/* ROOM 2: 100vw - 200vw */}
                <img src="/images/bingkai-2.webp" alt="Bingkai 2" className="visual-bingkai-2 absolute bottom-[5%] left-[105vw] w-52 md:w-64 object-contain z-30" />

                {/* ROOM 3: 200vw - 300vw */}
                <div className="visual-papan-group absolute bottom-0 left-[250vw] -translate-x-1/2 w-full max-w-[35rem] h-[80vh] z-30 flex flex-col items-center justify-end pb-[5vh]">
                  <img src="/images/bunga-berdiri.webp" alt="Bunga Berdiri" className="visual-bunga-berdiri absolute bottom-[-7%] left-[13%] w-65 md:w-64 z-20 origin-bottom-left" />
                  <div className="visual-papan relative w-80 z-10 translate-y-1">
                    <img src="/images/papan.webp" alt="Papan" className="w-full pointer-events-none" />
                    <Event data={HalalBihalalData.events} />
                  </div>
                </div>
                
                {/* ✨ Bunga Lantai dipisah keluar grup agar bisa naik murni dari bawah */}
                <img src="/images/bunga-lantai.webp" alt="Bunga Lantai" className="visual-bunga-lantai absolute bottom-[-2vh] left-[250vw] -translate-x-1/2 w-100 md:w-80 z-20" />
                <img src="/images/lantai.webp" alt="Lantai" className="visual-lantai-papan absolute bottom-[-45vh] left-[250vw] -translate-x-1/2 w-[52.5rem] max-w-none z-10" />
              </div>

              {/* UI LAYERS (Fixed positioned per step) */}
              <div className="absolute inset-0 pointer-events-none z-40">
                
                {/* STEP 0 */}
                <div className="step0-content absolute inset-0 flex items-center justify-center pointer-events-auto">
                   <Countdown data={HalalBihalalData} />
                </div>

                {/* STEP 1 */}
                <div className="step1-content absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 translate-y-8 [&_.event-lantai]:hidden [&_.event-bunga-berdiri]:hidden [&_.event-bunga-lantai]:hidden [&_.event-papan_img]:hidden">
                  
                  {/* ✨ Tema Acara Part 1 (Host) */}
                  <div className="absolute top-16 md:top-24 left-8 md:left-16 -rotate-6 z-10 flex flex-col items-start opacity-100 drop-shadow-md">
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#5D1E21] font-extrabold mb-1 pl-1">✧ Tema Utama</span>
                    <div className={`w-72 md:w-80 text-left text-5xl md:text-6xl text-[#5D1E21] leading-tight drop-shadow-lg ${parisienne.className}`}>
                      Silaturahmi Lintas Pimpinan Alumni
                    </div>
                    <div className="flex items-center gap-2 mt-2 pl-1">
                      <div className="w-12 h-[2px] bg-[#5D1E21]/60"></div>
                      <span className="text-[9px] md:text-[11px] uppercase tracking-[0.3em] font-bold text-[#5D1E21]/80">Lintas Generasi</span>
                    </div>
                  </div>
                  {/* Konten Frame 1 (Host) dikosongkan agar info event muncul bersama papan */}
                </div>

                {/* STEP 2 */}
                <div className="step2-content absolute inset-0 pointer-events-none opacity-0 translate-y-8">
                  
                  {/* ✨ Tema Acara Part 2 (Co-Host) */}
                  <div className="absolute top-16 md:top-24 right-8 md:right-16 rotate-6 z-10 flex flex-col items-end opacity-100 drop-shadow-md">
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#5D1E21] font-extrabold mb-1 pr-1">Agenda Bersama ✧</span>
                    <div className={`w-80 md:w-96 text-right text-5xl md:text-6xl text-[#5D1E21] leading-tight drop-shadow-lg ${parisienne.className}`}>
                      Mengembalikan Eksistensi
                      <br />
                      Organisasi External
                    </div>
                    <div className="flex items-center gap-2 mt-2 pr-1">
                      <span className="text-[9px] md:text-[11px] uppercase tracking-[0.3em] font-bold text-[#5D1E21]/80">Sinergi & Kolaborasi</span>
                      <div className="w-12 h-[2px] bg-[#5D1E21]/60"></div>
                    </div>
                  </div>

                  {/* Konten teks Co-Host (Step 2) dihapus sesuai permintaan */}
                </div>

                {/* STEP 3 */}
                <div className="step3-content absolute inset-0 pointer-events-none opacity-0 translate-y-8">
                  {/* Teks event sekarang menyatu langsung di dalam papan animasi .visual-papan */}
                </div>

                {/* STEP 4 */}
                <div className="step4-content absolute inset-0 pointer-events-none opacity-0 translate-y-8 flex flex-col items-center justify-end pb-32">
                  <button 
                    onClick={() => setShowForm(true)}
                    className="pointer-events-auto px-8 py-3.5 bg-[#5D1E21] text-[#E6E2DA] rounded-full font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs shadow-[0_0_20px_rgba(166,130,74,0.4)] border border-[#A6824A]/70 hover:bg-[#A6824A] hover:text-[#101111] active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span>{isClosed ? 'Lihat Tiket Masuk' : 'Konfirmasi Kehadiran'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                </div>
              </div>
          </div>

          {/* MODAL FORM RSVP & GUESTBOOK */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                id="rsvp-modal"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="fixed inset-0 z-[200] flex flex-col overflow-y-auto overscroll-contain bg-[#101111]/95 backdrop-blur-md"
              >
                <div className="w-full pointer-events-auto min-h-full flex flex-col relative">
                  {/* Tombol Close */}
                  <button
                    onClick={() => setShowForm(false)}
                    className="absolute top-6 right-6 z-50 p-2 bg-[#E6E2DA]/10 backdrop-blur-sm rounded-full text-[#E6E2DA] hover:bg-[#E6E2DA]/20 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="flex-grow pt-24 pb-8 flex flex-col items-center gap-12">
                      {/* --- FORM KONFIRMASI KEHADIRAN (Eks Step 3) --- */}
                      <div className="max-w-md mx-auto w-full px-6">
                        {!invitation ? (
                          <>
                            <h2 className="text-3xl font-bold text-[#A6824A] mb-6 text-center drop-shadow-md">
                              {isClosed ? 'Cek Tiket Masuk' : 'Konfirmasi Kehadiran'}
                            </h2>
                            <form onSubmit={handleSubmit} className="w-full text-[#E6E2DA]">
                              {isClosed ? (
                                <div className="bg-[#5D1E21]/20 border border-[#5D1E21] p-4 rounded-xl mb-8 text-center">
                                  <p className="text-xs text-[#E6E2DA] font-medium leading-relaxed">Pendaftaran telah ditutup pada <br/><b className="text-[#A6824A]">03 April 2026, 23:59 WIB</b>.</p>
                                  <p className="text-[10px] text-[#E6E2DA]/70 mt-2">Silakan masukkan email terdaftar Anda untuk melihat tiket.</p>
                                </div>
                              ) : (
                                <p className="text-xs text-[#E6E2DA]/80 mb-8 text-center">Isi data baru, atau masukkan email terdaftar untuk melihat tiket Anda.</p>
                              )}
                              
                              <div className="space-y-6">
                                <div>
                                  <label className="block text-xs font-medium mb-1 uppercase tracking-wider text-[#A6824A]">Email</label>
                                  <input name="email" type="email" required placeholder="email@contoh.com" className="w-full bg-transparent border-0 border-b-2 border-[#A6824A]/50 text-[#E6E2DA] placeholder:text-[#E6E2DA]/50 py-3 px-1 text-sm focus:outline-none focus:ring-0 focus:border-[#A6824A] transition-colors" />
                                </div>
                                {!isClosed && (
                                  <>
                                <div>
                                  <label className="block text-xs font-medium mb-1 uppercase tracking-wider text-[#A6824A]">Periode Pimpinan</label>
                                  <div className="relative">
                                    <select name="periode" required className="w-full bg-[#101111] border-0 border-b-2 border-[#A6824A]/50 text-[#E6E2DA] py-3 px-1 text-sm rounded-t-md focus:outline-none focus:ring-0 focus:border-[#A6824A] transition-colors appearance-none">
                                      <option value="" className="bg-[#101111]">Pilih Periode</option>
                                      <option value="2024/2026" className="bg-[#101111]">2024/2026</option>
                                      <option value="2021/2023" className="bg-[#101111]">2021/2023</option>
                                      <option value="2019/2021" className="bg-[#101111]">2019/2021</option>
                                      <option value="2017/2019" className="bg-[#101111]">2017/2019</option>
                                      <option value="2015/2017" className="bg-[#101111]">2015/2017</option>
                                      <option value="2013/2015" className="bg-[#101111]">2013/2015</option>
                                      <option value="2011/2013" className="bg-[#101111]">2011/2013</option>
                                      <option value="2009/2011" className="bg-[#101111]">2009/2011</option>
                                      <option value="2007/2009" className="bg-[#101111]">2007/2009</option>
                                      <option value="2005/2007" className="bg-[#101111]">2005/2007</option>
                                      <option value="2003/2005" className="bg-[#101111]">2003/2005</option>
                                      <option value="2001/2003" className="bg-[#101111]">2001/2003</option>
                                      <option value="1999/2001" className="bg-[#101111]">1999/2001</option>
                                  </select>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#A6824A]">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1 uppercase tracking-wider text-[#A6824A]">Jumlah Tamu yang Hadir</label>
                                  <div className="relative">
                                    <select value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} className="w-full bg-[#101111] border-0 border-b-2 border-[#A6824A]/50 text-[#E6E2DA] py-3 px-1 text-sm rounded-t-md focus:outline-none focus:ring-0 focus:border-[#A6824A] transition-colors appearance-none">
                                      <option value={1} className="bg-[#101111]">1 Orang</option>
                                    <option value={2} className="bg-[#101111]">2 Orang</option>
                                    <option value={3} className="bg-[#101111]">3 Orang</option>
                                  </select>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#A6824A]">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                  </div>
                                </div>

                                {Array.from({ length: guestCount }).map((_, idx) => {
                                  const i = idx + 1;
                                  return (
                                    <div key={i} className="space-y-6 pt-6 mt-6 border-t border-[#A6824A]/60">
                                      <p className="text-sm font-bold text-[#E6E2DA]">Data Tamu {i}</p>
                                      
                                      <div>
                                        <label className="block text-xs font-medium mb-1 uppercase tracking-wider text-[#A6824A]">Nama Lengkap</label>
                                        <input name={`nama_${i}`} required placeholder={`Nama Tamu ${i}`} className="w-full bg-transparent border-0 border-b-2 border-[#A6824A]/50 text-[#E6E2DA] placeholder:text-[#E6E2DA]/50 py-3 px-1 text-sm focus:outline-none focus:ring-0 focus:border-[#A6824A] transition-colors" />
                                      </div>
                                      
                                      <div>
                                        <label className="block text-xs font-medium mb-1 uppercase tracking-wider text-[#A6824A]">Makanan</label>
                                        <div className="relative">
                                          <select name={`food_menu_${i}`} required className="w-full bg-[#101111] border-0 border-b-2 border-[#A6824A]/50 text-[#E6E2DA] py-3 px-1 text-sm rounded-t-md focus:outline-none focus:ring-0 focus:border-[#A6824A] transition-colors appearance-none">
                                            <option value="" className="bg-[#101111]">Pilih Makanan</option>
                                          <option value="Rice Bowl Original" className="bg-[#101111]">Rice Bowl Original</option>
                                          <option value="Rice Bowl Hot Lava" className="bg-[#101111]">Rice Bowl Hot Lava</option>
                                          <option value="Rice Bowl Teriyaki" className="bg-[#101111]">Rice Bowl Teriyaki</option>
                                          <option value="Rice Bowl Lada Hitam" className="bg-[#101111]">Rice Bowl Lada Hitam</option>
                                          <option value="Nasi Ayam Bali" className="bg-[#101111]">Nasi Ayam Bali</option>
                                          <option value="Nasi Goreng" className="bg-[#101111]">Nasi Goreng</option>
                                        </select>
                                          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#A6824A]">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <label className="block text-xs font-medium mb-2 uppercase tracking-wider text-[#A6824A]">Minuman</label>
                                        <div className="space-y-3 pt-2">
                                          <label className="flex items-center gap-3 cursor-pointer"><input type="radio" name={`drink_choice_${i}`} value="es_teh_manis" required className="w-4 h-4 accent-[#A6824A] bg-transparent border-[#A6824A] text-[#A6824A] focus:ring-[#A6824A]" /><span className="text-sm text-[#E6E2DA] font-medium">Es Teh Manis</span></label>
                                          <label className="flex items-center gap-3 cursor-pointer"><input type="radio" name={`drink_choice_${i}`} value="es_teh_tawar" required className="w-4 h-4 accent-[#A6824A] bg-transparent border-[#A6824A] text-[#A6824A] focus:ring-[#A6824A]" /><span className="text-sm text-[#E6E2DA] font-medium">Es Teh Tawar</span></label>
                                          <label className="flex items-center gap-3 cursor-pointer"><input type="radio" name={`drink_choice_${i}`} value="air_mineral" required className="w-4 h-4 accent-[#A6824A] bg-transparent border-[#A6824A] text-[#A6824A] focus:ring-[#A6824A]" /><span className="text-sm text-[#E6E2DA] font-medium">Air Mineral</span></label>
                                        </div>
                                      </div>

                                      <div className="pt-2">
                                        <label className="block text-xs font-medium mb-2 uppercase tracking-wider text-[#A6824A]">Kendaraan</label>
                                        <div className="grid grid-cols-2 gap-4">
                                  <label className="relative block cursor-pointer">
                                    <input type="radio" name={`vehicle_${i}`} value="Mobil" required className="absolute opacity-0 w-full h-full peer z-10 cursor-pointer" />
                                    <div className="flex flex-col items-center justify-center p-3 border-2 border-[#A6824A] bg-[#E6E2DA]/5 rounded-xl text-[#A6824A]/70 peer-checked:border-[#A6824A] peer-checked:text-[#E6E2DA] peer-checked:bg-[#101111] hover:bg-[#E6E2DA]/10 transition-all pointer-events-none">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path><path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path><path d="M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5"></path></svg>
                                              <span className="text-xs font-bold tracking-wide">MOBIL</span>
                                            </div>
                                          </label>
                                  <label className="relative block cursor-pointer">
                                    <input type="radio" name={`vehicle_${i}`} value="Motor" required className="absolute opacity-0 w-full h-full peer z-10 cursor-pointer" />
                                    <div className="flex flex-col items-center justify-center p-3 border-2 border-[#A6824A] bg-[#E6E2DA]/5 rounded-xl text-[#A6824A]/70 peer-checked:border-[#A6824A] peer-checked:text-[#E6E2DA] peer-checked:bg-[#101111] hover:bg-[#E6E2DA]/10 transition-all pointer-events-none">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M5 16m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path><path d="M19 16m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path><path d="M7.5 14h5l4 -4h-10.5m1.5 4l4 -4"></path><path d="M13 6h2l1.5 3l2 4"></path></svg>
                                              <span className="text-xs font-bold tracking-wide">MOTOR</span>
                                            </div>
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                                  </>
                                )}
                              </div>

                              <button disabled={isSubmitting} type="submit" className="w-full bg-[#5D1E21] hover:bg-[#A6824A] hover:text-[#101111] text-[#E6E2DA] p-4 rounded-xl font-bold tracking-wider uppercase transition-colors mt-8 shadow-[0_0_15px_rgba(166,130,74,0.2)] hover:shadow-[0_0_20px_rgba(166,130,74,0.4)] border border-transparent hover:border-[#A6824A] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2">
                                {isSubmitting ? 'Memproses...' : (
                                  <>
                                    <span>{isClosed ? 'Cek Tiket Saya' : 'Lanjut Pilih Kursi'}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                  </>
                                )}
                              </button>
                            </form>
                          </>
                        ) : (!invitation.seat_number || invitation.seat_number === 'null' || String(invitation.seat_number).trim() === '') ? (
                          <SeatSelection
                            invitationId={invitation.id}
                            pendingData={invitation.isNew ? invitation : undefined}
                            guestCount={invitation.full_name?.split(', ')?.length || 1}
                            onBookingComplete={handleBookingComplete}
                          />
                        ) : (
                          <>
                            <h2 className="text-3xl font-bold text-[#A6824A] mb-6 text-center drop-shadow-md">Tiket Anda</h2>
                            <div className="bg-[#E6E2DA]/95 backdrop-blur-md p-6 rounded-xl shadow-2xl w-full text-center border-t-8 border-[#5D1E21]">
                              <h1 className="text-2xl font-bold text-[#101111] mb-1">Tiket Masuk</h1>
                              <p className="text-[#101111]/70 text-xs mb-4">Periode {invitation.periode}</p>
                              
                              <div className="space-y-6 mt-4">
                                {(invitation.full_name?.split(', ') || []).map((name, i) => {
                                  const foods = invitation.food_menu?.split(', ') || [];
                                  const drinks = invitation.drink_menu?.split(', ') || [];
                                  const vehicles = invitation.vehicle?.split(', ') || [];
                                  const parkings = invitation.jenis_parkiran?.split(', ') || [];
                                  const seats = invitation.seat_number?.split(', ') || [];
                                  const legacyDrink = invitation.is_sweet_drink !== null && invitation.is_sweet_drink !== undefined ? (invitation.is_sweet_drink ? ' Manis' : ' Tawar') : '';
                                  
                                  const cleanVehicle = vehicles[i] || '-';
                                  const parkingLoc = parkings[i] || 'Warmindo 17';
                                  
                                  const canvasId = `qr-${invitation.id}-${i}`;
                                  
                                  const asisten = getAsistenByPeriode(invitation.periode);
                                  
                                  // Payload data lengkap untuk QR Code individual
                                  const qrPayload = JSON.stringify({
                                    id: invitation.id,
                                    nama: name,
                                    meja: seats[i] || seats[0]
                                  });

                                  return (
                                    <div key={i} className="bg-[#E6E2DA]/20 border border-[#A6824A]/20 rounded-xl p-5 shadow-sm relative text-left">
                                      <div className="text-center mb-4">
                                        <p className="font-bold text-[#5D1E21] text-lg mb-1">{name}</p>
                                        <p className="text-[#A6824A] font-bold text-xl mb-4">{seats[i] || seats[0]}</p>
                                        
                                        <div className="relative inline-block">
                                          <div className="p-2 bg-[#FFFFFF] border border-[#A6824A]/20 rounded-xl shadow-inner">
                                            <QRCodeCanvas id={canvasId} value={qrPayload} size={200} level="L" includeMargin={true} fgColor="#000000" bgColor="#FFFFFF" />
                                          </div>
                                          <button 
                                            onClick={() => downloadQR(canvasId, name)}
                                            type="button"
                                            className="absolute -bottom-3 -right-3 bg-[#A6824A] text-[#101111] p-2.5 rounded-full shadow-lg hover:bg-[#5D1E21] hover:scale-110 active:scale-95 transition-all"
                                            title="Download QR Code"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                          </button>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 gap-1.5 text-[11px] text-[#101111] bg-[#E6E2DA] p-3 rounded-lg border border-[#A6824A]/10">
                                        <p>🍽️ {foods[i] || '-'}</p>
                                        <p>🥤 {drinks[i] || '-'}{i === 0 && legacyDrink}</p>
                                        <p>🚗 {cleanVehicle}</p>
                                        <p className="text-[#5D1E21]">🅿️ Parkir: <span className="font-semibold">{parkingLoc}</span></p>
                                        <div className="mt-2 pt-2 border-t border-[#A6824A]/20 flex items-center justify-between">
                                          <p className="text-[#5D1E21]">👤 Asisten: <span className="font-semibold">{asisten.nama}</span></p>
                                          <a 
                                            href={`https://wa.me/${asisten.wa.replace('+', '')}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="bg-[#A6824A] text-[#E6E2DA] px-2 py-1 rounded text-[9px] hover:bg-[#5D1E21] transition-colors"
                                          >Hubungi WA</a>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="pt-4 mt-6 border-t border-[#A6824A]/20">
                                  <p className="text-center font-bold text-xs text-[#5D1E21]">Status: {invitation.is_present ? '✅ Hadir' : 'Menunggu Kehadiran'}</p>
                                </div>
                            </div>
                          </>
                        )}
                      </div>

                    </div>
                    <Thanksgiving />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          <div className="scroll-indicator fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#101111]/80 to-transparent z-[100] flex flex-col items-center justify-end pb-4 pointer-events-none">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#E6E2DA]/90 font-medium text-center drop-shadow-md">
                Scroll/Swipe
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#E6E2DA]/90 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </motion.div>
          </div>
        </>
      )}
      </main>
    </>
  );
}
