import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Composant de test
const TestComponent = () => {
  const { user, isAuthenticated } = useAuth();
  return (
    <div>
      <div>{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      {user && <div>User: {user.email}</div>}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should provide authentication state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Not Authenticated')).toBeInTheDocument();
  });

  it('should load user from localStorage', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Authenticated')).toBeInTheDocument();
      expect(screen.getByText(`User: ${mockUser.email}`)).toBeInTheDocument();
    });
  });

  it('should handle logout', async () => {
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify({ email: 'test@example.com' }));

    const LogoutComponent = () => {
      const { logout } = useAuth();
      return <button onClick={logout}>Logout</button>;
    };

    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
        <LogoutComponent />
      </AuthProvider>
    );

    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    rerender(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});
