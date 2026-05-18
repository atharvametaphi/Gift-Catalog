import React, { createContext, useContext, ReactNode } from 'react';

interface ThemeContextType {
  colors: {
    background: string;
    cardBg: string;
    sidebarBg: string;
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    accent: {
      gold: string;
      goldDark: string;
      goldLight: string;
    };
    border: string;
    hover: string;
  };
}

const lightTheme = {
  background: '#FAF8F5',
  cardBg: '#FFFFFF',
  sidebarBg: '#F5F2ED',
  text: {
    primary: '#1A1A1A',
    secondary: '#5A5A5A',
    tertiary: '#8A8A8A',
  },
  accent: {
    gold: '#E52938',
    goldDark: '#C71F2D',
    goldLight: '#EE4450',
  },
  border: '#E8E4DC',
  hover: '#F9F6F0',
};

const defaultThemeValue: ThemeContextType = {
  colors: {
    background: '#FAF8F5',
    cardBg: '#FFFFFF',
    sidebarBg: '#F5F2ED',
    text: {
      primary: '#1A1A1A',
      secondary: '#5A5A5A',
      tertiary: '#8A8A8A',
    },
    accent: {
      gold: '#E52938',
      goldDark: '#C71F2D',
      goldLight: '#EE4450',
    },
    border: '#E8E4DC',
    hover: '#F9F6F0',
  }
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeValue);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ colors: lightTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
