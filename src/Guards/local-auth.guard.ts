import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard for login endpoint
 * Triggers LocalStrategy automatically
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
