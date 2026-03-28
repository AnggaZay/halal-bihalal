import React from 'react';

const SumberDaya = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Daftar Pengisi Acara & MC</h2>
      <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <span className="font-semibold">Ustadz Hanan (Penceramah)</span>
          <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">Terkonfirmasi</span>
        </div>
      </div>
    </div>
  );
};

export default SumberDaya;