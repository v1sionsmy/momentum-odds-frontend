import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_UPDATES_WS_URL || 'wss://momentum-ignition-backend.onrender.com/ws/updates';

export interface UpdateMessage {
  type: string;
  data: Record<string, unknown>;
  odds?: unknown;
  gameId?: string;
}

export function useUpdatesWebSocket(onMessage: (msg: UpdateMessage) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(() => {
    setError(null);
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => setError(new Error('WebSocket error'));
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        onMessage(msg);
      } catch {
        setError(new Error('Failed to parse WebSocket message'));
      }
    };
  }, [onMessage]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  return { isConnected, error };
} 