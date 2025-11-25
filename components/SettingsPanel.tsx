import React, { useState } from 'react';
import { WidgetSettings, ThemeMode, MascotType, WidgetPosition, GoalMode, WidgetStyle, MascotReaction, CompactTitleAlign, TrailReward } from '../types';
import { Sliders, Layout, Palette, PlayCircle, DollarSign, Gift, Dna, Maximize2, Minimize2, Smile, Globe, Eye, EyeOff, Zap, Check, Wifi, WifiOff, Timer, AlignLeft, AlignRight, Type, MoveVertical, MoveHorizontal, Map, Plus, Trash2, Trophy, RotateCcw } from 'lucide-react';

interface SettingsPanelProps {
    settings: WidgetSettings;
    setSettings: React.Dispatch<React.SetStateAction<WidgetSettings>>;
    onSimulateDonation: (amount: number, user: string, msg: string) => void;
    socketStatus: 'disconnected' | 'connecting' | 'connected';
    onFullReset: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings, onSimulateDonation, socketStatus, onFullReset }) => {
    
    const [showSecrets, setShowSecrets] = useState(false);
    
    // Local state for adding new trail rewards
    const [newRewardAmount, setNewRewardAmount] = useState<number>(0);
    const [newRewardLabel, setNewRewardLabel] = useState<string>('');

    const handleChange = (key: keyof WidgetSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleEventsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const lines = e.target.value.split('\n').filter(line => line.trim() !== '');
        handleChange('rouletteEvents', lines);
    };

    const addTrailReward = () => {
        if (newRewardAmount > 0 && newRewardLabel.trim() !== '') {
            const newReward: TrailReward = {
                id: Date.now().toString(),
                amount: newRewardAmount,
                label: newRewardLabel
            };
            
            // Add and sort by amount
            const updatedRewards = [...settings.trailRewards, newReward].sort((a, b) => a.amount - b.amount);
            
            handleChange('trailRewards', updatedRewards);
            setNewRewardAmount(0);
            setNewRewardLabel('');
        }
    };

    const removeTrailReward = (id: string) => {
        const updatedRewards = settings.trailRewards.filter(r => r.id !== id);
        handleChange('trailRewards', updatedRewards);
    };

    return (
        <div className="p-6 space-y-8 pb-12">
            
            {/* Style Mode Section */}
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

            {/* Integrations Section */}
            <section className="space-y-3 bg-indigo-50 p-4 rounded-xl border border-indigo-100 relative overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold uppercase text-indigo-600 flex items-center gap-2">
                        <Globe size={14} /> Real-time Integrations
                    </h3>
                    <button 
                        onClick={() => setShowSecrets(!showSecrets)} 
                        className="text-indigo-400 hover:text-indigo-600"
                        title={showSecrets ? "Hide Keys" : "Show Keys"}
                    >
                        {showSecrets ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                            <span className="flex items-center gap-1"><Zap size={12} className="text-yellow-500" /> StreamElements JWT Token</span>
                            {/* Connection Status Badge */}
                            {settings.streamElementsToken && (
                                <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${
                                    socketStatus === 'connected' ? 'bg-green-100 text-green-700' : 
                                    socketStatus === 'connecting' ? 'bg-yellow-100 text-yellow-700' : 
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {socketStatus === 'connected' ? <Wifi size={10} /> : <WifiOff size={10} />}
                                    {socketStatus === 'connected' ? 'Connected' : socketStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                                </span>
                            )}
                        </label>
                        <div className="relative">
                            <input 
                                type={showSecrets ? "text" : "password"}
                                value={settings.streamElementsToken || ''}
                                onChange={(e) => handleChange('streamElementsToken', e.target.value)}
                                placeholder="Paste JWT Token here..."
                                className={`w-full p-2 pr-8 bg-white border rounded-md text-xs focus:ring-2 outline-none transition-colors ${
                                    socketStatus === 'connected' ? 'border-green-300 ring-green-100' : 'border-indigo-200 focus:ring-indigo-500'
                                }`}
                            />
                            {settings.streamElementsToken && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none" title="Saved">
                                    <Check size={14} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                             <span className="flex items-center gap-1"><Zap size={12} className="text-green-500" /> LivePix Key / URL</span>
                        </label>
                        <div className="relative">
                            <input 
                                type={showSecrets ? "text" : "password"}
                                value={settings.livePixKey || ''}
                                onChange={(e) => handleChange('livePixKey', e.target.value)}
                                placeholder="Paste LivePix Widget URL or Key..."
                                className="w-full p-2 pr-8 bg-white border border-indigo-200 rounded-md text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            {settings.livePixKey && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none" title="Saved">
                                    <Check size={14} />
                                </div>
                            )}
                        </div>
                    </div>
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
                 <div>
                    <div className="flex items-center gap-2 mt-2">
                         <input
                            type="checkbox"
                            id="useCustomBarColor"
                            checked={settings.useCustomBarColor}
                            onChange={(e) => handleChange('useCustomBarColor', e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <label htmlFor="useCustomBarColor" className="text-xs text-gray-700 font-semibold">Use Custom Bar Color</label>
                        <input
                            type="color"
                            value={settings.customBarColor}
                            onChange={(e) => handleChange('customBarColor', e.target.value)}
                            className={`w-8 h-8 rounded-full border-2 border-white shadow-sm cursor-pointer ${!settings.useCustomBarColor ? 'opacity-50 pointer-events-none' : ''}`}
                            disabled={!settings.useCustomBarColor}
                        />
                    </div>
                </div>
            </section>

            {/* Typography & Title Positioning */}
            <section className="space-y-3">
                 <h3 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2">
                    <Type size={14} /> Typography & Positioning
                </h3>
                
                {/* Font Size & Title Color */}
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs text-gray-500 mb-1">Title Font Size</label>
                        <input 
                            type="range" 
                            min="10" 
                            max="36" 
                            value={settings.titleFontSize}
                            onChange={(e) => handleChange('titleFontSize', parseInt(e.target.value))}
                            className="w-full"
                        />
                        <div className="text-[10px] text-right text-gray-400">{settings.titleFontSize}px</div>
                    </div>
                    <div>
                         <label className="block text-xs text-gray-500 mb-1">Title Color</label>
                         <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={settings.useCustomTitleColor}
                                onChange={(e) => handleChange('useCustomTitleColor', e.target.checked)}
                                className="w-3 h-3 text-indigo-600 rounded"
                                title="Enable custom title color"
                            />
                            <input
                                type="color"
                                value={settings.customTitleColor}
                                onChange={(e) => handleChange('customTitleColor', e.target.value)}
                                className={`w-full h-8 rounded border border-gray-300 cursor-pointer ${!settings.useCustomTitleColor ? 'opacity-50 pointer-events-none' : ''}`}
                            />
                         </div>
                    </div>
                </div>

                {/* Compact Mode Specifics */}
                {settings.style === WidgetStyle.COMPACT && (
                    <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                            <label className="block text-xs text-indigo-700 font-bold mb-1 flex items-center gap-1">
                                <MoveVertical size={12} />
                                Compact Title Vertical Offset
                            </label>
                            <input 
                                type="range" 
                                min="-50" 
                                max="50" 
                                step="1"
                                value={settings.compactTitleOffset}
                                onChange={(e) => handleChange('compactTitleOffset', parseInt(e.target.value))}
                                className="w-full"
                            />
                        </div>

                         {/* Width Control */}
                        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                            <label className="block text-xs text-indigo-700 font-bold mb-1 flex items-center gap-1">
                                <MoveHorizontal size={12} />
                                Compact Bar Width
                            </label>
                            <input 
                                type="range" 
                                min="200" 
                                max="1000" 
                                step="10"
                                value={settings.compactWidth}
                                onChange={(e) => handleChange('compactWidth', parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="text-[10px] text-right text-gray-400">{settings.compactWidth}px</div>
                        </div>
                    </div>
                )}
            </section>

            {/* Goal Configuration */}
            <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2">
                    <DollarSign size={14} /> Goal Logic
                </h3>
                
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

            {/* Trail & Jackpot Section */}
            <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2">
                    <Map size={14} /> Trail & Jackpot
                </h3>
                
                {/* Jackpot Settings */}
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <label className="block text-xs font-bold text-yellow-700 mb-1 flex items-center gap-1">
                        <Trophy size={12} /> Jackpot Reward (Final Goal)
                    </label>
                    <input 
                        type="text"
                        value={settings.jackpotLabel}
                        onChange={(e) => handleChange('jackpotLabel', e.target.value)}
                        className="w-full p-2 bg-white border border-yellow-300 rounded text-xs"
                        placeholder="e.g. Cosplay Stream, 12h Stream"
                    />
                </div>

                {/* Trail List */}
                <div className="space-y-2">
                    <label className="block text-xs text-gray-500">Intermediate Rewards</label>
                    
                    {/* List existing rewards */}
                    <div className="space-y-1">
                        {settings.trailRewards.map((reward) => (
                            <div key={reward.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200 text-xs">
                                <div className="font-mono font-bold w-12 text-indigo-600">{settings.currency}{reward.amount}</div>
                                <div className="flex-1 truncate font-medium">{reward.label}</div>
                                <button onClick={() => removeTrailReward(reward.id)} className="text-red-400 hover:text-red-600">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add new reward */}
                    <div className="flex gap-2 items-center mt-2">
                        <input 
                            type="number"
                            value={newRewardAmount || ''}
                            onChange={(e) => setNewRewardAmount(parseInt(e.target.value))}
                            placeholder="Amt"
                            className="w-16 p-2 bg-white border rounded text-xs"
                        />
                        <input 
                            type="text"
                            value={newRewardLabel}
                            onChange={(e) => setNewRewardLabel(e.target.value)}
                            placeholder="Reward name (e.g. Skin Giveaway)"
                            className="flex-1 p-2 bg-white border rounded text-xs"
                        />
                        <button 
                            onClick={addTrailReward}
                            className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            disabled={!newRewardAmount || !newRewardLabel}
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
            </section>
            
             {/* Goal Timer */}
            <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2">
                    <Timer size={14} /> Goal Timer
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                        <input 
                            type="datetime-local" 
                            value={settings.goalStartDate}
                            onChange={(e) => handleChange('goalStartDate', e.target.value)}
                            className="w-full p-2 bg-black text-white border border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">End Date</label>
                        <input 
                            type="datetime-local" 
                            value={settings.goalEndDate}
                            onChange={(e) => handleChange('goalEndDate', e.target.value)}
                            className="w-full p-2 bg-black text-white border border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>
            </section>

            {/* Roulette / Event Settings */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2">
                        <Gift size={14} /> Event Roulette (Sub-goals)
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
                    <div className="animate-fade-in bg-gray-50 p-3 rounded border border-gray-200">
                         <div className="mb-2">
                            <label className="block text-xs text-indigo-700 font-bold mb-1 flex items-center gap-1">
                                <Dna size={12} />
                                Spin Every
                            </label>
                            <input 
                                type="number" 
                                value={settings.subGoalInterval}
                                onChange={(e) => handleChange('subGoalInterval', parseInt(e.target.value))}
                                className="w-full p-2 bg-white border border-gray-300 rounded text-xs"
                                placeholder="e.g. 100"
                            />
                        </div>
                         <label className="block text-xs text-gray-500 mb-1">Roulette Options (One per line)</label>
                         <textarea 
                            value={settings.rouletteEvents.join('\n')}
                            onChange={handleEventsChange}
                            rows={5}
                            className="w-full p-2 bg-white text-gray-800 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                            placeholder="Sing a song&#10;Do 10 squats&#10;Gift sub"
                         />
                    </div>
                )}
            </section>

            {/* Mascot & Layout */}
            <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-gray-400 flex items-center gap-2">
                    <Smile size={14} /> Mascot & Layout
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
                     <label className="block text-xs text-gray-500">Donation Reaction Style</label>
                     <select 
                        value={settings.reactionType}
                        onChange={(e) => handleChange('reactionType', e.target.value)}
                        className="w-full p-2 border rounded-md text-sm bg-white"
                     >
                         <option value={MascotReaction.HAPPY}>😊 Happy (Default)</option>
                         <option value={MascotReaction.LOVE}>😍 Love / Hearts</option>
                         <option value={MascotReaction.SHOCKED}>😲 Shocked / OMG</option>
                         <option value={MascotReaction.COOL}>😎 Cool / Shades</option>
                         <option value={MascotReaction.CRYING}>😭 Crying Joy</option>
                         <option value={MascotReaction.ANGRY}>🔥 Hype / Determined</option>
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
                 
                 <div className="space-y-2">
                    <label className="block text-xs text-gray-500">Compact Title Position</label>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button 
                            onClick={() => handleChange('compactTitleAlign', CompactTitleAlign.LEFT)}
                            className={`flex-1 text-xs py-1.5 rounded-md font-semibold transition flex items-center justify-center gap-1 ${settings.compactTitleAlign === CompactTitleAlign.LEFT ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                        ><AlignLeft size={14} /> Left</button>
                        <button 
                            onClick={() => handleChange('compactTitleAlign', CompactTitleAlign.RIGHT)}
                            className={`flex-1 text-xs py-1.5 rounded-md font-semibold transition flex items-center justify-center gap-1 ${settings.compactTitleAlign === CompactTitleAlign.RIGHT ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                        ><AlignRight size={14} /> Right</button>
                    </div>
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
                        Add $100 (Trigger Sub-Goal/Trail)
                    </button>
                </div>
                <p className="text-[10px] text-green-600 opacity-70 text-center">
                    Clicking updates the preview & triggers the selected reaction.
                </p>
            </section>

            {/* Danger Zone - Manual Reset */}
            <section className="p-4 bg-red-50 rounded-xl border border-red-100 space-y-3 mt-8">
                 <h3 className="text-xs font-bold uppercase text-red-600 flex items-center gap-2">
                    <RotateCcw size={14} /> Danger Zone
                </h3>
                <button 
                    onClick={onFullReset}
                    className="w-full bg-red-500 text-white text-xs font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition shadow-sm flex items-center justify-center gap-2"
                >
                    <RotateCcw size={16} /> Reset Progress & History
                </button>
                <p className="text-[10px] text-red-500 opacity-70 text-center">
                    Clears Current Amount (0) and Donation History. Use this when starting a new month/goal.
                </p>
            </section>

        </div>
    );
};