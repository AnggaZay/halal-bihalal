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
    const tuaPeriods = ["2002 - 2004", "2004 - 2006", "2006 - 2008", "2008 - 2010"];
    const agakTuaPeriods = ["2010 - 2012", "2012 - 2014", "2014 - 2016", "2016 - 2018"];
    
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#101111]">Master Data RSVP</h3>
          <p className="text-sm text-[#6B7280] mt-1">Daftar seluruh tamu yang telah mengonfirmasi kehadiran.</p>
        </div>
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Cari nama atau email..."
            className="w-full sm:w-72 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A6824A]/50 focus:border-[#A6824A] transition-all text-[#101111]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Area Tabel (Bisa scroll horizontal) */}
      <div className="flex-1 overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse min-w-[1600px]">
          <thead className="bg-[#F3F4F6] text-[#101111] sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider border-b border-gray-200">No</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider border-b border-gray-200">Nama Lengkap</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider border-b border-gray-200">Periode</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider border-b border-gray-200">Email</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider border-b border-gray-200 text-center">Kursi</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider border-b border-gray-200">Makanan</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider border-b border-gray-200">Minuman</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider border-b border-gray-200">Kendaraan & Parkir</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider border-b border-gray-200">Asisten</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider border-b border-gray-200 text-center">Status Check-In</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider border-b border-gray-200 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm text-[#101111]">
            {isLoading ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-[#6B7280] animate-pulse font-medium">Memuat data peserta...</td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-[#6B7280]">Tidak ada data peserta ditemukan.</td>
              </tr>
            ) : (
              filteredData.map((inv, index) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors even:bg-gray-50/50">
                  <td className="py-3 px-4 font-medium text-[#6B7280]">{index + 1}</td>
                  <td className="py-3 px-4 font-semibold">
                    {(inv.full_name || '-').split(', ').map((name, idx) => (
                      <span key={idx} className="block whitespace-nowrap">{name}</span>
                    ))}
                  </td>
                  <td className="py-3 px-4">{inv.periode || '-'}</td>
                  <td className="py-3 px-4 text-[#6B7280]">{inv.email}</td>
                  <td className="py-3 px-4 text-center">
                    {(inv.seat_number || 'Belum Pilih').split(', ').map((seat, idx) => (
                      <span key={idx} className="block font-mono text-xs font-bold text-[#5D1E21] bg-gray-100 border border-gray-200 rounded px-2 py-0.5 my-0.5">
                        {seat}
                      </span>
                    ))}
                  </td>
                  <td className="py-3 px-4">
                    {(inv.food_menu || '-').split(', ').map((food, idx) => (
                      <span key={idx} className="block whitespace-nowrap">{food}</span>
                    ))}
                  </td>
                  <td className="py-3 px-4">
                    {(inv.drink_menu || '-').split(', ').map((drink, idx) => (
                      <span key={idx} className="block whitespace-nowrap">{drink}</span>
                    ))}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {(inv.vehicle || '-').split(', ').map((v, idx) => (
                      <span key={idx} className="block whitespace-nowrap">{v}</span>
                    ))}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-600 whitespace-nowrap">
                    {getAsistenByPeriode(inv.periode).nama}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {inv.is_present ? (
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                        ✅ Hadir
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-[#A6824A]/10 text-[#A6824A] border border-[#A6824A]/30 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                        ⏳ Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button onClick={() => handleEditClick(inv)} className="text-[#A6824A] hover:text-[#8a6a3b] mr-3 font-medium transition-colors">Edit</button>
                    <button onClick={() => handleDelete(inv.id)} className="text-[#5D1E21] hover:text-[#411517] font-medium transition-colors">Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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