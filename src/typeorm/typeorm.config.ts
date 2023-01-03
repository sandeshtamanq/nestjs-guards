import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist';

export const typeOrmConfig: TypeOrmModuleOptions = {
  // host: 'localhost',
  // port: 5432,
  // username: 'postgres',
  // password: 'sandeshtamang',
  // database: 'blog',
  // entities: [__dirname + '/../**/models/entity/*.entity{.ts,.js}'],
  type: 'postgres',
  url: process.env.DATABASE_URL,
  autoLoadEntities: true,
  synchronize: true,
};
