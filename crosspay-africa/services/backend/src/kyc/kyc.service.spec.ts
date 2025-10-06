import { Test, TestingModule } from '@nestjs/testing';
import { KycService } from './kyc.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { KycVerification } from './entities/kyc-verification.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { NotFoundException } from '@nestjs/common';

describe('KycService', () => {
  let service: KycService;
  let repository: Repository<KycVerification>;
  let usersService: UsersService;

  const mockKycVerification = {
    id: '1',
    userId: 'user-1',
    status: 'pending',
    documentType: 'passport',
    documentNumber: 'AB123456',
    documentFrontUrl: 'http://example.com/front.jpg',
    documentBackUrl: 'http://example.com/back.jpg',
    selfieUrl: 'http://example.com/selfie.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KycService,
        {
          provide: getRepositoryToken(KycVerification),
          useValue: mockRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<KycService>(KycService);
    repository = module.get<Repository<KycVerification>>(
      getRepositoryToken(KycVerification),
    );
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new KYC verification', async () => {
      const createDto = {
        userId: 'user-1',
        documentType: 'passport',
        documentNumber: 'AB123456',
        documentFrontUrl: 'http://example.com/front.jpg',
      };

      mockRepository.create.mockReturnValue(mockKycVerification);
      mockRepository.save.mockResolvedValue(mockKycVerification);

      const result = await service.create(createDto);

      expect(result).toEqual(mockKycVerification);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockKycVerification);
    });
  });

  describe('findAll', () => {
    it('should return all KYC verifications', async () => {
      const verifications = [mockKycVerification];
      mockRepository.find.mockResolvedValue(verifications);

      const result = await service.findAll();

      expect(result).toEqual(verifications);
      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findPending', () => {
    it('should return pending KYC verifications', async () => {
      const pendingVerifications = [{ ...mockKycVerification, status: 'pending' }];
      mockRepository.find.mockResolvedValue(pendingVerifications);

      const result = await service.findPending();

      expect(result).toEqual(pendingVerifications);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { status: 'pending' },
        relations: ['user'],
        order: { createdAt: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a KYC verification by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockKycVerification);

      const result = await service.findOne('1');

      expect(result).toEqual(mockKycVerification);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['user'],
      });
    });

    it('should throw NotFoundException if verification not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('approve', () => {
    it('should approve a KYC verification', async () => {
      const approvedVerification = { ...mockKycVerification, status: 'approved' };
      mockRepository.findOne.mockResolvedValue(mockKycVerification);
      mockRepository.save.mockResolvedValue(approvedVerification);
      mockUsersService.update.mockResolvedValue({});

      const result = await service.approve('1');

      expect(result.status).toBe('approved');
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockUsersService.update).toHaveBeenCalledWith(
        mockKycVerification.userId,
        { isVerified: true },
      );
    });
  });

  describe('reject', () => {
    it('should reject a KYC verification with a reason', async () => {
      const rejectedVerification = {
        ...mockKycVerification,
        status: 'rejected',
        rejectionReason: 'Invalid document',
      };
      mockRepository.findOne.mockResolvedValue(mockKycVerification);
      mockRepository.save.mockResolvedValue(rejectedVerification);

      const result = await service.reject('1', 'Invalid document');

      expect(result.status).toBe('rejected');
      expect(result.rejectionReason).toBe('Invalid document');
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
