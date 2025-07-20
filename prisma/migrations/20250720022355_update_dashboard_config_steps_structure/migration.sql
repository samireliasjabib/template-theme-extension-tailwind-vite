/*
  Warnings:

  - You are about to drop the column `configData` on the `DashboardConfigStep` table. All the data in the column will be lost.
  - Added the required column `actionButtonText` to the `DashboardConfigStep` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DashboardConfigStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "stepType" TEXT NOT NULL DEFAULT 'CART_DRAWER_SETUP',
    "stepTitle" TEXT NOT NULL,
    "stepDescription" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "actionButtonText" TEXT NOT NULL,
    "actionUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DashboardConfigStep_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DashboardConfigStep" ("completedAt", "createdAt", "id", "isCompleted", "order", "stepDescription", "stepTitle", "stepType", "storeId", "updatedAt") SELECT "completedAt", "createdAt", "id", "isCompleted", "order", "stepDescription", "stepTitle", "stepType", "storeId", "updatedAt" FROM "DashboardConfigStep";
DROP TABLE "DashboardConfigStep";
ALTER TABLE "new_DashboardConfigStep" RENAME TO "DashboardConfigStep";
CREATE INDEX "DashboardConfigStep_storeId_stepType_idx" ON "DashboardConfigStep"("storeId", "stepType");
CREATE INDEX "DashboardConfigStep_storeId_isCompleted_idx" ON "DashboardConfigStep"("storeId", "isCompleted");
CREATE INDEX "DashboardConfigStep_storeId_order_idx" ON "DashboardConfigStep"("storeId", "order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
