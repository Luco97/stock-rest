import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FastifyRequest } from 'fastify';

@Injectable()
export class CreateItemInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: FastifyRequest = context.switchToHttp().getRequest();
    if (request.body['price'])
      request.body['price'] = +request.body['price'] || undefined;
    if (request.body['stock'])
      request.body['stock'] = +request.body['stock'] || undefined;
    return next.handle();
  }
}
