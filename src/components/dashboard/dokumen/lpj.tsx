"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Lpj() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateLPJ = async () => {
    setIsGenerating(true);
    
    try {
      // 1. TARIK SEMUA DATA DARI DATABASE SEKALI JALAN
      const [invRes, pemRes, pengRes, perlRes, partRes] = await Promise.all([
        supabase.from('invitations').select('full_name, periode, is_present').order('created_at', { ascending: true }),
        supabase.from('pemasukan').select('sumber, nominal'),
        supabase.from('pengeluaran').select('nama, jumlah, nominal'),
        supabase.from('perlengkapan').select('nama, jenis, jumlah, status'),
        supabase.from('partnership').select('nama, keterangan, tahap')
      ]);

      // 2. OLAH DATA KEPESERTAAN
      const peserta = invRes.data || [];
      let totalPeserta = 0;
      let totalHadir = 0;
      const pesertaRows = peserta.map((p, i) => {
        const names = p.full_name ? p.full_name.split(', ') : ['Tanpa Nama'];
        totalPeserta += names.length;
        if (p.is_present) totalHadir += names.length;
        return `<tr><td align="center">${i + 1}</td><td>${p.full_name || '-'}</td><td align="center">${p.periode || '-'}</td><td align="center">${p.is_present ? 'Hadir' : 'Absen'}</td></tr>`;
      }).join('');
      const persenHadir = totalPeserta > 0 ? Math.round((totalHadir / totalPeserta) * 100) : 0;

      // 3. OLAH DATA KEUANGAN
      const pemasukan = pemRes.data || [];
      const pengeluaran = pengRes.data || [];
      const totalPem = pemasukan.reduce((acc, curr) => acc + (curr.nominal || 0), 0);
      const totalPeng = pengeluaran.reduce((acc, curr) => acc + (curr.nominal || 0), 0);
      const saldo = totalPem - totalPeng;
      
      const pemRows = pemasukan.length ? pemasukan.map((p, i) => `<tr><td align="center">${i + 1}</td><td>${p.sumber}</td><td>Rp ${p.nominal.toLocaleString('id-ID')}</td></tr>`).join('') : '<tr><td colspan="3" align="center">Belum ada pemasukan</td></tr>';
      const pengRows = pengeluaran.length ? pengeluaran.map((p, i) => `<tr><td align="center">${i + 1}</td><td>${p.nama}</td><td align="center">${p.jumlah}</td><td>Rp ${p.nominal.toLocaleString('id-ID')}</td></tr>`).join('') : '<tr><td colspan="4" align="center">Belum ada pengeluaran</td></tr>';

      // 4. OLAH DATA SUMBER DAYA & PARTNERSHIP
      const perlengkapan = perlRes.data || [];
      const sudahPerlengkapan = perlengkapan.filter(p => p.status === 'sudah').length;
      const perlRows = perlengkapan.length ? perlengkapan.map((p, i) => `<tr><td align="center">${i + 1}</td><td>${p.nama}</td><td align="center">${p.jenis}</td><td align="center">${p.jumlah}</td><td align="center">${p.status === 'sudah' ? 'Siap' : 'Belum'}</td></tr>`).join('') : '<tr><td colspan="5" align="center">Belum ada pendataan perlengkapan</td></tr>';
      
      const partnership = partRes.data || [];
      const partRows = partnership.length ? partnership.map((p, i) => `<tr><td align="center">${i + 1}</td><td>${p.nama}</td><td>${p.keterangan}</td><td align="center">${p.tahap}</td></tr>`).join('') : '<tr><td colspan="4" align="center">Belum ada data kemitraan</td></tr>';

      // 5. RENDER KE FORMAT TEMPLATE MS WORD (HTML Standard)
      const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>LPJ Halal Bihalal 2026</title>
        <style>
          body { font-family: 'Times New Roman', serif; line-height: 1.5; font-size: 12pt; color: #000; }
          h1, h2, h3 { text-align: center; }
          table { border-collapse: collapse; width: 100%; margin: 10px 0; }
          table, th, td { border: 1px solid black; }
          th, td { padding: 8px; text-align: left; }
          th { background-color: #e5e5e5; font-weight: bold; text-align: center; }
          .ttd-table { border: none !important; width: 100%; margin-top: 50px; }
          .ttd-table td, .ttd-table th { border: none !important; text-align: center; padding-bottom: 80px; background: transparent; }
        </style>
      </head>
      <body>
        <!-- COVER -->
        <div style="text-align: center; margin-top: 100px;">
          <h1 style="font-size: 24pt; text-transform: uppercase;">Laporan Pertanggungjawaban</h1>
          <h2 style="font-size: 20pt; margin-top: 20px;">HALAL BIHALAL KELUARGA ALUMNI 2026</h2>
          <h3 style="font-size: 16pt; font-weight: normal;">Pimpinan Daerah Ikatan Pelajar Muhammadiyah<br/>Kabupaten Pekalongan</h3>
          <br/><br/><br/><br/><br/><br/>
          <p>Dihasilkan otomatis oleh Sistem EventHub</p>
          <p>${new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short' }).format(new Date())}</p>
        </div>
        
        <br clear="all" style="page-break-before:always" />

        <!-- BAB 1 -->
        <h2>BAB I<br/>PENDAHULUAN</h2>
        <p>Puji syukur kehadirat Allah SWT karena atas rahmat-Nya kegiatan Halal Bihalal PD IPM Kabupaten Pekalongan 2026 telah terselenggara dengan lancar. Laporan ini disusun sebagai bentuk pertanggungjawaban panitia atas seluruh progres dan eksekusi kegiatan, mencakup aspek kepesertaan, pendanaan, serta manajemen logistik acara secara komprehensif.</p>

        <!-- BAB 2 -->
        <h2>BAB II<br/>LAPORAN KEPESERTAAN</h2>
        <p>Berikut adalah rekapitulasi data kehadiran tamu undangan (Master Data):</p>
        <ul>
          <li>Total Estimasi Tamu Terdaftar: <b>${totalPeserta} Orang</b></li>
          <li>Total Tamu Hadir (Check-in): <b>${totalHadir} Orang</b></li>
          <li>Tingkat Kehadiran Keseluruhan: <b>${persenHadir}%</b></li>
        </ul>
        <table>
          <tr><th width="5%">No</th><th>Nama Peserta/Rombongan</th><th width="20%">Periode</th><th width="20%">Status Kehadiran</th></tr>
          ${pesertaRows}
        </table>

        <!-- BAB 3 -->
        <h2>BAB III<br/>LAPORAN KEUANGAN</h2>
        <p>Rekapitulasi sirkulasi dana kegiatan secara keseluruhan:</p>
        <ul>
          <li>Total Pemasukan: <b>Rp ${totalPem.toLocaleString('id-ID')}</b></li>
          <li>Total Pengeluaran: <b>Rp ${totalPeng.toLocaleString('id-ID')}</b></li>
          <li>Saldo Akhir (Sisa Dana): <b>Rp ${saldo.toLocaleString('id-ID')}</b></li>
        </ul>
        
        <h3>3.1. Rincian Pemasukan Dana</h3>
        <table>
          <tr><th width="5%">No</th><th>Sumber Pemasukan</th><th width="30%">Nominal</th></tr>
          ${pemRows}
        </table>

        <h3>3.2. Rincian Belanja & Pengeluaran</h3>
        <table>
          <tr><th width="5%">No</th><th>Item Pengeluaran</th><th width="15%">Jumlah</th><th width="30%">Nominal</th></tr>
          ${pengRows}
        </table>

        <!-- BAB 4 -->
        <h2>BAB IV<br/>LAPORAN SUMBER DAYA & KEMITRAAN</h2>
        
        <h3>4.1. Inventaris & Perlengkapan Acara</h3>
        <p>Dari total <b>${perlengkapan.length}</b> item perlengkapan utama, sebanyak <b>${sudahPerlengkapan}</b> item berhasil direalisasikan/disiapkan.</p>
        <table>
          <tr><th width="5%">No</th><th>Nama Perlengkapan</th><th width="15%">Jenis</th><th width="15%">Volume</th><th width="20%">Status Akhir</th></tr>
          ${perlRows}
        </table>

        <h3>4.2. Kemitraan (Sponsorship)</h3>
        <table>
          <tr><th width="5%">No</th><th>Instansi / Mitra</th><th>Keterangan Dukungan</th><th width="25%">Tahap Akhir</th></tr>
          ${partRows}
        </table>

        <!-- BAB 5 -->
        <h2>BAB V<br/>PENUTUP</h2>
        <p>Demikian Laporan Pertanggungjawaban ini dibuat sebenar-benarnya berdasarkan rekam data dari sistem informasi secara akurat. Semoga rincian ini dapat menjadi referensi transparan dan bahan evaluasi guna meningkatkan kualitas pelaksanaan kegiatan di periode yang akan datang.</p>

        <table class="ttd-table">
          <tr>
            <td width="50%">
              Mengetahui,<br/>
              Ketua Panitia<br/><br/><br/><br/>
              <b>(.............................................)</b>
            </td>
            <td width="50%">
              Pekalongan, ${new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date())}<br/>
              Sekretaris<br/><br/><br/><br/>
              <b>(.............................................)</b>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `;

      // 6. RENDER KE FILE .DOC DAN DOWNLOAD OTOMATIS
      // BOM (\ufeff) ditambahkan agar MS Word bisa baca karakter UTF-8 dengan sempurna
      const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `LPJ_Halal_Bihalal_Otomatis_${new Date().getFullYear()}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("Yeay! LPJ Ajaib berhasil disusun dan didownload secara otomatis! 🎉");
    } catch (error: any) {
      alert("Gagal memproses LPJ otomatis: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-green-900 rounded-3xl shadow-xl shadow-emerald-500/20 transition-all duration-500 group flex flex-col overflow-hidden h-full relative">
      {/* Ornamen Magic Background */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 mix-blend-overlay"></div>
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 mix-blend-overlay"></div>
        
      {/* Body */}
      <div className="p-6 md:p-8 flex-1 flex flex-col justify-center items-center text-center relative z-10">
        
        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center text-yellow-300 mb-6 group-hover:-translate-y-2 transition-transform duration-500 shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>

        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight mb-2">LPJ Otomatis</h3>
        <p className="text-sm text-emerald-50 mb-8 leading-relaxed font-medium px-4">
          Sistem akan menarik data real-time, merekap seluruh keuangan & absensi, lalu menyusunnya menjadi Dokumen LPJ berstandar korporasi MS Word.
        </p>

        {/* Aksi */}
        <button 
          onClick={handleGenerateLPJ} 
          disabled={isGenerating} 
          className="w-full bg-white hover:bg-yellow-50 text-emerald-800 py-4 px-6 rounded-2xl text-sm md:text-base font-black uppercase tracking-widest transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed group/btn"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              Menyusun Dokumen...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              🪄 BUAT LPJ AJAIB
            </>
          )}
        </button>

      </div>
    </div>
  );
}