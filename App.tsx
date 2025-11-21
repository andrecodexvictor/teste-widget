
import React, { useState, useEffect, useCallback } from 'react';
import { WidgetSettings, DEFAULT_SETTINGS, Donation, ThemeMode, WidgetPosition, GoalMode, StreamElementsEvent } from './types';
import { KawaiiWidget } from './components/KawaiiWidget';
import { SettingsPanel } from './components/SettingsPanel';
import { RefreshCw, Monitor, Heart, ExternalLink, Save } from 'lucide-react';

const STORAGE_KEY = 'kawaii-widget-settings';

const App: React.FC = () => {
  // Initialize settings from LocalStorage if available, otherwise use defaults
  const [settings, setSettings] = useState<WidgetSettings>(() => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch (error) {
        console.error("Error loading settings:", error);
        return DEFAULT_SETTINGS;
    }
  });

  const [donations, setDonations] = useState<Donation[]>([
    { id: '1', username: 'NekoChan99', amount: 50, message: 'Keep it up!', timestamp: Date.now() },
    { id: '2', username: 'MarioFan', amount: 20, message: 'Here we go!', timestamp: Date.now() - 10000 },
    { id: '3', username: 'CyberPunk', amount: 100, message: 'Neon vibes only.', timestamp: Date.now() - 20000 },
  ]);
  const [isShaking, setIsShaking] = useState(false);
  const [isCelebration, setIsCelebration] = useState(false);
  const [showRoulette, setShowRoulette] = useState(false);
  
  // State for Overlay Mode (active when ?overlay=true in URL)
  const [isOverlayMode, setIsOverlayMode] = useState(false);

  // Check URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('overlay') === 'true') {
        setIsOverlayMode(true);
        document.body.style.backgroundColor = 'transparent';
    }
  }, []);

  // Save settings to LocalStorage whenever they change
  useEffect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Listen for Storage events (Sync Editor -> Overlay in real-time)
  useEffect(() => {
      const handleStorageChange = (e: StorageEvent) => {
          if (e.key === STORAGE_KEY && e.newValue) {
              try {
                  const newSettings = JSON.parse(e.newValue);
                  setSettings(newSettings);
              } catch (error) {
                  console.error("Error syncing settings:", error);
              }
          }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Simulate adding a donation (used by both manual buttons and SE events)
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
        const oldAmount = prev.currentAmount;
        const newAmount = oldAmount + amount;
        
        // Check for Sub-goal triggers
        let shouldTriggerRoulette = false;
        
        if (prev.enableRoulette) {
            if (prev.goalMode === GoalMode.SUBGOALS && prev.subGoalInterval > 0) {
                const oldMilestone = Math.floor(oldAmount / prev.subGoalInterval);
                const newMilestone = Math.floor(newAmount / prev.subGoalInterval);
                
                if (newMilestone > oldMilestone) {
                    shouldTriggerRoulette = true;
                }
            } else if (prev.goalMode === GoalMode.SIMPLE) {
                // For simple goal, only trigger on full completion
                if (newAmount >= prev.goalAmount && oldAmount < prev.goalAmount) {
                     shouldTriggerRoulette = true;
                }
            }
        }

        // Delay setting the roulette slightly so the shake happens first
        if (shouldTriggerRoulette) {
            setTimeout(() => setShowRoulette(true), 800);
        }

        return { ...prev, currentAmount: newAmount };
    });

    // Trigger Animations
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    // Check Celebration (Confetti)
    // Trigger if total goal reached
    if (settings.currentAmount + amount >= settings.goalAmount && settings.currentAmount < settings.goalAmount) {
        setIsCelebration(true);
        setTimeout(() => setIsCelebration(false), 8000);
    }
  }, [settings.currentAmount, settings.goalAmount, settings.goalMode, settings.subGoalInterval, settings.enableRoulette]);

  // StreamElements Event Listener
  useEffect(() => {
    const onEventReceived = (obj: CustomEvent | any) => {
        if (!obj.detail) return;
        const { listener, event } = obj.detail;

        console.log('StreamElements Event:', listener, event);

        if (listener === 'tip-latest') {
            simulateDonation(event.amount, event.name, event.message);
        }
        
        // You can add more listeners here (e.g. 'subscriber-latest' if you want to convert subs to points)
    };

    // StreamElements initial load (for session data if needed)
    const onWidgetLoad = (obj: CustomEvent | any) => {
        console.log('Widget Loaded', obj.detail);
        // Here you could sync initial goal state if you were pulling from SE session data
    };

    window.addEventListener('onEventReceived', onEventReceived);
    window.addEventListener('onWidgetLoad', onWidgetLoad);

    return () => {
        window.removeEventListener('onEventReceived', onEventReceived);
        window.removeEventListener('onWidgetLoad', onWidgetLoad);
    };
  }, [simulateDonation]);


  // Helper to determine absolute positioning classes based on settings
  const getPositionClasses = (pos: WidgetPosition) => {
    switch (pos) {
        case WidgetPosition.TOP_LEFT: return 'top-0 left-0 m-8 origin-top-left';
        case WidgetPosition.TOP_RIGHT: return 'top-0 right-0 m-8 origin-top-right';
        case WidgetPosition.BOTTOM_LEFT: return 'bottom-0 left-0 m-8 origin-bottom-left';
        case WidgetPosition.BOTTOM_RIGHT: return 'bottom-0 right-0 m-8 origin-bottom-right';
        case WidgetPosition.CENTER_TOP: return 'top-0 left-1/2 -translate-x-1/2 mt-8 origin-top';
        case WidgetPosition.CENTER_BOTTOM: return 'bottom-0 left-1/2 -translate-x-1/2 mb-8 origin-bottom';
        default: return 'bottom-0 left-1/2 -translate-x-1/2 mb-8 origin-bottom';
    }
  };

  const handleLaunchOverlay = () => {
      // Force save current state before opening to ensure consistency
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      
      // Construct URL
      const url = new URL(window.location.href);
      url.searchParams.set('overlay', 'true');
      
      // Open in new tab
      window.open(url.toString(), '_blank');
  };

  // --- RENDER: OVERLAY MODE (For OBS) ---
  if (isOverlayMode) {
      return (
          <div className="min-h-screen w-full overflow-hidden relative bg-transparent">
              <div 
                  className={`absolute ${getPositionClasses(settings.position)} transition-all duration-300`}
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
                      showRoulette={showRoulette}
                      onRouletteComplete={() => setShowRoulette(false)}
                  />
              </div>
          </div>
      );
  }

  // --- RENDER: EDITOR MODE (Default) ---
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row overflow-hidden font-sans text-gray-800">
      
      {/* Left Side: Control Panel */}
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

        <div className="p-4 bg-gray-50 border-t border-gray-200">
            <button 
                onClick={handleLaunchOverlay}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md"
            >
                <ExternalLink size={18} />
                Save & Open Overlay
            </button>
            <p className="text-xs text-center text-gray-400 mt-2">
               Opens a transparent window for OBS
            </p>
        </div>
      </div>

      {/* Right Side: Preview Area */}
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
                showRoulette={showRoulette}
                onRouletteComplete={() => setShowRoulette(false)}
            />
        </div>

        {/* Position Helper Grid (Visual Aid) */}
        <div className="absolute inset-0 pointer-events-none border-4 border-dashed border-black/5 opacity-20 m-4 rounded-3xl"></div>
      </div>

    </div>
  );
};

export default App;
