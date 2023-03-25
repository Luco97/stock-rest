import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { PayloadInterface } from '../interface/payload.interface';

@Injectable()
export class AuthService {
  constructor(private _jwtService: JwtService) {}

  genJWT(object: { id: number; name: string; type: string }): string {
    const { id, name, type } = object;
    return this._jwtService.sign({
      sub: name,
      context: {
        username: name,
        extra: id,
        type,
      },
    });
  }

  verify(token: string): PayloadInterface {
    return this._jwtService.verify<PayloadInterface>(token, {
      secret: process.env.SECRET_KEY,
    });
  }

  validateToken(token: string, type?: string): boolean {
    try {
      const validation: PayloadInterface = this.verify(token);
      if (validation.context.username && validation.context.extra) {
        if (!type) return true;
        else if (type && type == validation.context.type) return true;
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  userID(token: string): number {
    try {
      const payload = this.verify(token);
      if (payload.context.username && payload.context.extra)
        return payload?.context?.extra;
    } catch (error) {
      return -1;
    }
  }

  userType(token: string): string {
    try {
      const payload = this.verify(token);
      if (payload.context.username && payload.context.extra)
        return payload?.context?.type;
    } catch (error) {
      return '';
    }
  }

  getContext(token: string): { id?: number; name?: string; type?: string } {
    try {
      const payload = this.verify(token);
      if (payload.context.username && payload.context.extra)
        return {
          id: payload.context.extra,
          type: payload.context.type,
          name: payload.context.username,
        };
    } catch (error) {
      return {
        id: -1,
        name: '',
        type: '',
      };
    }
  }
}
