import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ChakraProvider } from '@chakra-ui/react';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    route: '/',
    pathname: '',
    query: {},
    asPath: '',
    push: jest.fn(),
  }),
}));

// Mock AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { name: 'Test User' },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Mock ThemeContext
jest.mock('../contexts/ThemeContext', () => ({
  useTheme: jest.fn().mockReturnValue({
    colorMode: 'light',
    toggleColorMode: jest.fn(),
  }),
}));

describe('Layout Component', () => {
  it('renders without crashing', () => {
    render(
      <ChakraProvider>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </ChakraProvider>
    );
    
    // Basic assertion to check if the component renders
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});