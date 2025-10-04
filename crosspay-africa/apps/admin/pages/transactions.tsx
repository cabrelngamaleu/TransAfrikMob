import { Box, Button, Container, Heading, Table, Thead, Tbody, Tr, Th, Td, Badge, Flex, Select, Input, HStack } from '@chakra-ui/react';
import Head from 'next/head';
import { useState } from 'react';

// Données simulées pour les transactions
const mockTransactions = [
  {
    id: 'tx-001',
    date: '2023-07-15',
    sender: '+233500000000',
    recipient: '+2348000000000',
    amount: '100.00',
    currency: 'GHS',
    status: 'completed',
    rail: 'MFS Africa'
  },
  {
    id: 'tx-002',
    date: '2023-07-14',
    sender: '+254700000000',
    recipient: '+256700000000',
    amount: '1000.00',
    currency: 'KES',
    status: 'completed',
    rail: 'Flutterwave'
  },
  {
    id: 'tx-003',
    date: '2023-07-13',
    sender: '+233500000001',
    recipient: '+2348000000001',
    amount: '200.00',
    currency: 'GHS',
    status: 'pending',
    rail: 'MFS Africa'
  },
  {
    id: 'tx-004',
    date: '2023-07-12',
    sender: '+254700000001',
    recipient: '+256700000001',
    amount: '500.00',
    currency: 'KES',
    status: 'failed',
    rail: 'Flutterwave'
  },
  {
    id: 'tx-005',
    date: '2023-07-11',
    sender: '+233500000002',
    recipient: '+2348000000002',
    amount: '150.00',
    currency: 'GHS',
    status: 'completed',
    rail: 'MFS Africa'
  }
];

// Fonction pour obtenir la couleur du badge en fonction du statut
const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'green';
    case 'pending':
      return 'yellow';
    case 'failed':
      return 'red';
    default:
      return 'gray';
  }
};

export default function Transactions() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrer les transactions en fonction du statut et du terme de recherche
  const filteredTransactions = mockTransactions.filter(tx => {
    const matchesStatus = filter === 'all' || tx.status === filter;
    const matchesSearch = searchTerm === '' || 
      tx.id.includes(searchTerm) || 
      tx.sender.includes(searchTerm) || 
      tx.recipient.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <Head>
        <title>Transactions - CrossPay Africa</title>
        <meta name="description" content="Gestion des transactions CrossPay Africa" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box as="main" p={4}>
        <Container maxW={'7xl'} mt={5}>
          <Heading as="h1" size="xl" mb={6}>
            Transactions
          </Heading>
          
          <HStack spacing={4} mb={6}>
            <Select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              width="200px"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Complétées</option>
              <option value="pending">En attente</option>
              <option value="failed">Échouées</option>
            </Select>
            
            <Input 
              placeholder="Rechercher par ID, expéditeur ou destinataire" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              flex={1}
            />
          </HStack>

          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Date</Th>
                  <Th>Expéditeur</Th>
                  <Th>Destinataire</Th>
                  <Th isNumeric>Montant</Th>
                  <Th>Rail</Th>
                  <Th>Statut</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredTransactions.map((tx) => (
                  <Tr key={tx.id}>
                    <Td>{tx.id}</Td>
                    <Td>{tx.date}</Td>
                    <Td>{tx.sender}</Td>
                    <Td>{tx.recipient}</Td>
                    <Td isNumeric>{tx.amount} {tx.currency}</Td>
                    <Td>{tx.rail}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(tx.status)}>
                        {tx.status}
                      </Badge>
                    </Td>
                    <Td>
                      <Button size="sm" colorScheme="blue">
                        Détails
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Container>
      </Box>
    </>
  );
}