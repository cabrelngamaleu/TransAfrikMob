import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkUserLoggedIn = async () => {
      try {
        // Simuler une vérification d'authentification
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          // Dans un cas réel, vous feriez une requête API pour valider le token
          // et récupérer les informations de l'utilisateur
          setUser({
            id: '1',
            email: 'admin@crosspay.africa',
            name: 'Admin',
            role: 'admin',
          });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simuler une requête d'authentification
      // Dans un cas réel, vous feriez une requête API pour authentifier l'utilisateur
      if (email === 'admin@crosspay.africa' && password === 'password') {
        const user = {
          id: '1',
          email,
          name: 'Admin',
          role: 'admin',
        };
        
        // Stocker le token d'authentification
        localStorage.setItem('auth_token', 'fake_token_for_demo');
        setUser(user);
        
        // Forcer la redirection avec un délai pour s'assurer que les données sont enregistrées
        setTimeout(() => {
          window.location.replace('/');
        }, 500);
        
        return;
      } else {
        throw new Error('Identifiants invalides');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);