import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { FastifyRequest } from 'fastify';
import { from, map, Observable, of } from 'rxjs';

import { AuthService } from '@shared/auth';
import { UserRepoService } from '@models/user';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly _reflector: Reflector,
    private readonly _authService: AuthService,
    private readonly _userService: UserRepoService,
  ) {}
  canActivate(context: ExecutionContext): boolean | Observable<boolean> {
    const request: FastifyRequest = context.switchToHttp().getRequest();
    const roles: string[] = this._reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    const token: string = request.headers?.authorization?.replace(
      /Bearer /g,
      '',
    );

    if (!this._authService.validateToken(token)) return of(false);

    const userID = this._authService.userID(token);

    return from(this._userService.countRoles({ userID, roles })).pipe(
      map<number, boolean>((count) => (count ? true : false)),
    );
  }
}
