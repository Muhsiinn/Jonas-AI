"use client";

import { createContext, useContext, ReactNode, useEffect, useRef } from "react";
import { useSubscription as useSubscriptionHook } from "@/lib/hooks/useSubscription";
import { useAuth } from "./AuthContext";

interface SubscriptionContextType {
  subscription: ReturnType<typeof useSubscriptionHook>['subscription'];
  loading: ReturnType<typeof useSubscriptionHook>['loading'];
  isPremium: ReturnType<typeof useSubscriptionHook>['isPremium'];
  error: ReturnType<typeof useSubscriptionHook>['error'];
  refetch: ReturnType<typeof useSubscriptionHook>['refetch'];
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const subscription = useSubscriptionHook();
  const refetchRef = useRef(subscription.refetch);
  const lastFetchRef = useRef<number>(0);
  const MIN_FETCH_INTERVAL = 5000; // Minimum 5 seconds between fetches

  useEffect(() => {
    refetchRef.current = subscription.refetch;
  }, [subscription.refetch]);

  useEffect(() => {
    if (isAuthenticated) {
      const handleFocus = () => {
        const now = Date.now();
        // Throttle refetch on window focus to prevent excessive polling
        if (now - lastFetchRef.current > MIN_FETCH_INTERVAL) {
          lastFetchRef.current = now;
          refetchRef.current();
        }
      };
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [isAuthenticated]);

  return (
    <SubscriptionContext.Provider value={subscription}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
