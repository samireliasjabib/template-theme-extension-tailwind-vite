-- CreateTable
CREATE TABLE "stores" (
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
    "minSupport" REAL NOT NULL DEFAULT 0.01,
    "minConfidence" REAL NOT NULL DEFAULT 0.5,
    "customAlgoMinOccurrence" INTEGER NOT NULL DEFAULT 3,
    "targetRecommendations" INTEGER NOT NULL DEFAULT 10,
    "processingWindow" INTEGER NOT NULL DEFAULT 90,
    "maxHistoryDays" INTEGER NOT NULL DEFAULT 365,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" DATETIME,
    "lastPatternUpdate" DATETIME,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "dataQualityScore" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "shopifyOrderId" BIGINT NOT NULL,
    "customerId" BIGINT,
    "totalAmount" REAL NOT NULL,
    "orderDate" DATETIME NOT NULL,
    "isProcessedFP" BOOLEAN NOT NULL DEFAULT false,
    "isProcessedCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "orders_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "shopifyProductId" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "productTitle" TEXT,
    "vendor" TEXT,
    "productType" TEXT,
    "tags" TEXT,
    CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "frequent_patterns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "productIds" TEXT NOT NULL,
    "supportCount" INTEGER NOT NULL,
    "confidence" REAL NOT NULL,
    "lift" REAL NOT NULL,
    "patternSize" INTEGER NOT NULL,
    "generationDate" DATETIME NOT NULL,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "totalOrders" INTEGER NOT NULL,
    "dataQuality" REAL NOT NULL,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "frequent_patterns_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pair_triple_patterns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "productIds" TEXT NOT NULL,
    "occurrenceCount" INTEGER NOT NULL,
    "patternType" TEXT NOT NULL,
    "generationDate" DATETIME NOT NULL,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "strength" REAL NOT NULL,
    "totalOrders" INTEGER NOT NULL,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pair_triple_patterns_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "installedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "uninstalledAt" DATETIME,
    "currentPlan" TEXT NOT NULL DEFAULT 'STARTER',
    "billingStatus" TEXT NOT NULL DEFAULT 'TRIAL',
    "trialStartedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trialEndsAt" DATETIME NOT NULL,
    "trialExtended" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionId" TEXT,
    "lastBillingDate" DATETIME,
    "nextBillingDate" DATETIME,
    "planChangedAt" DATETIME,
    "previousPlan" TEXT,
    "monthlyViews" INTEGER NOT NULL DEFAULT 0,
    "monthlyClicks" INTEGER NOT NULL DEFAULT 0,
    "monthlyRevenue" REAL NOT NULL DEFAULT 0,
    "lastActiveAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "webhookStatus" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "subscriptions_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "stores_shopifyDomain_key" ON "stores"("shopifyDomain");

-- CreateIndex
CREATE UNIQUE INDEX "orders_shopifyOrderId_key" ON "orders"("shopifyOrderId");

-- CreateIndex
CREATE INDEX "orders_storeId_isProcessedFP_idx" ON "orders"("storeId", "isProcessedFP");

-- CreateIndex
CREATE INDEX "orders_storeId_isProcessedCustom_idx" ON "orders"("storeId", "isProcessedCustom");

-- CreateIndex
CREATE INDEX "orders_storeId_orderDate_idx" ON "orders"("storeId", "orderDate");

-- CreateIndex
CREATE INDEX "order_items_shopifyProductId_idx" ON "order_items"("shopifyProductId");

-- CreateIndex
CREATE INDEX "order_items_vendor_idx" ON "order_items"("vendor");

-- CreateIndex
CREATE INDEX "order_items_productType_idx" ON "order_items"("productType");

-- CreateIndex
CREATE INDEX "frequent_patterns_storeId_isLatest_idx" ON "frequent_patterns"("storeId", "isLatest");

-- CreateIndex
CREATE INDEX "frequent_patterns_storeId_confidence_isLatest_idx" ON "frequent_patterns"("storeId", "confidence", "isLatest");

-- CreateIndex
CREATE INDEX "frequent_patterns_generationDate_idx" ON "frequent_patterns"("generationDate");

-- CreateIndex
CREATE UNIQUE INDEX "frequent_patterns_storeId_productIds_generationDate_key" ON "frequent_patterns"("storeId", "productIds", "generationDate");

-- CreateIndex
CREATE INDEX "pair_triple_patterns_storeId_patternType_isLatest_idx" ON "pair_triple_patterns"("storeId", "patternType", "isLatest");

-- CreateIndex
CREATE INDEX "pair_triple_patterns_storeId_isLatest_idx" ON "pair_triple_patterns"("storeId", "isLatest");

-- CreateIndex
CREATE INDEX "pair_triple_patterns_generationDate_idx" ON "pair_triple_patterns"("generationDate");

-- CreateIndex
CREATE UNIQUE INDEX "pair_triple_patterns_storeId_productIds_patternType_generationDate_key" ON "pair_triple_patterns"("storeId", "productIds", "patternType", "generationDate");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_storeId_key" ON "subscriptions"("storeId");
