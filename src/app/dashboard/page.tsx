"use client";

import { useState, useEffect } from "react";

// Import Komponen Peserta
import OverviewPeserta from "@/components/dashboard/kepesertaan/overview-peserta";
import DataPeserta from "@/components/dashboard/kepesertaan/data-master/data-peserta";
import Fasilitas from "@/components/dashboard/kepesertaan/parkiran/parkiran";
import Kehadiran from "@/components/dashboard/kepesertaan/kehadiran/presensi";
import Asisten from "@/components/dashboard/kepesertaan/kehadiran/asisten";

// Import Komponen Sumber Daya
import OverviewSumberDaya from "@/components/dashboard/sumber-daya/overview-sumber-daya";
import Keuangan from "@/components/dashboard/sumber-daya/keuangan/keuangan";
import Konsumsi from "@/components/dashboard/sumber-daya/konsumsi/konsumsi";
import Perlengkapan from "@/components/dashboard/sumber-daya/perlengkapan/perlengkapan";
import Partnership from "@/components/dashboard/sumber-daya/partnership/partnership";

// Import Komponen Dokumen
import Lpj from "@/components/dashboard/dokumen/lpj";
import SewaTempat from "@/components/dashboard/dokumen/sewa-tempat";
import Sponsorship from "@/components/dashboard/dokumen/sponsorship";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"peserta" | "sumber-daya" | "dokumen">("peserta");
  // State khusus untuk sub-menu Peserta
  const [activePesertaTab, setActivePesertaTab] = useState<"overview" | "data" | "kehadiran" | "fasilitas" | "asisten">("overview");
  // State khusus untuk sub-menu Sumber Daya
  const [activeSumberDayaTab, setActiveSumberDayaTab] = useState<"overview" | "keuangan" | "perlengkapan" | "partnership" | "konsumsi">("overview");

  // --- INTERCEPT TOMBOL BACK (MOBILE) & ESCAPE (PC) ---
  useEffect(() => {
    // Deteksi saat hardware "Back" button HP / history browser ditekan
    const handlePopState = () => {
      if (!window.location.hash) {
        setActivePesertaTab("overview");
        setActiveSumberDayaTab("overview");
      }
    };

    // Deteksi khusus kalau pakai PC dan pencet tombol Escape (ESC)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (window.location.hash === "#sub") window.history.back();
        else {
          setActivePesertaTab("overview");
          setActiveSumberDayaTab("overview");
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Fungsi Navigasi Sub-menu (Tambah Hash URL #sub biar HP bisa nangkep riwayatnya)
  const navigatePeserta = (tab: "overview" | "data" | "kehadiran" | "fasilitas" | "asisten") => {
    setActivePesertaTab(tab);
    if (tab !== "overview") window.location.hash = "sub";
  };

  const navigateSumberDaya = (tab: "overview" | "keuangan" | "perlengkapan" | "partnership" | "konsumsi") => {
    setActiveSumberDayaTab(tab);
    if (tab !== "overview") window.location.hash = "sub";
  };

  // Fungsi Kembali ke Overview
  const handleBackToOverview = () => {
    if (window.location.hash === "#sub") window.history.back();
    else {
      setActivePesertaTab("overview");
      setActiveSumberDayaTab("overview");
    }
  };

  // Fungsi Navigasi Tab Utama di Bawah
  const switchMainTab = (tab: "peserta" | "sumber-daya" | "dokumen") => {
    setActiveTab(tab);
    setActivePesertaTab("overview");
    setActiveSumberDayaTab("overview");
    window.history.replaceState(null, "", window.location.pathname); // Bersihkan hash kalau ada
  };

  return (
    // Tambahkan padding bottom (pb-24) agar konten paling bawah tidak tertutup oleh bottom navigation
    <div className="relative min-h-screen bg-gray-50 pb-24 md:pb-6 md:pl-64">
      <div className="w-full">

        {/* Konten Dashboard Berdasarkan Tab Aktif */}
        <div className="w-full">
          {activeTab === "peserta" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
              
              {/* Tombol Kembali (Muncul saat masuk sub-menu) */}
              {activePesertaTab !== "overview" && (
                <div className="px-4 pt-6 pb-2 max-w-7xl mx-auto w-full">
                  <button
                    onClick={handleBackToOverview}
                    className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#A6824A] transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm w-max"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Kembali ke Menu Utama
                  </button>
                </div>
              )}

              {/* Konten Sub-menu yang Aktif */}
              <div className={`animate-in fade-in zoom-in-95 duration-200 ${activePesertaTab !== 'overview' ? 'px-4 max-w-7xl mx-auto' : ''}`}>
                {activePesertaTab === "overview" && <OverviewPeserta onNavigate={navigatePeserta} />}
                {activePesertaTab === "data" && <DataPeserta />}
                {activePesertaTab === "kehadiran" && <Kehadiran />}
                {activePesertaTab === "fasilitas" && <Fasilitas />}
                {activePesertaTab === "asisten" && <Asisten />}
              </div>
            </div>
          )}

          {activeTab === "sumber-daya" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
              {/* Tombol Kembali untuk sub-menu Sumber Daya */}
              {activeSumberDayaTab !== "overview" && (
                <div className="px-4 pt-6 pb-2 max-w-7xl mx-auto w-full">
                  <button
                    onClick={handleBackToOverview}
                    className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#A6824A] transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm w-max"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Kembali ke Menu Sumber Daya
                  </button>
                </div>
              )}

              <div className={`animate-in fade-in zoom-in-95 duration-200 ${activeSumberDayaTab !== 'overview' ? 'p-4 md:p-6 max-w-7xl mx-auto' : ''}`}>
                {activeSumberDayaTab === "overview" && <OverviewSumberDaya onNavigate={navigateSumberDaya} />}
                {activeSumberDayaTab === "keuangan" && <Keuangan />}
                {activeSumberDayaTab === "perlengkapan" && <Perlengkapan />}
                {activeSumberDayaTab === "partnership" && <Partnership />}
                {activeSumberDayaTab === "konsumsi" && <Konsumsi />}
              </div>
            </div>
          )}

          {activeTab === "dokumen" && (
            <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Dokumen & Berkas</h1>
                <p className="text-[11px] md:text-sm text-blue-600 font-bold uppercase tracking-widest mt-0.5 md:mt-1">Pusat Manajemen File</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Sponsorship />
                <SewaTempat />
                <Lpj />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu: Bottom on Mobile, Sidebar on Desktop */}
      <div className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-0 md:w-64 bg-white border-t md:border-t-0 md:border-r border-gray-200 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none transition-all">
        <div className="flex flex-row md:flex-col justify-around md:justify-start items-center md:items-stretch h-16 md:h-full max-w-7xl mx-auto px-2 md:px-4 md:py-8 gap-1 md:gap-2">
          
          {/* Header Sidebar Desktop (Hidden di Mobile) */}
          <div className="hidden md:flex items-center gap-3 px-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A6824A] to-[#D4AF37] flex items-center justify-center shadow-md shrink-0 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
            </div>
            <span className="font-bold text-gray-800 tracking-tight text-lg">Admin Panel</span>
          </div>

          {/* Tab: Peserta */}
          <button
            onClick={() => switchMainTab("peserta")}
            className={`flex flex-col md:flex-row items-center justify-center md:justify-start w-full h-full md:h-auto space-y-1 md:space-y-0 md:space-x-3 transition-colors rounded-lg md:rounded-xl mx-1 md:mx-0 md:px-4 md:py-3 ${
              activeTab === "peserta" ? "text-blue-600 md:bg-blue-50" : "text-gray-500 hover:text-blue-500 hover:bg-gray-50 md:hover:bg-gray-100"
            }`}
          >
            <svg className="w-6 h-6 md:w-5 md:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-[10px] sm:text-xs md:text-sm font-medium">Peserta</span>
          </button>

          {/* Tab: Sumber Daya */}
          <button
            onClick={() => switchMainTab("sumber-daya")}
            className={`flex flex-col md:flex-row items-center justify-center md:justify-start w-full h-full md:h-auto space-y-1 md:space-y-0 md:space-x-3 transition-colors rounded-lg md:rounded-xl mx-1 md:mx-0 md:px-4 md:py-3 ${
              activeTab === "sumber-daya" ? "text-blue-600 md:bg-blue-50" : "text-gray-500 hover:text-blue-500 hover:bg-gray-50 md:hover:bg-gray-100"
            }`}
          >
            <svg className="w-6 h-6 md:w-5 md:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-[10px] sm:text-xs md:text-sm font-medium">
              <span className="md:hidden">SumbDaya</span>
              <span className="hidden md:inline">Sumber Daya</span>
            </span>
          </button>

          {/* Tab: Dokumen */}
          <button
            onClick={() => switchMainTab("dokumen")}
            className={`flex flex-col md:flex-row items-center justify-center md:justify-start w-full h-full md:h-auto space-y-1 md:space-y-0 md:space-x-3 transition-colors rounded-lg md:rounded-xl mx-1 md:mx-0 md:px-4 md:py-3 ${
              activeTab === "dokumen" ? "text-blue-600 md:bg-blue-50" : "text-gray-500 hover:text-blue-500 hover:bg-gray-50 md:hover:bg-gray-100"
            }`}
          >
            <svg className="w-6 h-6 md:w-5 md:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[10px] sm:text-xs md:text-sm font-medium">Dokumen</span>
          </button>
        </div>
      </div>
    </div>
  );
}