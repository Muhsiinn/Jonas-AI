export type SubscriptionPlan = "free" | "premium";
export type SubscriptionStatus = "free" | "active" | "canceled" | "past_due" | "trialing";

export interface UserSubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export interface CheckoutSessionResponse {
  session_id: string;
  url: string;
}

export interface SubscriptionStatusResponse {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}
