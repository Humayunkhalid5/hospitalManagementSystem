import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard, RolesGuard } from './guards';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      global: true, inject: [ConfigService],
      useFactory: (c: ConfigService) => ({ secret: c.get('JWT_SECRET'), signOptions: { expiresIn: '8h' } }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, { provide: APP_GUARD, useClass: AuthGuard }, { provide: APP_GUARD, useClass: RolesGuard }],
})
export class AuthModule {}
