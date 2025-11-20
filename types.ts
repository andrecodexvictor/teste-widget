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

export enum MascotType {
  CAT_GAMER = 'cat-gamer',
  SHIBA = 'shiba',
  LUMA = 'luma',
  ROBOT = 'robot',
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
  goalAmount: number;
  currentAmount: number;
  currency: string;
  title: string;
  mascot: MascotType;
  primaryColor: string;
  secondaryColor: string;
  showRecentDonations: boolean;
  showTopDonor: boolean;
  opacity: number;
  scale: number; // 0.5 to 1.5
  position: WidgetPosition;
}

export const DEFAULT_SETTINGS: WidgetSettings = {
  theme: ThemeMode.KAWAII,
  goalAmount: 500,
  currentAmount: 120,
  currency: 'R$',
  title: 'Monthly Goal',
  mascot: MascotType.CAT_GAMER,
  primaryColor: '#FFB7C5', // Sakura Pink
  secondaryColor: '#E0F7FA', // Pastel Blue
  showRecentDonations: true,
  showTopDonor: true,
  opacity: 0.95,
  scale: 1,
  position: WidgetPosition.CENTER_BOTTOM,
};