
import React, { useState, useEffect, useCallback } from 'react';
import { User, Vehicle, View } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Search from './components/Search';
import AddVehicle from './components/AddVehicle';
import LiveAssistant from './components/LiveAssistant';

const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: '1',
    plate: 'KAB123X',
    vin: 'VIN00123998',
    type: 'Car',
    model: 'Toyota Corolla',
    year: '2020',
    color: 'White',
    owner: 'John Doe',
    history: 'Minor scratch repaired in 2022. Regular service maintained.',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: '2',
    plate: 'ZDA990W',
    vin: 'VLV99822100',
    type: 'Truck',
    model: 'Volvo FH16',
    year: '2021',
    color: 'Deep Blue',
    owner: 'Global Logistics Ltd',
    history: 'Heavy duty usage. Engine overhaul performed at 150k miles.',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: '3',
    plate: 'MTR442S',
    vin: 'YAM77211054',
    type: 'Motorcycle',
    model: 'Yamaha MT-07',
    year: '2022',
    color: 'Tech Black',
    owner: 'Sarah Miller',
    history: 'Mint condition. Custom exhaust fitted.',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: '4',
    plate: 'BUS555K',
    vin: 'MBZ11223344',
    type: 'Bus',
    model: 'Mercedes-Benz Tourismo',
    year: '2019',
    color: 'Silver',
    owner: 'City Transit Authority',
    history: 'Used for long-distance regional travel. Brake pads replaced last month.',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: '5',
    plate: 'ELV101E',
    vin: 'TSL55433211',
    type: 'Car',
    model: 'Tesla Model 3',
    year: '2023',
    color: 'Pearl White',
    owner: 'Kevin Zhang',
    history: 'New registration. Full self-driving package enabled.',
    lastUpdated: new Date().toISOString()
  },
  {
    id: '6',
    plate: 'HGV778L',
    vin: 'SCN88776655',
    type: 'Truck',
    model: 'Scania R500',
    year: '2018',
    color: 'Red',
    owner: 'Road Haulers Co.',
    history: 'Transmission issues reported in 2023, now resolved.',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  },
  {
    id: '7',
    plate: 'SPD202B',
    vin: 'DCT44556677',
    type: 'Motorcycle',
    model: 'Ducati Panigale V4',
    year: '2023',
    color: 'Rosso Corsa',
    owner: 'Marco Rossi',
    history: 'Track use only. High performance maintenance schedule.',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: '8',
    plate: 'CTY889G',
    vin: 'VLV22334455',
    type: 'Bus',
    model: 'Volvo B8RLE',
    year: '2020',
    color: 'Green/White',
    owner: 'EcoBus Services',
    history: 'Electric-hybrid conversion candidate.',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  },
  {
    id: '9',
    plate: 'OLD554J',
    vin: 'FRD19670012',
    type: 'Car',
    model: 'Ford Mustang',
    year: '1967',
    color: 'Highland Green',
    owner: 'Classic Car Club',
    history: 'Full restoration completed in 2015. Museum quality.',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
  }
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('autotrack_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('autotrack_data');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [currentView, setCurrentView] = useState<View>(user ? 'dashboard' : 'login');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    localStorage.setItem('autotrack_data', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('autotrack_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('autotrack_user');
    }
  }, [user]);

  const handleLogin = (username: string) => {
    const newUser = { username, isLoggedIn: true };
    setUser(newUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  const handleAddVehicle = (v: Omit<Vehicle, 'id' | 'lastUpdated'>) => {
    const newVehicle: Vehicle = { 
      ...v, 
      id: Math.random().toString(36).substr(2, 9),
      lastUpdated: new Date().toISOString()
    };
    setVehicles(prev => [...prev, newVehicle]);
    setCurrentView('dashboard');
  };

  const handleUpdateVehicle = (v: Vehicle) => {
    const updated = { ...v, lastUpdated: new Date().toISOString() };
    setVehicles(prev => prev.map(item => item.id === v.id ? updated : item));
    setEditingVehicle(null);
    setCurrentView('dashboard');
  };

  const handleDeleteVehicle = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle record?')) {
      setVehicles(prev => prev.filter(v => v.id !== id));
    }
  };

  const startEditing = (v: Vehicle) => {
    setEditingVehicle(v);
    setCurrentView('edit');
  };

  const searchVehicle = useCallback((plate: string) => {
    return vehicles.find(v => v.plate.toUpperCase().trim() === plate.toUpperCase().trim());
  }, [vehicles]);

  const renderContent = () => {
    if (!user) return <Login onLogin={handleLogin} />;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
          vehicles={vehicles} 
          setView={setCurrentView} 
          onDelete={handleDeleteVehicle}
          onEdit={startEditing}
        />;
      case 'search':
        return <Search onSearch={searchVehicle} setView={setCurrentView} onEdit={startEditing} />;
      case 'add':
        return <AddVehicle onAdd={handleAddVehicle} setView={setCurrentView} />;
      case 'edit':
        return editingVehicle ? (
          <AddVehicle 
            onAdd={(v) => handleUpdateVehicle({ ...v, id: editingVehicle.id })} 
            setView={setCurrentView} 
            initialData={editingVehicle}
            isEdit
          />
        ) : <Dashboard vehicles={vehicles} setView={setCurrentView} onDelete={handleDeleteVehicle} onEdit={startEditing} />;
      default:
        return <Dashboard vehicles={vehicles} setView={setCurrentView} onDelete={handleDeleteVehicle} onEdit={startEditing} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-slate-900 text-white p-4 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => user && setCurrentView('dashboard')}
          >
            <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-500 transition-colors">
              <i className="fa-solid fa-car-rear text-xl"></i>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none tracking-tight">AutoTrack</h1>
              <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">Enterprise V2</p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex space-x-4 text-sm font-medium">
                <button onClick={() => setCurrentView('dashboard')} className={`hover:text-blue-400 transition-colors ${currentView === 'dashboard' ? 'text-blue-400' : 'text-slate-300'}`}>Dashboard</button>
                <button onClick={() => setCurrentView('search')} className={`hover:text-blue-400 transition-colors ${currentView === 'search' ? 'text-blue-400' : 'text-slate-300'}`}>Lookup</button>
                <button onClick={() => setCurrentView('add')} className={`hover:text-blue-400 transition-colors ${currentView === 'add' ? 'text-blue-400' : 'text-slate-300'}`}>Register</button>
              </div>
              <div className="h-6 w-px bg-slate-700 hidden md:block"></div>
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold">{user.username}</p>
                  <p className="text-[10px] text-slate-400">System Administrator</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-slate-800 hover:bg-red-900/40 hover:text-red-200 p-2 rounded-full transition-all border border-slate-700"
                  title="Logout"
                >
                  <i className="fa-solid fa-power-off"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:row justify-between items-center text-slate-400 text-xs">
          <p>© 2024 AutoTrack Systems. All rights reserved.</p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <span>Database Status: <span className="text-green-500 font-bold">Online</span></span>
            <span>API Latency: 24ms</span>
          </div>
        </div>
      </footer>

      {user && (
        <LiveAssistant 
          onSearch={searchVehicle} 
          onAdd={handleAddVehicle}
        />
      )}
    </div>
  );
};

export default App;
