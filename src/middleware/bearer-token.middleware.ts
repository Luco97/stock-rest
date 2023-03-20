import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    req.headers['authorization'] =
      req.headers?.authorization?.replace(/Bearer /g, '') || '';
    next();
  }
}
