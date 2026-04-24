'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface SocketContextType {
  socket: any;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(true); // Set as connected for demo

  useEffect(() => {
    // Mock socket for demo purposes since our simple backend doesn't have Socket.io
    const mockSocket = {
      on: () => {},
      off: () => {},
      emit: () => {},
      disconnect: () => {},
    };

    setSocket(mockSocket);
    console.log('Mock socket initialized for demo');
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}