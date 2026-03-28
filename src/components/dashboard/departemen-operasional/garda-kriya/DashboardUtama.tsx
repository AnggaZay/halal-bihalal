import React from 'react';

const DashboardUtama = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-indigo-800 mb-6 border-b pb-4">Dashboard Garda Kriya (Logistik & Perlengkapan)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
          <p className="text-indigo-700 font-bold mb-2">Status Peminjaman Barang</p>
          <h3 className="text-2xl font-bold text-indigo-900">80% Terpenuhi</h3>
        </div>
      </div>
    </div>
  );
};

export default DashboardUtama;