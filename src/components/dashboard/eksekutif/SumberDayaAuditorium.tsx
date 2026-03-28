import React from 'react';

const SumberDayaAuditorium = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Laporan Kapasitas SDM & Venue</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-lg mb-4">Laporan Visual Auditorium</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
           <div className="bg-gray-50 p-4 rounded border">
              <p className="text-gray-500 text-sm">Meja VIP Terisi</p>
              <p className="text-2xl font-bold">10 / 12</p>
           </div>
           <div className="bg-gray-50 p-4 rounded border">
              <p className="text-gray-500 text-sm">Panitia Standby H-Hari</p>
              <p className="text-2xl font-bold">142 Orang</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SumberDayaAuditorium;