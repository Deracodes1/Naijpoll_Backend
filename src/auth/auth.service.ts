import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { RefreshTokenService } from './refresh-token/refresh-token.service';
import { RegisterDto } from './dto/register.dto';
import { AuthUser } from './types/auth-user.type';
export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async register(
    registerDto: RegisterDto,
    res: Response,
  ): Promise<AuthResponse> {
    const user = await this.usersService.create(registerDto);
    return this.issueTokens(user, res);
  }

  async login(user: AuthUser, res: Response): Promise<AuthResponse> {
    return this.issueTokens(user, res);
  }

  async refresh(
    userId: string,
    tokenId: string,
    res: Response,
  ): Promise<AuthResponse> {
    const isValid = await this.refreshTokenService.validate(userId, tokenId);

    if (!isValid) {
      // Potential token reuse — revoke all sessions for security
      await this.refreshTokenService.revokeAll(userId);
      throw new UnauthorizedException(
        'Session invalidated. Please login again.',
      );
    }

    // Valid refresh — rotate: delete old, create new
    await this.refreshTokenService.revoke(userId, tokenId);

    const user = await this.usersService.findOne(userId);
    return this.issueTokens(user, res);
  }

  async logout(userId: string, tokenId: string, res: Response): Promise<void> {
    await this.refreshTokenService.revoke(userId, tokenId);
    this.clearRefreshCookie(res);
  }

  async validateTokenPayload(payload: TokenPayload) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) throw new UnauthorizedException('User no longer exists');
    return user;
  }

  private async issueTokens(
    user: AuthUser,
    res: Response,
  ): Promise<AuthResponse> {
    const tokenId = crypto.randomUUID();

    const accessToken = await this.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this.refreshTokenService.store(user.id, tokenId);
    this.setRefreshCookie(res, user.id, tokenId);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  private async generateAccessToken(payload: TokenPayload): Promise<string> {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET required');

    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn: '15m',
    });
  }
  verifyRefreshToken(token: string): { sub: string; tokenId: string } {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) throw new Error('JWT_REFRESH_SECRET required');

    try {
      return this.jwtService.verify(token, { secret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
  private setRefreshCookie(
    res: Response,
    userId: string,
    tokenId: string,
  ): void {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) throw new Error('JWT_REFRESH_SECRET required');

    const refreshToken = this.jwtService.sign(
      { sub: userId, tokenId },
      {
        secret: refreshSecret,
        expiresIn: '7d',
      },
    );
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
    });
  }
}
