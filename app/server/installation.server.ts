/**
 * installation.server.ts
 * ------------------------------------------------
 *  Módulo funcional para sincronizar la instalación
 *  y la des-instalación de la app.
 */
import prisma from "./db.server";
import type { Session } from "@shopify/shopify-app-remix/server";

/* ---------- 1. INSTALL --------------------------------------------------- */
export async function registerInstallation(session: Session) {
  const { shop } = session;

  /* 1A.  Upsert de Store */
  const store = await prisma.store.upsert({
    where: { shopifyDomain: shop },
    create: {
      shopifyDomain: shop,
      name: shop,
      cartDrawerEnabled: true,
    },
    update: {
      lastActiveAt: new Date(),
    },
  });

  /* 1B.  Upsert de Subscription (modo TRIAL) */
  await prisma.subscription.upsert({
    where: { storeId: store.id },
    create: {
      storeId: store.id,
      planName: "BASIC",
      status: "TRIAL",
      billingCycle: "MONTHLY",
      currentPeriodEnd: new Date(), // placeholder
    },
    update: { updatedAt: new Date() },
  });

  return store;
}

/* ---------- 2. UNINSTALL -------------------------------------------------- */
export async function markUninstalled(shopDomain: string) {
  /* 2A.  Marcar InstallationStatus */
  await prisma.installationStatus.upsert({
    where: { storeId: shopDomain },           // storeId === shopDomain (clave única)
    create: {
      storeId: shopDomain,
      status: "UNINSTALLED",
      uninstalledAt: new Date(),
      progress: 100,
    },
    update: {
      status: "UNINSTALLED",
      uninstalledAt: new Date(),
      progress: 100,
    },
  });

  /* 2B.  Opcional: desactivar suscripción */
  await prisma.subscription.updateMany({
    where: { store: { shopifyDomain: shopDomain } },
    data: { status: "CANCELLED", updatedAt: new Date() },
  });
} 