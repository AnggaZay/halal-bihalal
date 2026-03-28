import React from 'react';

const SumberDaya = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Tim & Vendor Garda Boga</h2>
      <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <span className="font-semibold">Vendor Catering Sinar Rasa</span>
          <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">Kontak Utama</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <span className="font-semibold">Tim Distribusi Meja (10 Orang)</span>
          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Standby</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
          <span className="font-semibold">Tim Quality Control (2 Orang)</span>
          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Standby</span>
        </div>
      </div>
    </div>
  );
};

export default SumberDaya;