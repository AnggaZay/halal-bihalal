import React from 'react';

const SumberDaya = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Database Sumber Daya Manusia</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <th className="p-4 font-semibold">Nama Lengkap</th>
              <th className="p-4 font-semibold">Departemen</th>
              <th className="p-4 font-semibold">Jabatan</th>
              <th className="p-4 font-semibold">Status Keaktifan</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((row) => (
              <tr key={row} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">Ahmad Faisal</td>
                <td className="p-4 text-gray-600">Operasional - Garda Boga</td>
                <td className="p-4 text-gray-600">Koordinator</td>
                <td className="p-4"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Aktif</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SumberDaya;