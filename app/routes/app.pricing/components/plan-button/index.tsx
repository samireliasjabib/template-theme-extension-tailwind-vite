import { Form } from "@remix-run/react";
import { Button } from "@shopify/polaris";
import type { Plan } from "../../types";

interface PlanButtonProps {
  plan: Pick<Plan, "id" | "buttonText" | "buttonVariant">;
}

export function PlanButton({ plan }: PlanButtonProps) {
  return (
    <Form method="post">
      <input type="hidden" name="plan" value={plan.id} />
      <Button
        variant={plan.buttonVariant}
        size="medium"
        fullWidth
        submit
      >
        {plan.buttonText}
      </Button>
    </Form>
  );
}