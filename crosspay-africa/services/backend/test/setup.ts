// Configuration globale pour les tests
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

// Configuration de la base de données de test
export const getTestDatabaseConfig = () => ({
  type: 'postgres' as const,
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '5433', 10),
  username: process.env.TEST_DB_USERNAME || 'test',
  password: process.env.TEST_DB_PASSWORD || 'test',
  database: process.env.TEST_DB_DATABASE || 'crosspay_test',
  entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
  synchronize: true,
  dropSchema: true,
  logging: false,
});

// Mock des services externes
export const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  expire: jest.fn(),
};

export const mockEmailService = {
  sendEmail: jest.fn().mockResolvedValue(true),
  sendTransactionConfirmation: jest.fn().mockResolvedValue(true),
  sendKycStatusUpdate: jest.fn().mockResolvedValue(true),
};

export const mockSmsService = {
  sendSms: jest.fn().mockResolvedValue(true),
  send2FACode: jest.fn().mockResolvedValue(true),
};

export const mockPaymentAdapter = {
  getName: jest.fn().mockReturnValue('Mock Provider'),
  initiate: jest.fn().mockResolvedValue({
    success: true,
    transactionId: 'mock-tx-123',
    status: 'pending',
  }),
  verify: jest.fn().mockResolvedValue({
    success: true,
    status: 'completed',
  }),
};

// Utilitaires de test
export const createMockUser = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@crosspay.africa',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+237600000000',
  roles: ['user'],
  kycStatus: 'approved',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockTransaction = (overrides = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174001',
  transactionId: 'TX-' + Date.now(),
  userId: '123e4567-e89b-12d3-a456-426614174000',
  recipientId: '123e4567-e89b-12d3-a456-426614174002',
  amount: 10000,
  currency: 'XAF',
  status: 'pending',
  provider: 'orange_money',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Nettoyage après les tests
afterAll(async () => {
  // Nettoyer les connexions
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});
