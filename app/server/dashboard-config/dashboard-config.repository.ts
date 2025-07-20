import prisma from "../db.server";
import {  type DashboardConfigStepType } from "./onboarding.types";

export async function createDefaultConfigSteps(storeId: string) {
  const defaultSteps = [
    {
      stepType: "MATCH_BRAND_DESIGN" as DashboardConfigStepType,
      stepTitle: "Match your brand design",
      stepDescription: "UpCart comes with great defaults but every brand is different. Hop into the cart editor and use the design options to match your brand.",
      order: 1,
      actionButtonText: "Open cart editor",
      actionUrl: "/cart-editor"
    },
    {
      stepType: "ADD_UPSELLS" as DashboardConfigStepType,
      stepTitle: "Add upsells",
      stepDescription: "Boost your AOV by using UpCart's high converting upsell offers. Head over to the cart editor to add upsells to your cart drawer.",
      order: 2,
      actionButtonText: "Add upsells",
      actionUrl: "/cart-editor/upsells"
    },
    {
      stepType: "ADD_REWARDS" as DashboardConfigStepType,
      stepTitle: "Add rewards",
      stepDescription: "Add a rewards module to offer urge customers to shop more. Create a free shipping bar, offer a free gift, or other rewards.",
      order: 3,
      actionButtonText: "Add rewards",
      actionUrl: "/cart-editor/rewards"
    },
    {
      stepType: "ACTIVATE_CART_DRAWER" as DashboardConfigStepType,
      stepTitle: "Activate UpCart",
      stepDescription: "Go to the cart editor and activate UpCart by switching it from 'Disabled' to 'Active'.",
      order: 4,
      actionButtonText: "Activate UpCart",
      actionUrl: "/cart-editor/activate"
    }
  ];

  return prisma.dashboardConfigStep.createMany({
    data: defaultSteps.map(step => ({
      storeId,
      ...step
    }))
  });
}

export async function getConfigSteps(storeId: string) {
  return prisma.dashboardConfigStep.findMany({
    where: { storeId },
    orderBy: { order: 'asc' }
  });
}

export async function completeConfigStep(stepId: string) {
  return prisma.dashboardConfigStep.update({
    where: { id: stepId },
    data: {
      isCompleted: true,
      completedAt: new Date()
    }
  });
}

export async function getNextConfigStep(storeId: string) {
  return prisma.dashboardConfigStep.findFirst({
    where: { 
      storeId,
      isCompleted: false 
    },
    orderBy: { order: 'asc' }
  });
} 