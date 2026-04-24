'use client';

import { Wifi, WifiOff } from 'lucide-react';

interface RealtimeIndicatorProps {
  isConnected: boolean;
}

export function RealtimeIndicator({ isConnected }: RealtimeIndicatorProps) {
  return (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <>
          <div className="flex items-center space-x-1">
            <Wifi className="h-4 w-4 text-green-600" />
            <div className="relative">
              <div className="h-2 w-2 bg-green-600 rounded-full"></div>
              <div className="absolute top-0 left-0 h-2 w-2 bg-green-600 rounded-full animate-ping"></div>
            </div>
          </div>
          <span className="text-xs text-green-600 font-medium">Live</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-xs text-red-500 font-medium">Disconnected</span>
        </>
      )}
    </div>
  );
}