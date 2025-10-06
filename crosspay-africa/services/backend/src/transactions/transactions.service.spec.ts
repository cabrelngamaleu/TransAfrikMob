import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let repository: Repository<Transaction>;

  const mockTransaction = {
    id: '1',
    userId: 'user-1',
    amount: 1000,
    currency: 'XOF',
    destinationCurrency: 'USD',
    exchangeRate: 0.0016,
    destinationAmount: 1.6,
    status: 'completed',
    recipientPhone: '+254712345678',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockTransaction], 1]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    repository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new transaction', async () => {
      const createDto = {
        userId: 'user-1',
        amount: 1000,
        currency: 'XOF',
        recipientPhone: '+254712345678',
      };

      mockRepository.create.mockReturnValue(mockTransaction);
      mockRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.create(createDto);

      expect(result).toEqual(mockTransaction);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockTransaction);
    });
  });

  describe('findAll', () => {
    it('should return paginated transactions', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: [mockTransaction],
        total: 1,
        page: 1,
        totalPages: 1,
      });
    });

    it('should filter by status', async () => {
      await service.findAll({ page: 1, limit: 10, status: 'completed' });

      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');

      await service.findAll({
        page: 1,
        limit: 10,
        startDate,
        endDate,
      });

      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockTransaction);

      const result = await service.findOne('1');

      expect(result).toEqual(mockTransaction);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['user'],
      });
    });

    it('should throw NotFoundException if transaction not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('should return transactions for a specific user', async () => {
      mockRepository.find.mockResolvedValue([mockTransaction]);

      const result = await service.findByUser('user-1');

      expect(result).toEqual([mockTransaction]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('updateStatus', () => {
    it('should update transaction status', async () => {
      const updatedTransaction = { ...mockTransaction, status: 'failed' };
      mockRepository.findOne.mockResolvedValue(mockTransaction);
      mockRepository.save.mockResolvedValue(updatedTransaction);

      const result = await service.updateStatus('1', 'failed');

      expect(result.status).toBe('failed');
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('getStatistics', () => {
    it('should return transaction statistics', async () => {
      mockRepository.createQueryBuilder().getManyAndCount.mockResolvedValue([
        [mockTransaction],
        1,
      ]);

      const result = await service.getStatistics('user-1');

      expect(result).toHaveProperty('totalTransactions');
      expect(result).toHaveProperty('totalAmount');
      expect(result).toHaveProperty('successRate');
    });
  });
});
