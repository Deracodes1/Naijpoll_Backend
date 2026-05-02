import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard for protected routes
 * Triggers JwtStrategy automatically
 * Returns 401 if token missing, expired, or invalid
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
