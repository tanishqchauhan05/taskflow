import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

const resolveEnvPath = () => {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'src/.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '.env'),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0];
};

const envPath = resolveEnvPath();
dotenv.config({ path: envPath });

const dbPassword = process.env.DB_PASSWORD;

if (!dbPassword || typeof dbPassword !== 'string' || dbPassword.trim() === '') {
  throw new Error(
    'DB_PASSWORD is missing or invalid. Add a valid PostgreSQL password to your .env file.',
  );
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: dbPassword,
  database: process.env.DB_DATABASE,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
