import { Box, Flex, Link, Icon, Text, Stack, Drawer, DrawerContent, useDisclosure, BoxProps, FlexProps, CloseButton, useColorModeValue, Button } from '@chakra-ui/react';
import NextLink from 'next/link';
import { FiHome, FiTrendingUp, FiSettings, FiMenu, FiLogOut } from 'react-icons/fi';
import { ReactNode } from 'react';
import { IconType } from 'react-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

interface LinkItemProps {
  name: string;
  icon: IconType;
  href: string;
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Tableau de bord', icon: FiHome, href: '/' },
  { name: 'Transactions', icon: FiTrendingUp, href: '/transactions' },
  { name: 'Paramètres', icon: FiSettings, href: '/settings' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <SidebarContent onClose={() => onClose} display={{ base: 'none', md: 'block' }} />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full">
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  );
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const { logout } = useAuth();
  
  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}>
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          CrossPay Africa
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem key={link.name} icon={link.icon} href={link.href}>
          {link.name}
        </NavItem>
      ))}
      <Box mt={6} mx={4}>
        <Button 
          leftIcon={<FiLogOut />} 
          variant="outline" 
          colorScheme="red" 
          size="sm" 
          width="full"
          onClick={logout}
        >
          Déconnexion
        </Button>
      </Box>
    </Box>
  );
};

interface NavItemProps extends FlexProps {
  icon: IconType;
  href: string;
  children: ReactNode;
}

const NavItem = ({ icon, href, children, ...rest }: NavItemProps) => {
  return (
    <NextLink href={href} passHref legacyBehavior>
      <Link style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          _hover={{
            bg: 'cyan.400',
            color: 'white',
          }}
          {...rest}>
          {icon && (
            <Icon
              mr="4"
              fontSize="16"
              _groupHover={{
                color: 'white',
              }}
              as={icon}
            />
          )}
          {children}
        </Flex>
      </Link>
    </NextLink>
  );
};

interface MobileProps extends FlexProps {
  onOpen: () => void;
}

const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  const { colorMode, toggleColorMode } = useTheme();
  
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}>
      <Icon
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        cursor="pointer"
        as={FiMenu}
        w={5}
        h={5}
      />
      <Text
        display={{ base: 'flex', md: 'none' }}
        fontSize="2xl"
        fontFamily="monospace"
        fontWeight="bold">
        CrossPay
      </Text>
      
      <ThemeToggle ml={3} />
    </Flex>
  );
};