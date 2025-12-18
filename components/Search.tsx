
import React, { useState } from 'react';
import { Vehicle, View } from '../types';

interface SearchProps {
  onSearch: (plate: string) => Vehicle | undefined;
  setView: (view: View) => void;
  onEdit: (v: Vehicle) => void;
}

const Search: React.FC<SearchProps> = ({ onSearch, setView, onEdit }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Vehicle | null | 'notfound'>(null);

  const handleSearch = () => {
    if (!query.trim()) return;
    const found = onSearch(query);
    setResult(found || 'notfound');
  };

  const handleClear = () => {
    setQuery('');
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500 pb-12">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <i className="fa-solid fa-magnifying-glass text-9xl"></i>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Registry Lookup</h2>
          <p className="text-slate-500 mb-8 font-medium">Verify vehicle credentials and history instantly.</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <i className="fa-solid fa-hashtag absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter Plate Number..."
                className="w-full pl-12 pr-4 py-5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-mono font-black text-xl tracking-widest uppercase"
              />
              {query && (
                <button 
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-2xl font-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center space-x-3 group"
            >
              <i className="fa-solid fa-search group-hover:scale-110 transition-transform"></i>
              <span>Lookup</span>
            </button>
          </div>
        </div>
      </div>

      {result === 'notfound' && (
        <div className="bg-orange-50 border-2 border-orange-100 p-12 rounded-3xl text-center shadow-lg shadow-orange-100/20">
          <div className="bg-orange-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-600">
            <i className="fa-solid fa-ghost text-4xl"></i>
          </div>
          <h3 className="text-2xl font-black text-orange-800 tracking-tight">Zero Matches Found</h3>
          <p className="text-orange-700/70 mt-3 max-w-sm mx-auto font-medium">
            Plate <span className="font-mono font-black text-orange-900 underline">{query}</span> does not exist in our secure registry.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
             <button 
              onClick={() => setView('add')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-200"
            >
              Create New Record
            </button>
          </div>
        </div>
      )}

      {result && result !== 'notfound' && (
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-500 overflow-hidden relative animate-in zoom-in duration-300">
          {/* Action Header */}
          <div className="absolute top-6 right-6 flex space-x-3 z-20">
            <button 
              onClick={() => onEdit(result)}
              className="bg-white/90 backdrop-blur shadow-lg text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
              title="Edit Record"
            >
              <i className="fa-solid fa-pen"></i>
            </button>
            <button className="bg-white/90 backdrop-blur shadow-lg text-slate-400 w-12 h-12 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all">
              <i className="fa-solid fa-print"></i>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Image Section */}
            <div className="w-full lg:w-2/5 relative bg-slate-900 aspect-video lg:aspect-auto min-h-[300px]">
              {result.image ? (
                <img src={result.image} alt={result.model} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-700">
                   <i className={`fa-solid ${getIconForType(result.type)} text-8xl opacity-10 mb-4`}></i>
                   <p className="text-xs uppercase font-black tracking-widest opacity-40">No Photo Available</p>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-slate-950 to-transparent">
                 <span className="text-[10px] font-black text-white bg-blue-600 px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">Secure Verified Asset</span>
                 <h3 className="text-5xl font-black text-white tracking-tighter font-mono">{result.plate}</h3>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-8 lg:p-12">
              <div className="mb-8">
                <p className="text-slate-400 font-medium flex items-center text-sm">
                  <i className="fa-solid fa-clock mr-2 text-blue-400"></i>
                  Last Activity Logged: {new Date(result.lastUpdated || '').toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <DetailBox label="Manufacturer & Model" value={result.model} icon="fa-car" />
                <DetailBox label="VIN Identification" value={result.vin} icon="fa-fingerprint" />
                <DetailBox label="Registered Owner" value={result.owner} icon="fa-user-check" />
                <DetailBox label="Body Type" value={result.type} icon="fa-truck-pickup" />
                <DetailBox label="Year of Make" value={result.year} icon="fa-calendar-day" />
                <DetailBox label="Visual Palette" value={result.color} icon="fa-paint-brush" />
              </div>

              <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                  <i className="fa-solid fa-scroll mr-2"></i>
                  Asset Narrative & History
                </h4>
                <p className="text-slate-700 font-medium leading-relaxed italic text-sm">
                  "{result.history || 'No significant history recorded for this asset.'}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
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

const DetailBox: React.FC<{ label: string; value: string; icon: string }> = ({ label, value, icon }) => (
  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 group hover:border-blue-200 hover:bg-blue-50/30 transition-all">
    <div className="flex items-center text-slate-400 mb-1 group-hover:text-blue-500 transition-colors">
      <i className={`fa-solid ${icon} text-[10px] mr-2`}></i>
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-slate-800 font-black text-base truncate" title={value}>{value}</p>
  </div>
);

export default Search;
