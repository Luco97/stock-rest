import {
  Injectable,
  CallHandler,
  NestInterceptor,
  ExecutionContext,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FastifyRequest } from 'fastify';

import { AuthService } from '@shared/auth';

@Injectable()
export class GetTokenInterceptor implements NestInterceptor {
  constructor(private _authService: AuthService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: FastifyRequest = context.switchToHttp().getRequest();
    const { id, name, type } = this._authService.getContext(
      request.headers?.authorization?.replace(/Bearer /g, ''),
    );

    request.headers['user_id'] = id.toString();
    request.headers['user_name'] = name;
    request.headers['user_type'] = type;

    return next.handle();
  }
}
