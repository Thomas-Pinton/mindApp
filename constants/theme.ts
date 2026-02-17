/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Semantic tokens
    cardBackground: '#f8f9fa',
    cardBorder: '#e9ecef',
    textPrimary: '#11181C',
    textSecondary: '#687076',
    textTertiary: '#8D969E',
    iconPrimary: '#11181C',
    iconSecondary: '#687076',
    iconTertiary: '#8D969E',
    inputBackground: '#f1f3f5',
    primaryButton: '#0a7ea4',
    deleteIcon: '#dc3545',
    successIcon: '#28a745',
    savedIcon: '#e0a800',
    shadow: '#000',
    cancelIcon: '#888',
    snackbarBackground: '#1e1e1e', // Dark background for contrast in light mode
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Semantic tokens
    cardBackground: 'rgba(255, 255, 255, 0.08)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#ECEDEE',
    textSecondary: 'rgba(255, 255, 255, 0.9)',
    textTertiary: 'rgba(255, 255, 255, 0.6)',
    iconPrimary: '#ECEDEE',
    iconSecondary: 'rgba(255, 255, 255, 0.7)',
    iconTertiary: 'rgba(255, 255, 255, 0.5)',
    inputBackground: 'rgba(0, 0, 0, 0.2)',
    primaryButton: '#0a7ea4',
    deleteIcon: '#ff6b6b',
    successIcon: '#0a7ea4',
    savedIcon: '#ffd700',
    shadow: '#000',
    cancelIcon: '#888',
    snackbarBackground: '#333',
  },
};

export const ColorPalette = [
  '#0a7ea4', // Blue (Default)
  '#9b59b6', // Purple
  '#2ecc71', // Green
  '#e67e22', // Orange
  '#e91e63', // Pink
  '#1abc9c', // Teal
];

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
