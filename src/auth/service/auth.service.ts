import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { from, Observable } from 'rxjs';
import { User } from 'src/user/models/interface/user.interface';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateJwt(user: User): Promise<string> {
    return this.jwtService.sign({ user });
  }

  hashPassword(password: string): Observable<any> {
    return from(bcrypt.hash(password, 12));
  }

  comparePassword(password: string, hashPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashPassword);
  }
}
