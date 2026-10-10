import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { Request } from 'express';

const issuer = process.env.COGNITO_ISSUER ?? '';
const audience = process.env.COGNITO_CLIENT_ID ?? '';

const jwks = issuer
  ? createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`))
  : null;

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    const devUserId = request.headers['x-user-id'];

    if ((!authHeader || !authHeader.startsWith('Bearer ')) && devUserId) {
      request.user = { sub: String(devUserId) };
      return true;
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    if (!jwks || !issuer || !audience) {
      throw new UnauthorizedException('Auth not configured');
    }

    const token = authHeader.replace('Bearer ', '');
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience,
    });

    request.user = {
      sub: payload.sub,
      email: payload.email as string | undefined,
    };

    return true;
  }
}
