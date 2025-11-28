import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WidgetSettings, DEFAULT_SETTINGS, Donation, ThemeMode, WidgetPosition, GoalMode, StreamElementsEvent, TrailReward } from './types';
import { KawaiiWidget } from './components/KawaiiWidget';
import { SettingsPanel } from './components/SettingsPanel';
import { RefreshCw, Monitor, Heart, ExternalLink, Save } from 'lucide-react';
import { getOrCreateSessionId, syncToBackend, fetchFromBackend } from './sessionUtils';

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

    // Initialize settings
    const [settings, setSettings] = useState<WidgetSettings>(() => {
        // 1. Check URL Data
        if (urlData) {
            if (urlData.settings) return { ...DEFAULT_SETTINGS, ...urlData.settings };
            if (urlData.theme) return { ...DEFAULT_SETTINGS, ...urlData };
        }
        // 2. Check LocalStorage
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        } catch (e) { console.error(e); }

        return DEFAULT_SETTINGS;
    });

    // Initialize Donations
    const [donations, setDonations] = useState<Donation[]>(() => {
        if (urlData && urlData.donations) return urlData.donations;
        try {
            const saved = localStorage.getItem(STORAGE_KEY_DONATIONS);
            if (saved) return JSON.parse(saved);
            // Default mock data
            return [
                { id: '1', username: 'NekoChan99', amount: 50, message: 'Keep it up!', timestamp: Date.now() },
                { id: '2', username: 'MarioFan', amount: 20, message: 'Here we go!', timestamp: Date.now() - 10000 },
                { id: '3', username: 'CyberPunk', amount: 100, message: 'Neon vibes only.', timestamp: Date.now() - 20000 },
            ];
        } catch (error) { return []; }
    });

    const [isShaking, setIsShaking] = useState(false);
    const [isCelebration, setIsCelebration] = useState(false);
    const [showRoulette, setShowRoulette] = useState(false);
    const [activeReward, setActiveReward] = useState<TrailReward | null>(null);
    // Track connection status for each provider independently
    const [seSocketStatus, setSeSocketStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [lpSocketStatus, setLpSocketStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    // Derived global status for the UI
    const socketStatus = (seSocketStatus === 'connected' || lpSocketStatus === 'connected')
        ? 'connected'
        : (seSocketStatus === 'connecting' || lpSocketStatus === 'connecting')
            ? 'connecting'
            : 'disconnected';

    const [debouncedToken, setDebouncedToken] = useState(settings.streamElementsToken);
    const [debouncedLivePixKey, setDebouncedLivePixKey] = useState(settings.livePixKey);
    const [isOverlayMode, setIsOverlayMode] = useState(false);
    const [sessionId, setSessionId] = useState<string>('');
    const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('offline');

    // Ref to track previous amount for triggering events on change
    const prevAmountRef = useRef(settings.currentAmount);

    // Initialize Session ID and Overlay Mode
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlSessionId = params.get('sessionId');

        if (urlSessionId) {
            // Overlay mode - use sessionId from URL
            setSessionId(urlSessionId);
            setIsOverlayMode(params.get('overlay') === 'true');
            if (params.get('overlay') === 'true') {
                document.body.style.backgroundColor = 'transparent';
            }
        } else {
            // Editor mode - get or create sessionId
            const storedSessionId = getOrCreateSessionId();
            setSessionId(storedSessionId);
        }
    }, []);

    // Local Persistence (Backup)
    useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); }, [settings]);
    useEffect(() => { localStorage.setItem(STORAGE_KEY_DONATIONS, JSON.stringify(donations)); }, [donations]);

    // Backend Sync (Editor Mode Only)
    useEffect(() => {
        if (!sessionId || isOverlayMode) return;

        const syncData = async () => {
            try {
                setSyncStatus('syncing');
                const success = await syncToBackend(sessionId, settings, donations);
                setSyncStatus(success ? 'synced' : 'offline');
            } catch (error) {
                console.error('Sync error:', error);
                setSyncStatus('offline');
            }
        };

        const debounceTimer = setTimeout(syncData, 500);
        return () => clearTimeout(debounceTimer);
    }, [settings, donations, sessionId, isOverlayMode]);

    // Polling in Overlay Mode
    useEffect(() => {
        if (!isOverlayMode || !sessionId) return;

        const fetchData = async () => {
            try {
                const data = await fetchFromBackend(sessionId);
                if (data) {
                    if (data.settings) setSettings(prev => ({ ...DEFAULT_SETTINGS, ...data.settings }));
                    if (data.donations) setDonations(data.donations);
                    setSyncStatus('synced');
                } else {
                    setSyncStatus('offline');
                }
            } catch (error) {
                console.error('Fetch error:', error);
                setSyncStatus('offline');
            }
        };

        // Initial fetch
        fetchData();

        // Poll every 3 seconds
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, [isOverlayMode, sessionId]);

    // Sync across tabs/windows via LocalStorage
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
    // This effect watches `settings.currentAmount` and fires animations if milestones are crossed.
    // It works in both Editor and Overlay because `settings` is synced.
    useEffect(() => {
        const oldAmount = prevAmountRef.current;
        const newAmount = settings.currentAmount;

        // Only trigger if amount INCREASED (don't trigger on reset or initial load if equal)
        if (newAmount > oldAmount) {

            // 1. Roulette Logic
            let shouldTriggerRoulette = false;
            if (settings.enableRoulette) {
                if (settings.goalMode === GoalMode.SUBGOALS && settings.subGoalInterval > 0) {
                    const oldMilestone = Math.floor(oldAmount / settings.subGoalInterval);
                    const newMilestone = Math.floor(newAmount / settings.subGoalInterval);
                    if (newMilestone > oldMilestone) shouldTriggerRoulette = true;
                } else if (settings.goalMode === GoalMode.SIMPLE) {
                    // Trigger only when goal is FIRST reached
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

            // 3. Grand Celebration (Jackpot/Goal Reached)
            if (newAmount >= settings.goalAmount && oldAmount < settings.goalAmount) {
                setIsCelebration(true);
                // Celebration lasts longer
                setTimeout(() => setIsCelebration(false), 10000);
            }

            // 4. Shake Effect (Always on donation)
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
        }

        // Update ref for next change
        prevAmountRef.current = newAmount;
    }, [settings.currentAmount, settings.enableRoulette, settings.goalMode, settings.subGoalInterval, settings.goalAmount, settings.trailRewards]);


    // Socket Debounce
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedToken(settings.streamElementsToken), 1000);
        return () => clearTimeout(handler);
    }, [settings.streamElementsToken]);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedLivePixKey(settings.livePixKey), 1000);
        return () => clearTimeout(handler);
    }, [settings.livePixKey]);

    // Reset Handler
    const handleFullReset = () => {
        if (window.confirm("Are you sure? This will reset the Current Amount to 0 and clear the Donation History.")) {
            setSettings(prev => ({ ...prev, currentAmount: 0 }));
            setDonations([]);
        }
    };

    // Add Donation (Update State Only - Logic is handled by Effect above)
    const simulateDonation = useCallback((amount: number, username: string, message: string) => {
        const newDonation: Donation = {
            id: Date.now().toString(),
            username,
            amount,
            message,
            timestamp: Date.now(),
        };

        setDonations(prev => [newDonation, ...prev].slice(0, 10));
        setSettings(prev => ({ ...prev, currentAmount: prev.currentAmount + amount }));
    }, []);

    // --- Socket Logic ---
    // Memoized callback handlers to prevent infinite loop in RouletteWheel useEffect
    const handleRouletteComplete = useCallback(() => {
        console.log('[APP] Roulette complete, closing...');
        setShowRoulette(false);
    }, []);

    const handleRewardComplete = useCallback(() => {
        console.log('[APP] Reward complete, closing...');
        setActiveReward(null);
    }, []);

    // --- Socket Logic (StreamElements) ---
    useEffect(() => {
        const token = debouncedToken;
        if (!token || !(window as any).io) {
            setSeSocketStatus('disconnected');
            return;
        }

        setSeSocketStatus('connecting');

        const socket = (window as any).io('https://realtime.streamelements.com', { transports: ['websocket'] });

        socket.on('connect', () => socket.emit('authenticate', { method: 'jwt', token }));
        socket.on('authenticated', () => setSeSocketStatus('connected'));
        socket.on('unauthorized', () => setSeSocketStatus('disconnected'));
        socket.on('event', (data: any) => {
            if (data.type === 'tip') simulateDonation(data.data.amount, data.data.username, data.data.message || '');
        });
        socket.on('disconnect', () => setSeSocketStatus('disconnected'));

        return () => socket.disconnect();
    }, [debouncedToken, simulateDonation]);

    // --- Socket Logic (LivePix) ---
    useEffect(() => {
        const keyOrUrl = debouncedLivePixKey;
        if (!keyOrUrl || !(window as any).io) {
             setLpSocketStatus('disconnected');
             return;
        }

        let widgetId = keyOrUrl;
        // Try to parse URL if it is one
        if (keyOrUrl.includes('livepix.gg')) {
            const match = keyOrUrl.match(/alert\/([a-zA-Z0-9-]+)/);
            if (match && match[1]) {
                widgetId = match[1];
            }
        }

        console.log('[LivePix] Connecting with ID:', widgetId);
        setLpSocketStatus('connecting');

        // Note: Using the generic socket.io connection logic for LivePix based on community patterns
        // Usually LivePix widgets use a socket connection to listen for events.
        const socket = (window as any).io('https://socket.livepix.gg', {
            transports: ['websocket'],
            query: {
                widgetId: widgetId
            }
        });

        socket.on('connect', () => {
            console.log('[LivePix] Connected');
            setLpSocketStatus('connected');
        });

        socket.on('donation', (data: any) => {
            console.log('[LivePix] Donation received:', data);
            // Verify payload structure (common structure)
            const amount = parseFloat(data.amount || 0);
            const username = data.username || 'Anonymous';
            const message = data.message || '';

            if (amount > 0) {
                simulateDonation(amount, username, message);
            }
        });

        socket.on('disconnect', () => {
            console.log('[LivePix] Disconnected');
            setLpSocketStatus('disconnected');
        });

        return () => socket.disconnect();
    }, [debouncedLivePixKey, simulateDonation]);

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

    const handleLaunchOverlay = async () => {
        if (!sessionId) return;

        // Ensure data is synced before opening overlay
        try {
            await syncToBackend(sessionId, settings, donations);
        } catch (e) {
            console.error('Failed to sync before opening overlay:', e);
        }

        const url = new URL(window.location.href);
        url.searchParams.set('overlay', 'true');
        url.searchParams.set('sessionId', sessionId);
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
                        onRouletteComplete={handleRouletteComplete}
                        activeReward={activeReward}
                        onRewardComplete={handleRewardComplete}
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
                <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Sync Status:</span>
                        <span className={`font-semibold ${syncStatus === 'synced' ? 'text-green-600' :
                            syncStatus === 'syncing' ? 'text-yellow-600' :
                                'text-red-600'
                            }`}>
                            {syncStatus === 'synced' ? '✓ Synced' :
                                syncStatus === 'syncing' ? '⟳ Syncing...' :
                                    '✗ Offline'}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 truncate">
                        Session: {sessionId.substring(0, 20)}...
                    </div>
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
                        onRouletteComplete={handleRouletteComplete}
                        activeReward={activeReward}
                        onRewardComplete={handleRewardComplete}
                    />
                </div>
                <div className="absolute inset-0 pointer-events-none border-4 border-dashed border-black/5 opacity-20 m-4 rounded-3xl"></div>
            </div>
        </div>
    );
};
//comentario
export default App;

