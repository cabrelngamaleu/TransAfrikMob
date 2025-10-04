import React from 'react';
import { Button, ButtonProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';

// Création d'un bouton Chakra animé avec Framer Motion
const MotionButton = motion(Button);

interface AnimatedButtonProps extends ButtonProps {}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ children, ...props }) => {
  return (
    <MotionButton
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </MotionButton>
  );
};

export default AnimatedButton;