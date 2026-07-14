import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Send, Loader2, CheckCheck, Clock, ChevronRight, LogIn, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { ENDPOINTS, storage } from '../../config/environment';
import useSocket from '../../hooks/useSocket';
import { formatDateTime, formatRelativeTime } from '../../utils/formatters';
import useNow from '../../hooks/useNow';

export default function ChatPopup({ prefillProduct, isOpen, onClose }) {
  const user = storage.getUser();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [creating, setCreating] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(prefillProduct?._id || '');
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  const panelRef = useRef(null);

  const tempIdCounter = useRef(0);

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
    setConversations((prev) =>
      prev.map((c) => {
        const convId = c._id;
        const msgConvId = message.conversation?._id || message.conversation;
        if (convId === msgConvId) {
          return { ...c, lastMessageAt: new Date().toISOString(), lastMessagePreview: message.text };
        }
        return c;
      })
    );
  }, [selectedConv]);

  const handleUnreadCount = useCallback((data) => {
    setUnreadCounts((prev) => ({ ...prev, [data.conversationId]: data.count }));
  }, []);

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
    onUnreadCount: handleUnreadCount,
    onMessagesRead: handleMessagesRead,
  });

  const now = useNow();

  const totalUnread = Object.values(unreadCounts).reduce((sum, c) => sum + (c || 0), 0);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.INQUIRIES);
      setConversations(res.data || []);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      fetchProducts();
    }
  }, [isOpen, fetchConversations]);

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

  const fetchProducts = async () => {
    try {
      const res = await api.get(ENDPOINTS.PRODUCTS);
      setProducts(res.data || []);
    } catch {}
  };

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
      openConversation(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuat inquiry');
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status) => ({
    Open: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Replied: 'bg-blue-100 text-blue-700 border-blue-200',
    Closed: 'bg-slate-100 text-slate-500 border-slate-200',
  }[status] || 'bg-slate-100 text-slate-500');

  if (!isOpen) return null;

  if (!storage.getToken()) {
    return (
      <>
        <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
        <div className="fixed bottom-24 right-6 z-50 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-primary text-white">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} />
              <span className="font-bold text-sm">Pesan</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition-all">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
              <LogIn size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Login Required</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-xs">Silahkan login untuk mengirim pesan ke admin.</p>
            <button
              onClick={() => navigate('/login?redirect=/portal')}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Masuk Sekarang
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
          <div
            ref={panelRef}
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[560px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-primary text-white">
              {selectedConv ? (
                <div className="flex items-center gap-2 min-w-0">
                  <button onClick={closeConversation} className="p-1 rounded-lg hover:bg-white/20 transition-all">
                    <ChevronRight size={18} className="rotate-180" />
                  </button>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{selectedConv.subject}</p>
                    <p className="text-[10px] text-white/70 truncate">{selectedConv.product?.name || 'Inquiry Umum'}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} />
                  <span className="font-bold text-sm">Pesan</span>
                </div>
              )}
              {!selectedConv && (
                <button
                  onClick={() => setShowNewForm(true)}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-all text-sm font-bold"
                >
                  + Baru
                </button>
              )}
            </div>

            {showNewForm && !selectedConv ? (
              <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-4 space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">Produk (opsional)</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-primary"
                  >
                    <option value="">Inquiry Umum</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">Subjek *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Contoh: Tanya stok"
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">Pesan *</label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Tulis pesan..."
                    rows={3}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-primary resize-none"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewForm(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !subject.trim() || !messageText.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Kirim'}
                  </button>
                </div>
              </form>
            ) : selectedConv ? (
              <>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
                  {msgLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.sender?._id === user?._id;
                      const isTemp = msg._tempId;
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200 ${isTemp ? 'opacity-70' : ''}`}
                          style={{ animationFillMode: 'backwards', animationDelay: `${Math.min(idx * 20, 200)}ms` }}
                        >
                          <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${isMe ? 'bg-primary text-white rounded-br-md' : 'bg-white border border-slate-200 rounded-bl-md shadow-sm'}`}>
                            <p className="text-[11px] font-bold mb-0.5 opacity-70">{msg.sender?.name || 'Tidak Dikenal'}</p>
                            <p className="text-xs">{msg.text}</p>
                            <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              {msg.readAt ? <CheckCheck size={10} className="opacity-50" /> : <Clock size={10} className="opacity-30" />}
                              <span className={`text-[9px] ${isMe ? 'text-white/60' : 'text-slate-400'}`}>{formatRelativeTime(msg.createdAt, now)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-3 border-t border-slate-100 bg-white">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ketik pesan..."
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || sending}
                      className="p-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <MessageSquare size={36} className="mb-2 opacity-40" />
                    <p className="text-xs font-bold">Belum ada pesan</p>
                    <p className="text-[10px] mt-1">Klik "+ Baru" untuk memulai</p>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const unread = unreadCounts[conv._id] || 0;
                    return (
                      <button
                        key={conv._id}
                        onClick={() => openConversation(conv)}
                        className="w-full text-left p-3 border-b border-slate-50 hover:bg-slate-50 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <span className="font-bold text-xs text-slate-800 truncate">{conv.subject}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${getStatusColor(conv.status)}`}>
                            {conv.status}
                          </span>
                        </div>
                        {conv.lastMessagePreview && (
                          <p className="text-[11px] text-slate-400 truncate">{conv.lastMessagePreview}</p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[9px] text-slate-400">
                            {conv.lastMessageAt ? formatRelativeTime(conv.lastMessageAt, now) : formatRelativeTime(conv.createdAt, now)}
                          </span>
                          {unread > 0 && (
                            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                              {unread}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
    </>
  );
}
