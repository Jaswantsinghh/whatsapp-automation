'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <h1 className="text-4xl font-bold text-foreground mb-4">Oops!</h1>
            <h2 className="text-xl font-semibold text-foreground mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">
              We encountered an unexpected error in the WhatsApp Dashboard. Please try again.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => reset()}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}