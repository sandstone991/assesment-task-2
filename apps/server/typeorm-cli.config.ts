import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  url: configService.get<string>('TYPEORM_DB_URL'),
  ssl: !!configService.get<boolean>('TYPEORM_DB_SSL'),
  entities: [],
  migrations: [],
});
