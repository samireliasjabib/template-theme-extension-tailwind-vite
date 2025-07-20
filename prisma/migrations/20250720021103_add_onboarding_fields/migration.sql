-- CreateTable
CREATE TABLE "InstallationStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_INSTALLED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "installedAt" DATETIME,
    "uninstalledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InstallationStatus_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OnboardingBanner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDismissible" BOOLEAN NOT NULL DEFAULT true,
    "actionText" TEXT,
    "actionUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OnboardingBanner_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopifyDomain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "cartDrawerEnabled" BOOLEAN NOT NULL DEFAULT true,
    "cartDrawerConfig" TEXT,
    "isFirstInstall" BOOLEAN NOT NULL DEFAULT true,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingSteps" TEXT,
    "currentOnboardingStep" TEXT,
    "reinstalledAt" DATETIME,
    "lastActiveAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Store" ("cartDrawerConfig", "cartDrawerEnabled", "createdAt", "currency", "email", "id", "lastActiveAt", "name", "shopifyDomain", "timezone", "updatedAt") SELECT "cartDrawerConfig", "cartDrawerEnabled", "createdAt", "currency", "email", "id", "lastActiveAt", "name", "shopifyDomain", "timezone", "updatedAt" FROM "Store";
DROP TABLE "Store";
ALTER TABLE "new_Store" RENAME TO "Store";
CREATE UNIQUE INDEX "Store_shopifyDomain_key" ON "Store"("shopifyDomain");
CREATE INDEX "Store_shopifyDomain_idx" ON "Store"("shopifyDomain");
CREATE INDEX "Store_lastActiveAt_idx" ON "Store"("lastActiveAt");
CREATE INDEX "Store_isFirstInstall_idx" ON "Store"("isFirstInstall");
CREATE INDEX "Store_onboardingCompleted_idx" ON "Store"("onboardingCompleted");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "InstallationStatus_storeId_key" ON "InstallationStatus"("storeId");

-- CreateIndex
CREATE INDEX "InstallationStatus_status_idx" ON "InstallationStatus"("status");

-- CreateIndex
CREATE INDEX "InstallationStatus_installedAt_idx" ON "InstallationStatus"("installedAt");

-- CreateIndex
CREATE INDEX "OnboardingBanner_storeId_isActive_idx" ON "OnboardingBanner"("storeId", "isActive");

-- CreateIndex
CREATE INDEX "OnboardingBanner_type_idx" ON "OnboardingBanner"("type");
