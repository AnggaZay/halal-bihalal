import React from 'react';

const DashboardUtama = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-orange-800 mb-6 border-b pb-4 border-orange-200">Dashboard Garda Boga (Konsumsi)</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
          <p className="text-orange-700 font-bold mb-2">Porsi Makanan Siap</p>
          <h3 className="text-3xl font-black text-orange-900">450 / 500</h3>
        </div>
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
          <p className="text-yellow-700 font-bold mb-2">Pilihan Terfavorit</p>
          <h3 className="text-xl font-bold text-yellow-900">Rendang Daging (65%)</h3>
        </div>
      </div>
    </div>
  );
};

export default DashboardUtama;