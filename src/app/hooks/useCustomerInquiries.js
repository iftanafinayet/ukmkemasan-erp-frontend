import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import api from '../utils/api';
import { ENDPOINTS, storage } from '../config/environment';
import useSocket from './useSocket';

export default function useCustomerInquiries({ prefillProduct } = {}) {
  const user = storage.getUser();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(prefillProduct?._id || '');
  const messagesEndRef = useRef(null);
  const tempIdCounter = useRef(0);

  useEffect(() => {
    if (prefillProduct) {
      setSelectedProductId(prefillProduct._id);
      setShowNewForm(true);
    }
  }, [prefillProduct]);

  const handleNewMessage = useCallback((message) => {
    if (selectedConv && (message.conversation === selectedConv._id || message.conversation?._id === selectedConv._id)) {
      setMessages((prev) => {
        const existingIdx = prev.findIndex((m) => m._tempId && m._tempId === message._tempId);
        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = { ...message, _tempId: undefined };
          return updated;
        }
        const exists = prev.some((m) => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
    }
  }, [selectedConv]);

  const handleMessagesRead = useCallback((data) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.readAt || m.sender?._id === data.readBy) return m;
        return { ...m, readAt: data.readAt };
      })
    );
  }, []);

  const { joinConversation, leaveConversation, sendMessage, markRead } = useSocket({
    onNewMessage: handleNewMessage,
    onMessagesRead: handleMessagesRead,
  });

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.INQUIRIES);
      setConversations(res.data || []);
    } catch {
      toast.error('Gagal memuat inquiries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (showNewForm) {
      api.get(ENDPOINTS.PRODUCTS).then((res) => setProducts(res.data || [])).catch(() => {});
    }
  }, [showNewForm]);

  const openConversation = async (conv) => {
    setSelectedConv(conv);
    setMsgLoading(true);
    try {
      const res = await api.get(ENDPOINTS.INQUIRY_BY_ID(conv._id));
      setMessages(res.data.messages || []);
      markRead(conv._id);
      joinConversation(conv._id);
    } catch {
      toast.error('Gagal memuat pesan');
    } finally {
      setMsgLoading(false);
    }
  };

  const closeConversation = () => {
    if (selectedConv) leaveConversation(selectedConv._id);
    setSelectedConv(null);
    setMessages([]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !messageText.trim()) return;
    setCreating(true);
    try {
      const res = await api.post(ENDPOINTS.INQUIRIES, {
        productId: selectedProductId || undefined,
        subject,
        message: messageText,
      });
      setConversations((prev) => [res.data, ...prev]);
      setShowNewForm(false);
      setSubject('');
      setMessageText('');
      setSelectedProductId('');
      toast.success('Inquiry berhasil dikirim!');
      openConversation(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuat inquiry');
    } finally {
      setCreating(false);
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedConv) return;
    const text = replyText;
    setReplyText('');

    const tempId = `temp_${++tempIdCounter.current}`;
    const tempMsg = {
      _id: tempId,
      _tempId: tempId,
      conversation: selectedConv._id,
      sender: { _id: user?._id, name: user?.name, role: user?.role },
      text,
      readAt: null,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setConversations((prev) =>
      prev.map((c) =>
        c._id === selectedConv._id
          ? { ...c, lastMessageAt: new Date().toISOString(), lastMessagePreview: text }
          : c
      )
    );

    sendMessage(selectedConv._id, text, (res) => {
      if (res?.error) {
        setMessages((prev) => prev.filter((m) => m._id !== tempId));
        toast.error(res.error);
        return;
      }
      if (res?.message) {
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? { ...res.message, _tempId: undefined } : m))
        );
      }
    }, tempId);
    markRead(selectedConv._id);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  return {
    user,
    conversations,
    selectedConv,
    messages,
    loading,
    msgLoading,
    showNewForm,
    setShowNewForm,
    subject,
    setSubject,
    messageText,
    setMessageText,
    replyText,
    setReplyText,
    sending,
    creating,
    products,
    selectedProductId,
    setSelectedProductId,
    messagesEndRef,
    openConversation,
    closeConversation,
    handleCreate,
    handleSendReply,
    handleKeyDown,
  };
}
