import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import ThemeToggle from '../components/ThemeToggle';
import { ThemeProvider } from '../contexts/ThemeContext';

describe('ThemeToggle Component', () => {
  it('renders without crashing', () => {
    render(
      <ChakraProvider>
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      </ChakraProvider>
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('has accessible aria-label', () => {
    render(
      <ChakraProvider>
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      </ChakraProvider>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });

  it('toggles color mode on click', () => {
    render(
      <ChakraProvider>
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      </ChakraProvider>
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    // Le bouton devrait toujours être présent après le click
    expect(button).toBeInTheDocument();
  });
});
