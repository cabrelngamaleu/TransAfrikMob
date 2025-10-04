import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  Container,
  Flex,
  Image,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';

type LoginFormData = {
  email: string;
  password: string;
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const { login } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast({
        title: 'Connexion réussie',
        description: 'Vous êtes maintenant connecté',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
      // Forcer la redirection directement ici
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      
    } catch (error) {
      toast({
        title: 'Erreur de connexion',
        description: 'Identifiants invalides',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="100%" p={0} h="100vh" bg="gray.50">
      <Flex h="full" align="center" justify="center">
        <Box
          p={8}
          maxWidth="400px"
          borderWidth={1}
          borderRadius={8}
          boxShadow="lg"
          bg="white"
        >
          <Box textAlign="center" mb={8}>
            <Image
              src="/logo.png"
              alt="CrossPay Logo"
              maxH="60px"
              mx="auto"
              mb={4}
            />
            <Heading size="lg" mb={2}>CrossPay Admin</Heading>
            <Text color="gray.500">Connectez-vous à votre compte</Text>
          </Box>
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={4}>
              <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Votre email"
                  {...register('email', {
                    required: 'L\'email est requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Adresse email invalide',
                    },
                  })}
                />
                {errors.email && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.email.message}
                  </Text>
                )}
              </FormControl>

              <FormControl id="password" isRequired>
                <FormLabel>Mot de passe</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Votre mot de passe"
                    {...register('password', {
                      required: 'Le mot de passe est requis',
                      minLength: {
                        value: 6,
                        message: 'Le mot de passe doit contenir au moins 6 caractères',
                      },
                    })}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
                {errors.password && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.password.message}
                  </Text>
                )}
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                width="full"
                mt={4}
              >
                Se connecter
              </Button>
            </VStack>
          </form>
        </Box>
      </Flex>
    </Container>
  );
}