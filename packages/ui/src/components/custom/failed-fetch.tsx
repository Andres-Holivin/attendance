'use client';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '../card';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

export function FailedFetch({ message, retry }: Readonly<{ message?: string, retry?: () => void }>) {
  function retryFunction(){
    if(retry) return retry();
    window.location.reload();
  }
  return (
    <div className='absolute top-1/2 left-1/2 mb-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-center'>
      <Card className="shadow-lg border">
        <CardContent className="flex flex-col items-center text-center p-8">
          <div className="mb-6 space-y-4">
            <AlertTriangle className="h-16 w-16 text-destructive-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We encountered an unexpected error while processing your request. Please try again or return to the
              homepage.
            </p>
            <p>{message && <span className="text-red-500 mt-2">Error Details: {message}</span>}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Button onClick={()=>window.location.href="/dashboard"} variant="default" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
            <Button onClick={retryFunction} variant="secondary" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
