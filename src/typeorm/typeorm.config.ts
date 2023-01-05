import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  username: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'sandeshtamang',
  database: process.env.PGDATABASE || 'blog',
  // entities: [__dirname + '/../**/models/entity/*.entity{.ts,.js}'],
  // url: process.env.DATABASE_URL,
  autoLoadEntities: true,
  synchronize: true,
};
