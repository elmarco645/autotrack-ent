
import React, { useState } from 'react';
import { Vehicle, View, User } from '../types';

interface DashboardProps {
  vehicles: Vehicle[];
  setView: (view: View) => void;
  onDelete: (id: string) => void;
  onEdit: (v: Vehicle) => void;
  onQuickSearch: (query: string) => void;
  isAdmin: boolean;
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ vehicles, setView, onDelete, onEdit, onQuickSearch, isAdmin, user }) => {
  const [vinQuery, setVinQuery] = useState('');

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vehicles, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "autotrack_backup_" + new Date().toLocaleDateString() + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleVinSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (vinQuery.trim()) {
      onQuickSearch(vinQuery.trim());
    }
  };

  const counts = vehicles.reduce((acc, v) => {
    acc[v.type] = (acc[v.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!isAdmin) {
    /* VIEWER RESTRICTED ACCESS VIEW */
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-700 px-4">
        <div className="w-full max-w-2xl text-center space-y-12">
          {/* Security Branding */}
          <div className="space-y-4">
            <div className="bg-slate-900 text-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl rotate-3">
              <i className="fa-solid fa-fingerprint text-3xl"></i>
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Secure Asset Verification</h2>
            <p className="text-slate-500 font-medium max-w-md mx-auto">
              Please enter the unique 17-character VIN to retrieve official registration and history data.
            </p>
          </div>

          {/* Minimalist VIN Search Bar */}
          <form onSubmit={handleVinSearch} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
              <div className="pl-6 text-slate-400">
                <i className="fa-solid fa-hashtag text-xl"></i>
              </div>
              <input
                type="text"
                value={vinQuery}
                onChange={(e) => setVinQuery(e.target.value.toUpperCase())}
                placeholder="Enter VIN Number..."
                className="w-full px-4 py-6 text-xl font-mono font-black tracking-widest text-slate-800 outline-none placeholder:text-slate-200 placeholder:font-sans placeholder:font-bold placeholder:tracking-normal"
                maxLength={17}
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-black text-white px-10 h-[80px] font-black transition-all flex items-center space-x-3"
              >
                <span>Verify</span>
                <i className="fa-solid fa-shield-check"></i>
              </button>
            </div>
          </form>

          {/* Quick Tips */}
          <div className="flex justify-center items-center space-x-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="flex items-center"><i className="fa-solid fa-lock mr-2 text-blue-500"></i> Encrypted Access</div>
            <div className="flex items-center"><i className="fa-solid fa-clock mr-2 text-blue-500"></i> Real-time DB</div>
            <div className="flex items-center"><i className="fa-solid fa-circle-check mr-2 text-blue-500"></i> Official Records</div>
          </div>
        </div>
      </div>
    );
  }

  /* ADMIN FULL DASHBOARD VIEW */
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">System Management</h2>
          <p className="text-slate-500 font-medium">Monitoring {vehicles.length} assets across the enterprise network.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={exportData}
            className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <i className="fa-solid fa-download"></i>
            <span>Export</span>
          </button>
          <button 
            onClick={() => setView('add')}
            className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <i className="fa-solid fa-plus"></i>
            <span>New Record</span>
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
          <h3 className="font-bold text-slate-800">Master Registry</h3>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Sync</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-black border-b border-slate-100">
                <th className="px-6 py-4">Visual</th>
                <th className="px-6 py-4">Plate</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Owner</th>
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
                      <p className="text-xs text-slate-400 font-medium">{v.year} • {v.type}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700">{v.owner}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => onEdit(v)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg"><i className="fa-solid fa-pen"></i></button>
                      <button onClick={() => onDelete(v.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg"><i className="fa-solid fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
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
    <div className={`bg-white p-6 rounded-2xl shadow-sm border ${colors[color]} flex items-center justify-between transition-transform hover:scale-[1.02]`}>
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
