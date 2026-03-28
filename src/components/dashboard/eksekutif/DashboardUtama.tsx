import React from 'react';

const DashboardUtama = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 border-b pb-4 mb-6">Dashboard Eksekutif (Ringkasan Pimpinan)</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg">
          <p className="text-slate-300 text-sm font-bold uppercase">Total Kehadiran RSVP</p>
          <h3 className="text-4xl font-bold mt-2">120 / 200</h3>
        </div>
        <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg">
          <p className="text-slate-300 text-sm font-bold uppercase">Status Persiapan Keseluruhan</p>
          <h3 className="text-4xl font-bold mt-2 text-green-400">85%</h3>
        </div>
        <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg">
          <p className="text-slate-300 text-sm font-bold uppercase">Isu Kritis (Blockers)</p>
          <h3 className="text-4xl font-bold mt-2 text-yellow-400">0</h3>
        </div>
      </div>
    </div>
  );
};

export default DashboardUtama;