import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const tursoUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !authToken) {
  console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

const client = createClient({
  url: tursoUrl,
  authToken,
});

async function setup() {
  console.log('🚀 Initializing Turso Cloud Database schema...');

  const schemaStatements = [
    `CREATE TABLE IF NOT EXISTS "Employee" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "fullName" TEXT NOT NULL,
        "department" TEXT NOT NULL,
        "position" TEXT NOT NULL,
        "email" TEXT,
        "site" TEXT,
        "status" TEXT NOT NULL DEFAULT 'Actif',
        "deletedAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS "Forfait" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "name" TEXT NOT NULL,
        "price" REAL NOT NULL,
        "operator" TEXT NOT NULL,
        "description" TEXT,
        "deletedAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS "PhoneNumber" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "phoneNumber" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'Disponible',
        "lineStatus" TEXT NOT NULL DEFAULT 'Actif',
        "notes" TEXT,
        "deletedAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "forfaitId" INTEGER,
        CONSTRAINT "PhoneNumber_forfaitId_fkey" FOREIGN KEY ("forfaitId") REFERENCES "Forfait" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "PhoneNumber_phoneNumber_key" ON "PhoneNumber"("phoneNumber");`,
    `CREATE TABLE IF NOT EXISTS "Assignment" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "employeeId" INTEGER NOT NULL,
        "phoneNumberId" INTEGER NOT NULL,
        "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "returnedAt" DATETIME,
        "assignedBy" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Assignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "Assignment_phoneNumberId_fkey" FOREIGN KEY ("phoneNumberId") REFERENCES "PhoneNumber" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );`
  ];

  for (const stmt of schemaStatements) {
    await client.execute(stmt);
  }

  console.log('✅ Tables created on Turso cloud database!');
}

setup().catch(err => {
  console.error('❌ Error initializing Turso:', err);
  process.exit(1);
});
