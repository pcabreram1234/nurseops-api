import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';

import { PassportModule } from '@nestjs/passport';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './controllers/auth.controller';

import { AuthService } from './services/auth.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtRefreshInterceptor } from './interceptors/jwt-refresh.interceptor';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,

    PassportModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: async (
        configService: ConfigService,
      ) => ({
        secret: configService.get<string>('JWT_SECRET'),

        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: "15m"
      }
    })
  ],

  controllers: [AuthController],

  providers: [AuthService, JwtStrategy, {
    provide: APP_INTERCEPTOR, useClass: JwtRefreshInterceptor
  }],

  exports: [AuthService],

})
export class AuthModule { }