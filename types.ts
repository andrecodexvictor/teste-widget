
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

export enum GoalMode {
  SIMPLE = 'simple',
  SUBGOALS = 'subgoals', // "Escadinha"
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

  // Roulette / Events
  enableRoulette: boolean;
  rouletteEvents: string[]; // List of events for the wheel
}

export const DEFAULT_SETTINGS: WidgetSettings = {
  theme: ThemeMode.KAWAII,
  style: WidgetStyle.STANDARD,
  goalMode: GoalMode.SUBGOALS,
  goalAmount: 500,
  currentAmount: 120,
  subGoalInterval: 100,
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
  
  enableRoulette: true,
  rouletteEvents: [
    "ASMR Stream", 
    "Cosplay", 
    "Horror Game", 
    "Karaoke", 
    "Giveaway", 
    "Chat Picks Game"
  ]
};
