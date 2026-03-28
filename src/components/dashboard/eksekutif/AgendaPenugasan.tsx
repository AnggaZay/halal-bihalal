import React from 'react';

const AgendaPenugasan = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Instruksi & Penugasan Khusus Pimpinan</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <form className="mb-6">
          <textarea placeholder="Tulis instruksi mendadak untuk seluruh Koordinator Garda..." className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-slate-800" rows={3}></textarea>
          <button type="button" className="mt-2 bg-slate-800 text-white px-6 py-2 rounded-lg font-bold">Broadcast Instruksi</button>
        </form>
        <div className="border-t pt-4 space-y-3">
          <p className="font-bold text-gray-700">Riwayat Instruksi:</p>
          <div className="p-3 bg-blue-50 border-l-4 border-blue-600 rounded">
            <p className="text-sm text-gray-800">Tolong pastikan konsumsi VIP sudah tiba sebelum jam 08:30 WIB.</p>
            <p className="text-xs text-gray-500 mt-1">Ditujukan ke: Garda Boga</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaPenugasan;