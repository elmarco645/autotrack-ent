
import React from 'react';
import { Vehicle, View } from '../types';

interface DashboardProps {
  vehicles: Vehicle[];
  setView: (view: View) => void;
  onDelete: (id: string) => void;
  onEdit: (v: Vehicle) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ vehicles, setView, onDelete, onEdit }) => {
  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vehicles, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "autotrack_backup_" + new Date().toLocaleDateString() + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const counts = vehicles.reduce((acc, v) => {
    acc[v.type] = (acc[v.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">System Overview</h2>
          <p className="text-slate-500 font-medium">Monitoring {vehicles.length} registered assets across the network.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={exportData}
            className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <i className="fa-solid fa-download"></i>
            <span>Export Data</span>
          </button>
          <button 
            onClick={() => setView('add')}
            className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <i className="fa-solid fa-plus"></i>
            <span>New Vehicle</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="fa-car" color="blue" label="Cars" value={counts['Car'] || 0} />
        <StatCard icon="fa-truck" color="orange" label="Trucks" value={counts['Truck'] || 0} />
        <StatCard icon="fa-motorcycle" color="purple" label="Bikes" value={counts['Motorcycle'] || 0} />
        <StatCard icon="fa-bus" color="green" label="Buses" value={counts['Bus'] || 0} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Vehicle Registry</h3>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time DB</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-100">
                <th className="px-6 py-4">Visual</th>
                <th className="px-6 py-4">Plate</th>
                <th className="px-6 py-4">Vehicle Details</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                      {v.image ? (
                        <img src={v.image} alt={v.plate} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                           <i className={`fa-solid ${getIconForType(v.type)} text-lg`}></i>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-black text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-700 transition-colors">
                      {v.plate}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{v.model}</p>
                      <p className="text-xs text-slate-400 font-medium">{v.year} • {v.type} • {v.color}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-700">{v.owner}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded uppercase tracking-tighter">Verified</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => onEdit(v)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit Record"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button 
                        onClick={() => onDelete(v.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Record"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-slate-300">
                        <i className="fa-solid fa-database text-2xl"></i>
                      </div>
                      <p className="text-slate-400 font-medium">No records found in the current database.</p>
                      <button onClick={() => setView('add')} className="mt-4 text-blue-600 text-sm font-bold hover:underline">Add first vehicle</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const getIconForType = (type: string) => {
  switch(type) {
    case 'Car': return 'fa-car';
    case 'Truck': return 'fa-truck';
    case 'Motorcycle': return 'fa-motorcycle';
    case 'Bus': return 'fa-bus';
    default: return 'fa-car-side';
  }
};

const StatCard: React.FC<{ icon: string; color: string; label: string; value: number }> = ({ icon, color, label, value }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    green: 'bg-green-50 text-green-600 border-green-100',
  };

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border ${colors[color]} flex items-center justify-between`}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-800">{value}</p>
      </div>
      <div className={`p-4 rounded-xl ${colors[color].split(' ')[0]} bg-opacity-50`}>
        <i className={`fa-solid ${icon} text-2xl`}></i>
      </div>
    </div>
  );
};

export default Dashboard;
