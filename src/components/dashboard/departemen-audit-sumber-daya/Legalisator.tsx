import React from 'react';

const Legalisator = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Legalisasi & Persetujuan Dokumen</h2>
      <div className="grid gap-4">
        {[
          { doc: 'Proposal Anggaran Garda Boga', status: 'Menunggu' },
          { doc: 'MoU Vendor Dekorasi Rupa', status: 'Disetujui' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center">
            <div>
              <h4 className="font-bold text-gray-800">{item.doc}</h4>
              <p className="text-sm text-gray-500 mt-1">Diajukan: 2 hari yang lalu</p>
            </div>
            {item.status === 'Menunggu' ? (
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold">Review & ACC</button>
            ) : (
              <span className="text-green-600 font-bold bg-green-50 px-4 py-2 rounded-lg text-sm">✅ Disetujui</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legalisator;