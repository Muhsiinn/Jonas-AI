'use client';

import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-light to-cream-dark flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 rounded-full p-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout Cancelled</h1>
        <p className="text-gray-600 mb-6">
          Your subscription was not completed. No charges were made.
        </p>
        <div className="space-y-3">
          <Button onClick={() => router.push('/checkout')} className="w-full">
            Try Again
          </Button>
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="w-full"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
