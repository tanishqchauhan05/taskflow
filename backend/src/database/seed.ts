import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { AppDataSource } from './data-source';

type Seeder = (dataSource: DataSource) => Promise<void>;

function findSeeders(): Array<{ name: string; seed: Seeder }> {
  return fs
    .readdirSync(__dirname)
    .filter((fileName) => /^seed\..+\.ts$/.test(fileName))
    .sort()
    .map((fileName) => {
      const modulePath = path.join(__dirname, fileName);
      const seeder = require(modulePath) as { seed?: Seeder };

      if (typeof seeder.seed !== 'function') {
        throw new Error(`${fileName} must export a seed(dataSource) function.`);
      }

      return { name: fileName, seed: seeder.seed };
    });
}

async function runSeeders() {
  const seeders = findSeeders();

  if (seeders.length === 0) {
    console.log('No seeders found.');
    return;
  }

  await AppDataSource.initialize();

  try {
    for (const seeder of seeders) {
      console.log(`Running ${seeder.name}...`);
      await seeder.seed(AppDataSource);
    }
  } finally {
    await AppDataSource.destroy();
  }
}

runSeeders().catch((error) => {
  console.error('Seeding failed:', error);
  process.exitCode = 1;
});