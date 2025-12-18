
import React, { useState, useEffect } from 'react';
import { Vehicle, View } from '../types';

interface AddVehicleProps {
  onAdd: (v: Omit<Vehicle, 'id' | 'lastUpdated'>) => void;
  setView: (view: View) => void;
  initialData?: Vehicle;
  isEdit?: boolean;
}

const AddVehicle: React.FC<AddVehicleProps> = ({ onAdd, setView, initialData, isEdit }) => {
  const [form, setForm] = useState<Omit<Vehicle, 'id' | 'lastUpdated'>>({
    plate: '',
    vin: '',
    type: 'Car',
    model: '',
    year: '',
    color: '',
    owner: '',
    history: ''
  });

  useEffect(() => {
    if (initialData) {
      const { id, lastUpdated, ...rest } = initialData;
      setForm(rest);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(form);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto animate-in slide-in-from-right duration-500">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              {isEdit ? 'Update Record' : 'System Registration'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isEdit ? `Modifying profile for ${initialData?.plate}` : 'Registering a new asset to the secure database.'}
            </p>
          </div>
          <button 
            onClick={() => setView('dashboard')}
            className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-slate-800 rounded-full flex items-center justify-center transition-all border border-slate-100 hover:border-slate-200"
          >
            <i className="fa-solid fa-times text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormGroup 
              label="Number Plate" 
              icon="fa-id-card"
              name="plate" 
              value={form.plate} 
              onChange={handleChange} 
              placeholder="e.g., KAB123X" 
              required 
              uppercase 
            />
            <FormGroup 
              label="VIN Number" 
              icon="fa-fingerprint"
              name="vin" 
              value={form.vin} 
              onChange={handleChange} 
              placeholder="e.g., VIN-7789-X..." 
              required 
            />
            
            <div className="space-y-2">
              <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <i className="fa-solid fa-tags mr-2"></i>
                Vehicle Type
              </label>
              <select 
                name="type" 
                value={form.type} 
                onChange={handleChange}
                className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-white font-semibold text-slate-800 transition-all appearance-none cursor-pointer"
              >
                <option>Car</option>
                <option>Truck</option>
                <option>Motorcycle</option>
                <option>Bus</option>
              </select>
            </div>

            <FormGroup label="Model / Make" icon="fa-car" name="model" value={form.model} onChange={handleChange} placeholder="e.g., Toyota Corolla" required />
            <FormGroup label="Year" icon="fa-calendar" name="year" value={form.year} onChange={handleChange} placeholder="e.g., 2024" required />
            <FormGroup label="Color" icon="fa-palette" name="color" value={form.color} onChange={handleChange} placeholder="e.g., Silver" required />
            <FormGroup label="Owner" icon="fa-user-tie" name="owner" value={form.owner} onChange={handleChange} placeholder="Full Legal Name" required />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              <i className="fa-solid fa-history mr-2"></i>
              Registry Notes & History
            </label>
            <textarea
              name="history"
              value={form.history}
              onChange={handleChange}
              rows={4}
              placeholder="Document maintenance, repairs, or specific vehicle traits..."
              className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none font-medium text-slate-700 leading-relaxed"
            ></textarea>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => setView('dashboard')}
              className="px-8 py-4 text-slate-400 font-bold hover:text-slate-800 transition-colors"
            >
              Cancel Operation
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-4 rounded-2xl transition-all shadow-xl shadow-blue-100 flex items-center justify-center space-x-3 group"
            >
              <i className={`fa-solid ${isEdit ? 'fa-check' : 'fa-plus'} group-hover:scale-125 transition-transform`}></i>
              <span>{isEdit ? 'Save Changes' : 'Confirm Registration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormGroup: React.FC<{ label: string; icon: string; name: string; value: string; onChange: any; placeholder: string; required?: boolean; uppercase?: boolean }> = ({ label, icon, name, value, onChange, placeholder, required, uppercase }) => (
  <div className="space-y-2">
    <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
      <i className={`fa-solid ${icon} mr-2`}></i>
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={(e) => {
        if (uppercase) e.target.value = e.target.value.toUpperCase();
        onChange(e);
      }}
      placeholder={placeholder}
      required={required}
      className="w-full p-4 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-800 placeholder:text-slate-300"
    />
  </div>
);

export default AddVehicle;
