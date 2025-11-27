import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WidgetSettings, DEFAULT_SETTINGS, Donation, ThemeMode, WidgetPosition, GoalMode, StreamElementsEvent, TrailReward } from './types';
import { KawaiiWidget } from './components/KawaiiWidget';
import { SettingsPanel } from './components/SettingsPanel';
import { RefreshCw, Monitor, Heart, ExternalLink, Save } from 'lucide-react';

const STORAGE_KEY = 'kawaii-widget-settings';
const STORAGE_KEY_DONATIONS = 'kawaii-widget-donations';

const App: React.FC = () => {
  
  // Helper to parse URL data
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

  // Initialize settings with STRICT PRIORITY Logic
  // URL = Source of Design (Colors, Title, Fonts, Goal Target)
  // LocalStorage = Source of Progress (Current Amount)
  const [settings, setSettings] = useState<WidgetSettings>(() => {
    // 1. Start with Defaults
    let baseSettings = { ...DEFAULT_SETTINGS };

    // 2. Apply URL Config (Design & Static settings)
    if (urlData) {
        if (urlData.settings) {
            baseSettings = { ...baseSettings, ...urlData.settings };
        } else if (urlData.theme) {
            // Support legacy format
            baseSettings = { ...baseSettings, ...urlData };
        }
    }

    // 3. Apply LocalStorage (Progress persistence)
    // This step is CRITICAL: We overwrite 'currentAmount' from the local save
    // ignoring whatever 'currentAmount' is in the static URL.
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const localData = JSON.parse(saved);
            
            // Check if we have valid progress data locally
            if (localData.currentAmount !== undefined && !isNaN(Number(localData.currentAmount))) {
                console.log("Restoring progress from LocalStorage:", localData.currentAmount);
                baseSettings.currentAmount = Number(localData.currentAmount);
            }
            
            // We usually want to trust the URL for the Goal Amount (so user can update target in editor),
            // but we trust LocalStorage for the Current Amount (so donations persist).
        }
    } catch (e) { console.error("Error loading settings from local storage", e); }

    return baseSettings;
  });

  // Initialize Donations (Strict Priority: LocalStorage > URL > Default)
  const [donations, setDonations] = useState<Donation[]>(() => {
      // 1. Try LocalStorage (The absolute truth for history)
      try {
          const saved = localStorage.getItem(STORAGE_KEY_DONATIONS);
          if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                  return parsed;
              }
          }
      } catch (error) { console.error(error); }

      // 2. Fallback to URL Data (Snapshot)
      if (urlData && urlData.donations && urlData.donations.length > 0) {
          return urlData.donations;
      }

      // 3. Fallback to Empty (if Overlay) or Mock (if Editor)
      const params = new URLSearchParams(window.location.search);
      if (params.get('overlay') === 'true') return []; 

      return [
        { id: '1', username: 'NekoChan99', amount: 50, message: 'Keep it up!', timestamp: Date.now() },
        { id: '2', username: 'MarioFan', amount: 20, message: 'Here we go!', timestamp: Date.now() - 10000 },
        { id: '3', username: 'CyberPunk', amount: 100, message: 'Neon vibes only.', timestamp: Date.now() - 20000 },
      ];
  });

  const [isShaking, setIsShaking] = useState(false);
  const [isCelebration, setIsCelebration] = useState(false);
  const [showRoulette, setShowRoulette] = useState(false);
  const [activeReward, setActiveReward] = useState<TrailReward | null>(null);
  const [socketStatus, setSocketStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [debouncedToken, setDebouncedToken] = useState(settings.streamElementsToken);
  const [isOverlayMode, setIsOverlayMode] = useState(false);

  // Ref to track previous amount for triggering events on change
  const prevAmountRef = useRef(settings.currentAmount);

  // Check Overlay Mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('overlay') === 'true') {
        setIsOverlayMode(true);
        document.body.style.backgroundColor = 'transparent';
    }
  }, []);

  // Persistence to LocalStorage (Always runs on every change)
  useEffect(() => { 
      // Important: Save the *current* state to local storage so it survives refresh
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); 
  }, [settings]);
  
  useEffect(() => { 
      localStorage.setItem(STORAGE_KEY_DONATIONS, JSON.stringify(donations)); 
  }, [donations]);

  // Live URL Update (Optional UX for manual refresh, doesn't affect OBS static source)
  useEffect(() => {
      if (isOverlayMode) {
          try {
              const url = new URL(window.location.href);
              const bundle = { settings, donations };
              const encodedBundle = btoa(encodeURIComponent(JSON.stringify(bundle)));
              url.searchParams.set('data', encodedBundle);
              window.history.replaceState(null, '', url.toString());
          } catch (e) { console.error(e); }
      }
  }, [settings, donations, isOverlayMode]);

  // Sync across tabs/windows via LocalStorage Events
  useEffect(() => {
      const handleStorageChange = (e: StorageEvent) => {
          if (e.key === STORAGE_KEY && e.newValue) {
              try { setSettings(JSON.parse(e.newValue)); } catch (e) { console.error(e); }
          }
          if (e.key === STORAGE_KEY_DONATIONS && e.newValue) {
              try { setDonations(JSON.parse(e.newValue)); } catch (e) { console.error(e); }
          }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // --- CENTRAL EVENT TRIGGER LOGIC ---
  useEffect(() => {
      const oldAmount = prevAmountRef.current;
      const newAmount = settings.currentAmount;

      if (newAmount > oldAmount) {
          // 1. Roulette Logic
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

          // 2. Trail Rewards Logic
          if (settings.trailRewards && settings.trailRewards.length > 0) {
              const crossedRewards = settings.trailRewards.filter(r => 
                  oldAmount < r.amount && newAmount >= r.amount
              );
              if (crossedRewards.length > 0) {
                  const latestReward = crossedRewards[crossedRewards.length - 1];
                  setTimeout(() => setActiveReward(latestReward), 600);
              }
          }

          // 3. Grand Celebration
          if (newAmount >= settings.goalAmount && oldAmount < settings.goalAmount) {
              setIsCelebration(true);
              setTimeout(() => setIsCelebration(false), 10000); 
          }
          
          // 4. Shake
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
      }
      prevAmountRef.current = newAmount;
  }, [settings.currentAmount, settings.enableRoulette, settings.goalMode, settings.subGoalInterval, settings.goalAmount, settings.trailRewards]);


  // Socket Debounce
  useEffect(() => {
      const handler = setTimeout(() => setDebouncedToken(settings.streamElementsToken), 1000);
      return () => clearTimeout(handler);
  }, [settings.streamElementsToken]);

  // Reset Handler (Danger Zone)
  const handleFullReset = () => {
      if (window.confirm("Are you sure? This will reset the Current Amount to 0 and clear the Donation History.")) {
          // We update state, which triggers useEffect, which updates LocalStorage
          setSettings(prev => ({ ...prev, currentAmount: 0 }));
          setDonations([]);
      }
  };

  // Add Donation Logic (Updates State -> Triggers Effect -> Saves to LS)
  const simulateDonation = useCallback((amountRaw: number | string, username: string, message: string) => {
    // SECURITY: Force number conversion
    const amount = parseFloat(String(amountRaw));
    if (isNaN(amount)) return;

    const newDonation: Donation = {
      id: Date.now().toString(),
      username,
      amount,
      message,
      timestamp: Date.now(),
    };

    setDonations(prev => [newDonation, ...prev].slice(0, 10));
    setSettings(prev => ({ ...prev, currentAmount: Number(prev.currentAmount) + amount }));
  }, []);

  // --- NATIVE STREAMELEMENTS EVENT LISTENER ---
  useEffect(() => {
      const handleNativeEvent = (event: any) => {
          if (!event.detail || !event.detail.listener) return;
          const { listener, event: data } = event.detail;
          
          if (listener === 'tip-latest' || listener === 'tip') {
              simulateDonation(data.amount, data.name || data.username, data.message || '');
          }
      };

      window.addEventListener('onEventReceived', handleNativeEvent);
      return () => window.removeEventListener('onEventReceived', handleNativeEvent);
  }, [simulateDonation]);

  // --- SOCKET.IO CONNECTION ---
  useEffect(() => {
    const token = debouncedToken;
    if (!token || !(window as any).io) {
        setSocketStatus('disconnected');
        return;
    }
    setSocketStatus('connecting');
    const socket = (window as any).io('https://realtime.streamelements.com', { transports: ['websocket'] });

    socket.on('connect', () => socket.emit('authenticate', { method: 'jwt', token }));
    socket.on('authenticated', () => setSocketStatus('connected'));
    socket.on('unauthorized', () => setSocketStatus('disconnected'));
    socket.on('event', (data: any) => {
        if (data.type === 'tip') simulateDonation(data.data.amount, data.data.username, data.data.message || '');
    });
    socket.on('disconnect', () => setSocketStatus('disconnected'));

    return () => socket.disconnect();
  }, [debouncedToken, simulateDonation]);

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
      const settingsToSave = { ...settings, currentAmount: Number(settings.currentAmount) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave));
      localStorage.setItem(STORAGE_KEY_DONATIONS, JSON.stringify(donations));
      
      const url = new URL(window.location.href);
      url.searchParams.set('overlay', 'true');
      try {
          const bundle = { settings: settingsToSave, donations };
          url.searchParams.set('data', btoa(encodeURIComponent(JSON.stringify(bundle))));
      } catch (e) { console.error(e); }
      window.open(url.toString(), '_blank');
  };

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
                onSimulateDonation={simulateDonation}
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