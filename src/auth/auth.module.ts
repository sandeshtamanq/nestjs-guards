import { Module } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/models/entity/user.entity';
import { UserModule } from 'src/user/user.module';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtStrategy } from './guards/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { AuthService } from './service/auth.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: 'thisissecretkey',
          signOptions: { expiresIn: '3600s' },
        };
      },
    }),
  ],
  providers: [AuthService, RolesGuard, JwtAuthGuard, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
