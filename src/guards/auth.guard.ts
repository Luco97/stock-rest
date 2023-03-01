import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AuthService } from '@shared/auth';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private _authService: AuthService) {}
  canActivate(context: ExecutionContext): boolean {
    const req: FastifyRequest = context.switchToHttp().getNext().req;
    return this._authService.validateToken(req.headers?.authorization);
  }
}
