
import React, { useState, useEffect, useCallback } from 'react';
import { WidgetSettings, DEFAULT_SETTINGS, Donation, ThemeMode, WidgetPosition, GoalMode, StreamElementsEvent, TrailReward } from './types';
import { KawaiiWidget } from './components/KawaiiWidget';
import { SettingsPanel } from './components/SettingsPanel';
import { RefreshCw, Monitor, Heart, ExternalLink, Save } from 'lucide-react';

const STORAGE_KEY = 'kawaii-widget-settings';

const App: React.FC = () => {
  // Initialize settings
  // Priority: 1. URL Params (Snapshot) -> 2. LocalStorage -> 3. Defaults
  const [settings, setSettings] = useState<WidgetSettings>(() => {
    try {
        // 1. Check URL Params (for Overlay Mode snapshot)
        const params = new URLSearchParams(window.location.search);
        const dataParam = params.get('data');
        
        if (dataParam) {
            try {
                // Decode base64 utf-8 string
                const decoded = decodeURIComponent(atob(dataParam));
                const parsed = JSON.parse(decoded);
                return { ...DEFAULT_SETTINGS, ...parsed };
            } catch (e) {
                console.error("Failed to parse URL settings", e);
            }
        }

        // 2. Check LocalStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        }
        return DEFAULT_SETTINGS;
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
  
  // State for active trail reward popup
  const [activeReward, setActiveReward] = useState<TrailReward | null>(null);

  const [socketStatus, setSocketStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  // Debounce logic for StreamElements Token to prevent socket spam while typing
  const [debouncedToken, setDebouncedToken] = useState(settings.streamElementsToken);

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

  // Save settings to LocalStorage whenever they change (Instant Save)
  useEffect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Debounce the token update for socket connection (waits 1s after typing stops)
  useEffect(() => {
      const handler = setTimeout(() => {
          setDebouncedToken(settings.streamElementsToken);
      }, 1000);
      return () => clearTimeout(handler);
  }, [settings.streamElementsToken]);

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
        
        // --- LOGIC: Roulette Trigger ---
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
        
        if (shouldTriggerRoulette) {
            setTimeout(() => setShowRoulette(true), 800);
        }

        // --- LOGIC: Trail Rewards Trigger ---
        // Check if any rewards in trailRewards were crossed
        if (prev.trailRewards && prev.trailRewards.length > 0) {
            // Find the highest reward that was crossed just now
            const crossedRewards = prev.trailRewards.filter(r => 
                oldAmount < r.amount && newAmount >= r.amount
            );
            
            if (crossedRewards.length > 0) {
                // Show the last crossed reward (most recent milestone)
                const latestReward = crossedRewards[crossedRewards.length - 1];
                setTimeout(() => setActiveReward(latestReward), 600);
            }
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

  // --- StreamElements Socket Connection Logic ---
  useEffect(() => {
    const token = debouncedToken; // Use the debounced token
    if (!token) {
        setSocketStatus('disconnected');
        return;
    }

    setSocketStatus('connecting');

    // Access the global 'io' object injected by the script tag in index.html
    const io = (window as any).io;
    if (!io) {
        console.error("Socket.io script not loaded");
        setSocketStatus('disconnected');
        return;
    }

    const socket = io('https://realtime.streamelements.com', {
        transports: ['websocket']
    });

    socket.on('connect', () => {
        console.log('Connected to StreamElements WebSocket');
        socket.emit('authenticate', { method: 'jwt', token: token });
    });

    socket.on('authenticated', () => {
        console.log('Successfully authenticated with StreamElements');
        setSocketStatus('connected');
    });

    socket.on('unauthorized', (data: any) => {
        console.error('StreamElements Auth Failed:', data);
        setSocketStatus('disconnected');
    });

    socket.on('event', (data: any) => {
        console.log('New StreamElements Event:', data);
        if (data.type === 'tip') {
            // Standard donation
             simulateDonation(data.data.amount, data.data.username, data.data.message || '');
        } else if (data.type === 'subscriber') {
            // Optional: Handle subs as amount if needed, e.g. 500 points per sub
            // simulateDonation(5, data.data.username, "Subscribed!");
        }
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from StreamElements');
        setSocketStatus('disconnected');
    });

    // Cleanup on unmount or token change
    return () => {
        socket.disconnect();
    };

  }, [debouncedToken, simulateDonation]);

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
      // Force save current state before opening
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      
      const url = new URL(window.location.href);
      url.searchParams.set('overlay', 'true');
      
      // Encode settings into URL to guarantee persistence in the new window
      try {
          const settingsStr = JSON.stringify(settings);
          const encodedSettings = btoa(encodeURIComponent(settingsStr));
          url.searchParams.set('data', encodedSettings);
      } catch (e) {
          console.error("Failed to encode settings for URL", e);
      }
      
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
                      activeReward={activeReward}
                      onRewardComplete={() => setActiveReward(null)}
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
                socketStatus={socketStatus}
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
                activeReward={activeReward}
                onRewardComplete={() => setActiveReward(null)}
            />
        </div>

        {/* Position Helper Grid (Visual Aid) */}
        <div className="absolute inset-0 pointer-events-none border-4 border-dashed border-black/5 opacity-20 m-4 rounded-3xl"></div>
      </div>

    </div>
  );
};

export default App;
