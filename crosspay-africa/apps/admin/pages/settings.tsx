import { Box, Button, Container, Divider, FormControl, FormLabel, Heading, Input, Select, Stack, Switch, Text, useToast } from '@chakra-ui/react';
import Head from 'next/head';
import { useState } from 'react';

export default function Settings() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSettings = () => {
    setIsLoading(true);
    // Simuler une sauvegarde
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Paramètres sauvegardés',
        description: 'Vos paramètres ont été mis à jour avec succès.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }, 1000);
  };

  return (
    <>
      <Head>
        <title>Paramètres - CrossPay Africa</title>
        <meta name="description" content="Paramètres de l'application CrossPay Africa" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box as="main" p={4}>
        <Container maxW={'7xl'} mt={5}>
          <Heading as="h1" size="xl" mb={6}>
            Paramètres
          </Heading>

          <Stack spacing={8}>
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Heading as="h2" size="md" mb={4}>
                Paramètres généraux
              </Heading>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Nom de l&apos;entreprise</FormLabel>
                  <Input defaultValue="CrossPay Africa" />
                </FormControl>
                <FormControl>
                  <FormLabel>Email de contact</FormLabel>
                  <Input defaultValue="contact@crosspay-africa.com" />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">
                    Mode maintenance
                  </FormLabel>
                  <Switch colorScheme="blue" />
                </FormControl>
              </Stack>
            </Box>

            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Heading as="h2" size="md" mb={4}>
                Paramètres des paiements
              </Heading>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Rail de paiement par défaut</FormLabel>
                  <Select defaultValue="mfs">
                    <option value="mfs">MFS Africa</option>
                    <option value="flutterwave">Flutterwave</option>
                    <option value="beyonic">Beyonic</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Limite de transaction (USD)</FormLabel>
                  <Input defaultValue="1000" type="number" />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">
                    Activer les paiements
                  </FormLabel>
                  <Switch colorScheme="blue" defaultChecked />
                </FormControl>
              </Stack>
            </Box>

            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Heading as="h2" size="md" mb={4}>
                Notifications
              </Heading>
              <Stack spacing={4}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">
                    Notifications par email
                  </FormLabel>
                  <Switch colorScheme="blue" defaultChecked />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">
                    Notifications SMS
                  </FormLabel>
                  <Switch colorScheme="blue" />
                </FormControl>
                <FormControl>
                  <FormLabel>Webhook URL</FormLabel>
                  <Input defaultValue="https://api.example.com/webhooks/crosspay" />
                </FormControl>
              </Stack>
            </Box>

            <Divider />

            <Box textAlign="right">
              <Button 
                colorScheme="blue" 
                size="lg" 
                onClick={handleSaveSettings}
                isLoading={isLoading}
              >
                Sauvegarder les paramètres
              </Button>
            </Box>
          </Stack>
        </Container>
      </Box>
    </>
  );
}