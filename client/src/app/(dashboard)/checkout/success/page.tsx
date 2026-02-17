'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { CheckCircle, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { refetch, isPremium, loading } = useSubscription();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 15;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPremiumRef = useRef(isPremium);
  const retryCountRef = useRef(0);

  useEffect(() => {
    isPremiumRef.current = isPremium;
  }, [isPremium]);

  useEffect(() => {
    retryCountRef.current = retryCount;
  }, [retryCount]);

  useEffect(() => {
    // Only start polling if not already premium
    if (isPremium) {
      return;
    }

    // Initial fetch
    refetch();
    
    intervalRef.current = setInterval(async () => {
      if (!isPremiumRef.current && retryCountRef.current < maxRetries) {
        await refetch();
        setRetryCount(prev => prev + 1);
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [refetch, isPremium]);

  useEffect(() => {
    if (isPremium) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    } else if (retryCount >= maxRetries) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isPremium, router, retryCount]);

  if (loading || (!isPremium && retryCount < maxRetries)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-light to-cream-dark flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 rounded-full p-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Processing Your Subscription</h1>
          <p className="text-gray-600 mb-6">
            Please wait while we activate your premium subscription...
          </p>
          <p className="text-sm text-gray-500">
            This may take a few moments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-light to-cream-dark flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Premium!</h1>
        <p className="text-gray-600 mb-6">
          Your subscription is now active. You have full access to all Jonas features.
        </p>
        <Button onClick={() => router.push('/dashboard')} className="w-full">
          Go to Dashboard
        </Button>
        <p className="mt-4 text-sm text-gray-500">
          Redirecting to dashboard in a few seconds...
        </p>
      </div>
    </div>
  );
}
