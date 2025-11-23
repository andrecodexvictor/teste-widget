
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
        <div className={`flex items-center gap-1 text-xs mt-1 ${textClass} opacity-80`}>
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

const Particles: React.FC<{ theme: ThemeMode }> = ({ theme }) => {
    // Simplified particle system for visual flair
    const [particles, setParticles] = useState<{id: number, left: number, top: number, delay: number, size: number}[]>([]);

    useEffect(() => {
        const count = 15;
        const newParticles = Array.from({ length: count }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            delay: Math.random() * 5,
            size: Math.random() * 10 + 5,
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className={`absolute opacity-60 ${theme === ThemeMode.NEON ? 'animate-pulse' : 'animate-float'}`}
                    style={{
                        left: `${p.left}%`,
                        top: `${p.top}%`,
                        animationDelay: `${p.delay}s`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                    }}
                >
                    {theme === ThemeMode.KAWAII && <span className="text-pink-200">🌸</span>}
                    {theme === ThemeMode.MARIO && <span className="text-yellow-400">⭐</span>}
                    {theme === ThemeMode.NEON && <div className="w-1 h-1 bg-cyan-400 shadow-[0_0_5px_#0ff] rounded-full" />}
                </div>
            ))}
        </div>
    );
};

const Confetti: React.FC = () => {
    const [particles, setParticles] = useState<{id: number, x: number, color: string}[]>([]);
    
    useEffect(() => {
        const colors = ['#FFC0CB', '#FFD700', '#00BFFF', '#EE82EE'];
        const newParticles = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            color: colors[Math.floor(Math.random() * colors.length)]
        }));
        setParticles(newParticles);
    }, []);

    return (
         <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
            {particles.map((p) => (
                <div 
                    key={p.id}
                    className="absolute w-2 h-2 rounded-full animate-bounce"
                    style={{
                        left: `${p.x}%`,
                        backgroundColor: p.color,
                        top: '-10px',
                        animationDuration: `${Math.random() * 2 + 1}s`
                    }}
                />
            ))}
         </div>
    )
}

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
    customClass?: string 
}> = ({ type, theme, isCelebrating, isReacting, reactionType = MascotReaction.HAPPY, scale, customClass }) => {
    const bounce = isCelebrating ? 'animate-bounce' : 'animate-float';
    const happy = isCelebrating || isReacting;
    
    // Default positioning for Standard Mode if customClass isn't provided
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
                style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}
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
                  <div className="text-yellow-400 filter drop-shadow-[0_0_10px_rgba(255,255,0,0.6)]">
                      <Star size={64} fill="currentColor" strokeWidth={1} className={`${happy ? 'animate-spin' : 'animate-spin-slow'}`} />
                      <div className="absolute inset-0 flex items-center justify-center">
                           <div className="flex gap-0 items-center justify-center h-6">
                                {renderEyes(
                                    <>
                                        <div className="w-1 h-3 bg-black rounded-full mr-2"></div>
                                        <div className="w-1 h-3 bg-black rounded-full"></div>
                                    </>,
                                    "bg-black"
                                )}
                           </div>
                      </div>
                  </div>
              )}
              {type === MascotType.ROBOT && (
                  <div className="bg-gray-800 border-2 border-cyan-500 p-2 rounded-lg">
                      <div className="w-12 h-8 bg-cyan-900 flex items-center justify-center gap-1">
                          {happy ? (
                             reactionType === MascotReaction.LOVE ? <Heart size={12} className="text-pink-400 fill-current" /> :
                             reactionType === MascotReaction.SHOCKED ? <div className="w-6 h-6 border-2 border-white rounded-full"></div> :
                             reactionType === MascotReaction.ANGRY ? <div className="w-8 h-2 bg-red-500"></div> :
                             <div className="flex gap-1">
                                <Heart size={10} className="text-pink-400 fill-current animate-bounce" />
                                <Heart size={10} className="text-pink-400 fill-current animate-bounce delay-75" />
                              </div>
                          ) : (
                              <>
                                <div className="w-3 h-3 bg-cyan-400 animate-pulse"></div>
                                <div className="w-3 h-3 bg-cyan-400 animate-pulse delay-75"></div>
                              </>
                          )}
                      </div>
                      <div className="h-1 w-full bg-gray-700 mt-1"></div>
                  </div>
              )}
              {type === MascotType.BUNNY && (
                  <div className="w-16 h-16 bg-white rounded-full border-2 border-pink-200 relative flex items-center justify-center">
                      {/* Ears */}
                      <div className={`absolute -top-6 left-2 w-3 h-8 bg-white border-2 border-pink-200 rounded-full ${happy ? '-rotate-[20deg]' : '-rotate-12'} transition-transform`}>
                          <div className="w-1 h-5 bg-pink-200 rounded-full mx-auto mt-1"></div>
                      </div>
                      <div className={`absolute -top-6 right-2 w-3 h-8 bg-white border-2 border-pink-200 rounded-full ${happy ? 'rotate-[20deg]' : 'rotate-12'} transition-transform`}>
                          <div className="w-1 h-5 bg-pink-200 rounded-full mx-auto mt-1"></div>
                      </div>
                      {/* Face */}
                      <div className="flex gap-0 mt-1 items-center justify-center h-6 w-full">
                           {renderEyes(
                                <>
                                    <div className="w-2 h-2 bg-gray-800 rounded-full mr-2"></div>
                                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                                </>
                           )}
                      </div>
                      <div className="absolute top-10 w-2 h-1 bg-pink-300 rounded-full"></div>
                  </div>
              )}
              {type === MascotType.GHOST && (
                  <div className="w-14 h-16 bg-white/90 rounded-t-full rounded-b-lg border-2 border-indigo-100 relative flex items-center justify-center shadow-lg">
                      {/* Eyes */}
                      <div className="flex gap-0 -mt-2 items-center justify-center h-6 w-full">
                          {renderEyes(
                               <>
                                <div className="w-3 h-3 bg-gray-800 rounded-full mr-2"></div>
                                <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                               </>
                          )}
                      </div>
                      {/* Blush */}
                      <div className={`absolute top-8 left-2 w-2 h-1 bg-pink-200 rounded-full ${happy ? 'opacity-100 scale-125' : 'opacity-50'}`}></div>
                      <div className={`absolute top-8 right-2 w-2 h-1 bg-pink-200 rounded-full ${happy ? 'opacity-100 scale-125' : 'opacity-50'}`}></div>
                      {/* Tail/Floaty bits at bottom */}
                      <div className="absolute -bottom-1 flex w-full justify-between px-1">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                  </div>
              )}
              {type === MascotType.SLIME && (
                  <div className="w-16 h-14 bg-cyan-400 rounded-t-[50%] rounded-b-2xl border-2 border-cyan-600 relative flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                      <div className="absolute -top-2 w-4 h-4 bg-cyan-400 rounded-full border-t-2 border-l-2 border-cyan-600 -rotate-45"></div>
                      <div className="flex gap-0 mt-2 items-center justify-center h-6 w-full">
                           {renderEyes(
                                <>
                                    <div className="w-2 h-3 bg-gray-900 rounded-full mr-2"></div>
                                    <div className="w-2 h-3 bg-gray-900 rounded-full"></div>
                                </>,
                                "bg-gray-900"
                           )}
                      </div>
                      {happy && <div className="absolute top-9 w-2 h-1 bg-gray-900/50 rounded-full"></div>}
                      <div className="absolute top-4 left-2 w-2 h-2 bg-white/50 rounded-full"></div>
                  </div>
              )}
              {type === MascotType.AXOLOTL && (
                  <div className="w-16 h-14 bg-pink-300 rounded-2xl border-2 border-pink-400 relative flex items-center justify-center">
                      {/* Gills */}
                      <div className={`absolute -left-2 top-2 w-2 h-2 bg-pink-500 rounded-full ${happy ? 'animate-pulse' : ''}`}></div>
                      <div className={`absolute -left-2 top-5 w-2 h-2 bg-pink-500 rounded-full ${happy ? 'animate-pulse' : ''}`}></div>
                      <div className={`absolute -right-2 top-2 w-2 h-2 bg-pink-500 rounded-full ${happy ? 'animate-pulse' : ''}`}></div>
                      <div className={`absolute -right-2 top-5 w-2 h-2 bg-pink-500 rounded-full ${happy ? 'animate-pulse' : ''}`}></div>
                      {/* Face */}
                      <div className="flex gap-0 items-center justify-center h-6 w-full">
                          {renderEyes(
                                <>
                                    <div className="w-1 h-1 bg-gray-800 rounded-full mr-2"></div>
                                    <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                                </>
                          )}
                      </div>
                      <div className={`absolute top-9 w-4 h-2 border-b-2 border-gray-700 rounded-full ${happy ? 'h-3' : 'h-2'}`}></div>
                  </div>
              )}
              {type === MascotType.DRAGON && (
                  <div className="w-16 h-16 bg-green-400 rounded-xl border-2 border-green-600 relative flex items-center justify-center">
                      {/* Wings */}
                      <div className={`absolute -left-4 top-4 w-6 h-4 bg-purple-400 rounded-full -rotate-12 -z-10 ${happy ? 'animate-flap' : ''}`}></div>
                      <div className={`absolute -right-4 top-4 w-6 h-4 bg-purple-400 rounded-full rotate-12 -z-10 ${happy ? 'animate-flap' : ''}`}></div>
                      {/* Horns */}
                      <div className="absolute -top-2 left-3 w-2 h-4 bg-yellow-400 rounded-full -rotate-12"></div>
                      <div className="absolute -top-2 right-3 w-2 h-4 bg-yellow-400 rounded-full rotate-12"></div>
                      
                      <div className="flex gap-0 mt-2 items-center justify-center h-6 w-full">
                          {renderEyes(
                                <>
                                    <div className="w-2 h-2 bg-gray-900 rounded-full mr-2"></div>
                                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                                </>,
                                "bg-gray-900"
                          )}
                      </div>
                      {/* Snout */}
                      <div className="absolute bottom-3 w-8 h-4 bg-green-300 rounded-full opacity-50"></div>
                      {reactionType === MascotReaction.ANGRY && happy && (
                          <Flame size={12} className="absolute -right-4 bottom-2 text-red-500 animate-pulse" fill="currentColor" />
                      )}
                  </div>
              )}
           </div>
        </div>
    );
};

const RecentDonationsTicker: React.FC<{ donations: Donation[], theme: ThemeMode }> = ({ donations, theme }) => {
    if (donations.length === 0) return null;

    let textClass = "text-gray-600";
    if (theme === ThemeMode.MARIO) textClass = "text-white font-press-start text-[10px]";
    if (theme === ThemeMode.NEON) textClass = "text-cyan-300 font-mono text-xs";
    if (theme === ThemeMode.KAWAII) textClass = "text-pink-600 font-fredoka text-sm";

    return (
        <div className="w-full overflow-hidden h-6 mt-2 relative">
            <div className="whitespace-nowrap animate-marquee flex gap-8 absolute items-center h-full">
                {donations.map((d) => (
                    <span key={d.id} className={`flex items-center gap-1 ${textClass}`}>
                        <Heart size={10} fill="currentColor" className="opacity-70" />
                        <span className="font-bold">{d.username}:</span>
                        <span>{d.amount}</span>
                    </span>
                ))}
                 {donations.map((d) => (
                    <span key={`${d.id}-dup`} className={`flex items-center gap-1 ${textClass}`}>
                        <Heart size={10} fill="currentColor" className="opacity-70" />
                        <span className="font-bold">{d.username}:</span>
                        <span>{d.amount}</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

// --- Main Component ---

interface KawaiiWidgetProps {
  settings: WidgetSettings;
  donations: Donation[];
  isShaking: boolean;
  isCelebration: boolean;
  showRoulette: boolean;
  onRouletteComplete: () => void;
}

export const KawaiiWidget: React.FC<KawaiiWidgetProps> = ({ settings, donations, isShaking, isCelebration, showRoulette, onRouletteComplete }) => {
    const percentage = Math.min(100, (settings.currentAmount / settings.goalAmount) * 100);
    const topDonor = donations.reduce((prev, current) => (prev.amount > current.amount) ? prev : current, donations[0]);

    // Dynamic Styles based on Theme
    const styles = useMemo(() => {
        switch(settings.theme) {
            case ThemeMode.MARIO:
                return {
                    container: 'bg-blue-500 border-4 border-yellow-400 shadow-[8px_8px_0px_#000]',
                    font: 'font-press-start',
                    textPrimary: 'text-white drop-shadow-[2px_2px_0_#000]',
                    textSecondary: 'text-yellow-200',
                    textCompactOutline: 'text-white drop-shadow-[2px_2px_0_#000]',
                    icon: <Coins className="text-yellow-300 animate-pulse" size={20} />
                };
            case ThemeMode.NEON:
                return {
                    container: 'bg-black/90 border-2 border-fuchsia-500 shadow-[0_0_30px_rgba(255,0,255,0.3)] rounded-sm neon-pulse',
                    font: 'font-vt323',
                    textPrimary: 'text-fuchsia-400 text-shadow-neon',
                    textSecondary: 'text-cyan-400',
                    textCompactOutline: 'text-cyan-100 text-shadow-[0_0_5px_#0ff]',
                    icon: <Zap className="text-cyan-400" size={20} />
                };
            case ThemeMode.KAWAII:
            default:
                return {
                    container: 'bg-white/95 border-4 border-pink-200 rounded-3xl shadow-xl',
                    font: 'font-mochiy',
                    textPrimary: 'text-pink-500',
                    textSecondary: 'text-indigo-400',
                    textCompactOutline: 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] stroke-black',
                    icon: <Sparkles className="text-yellow-400" size={20} />
                };
        }
    }, [settings.theme]);

    // --- RENDER: COMPACT MODE ---
    if (settings.style === WidgetStyle.COMPACT) {
        const titleAlignClass = settings.compactTitleAlign === CompactTitleAlign.RIGHT ? 'flex-row-reverse' : '';

        return (
            <>
            {/* Full Screen Celebration Overlay */}
            {isCelebration && (
                <GrandCelebration 
                    theme={settings.theme} 
                    title={settings.title} 
                    currency={settings.currency} 
                    amount={settings.goalAmount} 
                />
            )}
            
            <div className={`relative w-[400px] p-2 transition-transform ${isShaking ? 'animate-shake' : ''} ${styles.font}`}>
                {/* Event Roulette Overlay - Using fixed size to match Standard mode look, centered on the bar */}
                {showRoulette && settings.enableRoulette && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[350px] h-[350px]">
                         <RouletteWheel theme={settings.theme} events={settings.rouletteEvents} onComplete={onRouletteComplete} />
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    {/* Header Info (Text needs outline/shadow because bg is transparent) */}
                    <div className={`flex justify-between items-end px-1 ${titleAlignClass}`}>
                        <div className="flex flex-col items-start">
                           <h2 className={`text-sm uppercase font-bold ${styles.textCompactOutline} drop-shadow-md`}>{settings.title}</h2>
                           <GoalTimer startDateStr={settings.goalStartDate} endDateStr={settings.goalEndDate} textClass={styles.textCompactOutline} />
                        </div>
                        <div className={`text-xl font-black ${styles.textCompactOutline} drop-shadow-md`}>
                            {settings.currency}{settings.currentAmount}
                            <span className="text-xs opacity-90 ml-1">/ {settings.goalAmount}</span>
                        </div>
                    </div>

                    {/* Bar with Mascot INSIDE */}
                    <div className="relative w-full mt-2">
                         <ProgressBar percent={percentage} settings={settings} compact={true} />
                         {/* The Mascot moves with left: percentage% */}
                         <div 
                            className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear z-20"
                            style={{ left: `${percentage}%`, transform: `translateX(-50%) translateY(-50%)` }}
                         >
                             <Mascot 
                                type={settings.mascot} 
                                theme={settings.theme} 
                                isCelebrating={isCelebration} 
                                isReacting={isShaking || isCelebration}
                                reactionType={settings.reactionType}
                                customClass="w-5 h-5" // Smaller class to fit inside
                                scale={settings.mascotScale}
                            />
                         </div>
                    </div>
                </div>
            </div>
            </>
        );
    }

    // --- RENDER: STANDARD MODE (Original Card) ---
    return (
        <>
        {/* Full Screen Celebration Overlay */}
        {isCelebration && (
            <GrandCelebration 
                theme={settings.theme} 
                title={settings.title} 
                currency={settings.currency} 
                amount={settings.goalAmount} 
            />
        )}

        <div 
            className={`relative w-[350px] p-6 transition-transform ${isShaking ? 'animate-shake' : 'animate-float'} ${styles.container} ${styles.font}`}
        >
            {/* Event Roulette Overlay */}
            {showRoulette && settings.enableRoulette && (
                <RouletteWheel 
                    theme={settings.theme} 
                    events={settings.rouletteEvents} 
                    onComplete={onRouletteComplete} 
                />
            )}

            {isCelebration && <Confetti />}
            <Particles theme={settings.theme} />

            {/* Mascot (Fixed position) */}
            <Mascot 
                type={settings.mascot} 
                theme={settings.theme} 
                isCelebrating={isCelebration} 
                isReacting={isShaking || isCelebration}
                reactionType={settings.reactionType}
                scale={settings.mascotScale}
            />

            {/* Header */}
            <div className="flex justify-between items-end relative z-10 pl-12">
                <div className="flex flex-col">
                    <h2 className={`text-lg uppercase tracking-wider font-bold ${styles.textSecondary}`}>{settings.title}</h2>
                    <div className={`text-3xl font-black flex items-center gap-2 ${styles.textPrimary}`}>
                        {styles.icon}
                        <span>{settings.currency}{settings.currentAmount}</span>
                        <span className="text-sm opacity-70 self-end mb-1">/ {settings.goalAmount}</span>
                    </div>
                </div>
            </div>
            
            {/* Timer for Standard Mode */}
            <GoalTimer startDateStr={settings.goalStartDate} endDateStr={settings.goalEndDate} textClass={styles.textSecondary} />

            {/* Bar */}
            <div className="relative z-10 mt-1">
                <ProgressBar percent={percentage} settings={settings} />
            </div>

            {/* Footer / Top Donor */}
            <div className="mt-4 pt-2 border-t border-black/5 relative z-10">
                 {settings.showTopDonor && topDonor && (
                     <div className={`flex items-center gap-2 text-xs ${styles.textSecondary} mb-1`}>
                         <Crown size={14} className="text-yellow-500" />
                         <span className="opacity-75">MVP:</span>
                         <span className="font-bold">{topDonor.username}</span>
                         <span className="opacity-75">({settings.currency}{topDonor.amount})</span>
                     </div>
                 )}
                 
                 {settings.showRecentDonations && (
                     <RecentDonationsTicker donations={donations} theme={settings.theme} />
                 )}
            </div>
            
            {/* Decoration Elements for Mario Theme */}
            {settings.theme === ThemeMode.MARIO && (
                <>
                    <div className="absolute -top-3 right-4 w-8 h-8 bg-orange-600 border-2 border-black grid grid-cols-2 gap-1 p-1 shadow-[2px_2px_0_#000]">
                        <div className="bg-yellow-900 rounded-full w-1 h-1 place-self-center"></div>
                        <div className="bg-yellow-900 rounded-full w-1 h-1 place-self-center"></div>
                        <div className="bg-yellow-900 rounded-full w-1 h-1 place-self-center"></div>
                        <div className="bg-yellow-900 rounded-full w-1 h-1 place-self-center"></div>
                    </div>
                </>
            )}
        </div>
        </>
    );
};
