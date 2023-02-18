import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (_dotEnv: ConfigService) => ({
        secret: _dotEnv.get('SECRET_KEY'),
        signOptions: { expiresIn: _dotEnv.get('TOKEN_EXPIRATION') },
      }),
    }),
  ],
  exports: [AuthService],
  providers: [AuthService],
})
export class AuthModule {}
