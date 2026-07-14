import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Send, X, Loader2, CheckCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../utils/api';
import { ENDPOINTS } from '../../../config/environment';
import useSocket from '../../../hooks/useSocket';
import { formatDateTime } from '../utils';

const STATUS_OPTIONS = ['', 'Open', 'Replied', 'Closed'];
const STATUS_LABELS = { '': 'Semua Status', Open: 'Terbuka', Replied: 'Dibalas', Closed: 'Ditutup' };
const STATUS_COLORS = {
  Open: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Replied: 'bg-info-container text-on-info-container border-info/30',
  Closed: 'bg-surface-container-high text-on-surface-variant border-outline-variant',
};

export default function AdminInboxPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);

  const handleNewMessage = useCallback((message) => {
    if (selectedConv && (message.conversation === selectedConv._id || message.conversation?._id === selectedConv._id)) {
      setMessages((prev) => {
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
          return { ...c, lastMessageAt: new Date().toISOString(), lastMessagePreview: message.text, status: message.sender?.role === 'admin' ? 'Replied' : 'Open' };
        }
        return c;
      })
    );
  }, [selectedConv]);

  const handleUnreadCount = useCallback((data) => {
    setUnreadCounts((prev) => ({ ...prev, [data.conversationId]: data.count }));
  }, []);

  const handleConvUpdated = useCallback((conv) => {
    setConversations((prev) =>
      prev.map((c) => (c._id === conv._id ? { ...c, ...conv } : c))
    );
  }, []);

  const { joinConversation, leaveConversation, sendMessage, markRead } = useSocket({
    onNewMessage: handleNewMessage,
    onUnreadCount: handleUnreadCount,
    onConversationUpdated: handleConvUpdated,
  });

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await api.get(ENDPOINTS.INQUIRIES, { params });
      setConversations(res.data || []);
      const counts = {};
      (res.data || []).forEach((conv) => { counts[conv._id] = 0; });
      setUnreadCounts(counts);
    } catch {
      toast.error('Gagal memuat inquiries');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

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
    if (selectedConv) {
      leaveConversation(selectedConv._id);
    }
    setSelectedConv(null);
    setMessages([]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!replyText.trim() || !selectedConv) return;
    setSending(true);
    const text = replyText;
    setReplyText('');
    sendMessage(selectedConv._id, text, (result) => {
      setSending(false);
      if (result.error) {
        toast.error('Gagal mengirim pesan');
        setReplyText(text);
      } else {
        markRead(selectedConv._id);
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCloseConversation = async (convId) => {
    try {
      await api.put(ENDPOINTS.INQUIRY_STATUS(convId), { status: 'Closed' });
      toast.success('Conversation closed');
      fetchConversations();
      if (selectedConv?._id === convId) {
        closeConversation();
      }
    } catch {
      toast.error('Gagal menutup conversation');
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-0 rounded-3xl overflow-hidden border border-outline-variant bg-surface-container-lowest shadow-card">
      <div className="w-96 flex-shrink-0 border-r border-outline-variant flex flex-col">
        <div className="p-4 border-b border-outline-variant/30">
          <h2 className="text-lg font-bold text-on-surface mb-3">Inquiries</h2>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  statusFilter === s
                    ? 'bg-primary text-white'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted">
              <MessageSquare size={40} className="mb-3 opacity-50" />
              <p className="text-sm font-bold">Belum ada inquiries</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = selectedConv?._id === conv._id;
              const unread = unreadCounts[conv._id] || 0;
              return (
                <button
                  key={conv._id}
                  onClick={() => openConversation(conv)}
                  className={`w-full text-left p-4 border-b border-outline-variant/20 cursor-pointer transition-all duration-200 hover:bg-surface-container-low focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-sm text-on-surface truncate">
                        {conv.customer?.name || 'Tidak Dikenal'}
                      </span>
                      {unread > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {unread}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[conv.status]}`}>
                      {conv.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-on-surface truncate mb-1">{conv.subject}</p>
                  {conv.lastMessagePreview && (
                    <p className="text-[11px] text-muted truncate">{conv.lastMessagePreview}</p>
                  )}
                  <p className="text-[10px] text-muted mt-1">
                    {conv.lastMessageAt ? formatDateTime(conv.lastMessageAt) : formatDateTime(conv.createdAt)}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {!selectedConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted">
            <MessageSquare size={60} className="mb-4 opacity-30" />
            <p className="text-sm font-bold">Pilih percakapan untuk melihat pesan</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-lowest">
              <div>
                <h3 className="font-bold text-on-surface">{selectedConv.subject}</h3>
                <p className="text-xs text-on-surface-variant">
                  {selectedConv.customer?.name} &mdash; {selectedConv.product?.name || 'Inquiry Umum'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedConv.status !== 'Closed' && (
                  <button
                    onClick={() => handleCloseConversation(selectedConv._id)}
                    className="px-3 py-1.5 rounded-xl bg-error-container text-error text-xs font-bold hover:bg-error-container cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    Tutup
                  </button>
                )}
                <button
                  onClick={closeConversation}
                  className="p-2 rounded-xl hover:bg-surface-container-high text-muted cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-container-low/50">
              {msgLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.sender?.role === 'admin';
                  return (
                    <div key={msg._id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          isAdmin
                            ? 'bg-primary text-white rounded-br-md'
                            : 'bg-surface-container-lowest border border-outline-variant rounded-bl-md shadow-card'
                        }`}
                      >
                        <p className="text-xs font-bold mb-1 opacity-70">
                          {msg.sender?.name || 'Tidak Dikenal'}
                        </p>
                        <p className="text-sm">{msg.text}</p>
                        <div className={`flex items-center gap-1 mt-1 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          {msg.readAt ? (
                            <CheckCheck size={12} className="opacity-50" />
                          ) : (
                            <Clock size={12} className="opacity-30" />
                          )}
                          <span className={`text-[10px] ${isAdmin ? 'text-white/60' : 'text-muted'}`}>
                            {formatDateTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik pesan balasan..."
                  className="flex-1 rounded-2xl border border-outline-variant px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!replyText.trim() || sending}
                  className="p-3 rounded-xl bg-primary text-white hover:bg-primary/90 cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={20} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
