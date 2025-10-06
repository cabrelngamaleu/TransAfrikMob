import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Flex,
  useDisclosure,
  Spinner,
  Text,
  Select,
  HStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '../../components/Layout';
import { useAuth } from '../../../../services/admin/src/contexts/AuthContext';

// Types
interface KycVerification {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  documentType: string;
  documentNumber: string;
  createdAt: string;
}

const KycVerificationList = () => {
  const [verifications, setVerifications] = useState<KycVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const auth = useAuth();
  const token = localStorage.getItem('token');
  const router = useRouter();

  const fetchVerifications = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = statusFilter === 'pending' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/kyc/pending`
        : `${process.env.NEXT_PUBLIC_API_URL}/kyc`;
      
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      let data = response.data;
      
      // Filtrer les résultats si un filtre est appliqué et que nous n'utilisons pas déjà un endpoint filtré
      if (statusFilter !== 'all' && statusFilter !== 'pending') {
        data = data.filter(v => v.status === statusFilter);
      }
      
      setVerifications(data);
      setError('');
    } catch (err) {
      console.error('Error fetching KYC verifications:', err);
      setError('Failed to load KYC verifications');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, token]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge colorScheme="yellow">En attente</Badge>;
      case 'approved':
        return <Badge colorScheme="green">Approuvé</Badge>;
      case 'rejected':
        return <Badge colorScheme="red">Rejeté</Badge>;
      case 'expired':
        return <Badge colorScheme="gray">Expiré</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewDetails = (id: string) => {
    router.push(`/kyc/${id}`);
  };

  return (
    <Layout>
      <Box p={5}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg">Vérifications KYC</Heading>
          <HStack>
            <Text>Filtrer par statut:</Text>
            <Select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              width="200px"
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvés</option>
              <option value="rejected">Rejetés</option>
              <option value="expired">Expirés</option>
            </Select>
          </HStack>
        </Flex>

        {loading ? (
          <Flex justify="center" align="center" height="300px">
            <Spinner size="xl" />
          </Flex>
        ) : error ? (
          <Text color="red.500" textAlign="center">{error}</Text>
        ) : verifications.length === 0 ? (
          <Text textAlign="center">Aucune vérification KYC trouvée</Text>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Utilisateur</Th>
                <Th>Type de document</Th>
                <Th>Numéro</Th>
                <Th>Statut</Th>
                <Th>Date de création</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {verifications.map((verification) => (
                <Tr key={verification.id}>
                  <Td>{verification.id.substring(0, 8)}...</Td>
                  <Td>{`${verification.user.firstName} ${verification.user.lastName}`}</Td>
                  <Td>{verification.documentType}</Td>
                  <Td>{verification.documentNumber}</Td>
                  <Td>{getStatusBadge(verification.status)}</Td>
                  <Td>{formatDate(verification.createdAt)}</Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleViewDetails(verification.id)}
                    >
                      Détails
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
    </Layout>
  );
};

export default KycVerificationList;