/**
 * Creates a first admin user so you're not stuck manually editing the
 * database to get past the chicken-and-egg problem of RBAC (only an
 * admin can promote other users, but nobody starts as admin).
 *
 * Usage: npm run seed
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME from .env, falling
 * back to sensible defaults for local development.
 */
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { User } from '../users/user.entity';
import { Role } from '../common/enums/role.enum';

dotenv.config();

export async function seed(dataSource: DataSource) {
  const usersRepository = dataSource.getRepository(User);

  const email = process.env.ADMIN_EMAIL || 'admin@taskflow.local';
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const name = process.env.ADMIN_NAME || 'Admin';

  const existing = await usersRepository.findOne({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = usersRepository.create({
    email,
    name,
    password: hashedPassword,
    role: Role.ADMIN,
  });
  await usersRepository.save(admin);

  console.log(`Admin user created:`);
  console.log(`  email: ${email}`);
  console.log(`  password: ${password}`);
  console.log(`Log in via POST /auth/login, then change this password.`);
}
