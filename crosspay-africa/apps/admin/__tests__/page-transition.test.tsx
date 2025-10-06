import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import PageTransition from '../components/PageTransition';

describe('PageTransition Component', () => {
  it('renders without crashing', () => {
    render(
      <ChakraProvider>
        <PageTransition>
          <div>Test Content</div>
        </PageTransition>
      </ChakraProvider>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('wraps children in motion div', () => {
    const { container } = render(
      <ChakraProvider>
        <PageTransition>
          <p>Animated Content</p>
        </PageTransition>
      </ChakraProvider>
    );
    expect(container.querySelector('p')).toHaveTextContent('Animated Content');
  });
});
