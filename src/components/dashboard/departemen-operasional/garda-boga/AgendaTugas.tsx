import React from 'react';

const AgendaTugas = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Checklist Tugas Boga</h2>
      <ul className="space-y-2">
        <li className="flex items-center gap-3 bg-white p-3 rounded shadow-sm border">
          <input type="checkbox" checked readOnly className="w-5 h-5 text-orange-600 rounded" />
          <span className="line-through text-gray-500">Fiksasi Menu dengan Eksekutif</span>
        </li>
        <li className="flex items-center gap-3 bg-white p-3 rounded shadow-sm border border-orange-300">
          <input type="checkbox" className="w-5 h-5 text-orange-600 rounded" />
          <span className="font-medium text-gray-800">Loading barang catering (H-1)</span>
        </li>
      </ul>
    </div>
  );
};

export default AgendaTugas;