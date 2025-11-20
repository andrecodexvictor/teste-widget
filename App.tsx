import React, { useState, useEffect, useCallback } from 'react';
import { WidgetSettings, DEFAULT_SETTINGS, Donation, ThemeMode, WidgetPosition } from './types';
import { KawaiiWidget } from './components/KawaiiWidget';
import { SettingsPanel } from './components/SettingsPanel';
import { RefreshCw, Monitor, Heart } from 'lucide-react';

const App: React.FC = () => {
  const [settings, setSettings] = useState<WidgetSettings>(DEFAULT_SETTINGS);
  const [donations, setDonations] = useState<Donation[]>([
    { id: '1', username: 'NekoChan99', amount: 50, message: 'Keep it up!', timestamp: Date.now() },
    { id: '2', username: 'MarioFan', amount: 20, message: 'Here we go!', timestamp: Date.now() - 10000 },
    { id: '3', username: 'CyberPunk', amount: 100, message: 'Neon vibes only.', timestamp: Date.now() - 20000 },
  ]);
  const [isShaking, setIsShaking] = useState(false);
  const [isCelebration, setIsCelebration] = useState(false);

  // Simulate adding a donation
  const simulateDonation = useCallback((amount: number, username: string, message: string) => {
    const newDonation: Donation = {
      id: Date.now().toString(),
      username,
      amount,
      message,
      timestamp: Date.now(),
    };

    setDonations(prev => [newDonation, ...prev].slice(0, 10)); // Keep last 10
    
    setSettings(prev => {
        const newAmount = prev.currentAmount + amount;
        return { ...prev, currentAmount: newAmount };
    });

    // Trigger Animations
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    // Check Celebration
    if (settings.currentAmount + amount >= settings.goalAmount && settings.currentAmount < settings.goalAmount) {
        setIsCelebration(true);
        setTimeout(() => setIsCelebration(false), 8000);
    }
  }, [settings.currentAmount, settings.goalAmount]);

  // Layout for the "App" (Split screen: Settings vs Preview)
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row overflow-hidden font-sans text-gray-800">
      
      {/* Left Side: Control Panel (Simulating StreamElements Editor) */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white shadow-xl z-20 flex flex-col h-screen border-r border-gray-200">
        <div className="p-6 bg-indigo-600 text-white shadow-md">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Monitor size={24} />
                Widget Studio
            </h1>
            <p className="text-xs text-indigo-200 mt-1 opacity-80">Configure your stream overlay</p>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <SettingsPanel 
                settings={settings} 
                setSettings={setSettings} 
                onSimulateDonation={simulateDonation}
            />
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500">
           Built for OBS Browser Source
        </div>
      </div>

      {/* Right Side: Preview Area (Green Screen / Transparency simulation) */}
      <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-200 flex items-center justify-center overflow-hidden p-8">
        
        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-gray-500 border border-gray-300">
            {settings.position} • Scale: {settings.scale}x
        </div>

        {/* The Actual Widget Component */}
        <div 
            className={`transition-all duration-300 ease-in-out`}
            style={{ 
                transform: `scale(${settings.scale})`,
                opacity: settings.opacity,
            }}
        >
            <KawaiiWidget 
                settings={settings} 
                donations={donations} 
                isShaking={isShaking}
                isCelebration={isCelebration}
            />
        </div>

        {/* Position Helper Grid (Visual Aid) */}
        <div className="absolute inset-0 pointer-events-none border-4 border-dashed border-black/5 opacity-20 m-4 rounded-3xl"></div>
      </div>

    </div>
  );
};

export default App;