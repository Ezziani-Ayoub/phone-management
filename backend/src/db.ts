import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import dotenv from 'dotenv';
dotenv.config();

const tursoUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

let prisma: PrismaClient;

if (tursoUrl && (tursoUrl.startsWith('libsql://') || tursoUrl.startsWith('https://'))) {
  const libsql = createClient({
    url: tursoUrl,
    authToken,
  });
  const adapter = new PrismaLibSQL(libsql);
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

export default prisma;
