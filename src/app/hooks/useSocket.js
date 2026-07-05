import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { storage } from '../config/environment';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://ukmkemasan-erp-backend.onrender.com');

let sharedSocket = null;
let subscriberCount = 0;
const eventHandlers = {};

function ensureSocket() {
  const token = storage.getToken();
  if (!token) return null;

  if (!sharedSocket) {
    sharedSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    sharedSocket.on('disconnect', () => { sharedSocket = null; });
  }

  return sharedSocket;
}

function subscribe(event, handler) {
  const socket = ensureSocket();
  if (!socket) return () => {};

  if (!eventHandlers[event]) eventHandlers[event] = new Set();
  eventHandlers[event].add(handler);
  socket.on(event, handler);

  return () => {
    socket.off(event, handler);
    eventHandlers[event]?.delete(handler);
  };
}

export default function useSocket({ onNewMessage, onUnreadCount, onConversationUpdated } = {}) {
  const handlersRef = useRef({ onNewMessage, onUnreadCount, onConversationUpdated });
  handlersRef.current = { onNewMessage, onUnreadCount, onConversationUpdated };

  useEffect(() => {
    if (!storage.getToken()) return;
    ensureSocket();
    subscriberCount++;

    const unsubNew = subscribe('new:message', (data) => handlersRef.current.onNewMessage?.(data));
    const unsubUnread = subscribe('unread:count', (data) => handlersRef.current.onUnreadCount?.(data));
    const unsubUpdated = subscribe('conversation:updated', (data) => handlersRef.current.onConversationUpdated?.(data));

    return () => {
      unsubNew();
      unsubUnread();
      unsubUpdated();
      subscriberCount--;
      if (subscriberCount <= 0 && sharedSocket) {
        sharedSocket.disconnect();
        sharedSocket = null;
      }
    };
  }, []);

  const joinConversation = useCallback((conversationId) => {
    sharedSocket?.emit('join:conversation', conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    sharedSocket?.emit('leave:conversation', conversationId);
  }, []);

  const sendMessage = useCallback((conversationId, text, callback, _tempId) => {
    const payload = _tempId ? { conversationId, text, _tempId } : { conversationId, text };
    sharedSocket?.emit('send:message', payload, callback);
  }, []);

  const markRead = useCallback((conversationId) => {
    sharedSocket?.emit('mark:read', { conversationId });
  }, []);

  return { joinConversation, leaveConversation, sendMessage, markRead, socket: sharedSocket };
}
