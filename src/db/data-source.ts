import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config(); //this will load my .env files. did not use configservcie cos this is happening outside nest js scope

export const AppDataSource = new DataSource({
  type: 'postgres',
  // Use the full connection string from .env
  url: process.env.DIRECT_URL,
  // Necessary for Neon cloud connections
  ssl: {
    rejectUnauthorized: false,
  },
  // This helps handle SSL
  extra: {
    sslmode: 'verify-full',
  },
  entities: ['dist/**/*entity.js'],
  migrations: ['dist/db/migrations/*.js'],
  // this ensures that the migration table is the source of truth
  synchronize: false,
});
