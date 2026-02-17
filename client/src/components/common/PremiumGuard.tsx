'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { UpgradePrompt } from './UpgradePrompt';
import { ReactNode } from 'react';

interface PremiumGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function PremiumGuard({ children, fallback }: PremiumGuardProps) {
  const { isPremium, loading } = useSubscription();
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);

  if (!isPremium && !loading) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showModal) {
      router.push('/dashboard');
      return null;
    }

    return (
      <div className="relative">
        {children}
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setShowModal(false)}
        />
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <UpgradePrompt onClose={() => setShowModal(false)} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
