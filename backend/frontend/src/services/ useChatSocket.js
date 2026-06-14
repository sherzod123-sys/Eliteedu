import { useEffect, useRef, useCallback } from 'react';
import { WS_BASE } from '../utils/api';

export function useChatSocket(roomId, onMessageRef) {
  const wsRef        = useRef(null);
  const reconnectRef = useRef(null);
  const attemptsRef  = useRef(0);

  useEffect(() => {
    if (!roomId) return;

    const connect = () => {
      if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); }
      const token = localStorage.getItem('access_token');
      const ws    = new WebSocket(`${WS_BASE}/${roomId}/?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        attemptsRef.current = 0;
      };

      ws.onmessage = (e) => {
        try { onMessageRef.current?.(JSON.parse(e.data)); } catch {}
      };

      ws.onclose = (e) => {
        if (e.code !== 1000) {
          const delay = Math.min(1000 * 2 ** attemptsRef.current, 30000);
          attemptsRef.current++;
          reconnectRef.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = () => ws.close();
    };

    connect();

    return () => {
      clearTimeout(reconnectRef.current);
      if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(1000); }
    };
  }, [roomId]);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN)
      wsRef.current.send(JSON.stringify(data));
  }, []);

  const isConnected = () => wsRef.current?.readyState === WebSocket.OPEN;

  return { send, isConnected };
}