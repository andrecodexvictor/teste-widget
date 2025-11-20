import React from 'react';
import { WidgetSettings, ThemeMode, MascotType, WidgetPosition } from '../types';
import { Sliders, Layout, Palette, PlayCircle, DollarSign } from 'lucide-react';

interface SettingsPanelProps {
    settings: WidgetSettings;
    setSettings: React.Dispatch<React.SetStateAction<WidgetSettings>>;
    onSimulateDonation: (amount: number, user: string, msg: string) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings, onSimulateDonation }) => {
    
    const handleChange = (key: keyof WidgetSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="p-6 space-y-8">
            
            {/* Theme Section */}
            <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2">
                    <Palette size={14} /> Visual Theme
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    {[ThemeMode.KAWAII, ThemeMode.MARIO, ThemeMode.NEON].map(mode => (
                        <button
                            key={mode}
                            onClick={() => handleChange('theme', mode)}
                            className={`p-2 text-sm rounded-lg border-2 capitalize transition-all ${settings.theme === mode ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </section>

            {/* Goal Configuration */}
            <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2">
                    <DollarSign size={14} /> Goal Settings
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Target Amount</label>
                        <input 
                            type="number" 
                            value={settings.goalAmount}
                            onChange={(e) => handleChange('goalAmount', parseInt(e.target.value))}
                            className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                         <label className="block text-xs text-gray-500 mb-1">Current Amount</label>
                        <input 
                            type="number" 
                            value={settings.currentAmount}
                            onChange={(e) => handleChange('currentAmount', parseInt(e.target.value))}
                            className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Widget Title</label>
                    <input 
                        type="text" 
                        value={settings.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </section>

            {/* Mascot & Layout */}
            <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2">
                    <Layout size={14} /> Mascot & Layout
                </h3>
                
                <div className="space-y-2">
                     <label className="block text-xs text-gray-500">Active Mascot</label>
                     <select 
                        value={settings.mascot}
                        onChange={(e) => handleChange('mascot', e.target.value)}
                        className="w-full p-2 border rounded-md text-sm bg-white"
                     >
                         <option value={MascotType.CAT_GAMER}>🐱 Gamer Cat</option>
                         <option value={MascotType.SHIBA}>🐕 Shiba Inu</option>
                         <option value={MascotType.LUMA}>⭐ Star Spirit</option>
                         <option value={MascotType.ROBOT}>🤖 Mecha Bot</option>
                     </select>
                </div>

                 <div className="space-y-2">
                     <label className="block text-xs text-gray-500">Screen Position</label>
                     <select 
                        value={settings.position}
                        onChange={(e) => handleChange('position', e.target.value)}
                        className="w-full p-2 border rounded-md text-sm bg-white"
                     >
                         <option value={WidgetPosition.TOP_LEFT}>Top Left</option>
                         <option value={WidgetPosition.TOP_RIGHT}>Top Right</option>
                         <option value={WidgetPosition.BOTTOM_LEFT}>Bottom Left</option>
                         <option value={WidgetPosition.BOTTOM_RIGHT}>Bottom Right</option>
                         <option value={WidgetPosition.CENTER_BOTTOM}>Center Bottom</option>
                     </select>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <label className="text-sm text-gray-700">Scale ({settings.scale}x)</label>
                    <input 
                        type="range" 
                        min="0.5" 
                        max="1.5" 
                        step="0.1"
                        value={settings.scale}
                        onChange={(e) => handleChange('scale', parseFloat(e.target.value))}
                        className="w-24"
                    />
                </div>
            </section>

            {/* Simulation */}
            <section className="p-4 bg-green-50 rounded-xl border border-green-100 space-y-3">
                 <h3 className="text-xs font-bold uppercase text-green-600 flex items-center gap-2">
                    <PlayCircle size={14} /> Test Events
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => onSimulateDonation(10, "TestUser", "GG!")}
                        className="bg-white border border-green-200 text-green-700 text-xs font-bold py-2 px-3 rounded hover:bg-green-100 transition"
                    >
                        + $10 Donation
                    </button>
                    <button 
                        onClick={() => onSimulateDonation(50, "BigSpender", "Huge Hype!")}
                        className="bg-white border border-green-200 text-green-700 text-xs font-bold py-2 px-3 rounded hover:bg-green-100 transition"
                    >
                        + $50 Donation
                    </button>
                     <button 
                        onClick={() => onSimulateDonation(100, "Whale", "Milestone!")}
                        className="col-span-2 bg-green-500 text-white text-xs font-bold py-2 px-3 rounded hover:bg-green-600 transition shadow-sm"
                    >
                        Trigger Celebration ($100)
                    </button>
                </div>
                <p className="text-[10px] text-green-600 opacity-70 text-center">
                    Clicking updates the preview & triggers animations.
                </p>
            </section>

        </div>
    );
};