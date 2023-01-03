import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      name: 'Nestjs blog api',
      made_by: 'Sandesh Tamang',
      address: 'Chitwan',
      message: 'K cha Ashmita',
    };
  }
}
