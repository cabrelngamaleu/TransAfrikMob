import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Center, Spinner } from '@chakra-ui/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated && router.pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }

  if (!isAuthenticated && router.pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;