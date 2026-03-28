import React from 'react';

const Auditorium = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manajemen Kapasitas Auditorium</h2>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600 font-medium">Kapasitas Terisi</span>
          <span className="font-bold text-emerald-600">75% (150/200 Kursi)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div className="bg-emerald-500 h-4 rounded-full" style={{ width: '75%' }}></div>
        </div>
        <p className="text-sm text-gray-500 mt-4">* Layout mengikuti standar protokoler dan departemen operasional.</p>
      </div>
    </div>
  );
};

export default Auditorium;