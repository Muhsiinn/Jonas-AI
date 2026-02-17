"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { apiClient } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { CheckCircle, XCircle, Loader2, CreditCard, AlertTriangle } from "lucide-react";
import { ROUTES } from "@/lib/config/routes";

export default function SubscriptionPage() {
  const { logout } = useAuth();
  const { subscription, loading, isPremium, refetch } = useSubscription();
  const router = useRouter();
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleUpgrade = async () => {
    try {
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || '';
      if (!priceId) {
        setError('Subscription is not configured. Please contact support.');
        return;
      }

      const { url } = await apiClient.createCheckoutSession(priceId);
      if (url) {
        window.location.href = url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
    }
  };

  const handleCancel = async () => {
    try {
      setCanceling(true);
      setError(null);
      await apiClient.cancelSubscription();
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setCanceling(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'text-green-600';
      case 'canceled':
      case 'past_due':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'trialing':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'canceled':
      case 'past_due':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-cream flex flex-col overflow-hidden">
      <Navbar onLogout={logout} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-bold text-foreground mb-2">
              Subscription
            </h1>
            <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600">
              Manage your subscription and billing
            </p>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl p-8 border border-cream-dark flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-[family-name:var(--font-dm-sans)]">
                  {error}
                </div>
              )}

              <div className="bg-white rounded-xl p-6 border border-cream-dark">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-bold text-foreground">
                    Current Plan
                  </h2>
                  {subscription && getStatusIcon(subscription.status)}
                </div>

                {subscription ? (
                  <div className="space-y-4">
                    <div>
                      <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600 mb-1">
                        Plan
                      </p>
                      <p className="font-[family-name:var(--font-dm-sans)] text-lg font-semibold text-foreground capitalize">
                        {subscription.plan}
                      </p>
                    </div>

                    <div>
                      <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600 mb-1">
                        Status
                      </p>
                      <p className={`font-[family-name:var(--font-dm-sans)] text-lg font-semibold capitalize ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </p>
                    </div>

                    {subscription.current_period_end && (
                      <div>
                        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-600 mb-1">
                          {subscription.cancel_at_period_end ? 'Access until' : 'Renews on'}
                        </p>
                        <p className="font-[family-name:var(--font-dm-sans)] text-lg text-foreground">
                          {formatDate(subscription.current_period_end)}
                        </p>
                      </div>
                    )}

                    {subscription.cancel_at_period_end && (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm font-[family-name:var(--font-dm-sans)]">
                        Your subscription will be canceled at the end of the current billing period.
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="font-[family-name:var(--font-dm-sans)] text-gray-600">
                    Unable to load subscription information
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                {!isPremium && (
                  <Button
                    onClick={handleUpgrade}
                    variant="primary"
                    size="md"
                    className="flex-1"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                )}

                {isPremium && !subscription?.cancel_at_period_end && (
                  <Button
                    onClick={() => setShowCancelConfirm(true)}
                    variant="outline"
                    size="md"
                    className="flex-1 border-red-300 text-red-700 hover:bg-red-500 hover:border-red-400 cursor-pointer"
                    disabled={canceling}
                  >
                    {canceling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Canceling...
                      </>
                    ) : (
                      'Cancel Subscription'
                    )}
                  </Button>
                )}
              </div>

              {isPremium && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="font-[family-name:var(--font-fraunces)] font-bold text-foreground mb-2">
                    Premium Benefits
                  </h3>
                  <ul className="space-y-1 text-sm font-[family-name:var(--font-dm-sans)] text-gray-700">
                    <li>• Unlimited lessons and practice</li>
                    <li>• Advanced analytics and progress tracking</li>
                    <li>• Priority support</li>
                    <li>• Access to all premium features</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !canceling && setShowCancelConfirm(false)}
          />
          <div className="relative z-10 max-w-md w-full mx-4 rounded-2xl bg-white border border-cream-dark shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="font-[family-name:var(--font-fraunces)] text-lg font-bold text-foreground">
                Cancel premium subscription?
              </h2>
            </div>
            <div className="space-y-3 mb-5">
              <p className="font-[family-name:var(--font-dm-sans)] text-sm text-gray-700">
                Are you sure you want to cancel your premium plan? Your access will end immediately.
              </p>
              <ul className="list-disc list-inside space-y-1 font-[family-name:var(--font-dm-sans)] text-xs text-gray-600">
                <li>You&apos;ll be downgraded to the free plan right away.</li>
                <li>You&apos;ll lose access to premium features like lessons, roleplay, streaks and leaderboard.</li>
              </ul>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => !canceling && setShowCancelConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-[family-name:var(--font-dm-sans)] text-gray-700 hover:bg-cream-dark/30"
                disabled={canceling}
              >
                Keep subscription
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleCancel();
                  setShowCancelConfirm(false);
                }}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-[family-name:var(--font-dm-sans)] bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                disabled={canceling}
              >
                {canceling && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Yes, cancel premium
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
