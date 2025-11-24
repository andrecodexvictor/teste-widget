

export enum ThemeMode {
  KAWAII = 'kawaii',
  MARIO = 'mario',
  NEON = 'neon',
}

export enum WidgetPosition {
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right',
  CENTER_TOP = 'center-top',
  CENTER_BOTTOM = 'center-bottom',
}

export enum WidgetStyle {
  STANDARD = 'standard', // Card box, fixed mascot
  COMPACT = 'compact',   // Transparent, mascot walks on bar
}

export enum MascotType {
  CAT_GAMER = 'cat-gamer',
  SHIBA = 'shiba',
  LUMA = 'luma',
  ROBOT = 'robot',
  BUNNY = 'bunny',
  GHOST = 'ghost',
  SLIME = 'slime',
  AXOLOTL = 'axolotl',
  DRAGON = 'dragon',
}

export enum MascotReaction {
  HAPPY = 'happy',     // Standard smile
  LOVE = 'love',       // Heart eyes
  SHOCKED = 'shocked', // Big eyes/mouth
  COOL = 'cool',       // Sunglasses
  CRYING = 'crying',   // Tears of joy
  ANGRY = 'angry',     // Determined/Hype
}

export enum GoalMode {
  SIMPLE = 'simple',
  SUBGOALS = 'subgoals', // "Escadinha"
}

export enum CompactTitleAlign {
    LEFT = 'left',
    RIGHT = 'right',
}

export interface Donation {
  id: string;
  username: string;
  amount: number;
  message: string;
  timestamp: number;
}

export interface WidgetSettings {
  theme: ThemeMode;
  style: WidgetStyle;
  
  // Goal Logic
  goalMode: GoalMode;
  goalAmount: number;
  currentAmount: number;
  subGoalInterval: number; // e.g., Every 100 triggers an event
  goalStartDate: string;
  goalEndDate: string;
  
  // Visuals
  currency: string;
  title: string;
  mascot: MascotType;
  primaryColor: string;
  secondaryColor: string;
  showRecentDonations: boolean;
  showTopDonor: boolean;
  opacity: number;
  scale: number; // Widget scale
  mascotScale: number; // Mascot specific scale
  position: WidgetPosition;
  reactionType: MascotReaction; // Type of face on donation
  useCustomBarColor: boolean;
  customBarColor: string;
  compactTitleAlign: CompactTitleAlign;
  compactWidth: number; // New: Width control for compact mode
  
  // Title Customization
  titleFontSize: number;
  compactTitleOffset: number; // Vertical move
  useCustomTitleColor: boolean;
  customTitleColor: string;

  // Roulette / Events
  enableRoulette: boolean;
  rouletteEvents: string[]; // List of events for the wheel

  // Integrations
  streamElementsToken: string;
  livePixKey: string;
}

export const DEFAULT_SETTINGS: WidgetSettings = {
  theme: ThemeMode.KAWAII,
  style: WidgetStyle.STANDARD,
  goalMode: GoalMode.SUBGOALS,
  goalAmount: 500,
  currentAmount: 120,
  subGoalInterval: 100,
  goalStartDate: '',
  goalEndDate: '',
  currency: 'R$',
  title: 'Monthly Goal',
  mascot: MascotType.CAT_GAMER,
  primaryColor: '#FFB7C5', // Sakura Pink
  secondaryColor: '#E0F7FA', // Pastel Blue
  showRecentDonations: true,
  showTopDonor: true,
  opacity: 0.95,
  scale: 1,
  mascotScale: 1,
  position: WidgetPosition.CENTER_BOTTOM,
  reactionType: MascotReaction.HAPPY,
  useCustomBarColor: false,
  customBarColor: '#4ade80',
  compactTitleAlign: CompactTitleAlign.LEFT,
  compactWidth: 400, // Default width
  
  titleFontSize: 14,
  compactTitleOffset: 0,
  useCustomTitleColor: false,
  customTitleColor: '#ffffff',
  
  enableRoulette: true,
  rouletteEvents: [
    "ASMR Stream", 
    "Cosplay", 
    "Horror Game", 
    "Karaoke", 
    "Giveaway", 
    "Chat Picks Game"
  ],

  streamElementsToken: '',
  livePixKey: ''
};

// --- StreamElements Interfaces ---

export interface StreamElementsEventDetail {
  listener: string;
  event: {
    name?: string;
    amount?: number;
    message?: string;
    username?: string;
    type?: string;
    gifted?: boolean;
    sender?: string;
    bulkGifted?: boolean;
    isCommunityGift?: boolean;
    playedAsCommunityGift?: boolean;
  };
}

export interface StreamElementsEvent {
  detail: StreamElementsEventDetail;
}