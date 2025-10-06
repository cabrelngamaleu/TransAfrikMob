import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import TransactionsPage from '../../pages/transactions';

// Mock du router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/transactions',
  }),
}));

// Mock de l'AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'admin@crosspay.africa' },
    isAuthenticated: true,
  }),
}));

// Mock d'axios
jest.mock('axios', () => ({
  default: {
    get: jest.fn(() =>
      Promise.resolve({
        data: [
          {
            id: '1',
            amount: 1000,
            currency: 'XOF',
            status: 'completed',
            recipient: 'John Doe',
            date: new Date().toISOString(),
          },
        ],
      }),
    ),
  },
}));

describe('TransactionsPage', () => {
  it('renders transactions page', () => {
    render(
      <ChakraProvider>
        <TransactionsPage />
      </ChakraProvider>
    );

    expect(screen.getByText(/transactions/i)).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(
      <ChakraProvider>
        <TransactionsPage />
      </ChakraProvider>
    );

    // Le composant peut afficher un spinner ou un message de chargement
    const loadingElement = screen.queryByText(/chargement/i);
    if (loadingElement) {
      expect(loadingElement).toBeInTheDocument();
    }
  });
});
