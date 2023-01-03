import { UnauthorizedException } from '@nestjs/common/exceptions';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserEntity } from 'src/user/models/entity/user.entity';
import { Repository } from 'typeorm';
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'thisissecretkey',
    });
  }

  async validate(payload: any) {
    const { user } = payload;
    const currentUser = this.userRepository.findOne({ where: { id: user.id } });
    if (!currentUser) {
      throw new UnauthorizedException();
    }
    return { ...user };
  }
}
