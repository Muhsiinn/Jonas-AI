import { useState, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api/client';
import { SubscriptionStatusResponse } from '@/types/subscription';

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchSubscription = useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      const status = await apiClient.getSubscriptionStatus();
      setSubscription(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription status');
      setSubscription(null);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const isPremium = subscription?.plan === 'premium' && 
    (subscription?.status === 'active' || subscription?.status === 'trialing');

  return {
    subscription,
    isPremium,
    loading,
    error,
    refetch: fetchSubscription,
  };
}
