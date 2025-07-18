/*
  Warnings:

  - You are about to drop the column `customAlgoMinOccurrence` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `maxHistoryDays` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `minConfidence` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `minSupport` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `processingWindow` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `targetRecommendations` on the `stores` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_stores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopifyDomain" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "shopifyStoreId" BIGINT,
    "name" TEXT,
    "email" TEXT,
    "planType" TEXT NOT NULL DEFAULT 'STARTER',
    "billingStatus" TEXT NOT NULL DEFAULT 'TRIAL',
    "trialEndsAt" DATETIME,
    "subscriptionId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" DATETIME,
    "lastPatternUpdate" DATETIME,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "dataQualityScore" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_stores" ("accessToken", "billingStatus", "createdAt", "dataQualityScore", "email", "id", "isActive", "lastPatternUpdate", "lastSyncAt", "name", "planType", "shopifyDomain", "shopifyStoreId", "subscriptionId", "totalOrders", "trialEndsAt", "updatedAt") SELECT "accessToken", "billingStatus", "createdAt", "dataQualityScore", "email", "id", "isActive", "lastPatternUpdate", "lastSyncAt", "name", "planType", "shopifyDomain", "shopifyStoreId", "subscriptionId", "totalOrders", "trialEndsAt", "updatedAt" FROM "stores";
DROP TABLE "stores";
ALTER TABLE "new_stores" RENAME TO "stores";
CREATE UNIQUE INDEX "stores_shopifyDomain_key" ON "stores"("shopifyDomain");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
