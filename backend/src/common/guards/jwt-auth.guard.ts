import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Verifies the JWT access token on incoming requests.
 * Populates request.user from the token payload (see JwtStrategy).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
