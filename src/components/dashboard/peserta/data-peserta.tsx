"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
}

export default function DataPeserta() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // State untuk modal edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Invitation>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInvitations = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Gagal mengambil data peserta:", error);
      } else {
        setInvitations(data || []);
      }
      setIsLoading(false);
    };

    // Panggil data pertama kali
    fetchInvitations();

    // Berlangganan (Subscribe) ke perubahan data di Supabase secara Realtime
    const channel = supabase
      .channel("realtime-invitations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "invitations" },
        (payload) => {
          // Stream data: Langsung suntikkan perubahan ke state tabel tanpa loading / fetch ulang
          setInvitations((prev) => {
            if (payload.eventType === 'INSERT') {
              return [payload.new as Invitation, ...prev]; // Tambah ke baris paling atas
            }
            if (payload.eventType === 'UPDATE') {
              return prev.map((inv) => (inv.id === payload.new.id ? (payload.new as Invitation) : inv)); // Ganti baris yang diedit
            }
            if (payload.eventType === 'DELETE') {
              return prev.filter((inv) => inv.id !== payload.old.id); // Hapus baris
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

  // Filter data berdasarkan input pencarian
  const filteredData = invitations.filter(
    (inv) =>
      inv.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fungsi bantuan untuk menentukan asisten berdasarkan periode
  const getAsistenByPeriode = (periodeStr: string | undefined) => {
    if (!periodeStr) return { nama: "M. Fikri Al-Khasani" };
    const tuaPeriods = ["1999/2001", "2001/2003", "2003/2005", "2005/2007"];
    const agakTuaPeriods = ["2007/2009", "2009/2011", "2011/2013", "2013/2015"];
    
    if (tuaPeriods.includes(periodeStr)) {
      return { nama: "M. Amri Albani" };
    } else if (agakTuaPeriods.includes(periodeStr)) {
      return { nama: "M. Taufiqurrahman" };
    } else {
      return { nama: "M. Fikri Al-Khasani" };
    }
  };

  // Handler untuk Hapus Data
  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus data peserta ini?")) return;
    
    // Optimistic UI: Langsung hapus dari layar detik itu juga
    setInvitations((prev) => prev.filter((inv) => inv.id !== id));

    const { error } = await supabase.from("invitations").delete().eq("id", id);
    if (error) {
      alert("Gagal menghapus data: " + error.message);
    }
  };

  // Handler untuk Buka Edit Modal
  const handleEditClick = (inv: Invitation) => {
    setEditingId(inv.id);
    setEditForm(inv);
  };

  // Handler untuk Simpan Perubahan
  const handleSaveEdit = async () => {
    if (!editingId) return;
    setIsSubmitting(true);
    
    // Optimistic UI: Langsung ubah di layar detik itu juga
    setInvitations((prev) =>
      prev.map((inv) => (inv.id === editingId ? { ...inv, ...editForm } as Invitation : inv))
    );

    const { error } = await supabase.from("invitations").update(editForm).eq("id", editingId);
    
    setIsSubmitting(false);
    if (error) {
      alert("Gagal menyimpan perubahan: " + error.message);
    } else {
      setEditingId(null);
    }
  };

  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 p-6 bg-[#FFFFFF] rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#101111]">Master Data RSVP</h3>
          <p className="text-sm text-[#6B7280] mt-1">Daftar seluruh tamu yang telah mengonfirmasi kehadiran.</p>
        </div>
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Cari nama atau email..."
            className="w-full sm:w-64 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#A6824A]/50 focus:border-[#A6824A] transition-all text-[#101111]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Area Desktop: Tabel Compact (Fit 1 Layar) */}
      <div className="hidden lg:block flex-1 overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#F3F4F6] text-[#101111] sticky top-0 z-10">
            <tr>
              <th className="py-2 px-3 font-bold uppercase tracking-wider border-b border-gray-200">No</th>
              <th className="py-2 px-3 font-bold uppercase tracking-wider border-b border-gray-200">Peserta</th>
              <th className="py-2 px-3 font-bold uppercase tracking-wider border-b border-gray-200 text-center">Kursi</th>
              <th className="py-2 px-3 font-bold uppercase tracking-wider border-b border-gray-200">Konsumsi</th>
              <th className="py-2 px-3 font-bold uppercase tracking-wider border-b border-gray-200">Logistik</th>
              <th className="py-2 px-3 font-bold uppercase tracking-wider border-b border-gray-200">Asisten</th>
              <th className="py-2 px-3 font-bold uppercase tracking-wider border-b border-gray-200 text-center">Status</th>
              <th className="py-2 px-3 font-bold uppercase tracking-wider border-b border-gray-200 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm text-[#101111]">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#6B7280] animate-pulse font-medium">Memuat data peserta...</td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#6B7280]">Tidak ada data peserta ditemukan.</td>
              </tr>
            ) : (
              filteredData.map((inv, index) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors even:bg-gray-50/50">
                  <td className="py-2 px-3 text-[#6B7280] align-top font-medium">{index + 1}</td>
                  <td className="py-2 px-3 align-top">
                    <div className="flex flex-col gap-0.5">
                      {(inv.full_name || '-').split(', ').map((name, idx) => (
                        <span key={idx} className="font-bold text-[#101111]">{name}</span>
                      ))}
                      <span className="text-[10px] text-[#6B7280] truncate max-w-[150px]" title={inv.email}>{inv.email}</span>
                      <span className="inline-block w-max mt-0.5 text-[9px] font-medium bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded">{inv.periode || '-'}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center align-top">
                    <div className="flex flex-col items-center gap-1">
                      {(inv.seat_number || 'Belum Pilih').split(', ').map((seat, idx) => (
                        <span key={idx} className="font-mono text-[10px] font-bold text-[#5D1E21] bg-[#5D1E21]/5 border border-[#5D1E21]/20 rounded px-1.5 py-0.5">
                          {seat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 px-3 align-top">
                    <div className="flex flex-col gap-1 max-w-[140px] text-[10px]">
                      {(inv.food_menu || '-').split(', ').map((food, idx) => (
                        <span key={`f-${idx}`} className="truncate text-gray-700" title={food}>🍽️ {food}</span>
                      ))}
                      {(inv.drink_menu || '-').split(', ').map((drink, idx) => (
                        <span key={`d-${idx}`} className="truncate text-gray-700" title={drink}>🥤 {drink}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 px-3 align-top">
                    <div className="flex flex-col gap-1 max-w-[130px] text-[10px]">
                      {(inv.vehicle || '-').split(', ').map((v, idx) => (
                        <span key={idx} className="truncate text-gray-700" title={v}>🚗 {v.replace('(Parkir: ', '- ').replace(')', '')}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 px-3 font-medium text-gray-600 align-top text-[10px]">
                    {getAsistenByPeriode(inv.periode).nama}
                  </td>
                  <td className="py-2 px-3 text-center align-top">
                    {inv.is_present ? (
                      <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 border border-green-200 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm">
                        ✅ Hadir
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 bg-[#A6824A]/10 text-[#A6824A] border border-[#A6824A]/30 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm">
                        ⏳ Pending
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center align-top whitespace-nowrap">
                    <button onClick={() => handleEditClick(inv)} className="text-[#A6824A] hover:bg-[#A6824A]/10 p-1.5 rounded transition-colors mr-1" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(inv.id)} className="text-[#5D1E21] hover:bg-[#5D1E21]/10 p-1.5 rounded transition-colors" title="Hapus">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Area Mobile: Card View (Hanya muncul di layar HP/Tablet) */}
      <div className="block lg:hidden flex-1 space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-[#6B7280] animate-pulse font-medium bg-gray-50 rounded-xl border border-gray-200">Memuat data peserta...</div>
        ) : filteredData.length === 0 ? (
          <div className="p-8 text-center text-[#6B7280] bg-gray-50 rounded-xl border border-gray-200">Tidak ada data peserta ditemukan.</div>
        ) : (
          filteredData.map((inv, index) => (
            <div key={inv.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-4 relative">
              {/* Header Card */}
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                    <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded font-medium">{inv.periode || '-'}</span>
                  </div>
                  <div className="font-bold text-[#101111] text-sm flex flex-col gap-0.5">
                    {(inv.full_name || '-').split(', ').map((name, idx) => (
                      <span key={idx}>{name}</span>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#6B7280] mt-1 break-all">{inv.email}</p>
                </div>
                <div className="text-right shrink-0">
                  {inv.is_present ? (
                    <span className="inline-block px-2.5 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      ✅ Hadir
                    </span>
                  ) : (
                    <span className="inline-block px-2.5 py-1 bg-[#A6824A]/10 text-[#A6824A] border border-[#A6824A]/30 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      ⏳ Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-2 gap-3 text-[11px] bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div>
                  <span className="block text-gray-500 mb-1">Kursi</span>
                  <div className="flex flex-wrap gap-1">
                    {(inv.seat_number || 'Belum Pilih').split(', ').map((seat, idx) => (
                      <span key={idx} className="font-mono font-bold text-[#5D1E21] bg-white border border-gray-200 rounded px-1.5 py-0.5">
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">Asisten</span>
                  <span className="font-medium text-gray-700">{getAsistenByPeriode(inv.periode).nama}</span>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">Makanan</span>
                  <div className="flex flex-col gap-0.5 text-gray-700 font-medium">
                    {(inv.food_menu || '-').split(', ').map((food, idx) => <span key={idx}>• {food}</span>)}
                  </div>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">Minuman</span>
                  <div className="flex flex-col gap-0.5 text-gray-700 font-medium">
                    {(inv.drink_menu || '-').split(', ').map((drink, idx) => <span key={idx}>• {drink}</span>)}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="block text-gray-500 mb-1">Kendaraan & Parkir</span>
                  <div className="flex flex-col gap-0.5 text-gray-700 font-medium">
                    {(inv.vehicle || '-').split(', ').map((v, idx) => <span key={idx}>• {v}</span>)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-1">
                <button onClick={() => handleEditClick(inv)} className="text-[#A6824A] hover:text-[#8a6a3b] font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 py-1 px-2 rounded hover:bg-[#A6824A]/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit
                </button>
                <button onClick={() => handleDelete(inv.id)} className="text-[#5D1E21] hover:text-[#411517] font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 py-1 px-2 rounded hover:bg-[#5D1E21]/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Edit Overlay */}
      {editingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-[#101111]">Edit Data Peserta</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input type="text" value={editForm.full_name || ''} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A6824A]/50 focus:border-[#A6824A] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A6824A]/50 focus:border-[#A6824A] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
                  <input type="text" value={editForm.periode || ''} onChange={(e) => setEditForm({...editForm, periode: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A6824A]/50 focus:border-[#A6824A] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kursi</label>
                  <input type="text" value={editForm.seat_number || ''} onChange={(e) => setEditForm({...editForm, seat_number: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A6824A]/50 focus:border-[#A6824A] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Makanan</label>
                  <input type="text" value={editForm.food_menu || ''} onChange={(e) => setEditForm({...editForm, food_menu: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A6824A]/50 focus:border-[#A6824A] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minuman</label>
                  <input type="text" value={editForm.drink_menu || ''} onChange={(e) => setEditForm({...editForm, drink_menu: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A6824A]/50 focus:border-[#A6824A] outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kendaraan</label>
                <input type="text" value={editForm.vehicle || ''} onChange={(e) => setEditForm({...editForm, vehicle: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A6824A]/50 focus:border-[#A6824A] outline-none" />
              </div>
              <div className="flex items-center pt-2">
                <input type="checkbox" id="isPresent" checked={editForm.is_present || false} onChange={(e) => setEditForm({...editForm, is_present: e.target.checked})} className="mr-2 h-4 w-4 text-[#A6824A] rounded border-gray-300 focus:ring-[#A6824A]" />
                <label htmlFor="isPresent" className="text-sm font-medium text-gray-700 cursor-pointer">Tamu Sudah Hadir (Check-In)</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setEditingId(null)} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                Batal
              </button>
              <button onClick={handleSaveEdit} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-[#A6824A] hover:bg-[#8a6a3b] rounded-lg disabled:opacity-50 transition-colors flex items-center">
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}