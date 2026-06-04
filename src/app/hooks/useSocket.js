import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { storage } from '../config/environment';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://ukmkemasan-erp-backend.onrender.com';

export default function useSocket({ onNewMessage, onUnreadCount, onConversationUpdated } = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = storage.getToken();
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {});

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    if (onNewMessage) {
      socket.on('new:message', onNewMessage);
    }

    if (onUnreadCount) {
      socket.on('unread:count', onUnreadCount);
    }

    if (onConversationUpdated) {
      socket.on('conversation:updated', onConversationUpdated);
    }

    socketRef.current = socket;

    return () => {
      if (onNewMessage) socket.off('new:message', onNewMessage);
      if (onUnreadCount) socket.off('unread:count', onUnreadCount);
      if (onConversationUpdated) socket.off('conversation:updated', onConversationUpdated);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [onNewMessage, onUnreadCount, onConversationUpdated]);

  const joinConversation = useCallback((conversationId) => {
    socketRef.current?.emit('join:conversation', conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    socketRef.current?.emit('leave:conversation', conversationId);
  }, []);

  const sendMessage = useCallback((conversationId, text, callback, _tempId) => {
    const payload = _tempId ? { conversationId, text, _tempId } : { conversationId, text };
    socketRef.current?.emit('send:message', payload, callback);
  }, []);

  const markRead = useCallback((conversationId) => {
    socketRef.current?.emit('mark:read', { conversationId });
  }, []);

  return { joinConversation, leaveConversation, sendMessage, markRead, socket: socketRef.current };
}
