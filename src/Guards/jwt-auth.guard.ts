import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: any, info: any): TUser {
    if (err || !user) {
      let message = 'Authentication required';

      if (info instanceof Error) {
        if (info.name === 'TokenExpiredError') {
          message = 'Token has expired. Please login again.';
        } else if (info.name === 'JsonWebTokenError') {
          message = 'Invalid token. Please provide a valid token.';
        } else if (info.message === 'No auth token') {
          message =
            'No authentication token provided. Please include a Bearer token in the Authorization header.';
        }
      }

      throw new UnauthorizedException(message);
    }

    return user as TUser;
  }
}
