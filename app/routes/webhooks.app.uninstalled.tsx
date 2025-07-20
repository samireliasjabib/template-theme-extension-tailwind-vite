import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../server/shopify.server";
import db from "../server/db.server";
import { markUninstalled } from "../server/installation/installation.service";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }

  const payload = await request.json();
  await markUninstalled(payload?.domain);
  return new Response("ok");
};
