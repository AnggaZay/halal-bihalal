import React from 'react';

const AgendaTugas = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Checklist Dekorasi</h2>
      <div className="bg-white p-4 rounded shadow-sm border flex items-center gap-3">
         <input type="checkbox" className="w-5 h-5 text-pink-600 rounded" />
         <span className="font-medium text-gray-800">Pemasangan Photobooth Area Depan</span>
      </div>
    </div>
  );
};

export default AgendaTugas;