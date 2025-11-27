import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WidgetSettings, DEFAULT_SETTINGS, Donation, ThemeMode, WidgetPosition, GoalMode, StreamElementsEvent, TrailReward } from './types';
import { KawaiiWidget } from './components/KawaiiWidget';
import { SettingsPanel } from './components/SettingsPanel';
import { RefreshCw, Monitor, Heart, ExternalLink, Save } from 'lucide-react';

const STORAGE_KEY = 'kawaii-widget-settings';
const STORAGE_KEY_DONATIONS = 'kawaii-widget-donations';

const App: React.FC = () => {
  
  // --- INITIALIZATION HELPERS ---

  const getUrlData = () => {
      const params = new URLSearchParams(window.location.search);
      const dataParam = params.get('data');
      if (dataParam) {
          try {
              const decoded = decodeURIComponent(atob(dataParam));
              return JSON.parse(decoded);
          } catch (e) {
              console.error("Failed to parse URL data", e);
          }
      }
      return null;
  };

  const urlData = getUrlData();
  const [isOverlayMode, setIsOverlayMode] = useState(false);

  // Detect Overlay Mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('overlay') === 'true') {
        setIsOverlayMode(true);
        document.body.style.backgroundColor = 'transparent';
    }
  }, []);

  // --- STATE MANAGEMENT ---

  // Settings State
  const [settings, setSettings] = useState<WidgetSettings>(() => {
    let finalSettings = { ...DEFAULT_SETTINGS };

    // 1. URL Data (Design Priority)
    if (urlData) {
        if (urlData.settings) {
            finalSettings = { ...finalSettings, ...urlData.settings };
        } else if (urlData.theme) {
            finalSettings = { ...finalSettings, ...urlData };
        }
    }

    // 2. LocalStorage (Progress Persistence)
    // We try to recover progress even in overlay mode if possible (same browser)
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsedSaved = JSON.parse(saved);
            
            // Critical: If local storage has a newer 'currentAmount', use it.
            // This acts as our "Simple Database"
            if (parsedSaved.currentAmount !== undefined && !isNaN(Number(parsedSaved.currentAmount))) {
                finalSettings.currentAmount = Number(parsedSaved.currentAmount);
            }
            // Also restore tokens if they exist locally but not in URL
            if (parsedSaved.streamElementsToken) finalSettings.streamElementsToken = parsedSaved.streamElementsToken;
            if (parsedSaved.livePixKey) finalSettings.livePixKey = parsedSaved.livePixKey;
        }
    } catch (e) { console.error(e); }

    // Ensure numeric types
    finalSettings.currentAmount = Number(finalSettings.currentAmount) || 0;
    finalSettings.goalAmount = Number(finalSettings.goalAmount) || 100;

    return finalSettings;
  });

  // Donations State
  const [donations, setDonations] = useState<Donation[]>(() => {
      // 1. Try LocalStorage (Our "Database")
      try {
          const saved = localStorage.getItem(STORAGE_KEY_DONATIONS);
          if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) return parsed;
          }
      } catch (e) { console.error(e); }

      // 2. Fallback to URL (Snapshot)
      if (urlData && urlData.donations && Array.isArray(urlData.donations)) {
          return urlData.donations;
      }

      // 3. Defaults (Only for fresh editor)
      const isOverlay = window.location.search.includes('overlay=true');
      if (isOverlay) return [];

      return [
        { id: '1', username: 'NekoChan99', amount: 50, message: 'Keep it up!', timestamp: Date.now() },
        { id: '2', username: 'MarioFan', amount: 20, message: 'Here we go!', timestamp: Date.now() - 10000 },
        { id: '3', username: 'CyberPunk', amount: 100, message: 'Neon vibes only.', timestamp: Date.now() - 20000 },
      ];
  });

  // Animation States
  const [isShaking, setIsShaking] = useState(false);
  const [isCelebration, setIsCelebration] = useState(false);
  const [showRoulette, setShowRoulette] = useState(false);
  const [activeReward, setActiveReward] = useState<TrailReward | null>(null);
  const [socketStatus, setSocketStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  // Debounce Token to prevent socket spam
  const [debouncedToken, setDebouncedToken] = useState(settings.streamElementsToken);

  // Ref to track previous amount for event triggering
  const prevAmountRef = useRef(settings.currentAmount);

  // --- PERSISTENCE EFFECT (The "Database" Logic) ---
  // Whenever settings or donations change, we save to LocalStorage.
  // This happens in BOTH Editor and Overlay (if possible) to keep them in sync on the same machine.
  useEffect(() => {
      const settingsToSave = { 
          ...settings, 
          currentAmount: Number(settings.currentAmount) 
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave));
  }, [settings]);

  useEffect(() => {
      localStorage.setItem(STORAGE_KEY_DONATIONS, JSON.stringify(donations));
  }, [donations]);

  // --- SYNC ACROSS TABS ---
  // If the Editor updates, the Overlay updates automatically via Storage Events
  useEffect(() => {
      const handleStorageChange = (e: StorageEvent) => {
          if (e.key === STORAGE_KEY && e.newValue) {
              try { 
                  const newSettings = JSON.parse(e.newValue);
                  // We merge, respecting local state if needed, but here we trust the "Server" (Editor)
                  setSettings(prev => ({ ...prev, ...newSettings })); 
              } catch (e) { console.error(e); }
          }
          if (e.key === STORAGE_KEY_DONATIONS && e.newValue) {
              try { 
                  setDonations(JSON.parse(e.newValue)); 
              } catch (e) { console.error(e); }
          }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // --- CORE LOGIC: PROCESS NEW DONATION ---
  // This function is the heart of the app. It runs in both Editor and Overlay independently.
  const processNewDonation = useCallback((amountRaw: number | string, username: string, message: string) => {
      const amount = parseFloat(String(amountRaw));
      if (isNaN(amount) || amount <= 0) return;

      console.log(`Processing Donation: ${username} - ${amount}`);

      // 1. Update Donation History
      const newDonation: Donation = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          username,
          amount,
          message,
          timestamp: Date.now(),
      };

      setDonations(prev => {
          const updated = [newDonation, ...prev].slice(0, 10);
          return updated;
      });

      // 2. Update Goal Amount
      setSettings(prev => {
          const newTotal = Number(prev.currentAmount) + amount;
          return { ...prev, currentAmount: newTotal };
      });

      // 3. Trigger Animations (Handled by the Effect below based on amount change)
  }, []);

  // --- EVENT TRIGGER EFFECT ---
  // Watches for changes in currentAmount to fire visuals
  useEffect(() => {
      const oldAmount = prevAmountRef.current;
      const newAmount = settings.currentAmount;

      // Threshold to prevent tiny float jitter triggering events, ensuring it's a real increase
      if (newAmount > oldAmount + 0.01) {
          
          // Roulette Logic
          let shouldTriggerRoulette = false;
          if (settings.enableRoulette) {
              if (settings.goalMode === GoalMode.SUBGOALS && settings.subGoalInterval > 0) {
                  const oldMilestone = Math.floor(oldAmount / settings.subGoalInterval);
                  const newMilestone = Math.floor(newAmount / settings.subGoalInterval);
                  if (newMilestone > oldMilestone) shouldTriggerRoulette = true;
              } else if (settings.goalMode === GoalMode.SIMPLE) {
                  if (newAmount >= settings.goalAmount && oldAmount < settings.goalAmount) {
                       shouldTriggerRoulette = true;
                  }
              }
          }
          if (shouldTriggerRoulette) setTimeout(() => setShowRoulette(true), 800);

          // Trail Rewards Logic
          if (settings.trailRewards && settings.trailRewards.length > 0) {
              const crossedRewards = settings.trailRewards.filter(r => 
                  oldAmount < r.amount && newAmount >= r.amount
              );
              if (crossedRewards.length > 0) {
                  const latestReward = crossedRewards[crossedRewards.length - 1];
                  setTimeout(() => setActiveReward(latestReward), 600);
              }
          }

          // Jackpot/Goal Celebration
          if (newAmount >= settings.goalAmount && oldAmount < settings.goalAmount) {
              setIsCelebration(true);
              setTimeout(() => setIsCelebration(false), 10000); 
          }
          
          // Shake
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
      }
      prevAmountRef.current = newAmount;
  }, [settings.currentAmount, settings.enableRoulette, settings.goalMode, settings.subGoalInterval, settings.goalAmount, settings.trailRewards]);

  // --- SOCKET CONNECTION ---
  // Debounce token update
  useEffect(() => {
      const handler = setTimeout(() => setDebouncedToken(settings.streamElementsToken), 1000);
      return () => clearTimeout(handler);
  }, [settings.streamElementsToken]);

  // Connect to Socket.IO
  useEffect(() => {
    const token = debouncedToken;
    
    // Safety check: if no token, disconnect
    if (!token) {
        setSocketStatus('disconnected');
        return;
    }

    // Safety check: ensure io library is loaded
    if (!(window as any).io) {
        console.error("Socket.io library not loaded via CDN");
        setSocketStatus('disconnected');
        return;
    }

    setSocketStatus('connecting');
    console.log("Attempting socket connection...");

    const socket = (window as any).io('https://realtime.streamelements.com', { transports: ['websocket'] });

    socket.on('connect', () => {
        console.log("Socket Connected");
        socket.emit('authenticate', { method: 'jwt', token });
    });

    socket.on('authenticated', () => {
        console.log("Socket Authenticated");
        setSocketStatus('connected');
    });

    socket.on('unauthorized', (data: any) => {
        console.error("Socket Auth Failed", data);
        setSocketStatus('disconnected');
    });

    socket.on('event', (data: any) => {
        console.log("Socket Event Received:", data);
        if (data.type === 'tip') {
            processNewDonation(data.data.amount, data.data.username, data.data.message || '');
        }
    });

    socket.on('disconnect', () => {
        console.log("Socket Disconnected");
        setSocketStatus('disconnected');
    });

    return () => {
        socket.disconnect();
    };
  }, [debouncedToken, processNewDonation]);

  // --- NATIVE LISTENER (For Browser Source Interactivity) ---
  useEffect(() => {
      const handleNativeEvent = (event: any) => {
          if (!event.detail || !event.detail.listener) return;
          const { listener, event: data } = event.detail;
          
          if (listener === 'tip-latest' || listener === 'tip') {
              console.log("Native Event Received:", data);
              processNewDonation(data.amount, data.name || data.username, data.message || '');
          }
      };

      window.addEventListener('onEventReceived', handleNativeEvent);
      return () => window.removeEventListener('onEventReceived', handleNativeEvent);
  }, [processNewDonation]);


  // --- UI HELPERS ---

  const handleFullReset = () => {
      if (window.confirm("Are you sure? This will reset the Current Amount to 0.")) {
          setSettings(prev => ({ ...prev, currentAmount: 0 }));
          setDonations([]);
      }
  };

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
      // 1. Save "Database" (LocalStorage)
      const settingsToSave = { ...settings, currentAmount: Number(settings.currentAmount) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave));
      localStorage.setItem(STORAGE_KEY_DONATIONS, JSON.stringify(donations));
      
      const url = new URL(window.location.href);
      url.searchParams.set('overlay', 'true');
      
      try {
          // 2. Create URL Bundle (Design + Backup Data)
          // We include everything in the URL as a backup/snapshot
          const bundle = { settings: settingsToSave, donations };
          url.searchParams.set('data', btoa(encodeURIComponent(JSON.stringify(bundle))));
      } catch (e) { console.error(e); }
      
      window.open(url.toString(), '_blank');
  };

  // --- RENDER ---

  if (isOverlayMode) {
      return (
          <div className="min-h-screen w-full overflow-hidden relative bg-transparent">
              <div 
                  className={`absolute ${getPositionClasses(settings.position)} transition-all duration-300`}
                  style={{ transform: `scale(${settings.scale})`, opacity: settings.opacity }}
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row overflow-hidden font-sans text-gray-800">
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white shadow-xl z-20 flex flex-col h-screen border-r border-gray-200">
        <div className="p-6 bg-indigo-600 text-white shadow-md">
            <h1 className="text-2xl font-bold flex items-center gap-2"><Monitor size={24} /> Widget Studio</h1>
            <p className="text-xs text-indigo-200 mt-1 opacity-80">Configure your stream overlay</p>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <SettingsPanel 
                settings={settings} 
                setSettings={setSettings} 
                onSimulateDonation={processNewDonation}
                socketStatus={socketStatus}
                onFullReset={handleFullReset}
            />
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200">
            <button onClick={handleLaunchOverlay} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md">
                <ExternalLink size={18} /> Save & Open Overlay
            </button>
            <p className="text-xs text-center text-gray-400 mt-2">Opens a transparent window for OBS</p>
        </div>
      </div>

      <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-200 flex items-center justify-center overflow-hidden p-8">
        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-gray-500 border border-gray-300">
            {settings.position} • Scale: {settings.scale}x
        </div>
        <div className={`transition-all duration-300 ease-in-out`} style={{ transform: `scale(${settings.scale})`, opacity: settings.opacity }}>
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
        <div className="absolute inset-0 pointer-events-none border-4 border-dashed border-black/5 opacity-20 m-4 rounded-3xl"></div>
      </div>
    </div>
  );
};

export default App;