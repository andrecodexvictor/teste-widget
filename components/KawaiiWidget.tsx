
import React, { useEffect, useState, useMemo } from 'react';
import { WidgetSettings, ThemeMode, Donation, MascotType, WidgetStyle, MascotReaction, CompactTitleAlign } from '../types';
import { Sparkles, Star, Heart, Gamepad2, Zap, Crown, Coins, Gift, Glasses, Flame, Timer } from 'lucide-react';
import { RouletteWheel } from './RouletteWheel';

// --- Sub-components ---

const GoalTimer: React.FC<{ startDateStr: string, endDateStr: string, textClass: string }> = ({ startDateStr, endDateStr, textClass }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!endDateStr) {
            setTimeLeft('');
            return;
        }

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const startDate = startDateStr ? new Date(startDateStr).getTime() : 0;
            const endDate = new Date(endDateStr).getTime();
            
            if (now < startDate) {
                const distance = startDate - now;
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                setTimeLeft(`Starts in ${days}d ${hours}h`);
                return;
            }

            const distance = endDate - now;

            if (distance < 0) {
                setTimeLeft('Goal Ended!');
                clearInterval(interval);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            let timerString = '';
            if (days > 0) timerString += `${days}d `;
            if (hours > 0 || days > 0) timerString += `${hours}h `;
            timerString += `${minutes}m ${seconds}s`;

            setTimeLeft(timerString.trim());
        }, 1000);

        return () => clearInterval(interval);

    }, [startDateStr, endDateStr]);

    if (!timeLeft) return null;

    return (
        <div className={`flex items-center gap-1 text-xs mt-1 ${textClass} opacity-80 whitespace-nowrap`}>
            <Timer size={12} />
            <span>{timeLeft}</span>
        </div>
    );
};

const GrandCelebration: React.FC<{ theme: ThemeMode, title: string, currency: string, amount: number }> = ({ theme, title, currency, amount }) => {
    
    // Theme-specific styles
    if (theme === ThemeMode.MARIO) {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 animate-fade-in font-press-start text-center pointer-events-none">
                 {/* Fireworks simulation via CSS */}
                <div className="firework absolute left-1/4 top-1/2"></div>
                <div className="firework absolute right-1/4 top-1/2" style={{ animationDelay: '0.5s' }}></div>
                <div className="firework absolute left-1/2 top-1/3" style={{ animationDelay: '1s' }}></div>

                <div className="relative z-10 animate-pop-in">
                    <h1 className="text-5xl md:text-7xl text-yellow-400 drop-shadow-[4px_4px_0_#b91c1c] mb-4">
                        COURSE CLEAR!
                    </h1>
                    <div className="text-2xl text-white mt-4 flex items-center justify-center gap-2">
                        <Star className="text-yellow-400 animate-spin" size={32} fill="currentColor" />
                        GOAL REACHED: {currency}{amount}
                        <Star className="text-yellow-400 animate-spin" size={32} fill="currentColor" />
                    </div>
                </div>
            </div>
        );
    }

    if (theme === ThemeMode.NEON) {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm font-vt323 text-center pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-fuchsia-900/40 to-black"></div>
                
                <div className="relative z-10">
                    <h1 className="text-8xl text-cyan-400 animate-glitch tracking-widest drop-shadow-[0_0_20px_rgba(0,255,255,0.8)]">
                        MISSION COMPLETE
                    </h1>
                    <div className="mt-6 text-4xl text-fuchsia-500 animate-pulse border-t-2 border-b-2 border-fuchsia-500 py-2 inline-block px-8 bg-black/50">
                        TARGET AQUIRED: {currency}{amount}
                    </div>
                </div>
                
                {/* Cyberpunk lines */}
                <div className="absolute top-0 left-0 w-full h-2 bg-cyan-500 shadow-[0_0_15px_#0ff]"></div>
                <div className="absolute bottom-0 left-0 w-full h-2 bg-fuchsia-500 shadow-[0_0_15px_#f0f]"></div>
            </div>
        );
    }

    // Default KAWAII
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-pink-500/80 backdrop-blur-sm font-mochiy text-center pointer-events-none overflow-hidden">
             {/* Rotating rays background */}
             <div className="absolute inset-0 animate-spin-slow opacity-20">
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_20deg,white_20_40deg,transparent_40_60deg,white_60_80deg,transparent_80_100deg,white_100_120deg,transparent_120_140deg,white_140_160deg,transparent_160_180deg,white_180_200deg,transparent_200_220deg,white_220_240deg,transparent_240_260deg,white_260_280deg,transparent_280_300deg,white_300_320deg,transparent_320_340deg,white_340_360deg)]"></div>
             </div>

             <div className="relative z-10 animate-pop-in bg-white/90 p-12 rounded-[3rem] border-8 border-pink-300 shadow-[0_0_50px_rgba(255,192,203,0.8)] transform rotate-2">
                 <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-8xl animate-bounce">
                     🎊
                 </div>
                 <h1 className="text-6xl text-pink-500 drop-shadow-md mb-2">
                     SUGOI!
                 </h1>
                 <h2 className="text-3xl text-indigo-400 uppercase tracking-wide">
                     Goal Reached!
                 </h2>
                 <div className="mt-6 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
                     {currency}{amount}
                 </div>
             </div>

             {/* Floating Hearts */}
             {Array.from({ length: 20 }).map((_, i) => (
                 <div 
                    key={i}
                    className="absolute text-4xl animate-float opacity-80"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${3 + Math.random() * 2}s`
                    }}
                 >
                     {['💖', '🌸', '✨', '🍰'][Math.floor(Math.random() * 4)]}
                 </div>
             ))}
        </div>
    );
};

const ProgressBar: React.FC<{ percent: number, settings: WidgetSettings, compact?: boolean }> = ({ percent, settings, compact }) => {
    const clampedPercent = Math.min(100, Math.max(0, percent));
    const { theme, useCustomBarColor, customBarColor } = settings;
    
    let barClass = "";
    let containerClass = "";

    if (theme === ThemeMode.KAWAII) {
        containerClass = "bg-white/50 border-2 border-pink-200 h-8 rounded-full shadow-inner";
        if (compact) containerClass = "bg-pink-100/80 border-2 border-pink-400 h-6 rounded-full shadow-md";
        barClass = "h-full rounded-full bg-gradient-to-r from-pink-300 to-pink-500 relative overflow-hidden";
    } else if (theme === ThemeMode.MARIO) {
        containerClass = "bg-black/80 border-4 border-white h-8 rounded-md shadow-[4px_4px_0px_rgba(0,0,0,0.2)]";
        if (compact) containerClass = "bg-black/80 border-2 border-white h-6 rounded-sm shadow-md";
        barClass = "h-full bg-gradient-to-r from-green-400 to-green-600 border-r-4 border-white/50";
    } else { // Neon
        containerClass = "bg-gray-900 border border-cyan-500/50 h-6 skew-x-[-10deg]";
        if (compact) containerClass = "bg-gray-900/90 border border-fuchsia-500 h-5 skew-x-[-10deg] shadow-[0_0_10px_#f0f]";
        barClass = "h-full bg-cyan-500 shadow-[0_0_15px_#0ff]";
    }

    const barStyle = {
        width: `${clampedPercent}%`,
        backgroundColor: useCustomBarColor ? customBarColor : undefined,
    };
    
    // If using custom color, remove gradient classes
    if(useCustomBarColor) {
        barClass = barClass.replace(/bg-gradient-to-r from-[\w-]+ to-[\w-]+/g, '');
    }

    return (
        <div className={`w-full relative ${containerClass} ${compact ? 'mt-0' : 'mt-2'}`}>
             <div 
                className={`transition-all duration-1000 ease-out ${barClass}`}
                style={barStyle}
            >
                {/* Shine effect (only if not custom color) */}
                {!useCustomBarColor && <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30"></div>}
            </div>
            
            {/* Mascot in Compact Mode - MOVES INSIDE BAR */}
            {compact && (
                <div 
                    className="absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-1000 ease-out will-change-transform"
                    style={{ 
                        left: `${clampedPercent}%`,
                        transform: `translate(-50%, -50%)` // Exactly centered on the progress point
                    }}
                >
                    <div className="flex items-center justify-center">
                         <Mascot 
                            type={settings.mascot} 
                            theme={theme} 
                            isCelebrating={false} 
                            isReacting={false}
                            reactionType={settings.reactionType}
                            scale={settings.mascotScale * 0.45} // Reduced scale for bar
                            customClass="origin-center" // No fixed size to prevent stretching
                            centered={true} // Force center transform origin
                        />
                    </div>
                </div>
            )}

            {/* Percentage Text Overlay - Only for Standard Mode */}
            {!compact && (
                <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${theme === ThemeMode.NEON ? 'text-cyan-100 skew-x-[10deg]' : 'text-gray-700 drop-shadow-md'}`}>
                    {percent.toFixed(1)}%
                </div>
            )}
        </div>
    );
};

const Mascot: React.FC<{ 
    type: MascotType, 
    theme: ThemeMode, 
    isCelebrating: boolean, 
    isReacting: boolean, 
    reactionType?: MascotReaction,
    scale: number,
    customClass?: string,
    centered?: boolean // Add centered prop
}> = ({ type, theme, isCelebrating, isReacting, reactionType = MascotReaction.HAPPY, scale, customClass, centered }) => {
    const bounce = isCelebrating ? 'animate-bounce' : 'animate-float';
    const happy = isCelebrating || isReacting;
    
    // Default positioning for Standard Mode if customClass isn't provided
    // If customClass is provided (like in Compact Mode), we use that instead of the fixed position
    const positionClass = customClass || "absolute -top-16 -left-6 w-24 h-24";

    // --- REACTION RENDERING HELPERS ---
    const renderEyes = (defaultElement: React.ReactNode, color: string = "bg-gray-800") => {
        if (!happy) return defaultElement;

        switch(reactionType) {
            case MascotReaction.LOVE:
                return (
                    <div className="flex gap-1 items-center justify-center">
                        <Heart size={10} fill="#ff4081" stroke="none" className="animate-ping-slow" />
                        <Heart size={10} fill="#ff4081" stroke="none" className="animate-ping-slow" />
                    </div>
                );
            case MascotReaction.SHOCKED:
                 return (
                     <div className="flex gap-2 items-center justify-center">
                         <div className={`w-3 h-3 ${color} rounded-full`}></div>
                         <div className={`w-3 h-3 ${color} rounded-full`}></div>
                     </div>
                 );
            case MascotReaction.COOL:
                return (
                     <div className="flex items-center justify-center">
                        <Glasses size={20} fill="black" className="text-black -mt-1" />
                     </div>
                );
            case MascotReaction.CRYING:
                return (
                     <div className="flex gap-2 items-center justify-center relative">
                         <div className={`w-2 h-1 ${color} rounded-full`}></div>
                         <div className={`w-2 h-1 ${color} rounded-full`}></div>
                         <div className="absolute top-2 left-0 w-1 h-2 bg-blue-400 rounded-full"></div>
                         <div className="absolute top-2 right-0 w-1 h-2 bg-blue-400 rounded-full"></div>
                     </div>
                );
            case MascotReaction.ANGRY:
                 return (
                     <div className="flex gap-1 items-center justify-center">
                         <div className={`w-2 h-1 ${color} rotate-12`}></div>
                         <div className={`w-2 h-1 ${color} -rotate-12`}></div>
                     </div>
                 );
            case MascotReaction.HAPPY:
            default:
                 // Default Smile Eyes
                 return (
                    <div className="flex gap-2 items-center justify-center">
                        <div className={`w-2 h-1.5 border-t-2 border-${color.replace('bg-', '')} rounded-full mt-1`}></div>
                        <div className={`w-2 h-1.5 border-t-2 border-${color.replace('bg-', '')} rounded-full mt-1`}></div>
                    </div>
                 );
        }
    };

    const renderMouth = () => {
        if (!happy) return null;
        
        switch(reactionType) {
            case MascotReaction.SHOCKED:
                return <div className="absolute top-8 w-2 h-3 bg-black rounded-full"></div>;
            case MascotReaction.ANGRY:
                 return <div className="absolute top-8 w-3 h-1 bg-black rounded-full"></div>;
            case MascotReaction.COOL:
                 return <div className="absolute top-8 w-2 h-1 border-b-2 border-black rounded-full"></div>;
            default:
                return <div className="absolute top-8 w-2 h-1 border-b-2 border-gray-800 rounded-full"></div>;
        }
    };
    
    return (
        <div className={`${positionClass} z-20 transition-transform ${bounce}`}>
           {/* Abstract Representation of Mascots using Lucide & DIVs because we don't have external assets */}
           <div 
                className="relative w-full h-full flex items-center justify-center drop-shadow-xl transition-transform duration-300"
                style={{ 
                    transform: `scale(${scale})`, 
                    transformOrigin: centered ? 'center' : 'bottom center' 
                }}
            >
              {type === MascotType.CAT_GAMER && (
                  <div className="relative">
                      <div className={`w-16 h-14 ${theme === ThemeMode.NEON ? 'bg-purple-600 border-2 border-cyan-400' : 'bg-white border-2 border-pink-300'} rounded-2xl flex items-center justify-center`}>
                         <div className="flex gap-0 mt-1 items-center justify-center w-full h-6">
                            {renderEyes(
                                <>
                                    <div className="w-2 h-2 bg-gray-800 rounded-full animate-pulse mr-2"></div>
                                    <div className="w-2 h-2 bg-gray-800 rounded-full animate-pulse"></div>
                                </>
                            )}
                         </div>
                         {renderMouth()}

                         <div className="absolute -top-3 left-0 w-4 h-4 bg-inherit border-inherit rounded-tl-lg"></div>
                         <div className="absolute -top-3 right-0 w-4 h-4 bg-inherit border-inherit rounded-tr-lg"></div>
                         {/* Headphones */}
                         <div className="absolute -left-2 top-2 w-3 h-10 bg-indigo-400 rounded-full"></div>
                         <div className="absolute -right-2 top-2 w-3 h-10 bg-indigo-400 rounded-full"></div>
                         <div className="absolute -top-4 left-2 right-2 h-6 border-t-4 border-indigo-400 rounded-t-full"></div>
                      </div>
                  </div>
              )}
              {type === MascotType.SHIBA && (
                   <div className="w-16 h-16 bg-orange-300 rounded-full border-2 border-white flex items-center justify-center relative overflow-hidden">
                       <div className="w-10 h-8 bg-white rounded-full absolute bottom-0"></div>
                       <div className="flex gap-0 z-10 mb-1 items-center justify-center w-full h-6">
                           {renderEyes(
                                <>
                                    <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                                    <div className="w-2 h-2 bg-black rounded-full"></div>
                                </>,
                                "bg-black"
                           )}
                       </div>
                       {happy && <div className="absolute bottom-3 w-2 h-3 bg-red-400 rounded-b-full z-20"></div>}
                       
                       <div className="absolute -top-0 left-1 w-4 h-4 bg-orange-300 rotate-45"></div>
                       <div className="absolute -top-0 right-1 w-4 h-4 bg-orange-300 rotate-45"></div>
                   </div>
              )}
              {type === MascotType.LUMA && (
                  <div className="text-yellow-400 filter drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]">
                      <Star size={64} fill="currentColor" className={`${isCelebrating ? 'animate-spin' : ''}`} />
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1">
                            {renderEyes(
                                <>
                                    <div className="w-1.5 h-3 bg-black rounded-full"></div>
                                    <div className="w-1.5 h-3 bg-black rounded-full"></div>
                                </>
                            )}
                       </div>
                  </div>
              )}
              {type === MascotType.ROBOT && (
                   <div className="relative w-14 h-16 bg-gray-300 border-2 border-gray-500 rounded-lg flex flex-col items-center justify-center">
                       {/* Antenna */}
                       <div className="absolute -top-4 w-1 h-4 bg-gray-500"></div>
                       <div className="absolute -top-5 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                       
                       {/* Face Screen */}
                       <div className="w-10 h-8 bg-black rounded-sm flex items-center justify-center border border-gray-600">
                           {happy ? (
                               <div className="text-green-400 text-xs font-mono">^ ^</div>
                           ) : (
                               <div className="flex gap-2">
                                   <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                   <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                               </div>
                           )}
                       </div>
                   </div>
              )}
              {type === MascotType.BUNNY && (
                   <div className="relative w-14 h-14 bg-white border-2 border-pink-100 rounded-full flex items-center justify-center">
                        <div className="absolute -top-6 left-0 w-4 h-8 bg-white border-2 border-pink-100 rounded-full rotate-[-15deg]"></div>
                        <div className="absolute -top-6 right-0 w-4 h-8 bg-white border-2 border-pink-100 rounded-full rotate-[15deg]"></div>
                        
                        <div className="z-10 flex flex-col items-center">
                             <div className="flex gap-2 mb-1">
                                {renderEyes(
                                    <>
                                        <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                                        <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                                    </>
                                )}
                             </div>
                             <div className="w-1 h-1 bg-pink-300 rounded-full"></div>
                        </div>
                   </div>
              )}
              {type === MascotType.GHOST && (
                   <div className="relative w-14 h-16 bg-blue-50/90 rounded-t-full rounded-b-lg shadow-lg flex flex-col items-center justify-center overflow-hidden">
                       <div className="flex gap-2 mb-2">
                           {renderEyes(
                                <>
                                    <div className="w-2 h-2 bg-indigo-900 rounded-full"></div>
                                    <div className="w-2 h-2 bg-indigo-900 rounded-full"></div>
                                </>
                           )}
                       </div>
                       {/* Wavy bottom */}
                       <div className="absolute bottom-0 w-full h-2 flex">
                           <div className="flex-1 bg-inherit rounded-t-full transform translate-y-1"></div>
                           <div className="flex-1 bg-inherit rounded-t-full transform translate-y-1"></div>
                           <div className="flex-1 bg-inherit rounded-t-full transform translate-y-1"></div>
                       </div>
                   </div>
              )}
              {type === MascotType.SLIME && (
                  <div className="relative w-16 h-12 bg-green-400/80 rounded-t-full rounded-b-xl border-b-4 border-green-600/50 flex items-center justify-center">
                      <div className="absolute top-2 right-3 w-2 h-2 bg-white/50 rounded-full"></div>
                      <div className="flex gap-4 mt-2">
                           {renderEyes(
                                <>
                                    <div className="w-2 h-2 bg-black rounded-full"></div>
                                    <div className="w-2 h-2 bg-black rounded-full"></div>
                                </>
                           )}
                      </div>
                  </div>
              )}
               {type === MascotType.AXOLOTL && (
                  <div className="relative w-16 h-14 bg-pink-300 rounded-2xl flex items-center justify-center">
                      {/* Gills */}
                      <div className="absolute -left-2 top-2 w-3 h-2 bg-pink-500 rounded-full"></div>
                      <div className="absolute -left-2 top-5 w-3 h-2 bg-pink-500 rounded-full"></div>
                      <div className="absolute -right-2 top-2 w-3 h-2 bg-pink-500 rounded-full"></div>
                      <div className="absolute -right-2 top-5 w-3 h-2 bg-pink-500 rounded-full"></div>
                      
                      <div className="flex gap-3 mb-1 z-10">
                            {renderEyes(
                                <>
                                    <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                                    <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                                </>
                           )}
                      </div>
                      <div className="absolute bottom-3 w-3 h-1 border-b border-black/50 rounded-full"></div>
                  </div>
              )}
               {type === MascotType.DRAGON && (
                  <div className="relative w-16 h-16">
                      <div className="absolute bottom-0 w-14 h-12 bg-green-500 rounded-lg border-2 border-green-700"></div>
                      {/* Wings */}
                      <div className="absolute top-2 -left-2 w-6 h-6 bg-red-400 rounded-tl-xl rotate-[-20deg] z-0"></div>
                      <div className="absolute top-2 -right-2 w-6 h-6 bg-red-400 rounded-tr-xl rotate-[20deg] z-0"></div>
                      
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                          <div className="flex gap-2 mb-1">
                                {renderEyes(
                                    <>
                                        <div className="w-2 h-2 bg-yellow-300 rounded-full border border-black"></div>
                                        <div className="w-2 h-2 bg-yellow-300 rounded-full border border-black"></div>
                                    </>
                                )}
                          </div>
                          {/* Snout */}
                          <div className="w-6 h-3 bg-green-300 rounded-full flex justify-between px-1">
                              <div className="w-1 h-1 bg-black rounded-full mt-1"></div>
                              <div className="w-1 h-1 bg-black rounded-full mt-1"></div>
                          </div>
                      </div>
                  </div>
              )}
           </div>
        </div>
    );
};

// --- Main Widget ---

export const KawaiiWidget: React.FC<{ 
    settings: WidgetSettings; 
    donations: Donation[];
    isShaking: boolean;
    isCelebration: boolean;
    showRoulette: boolean;
    onRouletteComplete: () => void;
}> = ({ settings, donations, isShaking, isCelebration, showRoulette, onRouletteComplete }) => {
    
    const { 
        theme, 
        style, 
        currency, 
        title, 
        goalAmount, 
        currentAmount, 
        mascot, 
        primaryColor, 
        secondaryColor 
    } = settings;

    const percent = Math.min(100, (currentAmount / goalAmount) * 100);

    // Dynamic Classes based on Theme
    const getContainerClass = () => {
        if (style === WidgetStyle.COMPACT) {
             return "relative w-[400px] flex flex-col gap-1";
        }

        switch(theme) {
            case ThemeMode.MARIO:
                return "relative bg-[#c84c0c] border-4 border-black p-1 rounded-lg shadow-[8px_8px_0_#000]";
            case ThemeMode.NEON:
                return "relative bg-black/90 border border-fuchsia-500 p-6 rounded-none shadow-[0_0_20px_rgba(255,0,255,0.3)] clip-path-cyberpunk";
            default: // KAWAII
                return "relative bg-white/95 backdrop-blur-md border-4 border-pink-200 p-6 rounded-[2rem] shadow-xl";
        }
    };

    const getTitleClass = () => {
        if (style === WidgetStyle.COMPACT) return ""; // Handled inline for Compact
        switch(theme) {
            case ThemeMode.MARIO: return "font-press-start text-white text-shadow-retro text-sm mb-2 text-center tracking-widest";
            case ThemeMode.NEON: return "font-vt323 text-3xl text-cyan-400 text-shadow-neon mb-1 text-center uppercase tracking-widest";
            default: return "font-fredoka text-xl text-gray-600 font-bold mb-1 text-center uppercase tracking-wider";
        }
    };

    const getValueClass = () => {
         switch(theme) {
            case ThemeMode.MARIO: return "font-press-start text-xs text-yellow-200 mt-1 block text-right";
            case ThemeMode.NEON: return "font-vt323 text-xl text-fuchsia-400 mt-1 block text-right";
            default: return "font-mochiy text-sm text-pink-500 mt-1 block text-right";
        }
    };

    return (
        <div className={`${isShaking ? 'animate-shake' : ''} transition-all duration-300`}>
            
            {/* Celebration Overlays */}
            {isCelebration && <GrandCelebration theme={theme} title={title} currency={currency} amount={goalAmount} />}
            {isCelebration && <div className="fixed inset-0 pointer-events-none z-50"><div className="firework"></div></div>}
            
            {/* Roulette Wheel Overlay */}
            {showRoulette && (
                <div className="absolute inset-0 z-50 flex items-center justify-center">
                    <RouletteWheel 
                        theme={theme} 
                        events={settings.rouletteEvents} 
                        onComplete={onRouletteComplete} 
                    />
                </div>
            )}

            <div className={getContainerClass()}>
                
                {/* Standard Mode Content */}
                {style === WidgetStyle.STANDARD && (
                    <>
                        {/* Inner Border for Mario */}
                        {theme === ThemeMode.MARIO && <div className="absolute inset-1 border-2 border-[#f8d878] pointer-events-none rounded-lg"></div>}
                        
                        {/* Floating Mascot */}
                        <Mascot 
                            type={mascot} 
                            theme={theme} 
                            isCelebrating={isCelebration} 
                            isReacting={isShaking} 
                            reactionType={settings.reactionType}
                            scale={settings.mascotScale}
                        />

                        {/* Header */}
                        <div className={getTitleClass()} style={{ color: settings.useCustomTitleColor ? settings.customTitleColor : undefined, fontSize: settings.titleFontSize ? `${settings.titleFontSize}px` : undefined }}>
                            {title}
                        </div>

                        {/* Progress Bar */}
                        <div className="relative z-10">
                            <ProgressBar percent={percent} settings={settings} />
                            
                            <div className="flex justify-between items-end mt-2">
                                <GoalTimer startDateStr={settings.goalStartDate} endDateStr={settings.goalEndDate} textClass={getValueClass()} />
                                <span className={getValueClass()}>
                                    {currency}{currentAmount} <span className="text-[0.8em] opacity-70">/ {currency}{goalAmount}</span>
                                </span>
                            </div>
                        </div>

                        {/* Recent Donation (Simple Ticker) */}
                        {settings.showRecentDonations && donations.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-gray-100/20">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <Heart size={14} className={`${theme === ThemeMode.NEON ? 'text-fuchsia-500' : 'text-pink-400'} animate-pulse`} fill="currentColor" />
                                    <div className="text-xs font-bold text-gray-500 whitespace-nowrap animate-marquee-slow">
                                        Latest: <span className={`${theme === ThemeMode.NEON ? 'text-cyan-400' : 'text-indigo-500'}`}>{donations[0].username}</span> - {currency}{donations[0].amount} "{donations[0].message}"
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Compact Mode Content */}
                {style === WidgetStyle.COMPACT && (
                    <div className="flex flex-col w-full">
                        {/* Header Row: Title & Amount */}
                        <div className={`flex items-end justify-between w-full mb-1 ${settings.compactTitleAlign === CompactTitleAlign.RIGHT ? 'flex-row-reverse' : 'flex-row'}`}>
                            
                            {/* Title - Movable Vertically */}
                            <div 
                                className={`text-sm font-bold drop-shadow-md ${
                                    theme === ThemeMode.NEON ? 'font-vt323 text-cyan-400 text-lg' : 
                                    theme === ThemeMode.MARIO ? 'font-press-start text-[10px] text-white' : 
                                    'font-fredoka text-gray-700'
                                }`}
                                style={{ 
                                    fontSize: `${settings.titleFontSize}px`,
                                    color: settings.useCustomTitleColor ? settings.customTitleColor : undefined,
                                    transform: `translateY(${settings.compactTitleOffset}px)`,
                                    transition: 'transform 0.2s ease-out'
                                }}
                            >
                                {title}
                            </div>

                             {/* Goal Amount - Always opposite to title */}
                             <div 
                                className={`text-xs font-bold drop-shadow-md whitespace-nowrap ${
                                    theme === ThemeMode.NEON ? 'font-vt323 text-fuchsia-400 text-lg' : 
                                    theme === ThemeMode.MARIO ? 'font-press-start text-[10px] text-white' : 
                                    'font-fredoka text-gray-600'
                                }`}
                                style={{
                                     color: settings.useCustomTitleColor ? settings.customTitleColor : undefined 
                                }}
                             >
                                {currency}{currentAmount} <span className="opacity-80">/ {currency}{goalAmount}</span>
                            </div>
                        </div>
                        
                        {/* Bar */}
                        <ProgressBar percent={percent} settings={settings} compact />
                        
                        {/* Footer Info: Timer only */}
                        <div className={`flex w-full mt-1 px-1 ${settings.compactTitleAlign === CompactTitleAlign.RIGHT ? 'justify-end' : 'justify-start'}`}>
                            <GoalTimer startDateStr={settings.goalStartDate} endDateStr={settings.goalEndDate} textClass="font-mono text-xs text-white drop-shadow-md" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
