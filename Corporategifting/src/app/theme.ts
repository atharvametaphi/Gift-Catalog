export const luxuryTheme = {
  light: {
    background: '#FAF8F5',
    cardBg: '#FFFFFF',
    sidebarBg: '#F5F2ED',
    text: {
      primary: '#1A1A1A',
      secondary: '#5A5A5A',
      tertiary: '#8A8A8A',
    },
    accent: {
      gold: '#C9A961',
      goldDark: '#B4924E',
      goldLight: '#D4B76F',
    },
    border: '#E8E4DC',
    hover: '#F9F6F0',
  },
  dark: {
    background: '#1A1F2E',
    cardBg: '#F5F2ED',
    sidebarBg: '#0F1419',
    text: {
      primary: '#F5F2ED',
      secondary: '#C4C0B8',
      tertiary: '#9A968E',
    },
    accent: {
      gold: '#D4AF37',
      goldDark: '#C9A961',
      goldLight: '#E5C158',
    },
    border: '#2A3244',
    hover: '#252D3F',
  },
};

export type Theme = 'light' | 'dark';
