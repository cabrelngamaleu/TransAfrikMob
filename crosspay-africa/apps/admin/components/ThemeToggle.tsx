import React from 'react';
import { IconButton, IconButtonProps, useColorModeValue } from '@chakra-ui/react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

// Création d'un bouton Chakra animé avec Framer Motion
const MotionIconButton = motion(IconButton);

interface ThemeToggleProps extends Omit<IconButtonProps, 'aria-label'> {}

const ThemeToggle: React.FC<ThemeToggleProps> = (props) => {
  const { colorMode, toggleColorMode } = useTheme();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <MotionIconButton
        aria-label={`Passer au mode ${colorMode === 'light' ? 'sombre' : 'clair'}`}
        icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
        onClick={toggleColorMode}
        variant="ghost"
        key={colorMode}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.2 }}
        {...props}
      />
    </AnimatePresence>
  );
};

export default ThemeToggle;