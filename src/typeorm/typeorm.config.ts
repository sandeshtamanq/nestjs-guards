import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'sandeshtamang',
  database: 'blog',
  entities: [__dirname + '/../**/models/entity/*.entity{.ts,.js}'],
  synchronize: true,
};
