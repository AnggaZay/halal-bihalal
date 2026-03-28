import React from 'react';

const DashboardUtama = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Dashboard Utama Audit & SDM</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl shadow-sm">
          <p className="text-blue-600 text-sm font-bold uppercase tracking-wider">Total SDM Panitia</p>
          <h3 className="text-4xl font-bold text-blue-900 mt-2">142 <span className="text-sm font-normal text-blue-500">Orang</span></h3>
        </div>
        <div className="bg-red-50 border border-red-100 p-6 rounded-xl shadow-sm">
          <p className="text-red-600 text-sm font-bold uppercase tracking-wider">Laporan Belum Audit</p>
          <h3 className="text-4xl font-bold text-red-900 mt-2">5 <span className="text-sm font-normal text-red-500">Dokumen</span></h3>
        </div>
        <div className="bg-green-50 border border-green-100 p-6 rounded-xl shadow-sm">
          <p className="text-green-600 text-sm font-bold uppercase tracking-wider">Status Anggaran</p>
          <h3 className="text-4xl font-bold text-green-900 mt-2">Aman</h3>
        </div>
      </div>
    </div>
  );
};

export default DashboardUtama;