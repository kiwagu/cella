import { execSync } from 'node:child_process';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { db } from '../src/db/db';

const commands = ['pnpm run seed:user', 'pnpm run seed:organizations', 'pnpm run seed:data'];

// Migrate the database
await migrate(db, { migrationsFolder: 'drizzle', migrationsSchema: 'drizzle-backend' });

const res = await db.execute(sql`SELECT * FROM users`);

if (res.rows.length > 0) {
  console.log('Database is already seeded');
  process.exit(0);
}

for (const cmd of commands) {
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${cmd}`, error);
    process.exit(1);
  }
}