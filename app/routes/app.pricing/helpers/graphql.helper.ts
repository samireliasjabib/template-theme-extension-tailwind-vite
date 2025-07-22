export const APP_SUBSCRIPTION_CREATE_MUTATION = `
  mutation appSubscriptionCreate($name: String!, $returnUrl: URL!, $lineItems: [AppSubscriptionLineItemInput!]!) {
    appSubscriptionCreate(
      name: $name
      returnUrl: $returnUrl
      lineItems: $lineItems
    ) {
      userErrors {
        field
        message
      }
      confirmationUrl
      appSubscription {
        id
        lineItems {
          id
          plan {
            pricingDetails {
              __typename
            }
          }
        }
      }
    }
  }
`; 