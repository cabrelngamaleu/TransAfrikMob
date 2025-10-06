import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import AnimatedButton from '../components/AnimatedButton';

describe('AnimatedButton Component', () => {
  it('renders without crashing', () => {
    render(
      <ChakraProvider>
        <AnimatedButton>Click me</AnimatedButton>
      </ChakraProvider>
    );
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <ChakraProvider>
        <AnimatedButton>Test Button</AnimatedButton>
      </ChakraProvider>
    );
    expect(screen.getByRole('button')).toHaveTextContent('Test Button');
  });

  it('accepts custom props', () => {
    render(
      <ChakraProvider>
        <AnimatedButton colorScheme="blue" size="lg">
          Large Button
        </AnimatedButton>
      </ChakraProvider>
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});
