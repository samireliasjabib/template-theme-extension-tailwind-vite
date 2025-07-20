-- CreateTable
CREATE TABLE "DashboardConfigStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "stepType" TEXT NOT NULL DEFAULT 'CART_DRAWER_SETUP',
    "stepTitle" TEXT NOT NULL,
    "stepDescription" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "configData" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DashboardConfigStep_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DashboardConfigStep_storeId_stepType_idx" ON "DashboardConfigStep"("storeId", "stepType");

-- CreateIndex
CREATE INDEX "DashboardConfigStep_storeId_isCompleted_idx" ON "DashboardConfigStep"("storeId", "isCompleted");

-- CreateIndex
CREATE INDEX "DashboardConfigStep_storeId_order_idx" ON "DashboardConfigStep"("storeId", "order");
