import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockEmailService = {
    sendEmail: jest.fn(),
  };

  const mockSmsService = {
    sendSms: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: 'EmailService',
          useValue: mockEmailService,
        },
        {
          provide: 'SmsService',
          useValue: mockSmsService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendTransactionNotification', () => {
    it('should send email notification for transaction', async () => {
      const transactionData = {
        userId: 'user-1',
        email: 'user@example.com',
        amount: 1000,
        currency: 'XOF',
        status: 'completed',
      };

      mockEmailService.sendEmail.mockResolvedValue(true);

      await service.sendTransactionNotification(transactionData);

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: transactionData.email,
        subject: expect.stringContaining('Transaction'),
        template: 'transaction-notification',
        context: expect.objectContaining({
          amount: transactionData.amount,
          currency: transactionData.currency,
        }),
      });
    });
  });

  describe('sendKycNotification', () => {
    it('should send notification when KYC is approved', async () => {
      const userData = {
        email: 'user@example.com',
        firstName: 'John',
        status: 'approved',
      };

      mockEmailService.sendEmail.mockResolvedValue(true);

      await service.sendKycNotification(userData);

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: userData.email,
        subject: expect.stringContaining('KYC'),
        template: 'kyc-notification',
        context: expect.objectContaining({
          firstName: userData.firstName,
          status: userData.status,
        }),
      });
    });

    it('should send notification when KYC is rejected', async () => {
      const userData = {
        email: 'user@example.com',
        firstName: 'John',
        status: 'rejected',
        reason: 'Invalid document',
      };

      mockEmailService.sendEmail.mockResolvedValue(true);

      await service.sendKycNotification(userData);

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            reason: userData.reason,
          }),
        }),
      );
    });
  });

  describe('sendSmsNotification', () => {
    it('should send SMS notification', async () => {
      const smsData = {
        phoneNumber: '+237123456789',
        message: 'Your transaction was successful',
      };

      mockSmsService.sendSms.mockResolvedValue(true);

      await service.sendSmsNotification(smsData);

      expect(mockSmsService.sendSms).toHaveBeenCalledWith({
        to: smsData.phoneNumber,
        message: smsData.message,
      });
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email to new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      mockEmailService.sendEmail.mockResolvedValue(true);

      await service.sendWelcomeEmail(userData);

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: userData.email,
        subject: expect.stringContaining('Bienvenue'),
        template: 'welcome-email',
        context: expect.objectContaining({
          firstName: userData.firstName,
          lastName: userData.lastName,
        }),
      });
    });
  });
});
