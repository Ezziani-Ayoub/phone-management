-- AlterTable
ALTER TABLE "Employee" ADD COLUMN "site" TEXT;

-- CreateTable
CREATE TABLE "Forfait" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "operator" TEXT NOT NULL,
    "description" TEXT,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PhoneNumber" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phoneNumber" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Disponible',
    "lineStatus" TEXT NOT NULL DEFAULT 'Actif',
    "notes" TEXT,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "forfaitId" INTEGER,
    CONSTRAINT "PhoneNumber_forfaitId_fkey" FOREIGN KEY ("forfaitId") REFERENCES "Forfait" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PhoneNumber" ("createdAt", "deletedAt", "id", "notes", "phoneNumber", "provider", "status", "updatedAt") SELECT "createdAt", "deletedAt", "id", "notes", "phoneNumber", "provider", "status", "updatedAt" FROM "PhoneNumber";
DROP TABLE "PhoneNumber";
ALTER TABLE "new_PhoneNumber" RENAME TO "PhoneNumber";
CREATE UNIQUE INDEX "PhoneNumber_phoneNumber_key" ON "PhoneNumber"("phoneNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
