"use client";

import { useState } from "react";

// Import Main Overview
import MainOverview from "@/components/dashboard/main-overview";

// Import Komponen Peserta
import OverviewPeserta from "@/components/dashboard/peserta/overview-peserta";
import DataPeserta from "@/components/dashboard/peserta/data-peserta";
import Fasilitas from "@/components/dashboard/peserta/fasilitas";
import Kehadiran from "@/components/dashboard/peserta/kehadiran";

// Import Komponen Sumber Daya
import OverviewSumberDaya from "@/components/dashboard/sumber-daya/overview-sumber-daya";
import Keuangan from "@/components/dashboard/sumber-daya/keuangan";
import Konsumsi from "@/components/dashboard/sumber-daya/konsumsi";
import Perlengkapan from "@/components/dashboard/sumber-daya/perlengkapan";

// Import Komponen Dokumen
import Lpj from "@/components/dashboard/dokumen/lpj";
import SewaTempat from "@/components/dashboard/dokumen/sewa-tempat";
import Sponsorship from "@/components/dashboard/dokumen/sponsorship";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "peserta" | "sumber-daya" | "dokumen">("overview");
  // State khusus untuk sub-menu Peserta
  const [activePesertaTab, setActivePesertaTab] = useState<"overview" | "data" | "kehadiran" | "fasilitas">("overview");

  return (
    // Tambahkan padding bottom (pb-24) agar konten paling bawah tidak tertutup oleh bottom navigation
    <div className="relative min-h-full pb-24">
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#A6824A]/10 p-2.5 rounded-xl text-[#A6824A] shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">Kelola semua kebutuhan acara Anda.</p>
          </div>
        </div>

        {/* Konten Dashboard Berdasarkan Tab Aktif */}
        <div className="mt-6">
          {activeTab === "overview" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <MainOverview />
            </div>
          )}

          {activeTab === "peserta" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Sub-menu Navigasi Peserta (Bentuk Pills) */}
              <div className="bg-gray-100/80 p-1 rounded-lg border border-gray-200/50 flex flex-row gap-1">
                <button
                  onClick={() => setActivePesertaTab("overview")}
                  className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 px-1 md:px-4 rounded-md transition-all ${
                    activePesertaTab === "overview" ? "bg-white text-[#A6824A] shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-[10px] md:text-sm font-medium">Rekap</span>
                </button>
                <button
                  onClick={() => setActivePesertaTab("data")}
                  className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 px-1 md:px-4 rounded-md transition-all ${
                    activePesertaTab === "data" ? "bg-white text-[#A6824A] shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-[10px] md:text-sm font-medium">Data</span>
                </button>
                <button
                  onClick={() => setActivePesertaTab("kehadiran")}
                  className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 px-1 md:px-4 rounded-md transition-all ${
                    activePesertaTab === "kehadiran" ? "bg-white text-[#A6824A] shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[10px] md:text-sm font-medium">Scan</span>
                </button>
                <button
                  onClick={() => setActivePesertaTab("fasilitas")}
                  className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 px-1 md:px-4 rounded-md transition-all ${
                    activePesertaTab === "fasilitas" ? "bg-white text-[#A6824A] shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  <span className="text-[10px] md:text-sm font-medium">Fasilitas</span>
                </button>
              </div>

              {/* Konten Sub-menu yang Aktif */}
              <div className="mt-4 animate-in fade-in zoom-in-95 duration-200">
                {activePesertaTab === "overview" && <OverviewPeserta />}
                {activePesertaTab === "data" && <DataPeserta />}
                {activePesertaTab === "kehadiran" && <Kehadiran />}
                {activePesertaTab === "fasilitas" && <Fasilitas />}
              </div>
            </div>
          )}

          {activeTab === "sumber-daya" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <OverviewSumberDaya />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Keuangan />
                <Konsumsi />
                <Perlengkapan />
              </div>
            </div>
          )}

          {activeTab === "dokumen" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Sponsorship />
                <SewaTempat />
                <Lpj />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Tab Menu Navigation */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-gray-200 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 max-w-7xl mx-auto px-2">
          {/* Tab: Overview */}
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors rounded-lg mx-1 ${
              activeTab === "overview" ? "text-blue-600" : "text-gray-500 hover:text-blue-500 hover:bg-gray-50"
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] sm:text-xs font-medium">Overview</span>
          </button>

          {/* Tab: Peserta */}
          <button
            onClick={() => setActiveTab("peserta")}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors rounded-lg mx-1 ${
              activeTab === "peserta" ? "text-blue-600" : "text-gray-500 hover:text-blue-500 hover:bg-gray-50"
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-[10px] sm:text-xs font-medium">Peserta</span>
          </button>

          {/* Tab: Sumber Daya */}
          <button
            onClick={() => setActiveTab("sumber-daya")}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors rounded-lg mx-1 ${
              activeTab === "sumber-daya" ? "text-blue-600" : "text-gray-500 hover:text-blue-500 hover:bg-gray-50"
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-[10px] sm:text-xs font-medium">SumbDaya</span>
          </button>

          {/* Tab: Dokumen */}
          <button
            onClick={() => setActiveTab("dokumen")}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors rounded-lg mx-1 ${
              activeTab === "dokumen" ? "text-blue-600" : "text-gray-500 hover:text-blue-500 hover:bg-gray-50"
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[10px] sm:text-xs font-medium">Dokumen</span>
          </button>
        </div>
      </div>
    </div>
  );
}