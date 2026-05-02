import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

/**
 * LocalStrategy handles username/password login
 * Passport automatically extracts email/password from request body
 * and calls validate() with them
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email', // Tell Passport to use 'email' field instead of default 'username'
    });
  }

  /**
   * Called by Passport after extracting credentials from request
   * Returns user object if valid, throws UnauthorizedException if not
   */
  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.login({ email, password });

    // Return user object (without sensitive data) to be attached to request
    // This becomes req.user in controllers
    return user;
  }
}
