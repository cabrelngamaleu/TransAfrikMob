import { Box, Container, Flex, Heading, SimpleGrid, Stat, StatLabel, StatNumber, Text, useColorModeValue, Button, Badge, HStack, VStack, Icon, Divider, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Image } from '@chakra-ui/react';
import Head from 'next/head';
import { FiDollarSign, FiUsers, FiActivity, FiRefreshCw, FiTrendingUp, FiGlobe, FiShield, FiZap } from 'react-icons/fi';
import AnimatedButton from '../components/AnimatedButton';
import { useState } from 'react';
import PageTransition from '../components/PageTransition';

// Composant pour les cartes statistiques
const StatCard = ({ title, stat, icon, trend = null, color = "blue" }) => {
  return (
    <Stat
      px={{ base: 4, md: 6 }}
      py={6}
      bg={useColorModeValue('white', 'gray.800')}
      shadow={'2xl'}
      borderRadius={'2xl'}
      position={'relative'}
      overflow={'hidden'}
      transition={'all 0.3s ease'}
      _hover={{
        transform: 'translateY(-5px)',
        shadow: '2xl',
      }}>
      <Box 
        position="absolute" 
        top={0} 
        left={0} 
        right={0} 
        h="4px" 
        bgGradient={`linear(to-r, ${color}.400, ${color}.600)`} 
      />
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <Box>
          <StatLabel fontWeight={'medium'} fontSize={'sm'} color={'gray.500'} mb={1} isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize={'3xl'} fontWeight={'bold'} letterSpacing="tight">
            {stat}
          </StatNumber>
          {trend && (
            <Badge colorScheme={trend.startsWith('+') ? 'green' : 'red'} mt={2} fontSize="xs" px={2} py={1} borderRadius="full">
              {trend}
            </Badge>
          )}
        </Box>
        <Box
          p={3}
          bg={`${color}.50`}
          color={`${color}.500`}
          borderRadius="full"
          boxSize={14}
          display="flex"
          alignItems="center"
          justifyContent="center">
          {icon}
        </Box>
      </Flex>
    </Stat>
  );
};

// Composant pour les transactions
const TransactionItem = ({ amount, status, date, recipient }) => {
  const statusColor = {
    'completed': 'green',
    'pending': 'orange',
    'failed': 'red'
  }[status] || 'gray';
  
  return (
    <Flex 
      p={4} 
      borderRadius="lg" 
      bg={useColorModeValue('gray.50', 'gray.700')}
      mb={3}
      alignItems="center"
      justifyContent="space-between"
      transition="all 0.3s"
      _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
    >
      <HStack spacing={4}>
        <Box 
          p={2} 
          borderRadius="full" 
          bg={`${statusColor}.100`}
          color={`${statusColor}.500`}
        >
          <FiDollarSign size="1.5em" />
        </Box>
        <VStack alignItems="flex-start" spacing={0}>
          <Text fontWeight="bold">{recipient}</Text>
          <Text fontSize="sm" color="gray.500">{date}</Text>
        </VStack>
      </HStack>
      <HStack>
        <Text fontWeight="bold">{amount}</Text>
        <Badge colorScheme={statusColor} borderRadius="full" px={2}>
          {status}
        </Badge>
      </HStack>
    </Flex>
  );
};

// Logo
const CrossPayLogo = () => (
  <Image src="/logo.svg" alt="CrossPay Africa Logo" width={180} height={40} />
);

export default function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <>
      <Head>
        <title>CrossPay Africa - Administration</title>
        <meta name="description" content="Interface d'administration CrossPay Africa - Plateforme de paiement panafricaine" />
        <link rel="icon" href="/logo.svg" />
      </Head>

      <PageTransition>
        <Box as="main" p={6} bg={useColorModeValue('gray.50', 'gray.900')}>
          <Container maxW={'7xl'} mt={5}>
            <Flex justifyContent="space-between" alignItems="center" mb={8}>
              <Box>
                <CrossPayLogo />
                <Text fontSize="sm" color="gray.500" mt={1}>Plateforme de paiement panafricaine</Text>
              </Box>
              <HStack>
                <Badge colorScheme="green" p={2} borderRadius="md">
                  <HStack>
                    <Icon as={FiShield} />
                    <Text>Système en ligne</Text>
                  </HStack>
                </Badge>
              </HStack>
            </Flex>
            
            <Heading as="h1" size="xl" mb={2} fontWeight="extrabold" letterSpacing="tight">
              Tableau de bord
            </Heading>
            <Text color="gray.500" mb={8}>Aperçu des performances et des activités de la plateforme</Text>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 5, lg: 8 }}>
              <StatCard
                title={'Transactions totales'}
                stat={'5,024'}
                icon={<FiActivity size={'1.5em'} />}
                trend={'+12.5%'}
                color="blue"
              />
              <StatCard
                title={'Volume (USD)'}
                stat={'$103,430'}
                icon={<FiDollarSign size={'1.5em'} />}
                trend={'+8.2%'}
                color="purple"
              />
              <StatCard
                title={'Utilisateurs actifs'}
                stat={'1,257'}
                icon={<FiUsers size={'1.5em'} />}
                trend={'+5.1%'}
                color="teal"
              />
              <StatCard
                title={'Pays desservis'}
                stat={'12'}
                icon={<FiGlobe size={'1.5em'} />}
                color="orange"
              />
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mt={10}>
              <Box 
                bg={useColorModeValue('white', 'gray.800')} 
                borderRadius="xl" 
                shadow="xl" 
                p={6}
                position="relative"
                overflow="hidden"
              >
                <Box 
                  position="absolute" 
                  top={0} 
                  left={0} 
                  right={0} 
                  h="4px" 
                  bgGradient="linear(to-r, blue.400, purple.500)" 
                />
                <Flex justifyContent="space-between" alignItems="center" mb={6}>
                  <Heading as="h2" size="md" fontWeight="bold">
                    Transactions récentes
                  </Heading>
                  <AnimatedButton 
                    leftIcon={<FiRefreshCw />} 
                    colorScheme="blue" 
                    size="sm"
                    variant="outline"
                    isLoading={isLoading}
                    onClick={handleRefresh}
                  >
                    Actualiser
                  </AnimatedButton>
                </Flex>
                
                <VStack spacing={3} align="stretch">
                  <TransactionItem 
                    amount="$1,250.00" 
                    status="completed" 
                    date="Aujourd'hui, 14:30" 
                    recipient="Entreprise ABC"
                  />
                  <TransactionItem 
                    amount="$750.50" 
                    status="pending" 
                    date="Aujourd'hui, 12:15" 
                    recipient="Fournisseur XYZ"
                  />
                  <TransactionItem 
                    amount="$320.75" 
                    status="completed" 
                    date="Hier, 18:45" 
                    recipient="Client 123"
                  />
                  <TransactionItem 
                    amount="$890.00" 
                    status="failed" 
                    date="Hier, 10:20" 
                    recipient="Partenaire DEF"
                  />
                </VStack>
                
                <Button 
                  variant="ghost" 
                  colorScheme="blue" 
                  size="sm" 
                  mt={4} 
                  onClick={onOpen}
                  rightIcon={<FiTrendingUp />}
                >
                  Voir toutes les transactions
                </Button>
              </Box>
              
              <Box 
                bg={useColorModeValue('white', 'gray.800')} 
                borderRadius="xl" 
                shadow="xl" 
                p={6}
                position="relative"
                overflow="hidden"
              >
                <Box 
                  position="absolute" 
                  top={0} 
                  left={0} 
                  right={0} 
                  h="4px" 
                  bgGradient="linear(to-r, teal.400, green.500)" 
                />
                <Heading as="h2" size="md" fontWeight="bold" mb={6}>
                  Performance du système
                </Heading>
                
                <SimpleGrid columns={2} spacing={6}>
                  <VStack align="start" spacing={1}>
                    <Text color="gray.500" fontSize="sm">Temps de réponse moyen</Text>
                    <HStack>
                      <Text fontWeight="bold" fontSize="2xl">120</Text>
                      <Text color="gray.500">ms</Text>
                    </HStack>
                    <Badge colorScheme="green">Excellent</Badge>
                  </VStack>
                  
                  <VStack align="start" spacing={1}>
                    <Text color="gray.500" fontSize="sm">Taux de réussite</Text>
                    <HStack>
                      <Text fontWeight="bold" fontSize="2xl">99.8</Text>
                      <Text color="gray.500">%</Text>
                    </HStack>
                    <Badge colorScheme="green">Stable</Badge>
                  </VStack>
                  
                  <VStack align="start" spacing={1}>
                    <Text color="gray.500" fontSize="sm">Transactions/minute</Text>
                    <HStack>
                      <Text fontWeight="bold" fontSize="2xl">42</Text>
                    </HStack>
                    <Badge colorScheme="blue">Normal</Badge>
                  </VStack>
                  
                  <VStack align="start" spacing={1}>
                    <Text color="gray.500" fontSize="sm">Disponibilité</Text>
                    <HStack>
                      <Text fontWeight="bold" fontSize="2xl">99.99</Text>
                      <Text color="gray.500">%</Text>
                    </HStack>
                    <Badge colorScheme="green">Excellent</Badge>
                  </VStack>
                </SimpleGrid>
                
                <Divider my={6} />
                
                <Flex justifyContent="space-between" alignItems="center">
                  <Text fontWeight="medium">État du système</Text>
                  <HStack>
                    <Box w={3} h={3} borderRadius="full" bg="green.400" />
                    <Text color="green.500" fontWeight="medium">Opérationnel</Text>
                  </HStack>
                </Flex>
              </Box>
            </SimpleGrid>
            
            <Box mt={10}>
              <Flex 
                bg={useColorModeValue('blue.50', 'blue.900')} 
                p={6} 
                borderRadius="xl" 
                shadow="md"
                direction={{ base: 'column', md: 'row' }}
                align="center"
                justify="space-between"
              >
                <Box maxW={{ base: '100%', md: '60%' }}>
                  <Heading as="h3" size="md" mb={2} color="blue.600">
                    Découvrez notre nouvelle API de paiement
                  </Heading>
                  <Text mb={4}>
                    Intégrez facilement les paiements transfrontaliers dans votre application avec notre API RESTful complète et notre documentation détaillée.
                  </Text>
                  <Button 
                    colorScheme="blue" 
                    size="md" 
                    leftIcon={<FiZap />}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                  >
                    Explorer la documentation
                  </Button>
                </Box>
                <Box 
                  mt={{ base: 6, md: 0 }}
                  bg="white" 
                  p={4} 
                  borderRadius="md" 
                  shadow="sm"
                  fontFamily="mono"
                  fontSize="sm"
                  color="gray.800"
                >
                  <Text>POST /api/v1/transactions</Text>
                  <Text color="gray.500" mt={1}>{'{'}</Text>
                  <Text color="gray.500" ml={4}>&quot;amount&quot;: 1000,</Text>
                  <Text color="gray.500" ml={4}>&quot;currency&quot;: &quot;USD&quot;,</Text>
                  <Text color="gray.500" ml={4}>&quot;destination&quot;: &quot;wallet_id&quot;,</Text>
                  <Text color="gray.500" ml={4}>&quot;description&quot;: &quot;Payment for services&quot;</Text>
                  <Text color="gray.500">{'}'}</Text>
                </Box>
              </Flex>
            </Box>
          </Container>
        </Box>
      </PageTransition>

      {/* Modal pour afficher toutes les transactions */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader>Toutes les transactions</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              {Array(8).fill(0).map((_, i) => (
                <TransactionItem 
                  key={i}
                  amount={`$${(Math.random() * 2000).toFixed(2)}`} 
                  status={['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)]} 
                  date={`${i < 3 ? "Aujourd'hui" : i < 5 ? "Hier" : "Il y a 2 jours"}, ${Math.floor(Math.random() * 12 + 8)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`} 
                  recipient={`Client ${Math.floor(Math.random() * 1000)}`}
                />
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}