'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { getStripe } from '@/lib/stripe';
import { useSubscription } from '@/contexts/SubscriptionContext';
import Button from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPremium, refetch } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || '';

  useEffect(() => {
    if (isPremium) {
      router.push('/dashboard');
    }
  }, [isPremium, router]);

  useEffect(() => {
    if (!priceId) {
      setError('Subscription is not configured. Please contact support or check environment variables.');
    }
  }, [priceId]);

  const handleCheckout = async () => {
    if (!priceId) {
      setError('Price ID not configured. Please contact support.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { url } = await apiClient.createCheckoutSession(priceId);
      
      if (url) {
        window.location.href = url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setLoading(false);
    }
  };

  if (isPremium) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-light to-cream-dark flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upgrade to Premium</h1>
        <p className="text-gray-600 mb-6">
          Get full access to all Jonas features for just $5/month
        </p>

        <div className="mb-6 space-y-3">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-gray-700">Unlimited German lessons</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-gray-700">AI Roleplay sessions</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-gray-700">Leaderboard & Daily Streaks</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-gray-700">Writing practice</p>
          </div>
        </div>

        {!priceId && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
            <p className="font-semibold mb-1">Configuration Error</p>
            <p>NEXT_PUBLIC_STRIPE_PRICE_ID is not set. Please configure Stripe in your environment variables.</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={handleCheckout}
          disabled={loading || !priceId}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Subscribe for $5/month'
          )}
        </Button>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Cancel anytime. Secure payment powered by Stripe.
        </p>
      </div>
    </div>
  );
}
