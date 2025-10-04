import React from 'react';
import { useRouter } from 'next/router';
import { Box, Heading, Text, Spinner, Center } from '@chakra-ui/react';

const KycDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  if (router.isFallback) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={5}>
      <Heading mb={4}>Détails KYC</Heading>
      <Text>ID: {id}</Text>
    </Box>
  );
};

export default KycDetailPage;