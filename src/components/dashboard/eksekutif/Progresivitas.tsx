import React from 'react';

const Progresivitas = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Laporan Progresivitas Departemen</h2>
      <div className="space-y-6">
        {[
          { dep: 'Garda Boga (Konsumsi)', progress: 90, color: 'bg-orange-500' },
          { dep: 'Garda Kriya (Logistik)', progress: 80, color: 'bg-indigo-500' },
          { dep: 'Garda Agenda (Acara)', progress: 95, color: 'bg-purple-500' },
          { dep: 'Garda Citra Wicara (Humas)', progress: 100, color: 'bg-cyan-500' },
          { dep: 'Garda Rupa (Dekorasi)', progress: 60, color: 'bg-pink-500' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex justify-between mb-2">
              <span className="font-bold text-gray-700">{item.dep}</span>
              <span className="font-bold text-gray-900">{item.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className={`${item.color} h-3 rounded-full`} style={{ width: `${item.progress}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Progresivitas;