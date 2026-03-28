import React from 'react';

const DashboardUtama = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-cyan-800 mb-6 border-b pb-4">Dashboard Garda Citra Wicara (Humas)</h2>
      <div className="bg-cyan-50 p-6 rounded-xl border border-cyan-100">
        <p className="text-cyan-700 font-bold mb-2">Undangan Disebar</p>
        <h3 className="text-3xl font-bold text-cyan-900">180 / 200</h3>
        <p className="text-sm text-cyan-600 mt-2">120 telah melakukan RSVP (Konfirmasi Hadir).</p>
      </div>
    </div>
  );
};

export default DashboardUtama;