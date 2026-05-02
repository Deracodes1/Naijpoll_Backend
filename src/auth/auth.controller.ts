import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService, AuthResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from 'src/Guards/local-auth.guard';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/register
   * Public endpoint - no guard needed
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  /**
   * POST /api/v1/auth/login
   * Uses LocalAuthGuard to validate credentials before reaching controller
   * Passport attaches validated user to req.user, but we call authService.login
   * to generate the actual JWT response
   */
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
