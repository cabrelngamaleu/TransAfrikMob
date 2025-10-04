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
import axios from 'axios';

type LoginFormData = {
  email: string;
  password: string;
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, data);
      
      // Stocker le token dans localStorage
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast({
        title: 'Connexion réussie',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      router.push('/');
    } catch (error) {
      toast({
        title: 'Erreur de connexion',
        description: 'Identifiants invalides. Veuillez réessayer.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="100vw" p={0} h="100vh" bg="gray.50">
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
              src="/logo.svg" 
              alt="CrossPay Africa Logo" 
              mx="auto" 
              h="60px" 
              mb={4}
            />
            <Heading size="lg" mb={2}>CrossPay Africa</Heading>
            <Text color="gray.600">Connectez-vous à votre compte administrateur</Text>
          </Box>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="votre@email.com"
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

              <FormControl isInvalid={!!errors.password}>
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
                colorScheme="brand"
                width="full"
                mt={4}
                type="submit"
                isLoading={isLoading}
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