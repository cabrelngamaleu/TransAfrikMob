import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f7ff',
      100: '#b3e0ff',
      500: '#0080ff',
      600: '#0066cc',
      700: '#004d99',
      800: '#003366',
      900: '#001a33',
    },
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default function App({ Component, pageProps, router }: AppProps) {
  const isLoginPage = router.route === '/login';

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ThemeProvider>
        <AuthProvider>
          {isLoginPage ? (
            <AnimatePresence mode="wait">
              <Component {...pageProps} key={router.route} />
            </AnimatePresence>
          ) : (
            <Layout>
              <AnimatePresence mode="wait">
                <Component {...pageProps} key={router.route} />
              </AnimatePresence>
            </Layout>
          )}
        </AuthProvider>
      </ThemeProvider>
    </ChakraProvider>
  );
}