import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: '123',
    email: 'test@crosspay.africa',
    password: '$2b$10$hashedpassword',
    firstName: 'John',
    lastName: 'Doe',
    roles: ['user'],
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.validateUser('test@crosspay.africa', 'password123');

      expect(result).toBeDefined();
      expect(result.password).toBeUndefined();
      expect(result.email).toBe('test@crosspay.africa');
    });

    it('should return null if user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@crosspay.africa', 'password123');

      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      const result = await service.validateUser('test@crosspay.africa', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return user info and access token', async () => {
      const user = { ...mockUser };
      delete user.password;

      const result = await service.login(user);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.id).toBe('123');
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
        roles: user.roles,
      });
    });
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const newUserData = {
        email: 'newuser@crosspay.africa',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        id: '456',
        ...newUserData,
        roles: ['user'],
      });

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed-password'));

      const result = await service.register(newUserData);

      expect(result).toBeDefined();
      expect(result.password).toBeUndefined();
      expect(mockUsersService.create).toHaveBeenCalledWith({
        ...newUserData,
        password: 'hashed-password',
        roles: ['user'],
      });
    });

    it('should throw UnauthorizedException if email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@crosspay.africa',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should return new access token for valid refresh token', async () => {
      mockJwtService.verify.mockReturnValue({ sub: '123', email: 'test@crosspay.africa' });
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.refreshToken('valid-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe('mock-jwt-token');
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockJwtService.verify.mockReturnValue({ sub: '999', email: 'test@crosspay.africa' });
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.refreshToken('valid-token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
