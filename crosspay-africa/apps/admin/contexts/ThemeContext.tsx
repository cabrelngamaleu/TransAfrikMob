import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider as ChakraThemeProvider, ColorModeProvider, useColorMode } from '@chakra-ui/react';

type ThemeContextType = {
  colorMode: string;
  toggleColorMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  // Effet pour charger la préférence de thème depuis le localStorage au démarrage
  useEffect(() => {
    const savedTheme = localStorage.getItem('colorMode');
    if (savedTheme && savedTheme !== colorMode) {
      toggleColorMode();
    }
  }, []);

  // Effet pour sauvegarder la préférence de thème dans le localStorage
  useEffect(() => {
    localStorage.setItem('colorMode', colorMode);
  }, [colorMode]);

  return (
    <ThemeContext.Provider value={{ colorMode, toggleColorMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};