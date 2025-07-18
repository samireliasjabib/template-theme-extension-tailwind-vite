/*
  Warnings:

  - You are about to drop the `frequent_patterns` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pair_triple_patterns` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stores` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscriptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "frequent_patterns";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "order_items";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "orders";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "pair_triple_patterns";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "stores";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "subscriptions";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopifyDomain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "cartDrawerEnabled" BOOLEAN NOT NULL DEFAULT true,
    "cartDrawerConfig" TEXT,
    "lastActiveAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "planName" TEXT NOT NULL DEFAULT 'BASIC',
    "status" TEXT NOT NULL DEFAULT 'TRIAL',
    "billingCycle" TEXT NOT NULL DEFAULT 'MONTHLY',
    "trialEndsAt" DATETIME,
    "currentPeriodEnd" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CartDrawer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "trafficPercentage" INTEGER NOT NULL DEFAULT 100,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CartDrawer_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CartDrawerFeature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cartDrawerId" TEXT NOT NULL,
    "featureType" TEXT NOT NULL DEFAULT 'RECOMMENDATIONS',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "config" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CartDrawerFeature_cartDrawerId_fkey" FOREIGN KEY ("cartDrawerId") REFERENCES "CartDrawer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CartSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "cartDrawerId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "customerId" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "totalTime" INTEGER,
    "cartValue" REAL NOT NULL DEFAULT 0,
    "itemsCount" INTEGER NOT NULL DEFAULT 0,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "orderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CartSession_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CartSession_cartDrawerId_fkey" FOREIGN KEY ("cartDrawerId") REFERENCES "CartDrawer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CartEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "cartSessionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL DEFAULT 'ADD_ITEM',
    "productId" TEXT,
    "variantId" TEXT,
    "quantity" INTEGER,
    "price" REAL,
    "metadata" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CartEvent_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CartEvent_cartSessionId_fkey" FOREIGN KEY ("cartSessionId") REFERENCES "CartSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscountRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PERCENTAGE',
    "value" REAL NOT NULL,
    "minQuantity" INTEGER,
    "minAmount" REAL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DiscountRule_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FPGrowthPattern" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "support" REAL NOT NULL,
    "confidence" REAL NOT NULL,
    "lift" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FPGrowthPattern_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnalyticsSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "metric" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsSummary_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_shopifyDomain_key" ON "Store"("shopifyDomain");

-- CreateIndex
CREATE INDEX "Store_shopifyDomain_idx" ON "Store"("shopifyDomain");

-- CreateIndex
CREATE INDEX "Store_lastActiveAt_idx" ON "Store"("lastActiveAt");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_storeId_key" ON "Subscription"("storeId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_currentPeriodEnd_idx" ON "Subscription"("currentPeriodEnd");

-- CreateIndex
CREATE INDEX "CartDrawer_storeId_isActive_idx" ON "CartDrawer"("storeId", "isActive");

-- CreateIndex
CREATE INDEX "CartDrawer_storeId_version_idx" ON "CartDrawer"("storeId", "version");

-- CreateIndex
CREATE INDEX "CartDrawerFeature_cartDrawerId_featureType_idx" ON "CartDrawerFeature"("cartDrawerId", "featureType");

-- CreateIndex
CREATE INDEX "CartSession_storeId_startedAt_idx" ON "CartSession"("storeId", "startedAt");

-- CreateIndex
CREATE INDEX "CartSession_sessionId_idx" ON "CartSession"("sessionId");

-- CreateIndex
CREATE INDEX "CartSession_customerId_idx" ON "CartSession"("customerId");

-- CreateIndex
CREATE INDEX "CartSession_storeId_converted_idx" ON "CartSession"("storeId", "converted");

-- CreateIndex
CREATE INDEX "CartEvent_storeId_timestamp_idx" ON "CartEvent"("storeId", "timestamp");

-- CreateIndex
CREATE INDEX "CartEvent_cartSessionId_eventType_idx" ON "CartEvent"("cartSessionId", "eventType");

-- CreateIndex
CREATE INDEX "CartEvent_productId_idx" ON "CartEvent"("productId");

-- CreateIndex
CREATE INDEX "CartEvent_storeId_eventType_timestamp_idx" ON "CartEvent"("storeId", "eventType", "timestamp");

-- CreateIndex
CREATE INDEX "DiscountRule_storeId_isActive_idx" ON "DiscountRule"("storeId", "isActive");

-- CreateIndex
CREATE INDEX "DiscountRule_storeId_type_idx" ON "DiscountRule"("storeId", "type");

-- CreateIndex
CREATE INDEX "DiscountRule_startsAt_endsAt_idx" ON "DiscountRule"("startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "FPGrowthPattern_storeId_support_idx" ON "FPGrowthPattern"("storeId", "support");

-- CreateIndex
CREATE INDEX "FPGrowthPattern_storeId_confidence_idx" ON "FPGrowthPattern"("storeId", "confidence");

-- CreateIndex
CREATE INDEX "FPGrowthPattern_storeId_isActive_idx" ON "FPGrowthPattern"("storeId", "isActive");

-- CreateIndex
CREATE INDEX "AnalyticsSummary_storeId_date_idx" ON "AnalyticsSummary"("storeId", "date");

-- CreateIndex
CREATE INDEX "AnalyticsSummary_storeId_metric_idx" ON "AnalyticsSummary"("storeId", "metric");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsSummary_storeId_date_metric_key" ON "AnalyticsSummary"("storeId", "date", "metric");
