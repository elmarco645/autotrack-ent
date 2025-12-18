
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
    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">
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
        <div className="bg-white p-10 rounded-3xl shadow-2xl border-2 border-blue-500 relative animate-in zoom-in duration-300">
          <div className="absolute top-10 right-10 flex space-x-3">
            <button 
              onClick={() => onEdit(result)}
              className="bg-blue-50 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center hover:bg-blue-100 transition-colors"
              title="Edit Record"
            >
              <i className="fa-solid fa-pen"></i>
            </button>
            <button className="bg-slate-50 text-slate-400 w-12 h-12 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
              <i className="fa-solid fa-print"></i>
            </button>
          </div>

          <div className="mb-10">
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">Secure Verified Asset</span>
            <h3 className="text-6xl font-black text-slate-900 tracking-tighter font-mono">{result.plate}</h3>
            <p className="text-slate-400 mt-2 font-medium flex items-center">
              <i className="fa-solid fa-clock mr-2"></i>
              Last activity: {new Date(result.lastUpdated || '').toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <DetailBox label="Manufacturer & Model" value={result.model} icon="fa-car" />
            <DetailBox label="VIN Identification" value={result.vin} icon="fa-fingerprint" />
            <DetailBox label="Registered Owner" value={result.owner} icon="fa-user-check" />
            <DetailBox label="Body Type" value={result.type} icon="fa-truck-pickup" />
            <DetailBox label="Year of Make" value={result.year} icon="fa-calendar-day" />
            <DetailBox label="Visual Palette" value={result.color} icon="fa-paint-brush" />
          </div>

          <div className="mt-12 p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
              <i className="fa-solid fa-scroll mr-2"></i>
              Asset Narrative & History
            </h4>
            <p className="text-slate-700 font-medium leading-relaxed italic">
              "{result.history || 'No significant history recorded for this asset.'}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailBox: React.FC<{ label: string; value: string; icon: string }> = ({ label, value, icon }) => (
  <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 group hover:border-blue-200 hover:bg-blue-50/30 transition-all">
    <div className="flex items-center text-slate-400 mb-2 group-hover:text-blue-500 transition-colors">
      <i className={`fa-solid ${icon} text-xs mr-2`}></i>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-slate-800 font-black text-lg truncate" title={value}>{value}</p>
  </div>
);

export default Search;
