import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

const SOCKET_URL = import.meta.env.VITE_WS_URL || (import.meta.env.VITE_API_URL || 'https://solubly-postinfective-mamie.ngrok-free.dev').replace(/\/api\/?$/, '');

export const useSocket = (roomId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      extraHeaders: {
        'ngrok-skip-browser-warning': 'true',
      },
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      if (roomId) {
        newSocket.emit('joinRoom', roomId);
      }
    });

    newSocket.on('connect_error', (err) => {
      console.warn('Socket connect error:', err.message);
    });

    // Listen for generic task updates to invalidate cache
    newSocket.on('taskUpdated', (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (data?.projectId) {
        queryClient.invalidateQueries({ queryKey: ['project', data.projectId] });
      }
    });
    
    // Listen for project updates
    newSocket.on('projectUpdated', () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, queryClient]);

  return socket;
};
