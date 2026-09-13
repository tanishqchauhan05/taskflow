import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('signed-token'), verify: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-value') },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('throws UnauthorizedException when the user does not exist', async () => {
      usersService.findByEmail!.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'ghost@example.com', password: 'whatever' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the password does not match', async () => {
      const hashed = await bcrypt.hash('correct-password', 10);
      usersService.findByEmail!.mockResolvedValue({
        id: '1',
        email: 'jane@example.com',
        password: hashed,
        role: Role.MEMBER,
      });

      await expect(
        authService.login({ email: 'jane@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns access and refresh tokens on valid credentials', async () => {
      const hashed = await bcrypt.hash('correct-password', 10);
      usersService.findByEmail!.mockResolvedValue({
        id: '1',
        email: 'jane@example.com',
        password: hashed,
        role: Role.MEMBER,
      });

      const result = await authService.login({
        email: 'jane@example.com',
        password: 'correct-password',
      });

      expect(result).toEqual({
        accessToken: 'signed-token',
        refreshToken: 'signed-token',
      });
    });
  });
});
