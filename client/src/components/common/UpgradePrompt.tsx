'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Lock, X } from 'lucide-react';

interface UpgradePromptProps {
  title?: string;
  message?: string;
  showButton?: boolean;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function UpgradePrompt({
  title = 'Upgrade to Premium',
  message = 'This feature is only available for premium users. Upgrade now to unlock all features!',
  showButton = true,
  onClose,
  showCloseButton = true,
}: UpgradePromptProps) {
  const router = useRouter();

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="flex justify-center mb-4">
          <div className="bg-amber-100 rounded-full p-4">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        {showButton && (
          <Button
            onClick={() => router.push('/checkout')}
            className="w-full"
          >
            Upgrade to Premium
          </Button>
        )}
      </div>
    </div>
  );
}
