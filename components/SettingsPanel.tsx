
import React from 'react';
import { WidgetSettings, ThemeMode, MascotType, WidgetPosition, GoalMode, WidgetStyle } from '../types';
import { Sliders, Layout, Palette, PlayCircle, DollarSign, Gift, Dna, Maximize2, Minimize2 } from 'lucide-react';

interface SettingsPanelProps {
    settings: WidgetSettings;
    setSettings: React.Dispatch<React.SetStateAction<WidgetSettings>>;
    onSimulateDonation: (amount: number, user: string, msg: string) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings, onSimulateDonation }) => {
    
    const handleChange = (key: keyof WidgetSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleEventsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const lines = e.target.value.split('\n').filter(line => line.trim() !== '');
        handleChange('rouletteEvents', lines);
    };

    return (
        <div className="p-6 space-y-8">
            
            {/* Style Mode Section (New) */}
            <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2">
                    <Layout size={14} /> Widget Layout
                </h3>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => handleChange('style', WidgetStyle.STANDARD)}
                        className={`flex-1 text-xs py-2 px-2 rounded-md font-semibold transition flex items-center justify-center gap-2 ${settings.style === WidgetStyle.STANDARD ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                    >
                        <Maximize2 size={14} /> Standard (Card)
                    </button>
                    <button 
                        onClick={() => handleChange('style', WidgetStyle.COMPACT)}
                        className={`flex-1 text-xs py-2 px-2 rounded-md font-semibold transition flex items-center justify-center gap-2 ${settings.style === WidgetStyle.COMPACT ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                    >
                        <Minimize2 size={14} /> Compact (Walking)
                    </button>
                </div>
            </section>

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
                    <DollarSign size={14} /> Goal Logic
                </h3>
                
                {/* Goal Mode Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                    <button 
                        onClick={() => handleChange('goalMode', GoalMode.SIMPLE)}
                        className={`flex-1 text-xs py-1.5 rounded-md font-semibold transition ${settings.goalMode === GoalMode.SIMPLE ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                    >
                        One Big Goal
                    </button>
                    <button 
                        onClick={() => handleChange('goalMode', GoalMode.SUBGOALS)}
                        className={`flex-1 text-xs py-1.5 rounded-md font-semibold transition ${settings.goalMode === GoalMode.SUBGOALS ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                    >
                        Sub-Goals (Escadinha)
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Total Target</label>
                        <input 
                            type="number" 
                            value={settings.goalAmount}
                            onChange={(e) => handleChange('goalAmount', parseInt(e.target.value))}
                            className="w-full p-2 bg-black text-white border border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                         <label className="block text-xs text-gray-500 mb-1">Current Amount</label>
                        <input 
                            type="number" 
                            value={settings.currentAmount}
                            onChange={(e) => handleChange('currentAmount', parseInt(e.target.value))}
                            className="w-full p-2 bg-black text-white border border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                {settings.goalMode === GoalMode.SUBGOALS && (
                    <div className="bg-indigo-50 p-3 rounded-md border border-indigo-100">
                        <label className="block text-xs text-indigo-700 font-bold mb-1 flex items-center gap-1">
                            <Dna size={12} />
                            Sub-Goal Step Amount
                        </label>
                        <div className="text-[10px] text-indigo-500 mb-1">Trigger event every time this amount is reached.</div>
                        <input 
                            type="number" 
                            value={settings.subGoalInterval}
                            onChange={(e) => handleChange('subGoalInterval', parseInt(e.target.value))}
                            className="w-full p-2 bg-black text-white border border-indigo-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. 100"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-xs text-gray-500 mb-1">Widget Title</label>
                    <input 
                        type="text" 
                        value={settings.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="w-full p-2 bg-black text-white border border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </section>

            {/* Roulette / Event Settings */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2">
                        <Gift size={14} /> Event Roulette
                    </h3>
                    <div className="flex items-center">
                        <input 
                            type="checkbox"
                            checked={settings.enableRoulette}
                            onChange={(e) => handleChange('enableRoulette', e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded"
                        />
                    </div>
                </div>
                
                {settings.enableRoulette && (
                    <div className="animate-fade-in">
                         <label className="block text-xs text-gray-500 mb-1">Events (One per line)</label>
                         <textarea 
                            value={settings.rouletteEvents.join('\n')}
                            onChange={handleEventsChange}
                            rows={5}
                            className="w-full p-2 bg-black text-white border border-gray-700 rounded-md text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                            placeholder="Sing a song&#10;Do 10 squats&#10;Gift sub"
                         />
                         <p className="text-[10px] text-gray-400 mt-1">Will trigger when a goal or sub-goal is reached.</p>
                    </div>
                )}
            </section>

            {/* Mascot & Layout */}
            <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2">
                    <Layout size={14} /> Mascot & Position
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
                         <option value={MascotType.BUNNY}>🐰 Bunny</option>
                         <option value={MascotType.GHOST}>👻 Ghost</option>
                         <option value={MascotType.SLIME}>💧 Slime</option>
                         <option value={MascotType.AXOLOTL}>🦎 Axolotl</option>
                         <option value={MascotType.DRAGON}>🐲 Dragon</option>
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

                <div className="grid grid-cols-2 gap-4">
                    <div className="">
                        <label className="block text-xs text-gray-700 mb-1">Widget Scale ({settings.scale}x)</label>
                        <input 
                            type="range" 
                            min="0.5" 
                            max="1.5" 
                            step="0.1"
                            value={settings.scale}
                            onChange={(e) => handleChange('scale', parseFloat(e.target.value))}
                            className="w-full"
                        />
                    </div>
                     <div className="">
                        <label className="block text-xs text-gray-700 mb-1">Mascot Size ({settings.mascotScale}x)</label>
                        <input 
                            type="range" 
                            min="0.5" 
                            max="2.0" 
                            step="0.1"
                            value={settings.mascotScale}
                            onChange={(e) => handleChange('mascotScale', parseFloat(e.target.value))}
                            className="w-full"
                        />
                    </div>
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
                        Add $100 (Trigger Sub-Goal)
                    </button>
                </div>
                <p className="text-[10px] text-green-600 opacity-70 text-center">
                    Clicking updates the preview & triggers animations.
                </p>
            </section>

        </div>
    );
};
