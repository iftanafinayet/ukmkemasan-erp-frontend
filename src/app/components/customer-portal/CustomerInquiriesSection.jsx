import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Send, Plus, X, Loader2, CheckCheck, Clock, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';
import { ENDPOINTS, storage } from '../../config/environment';
import useSocket from '../../hooks/useSocket';
import { formatDateTime } from '../../utils/formatters';

export default function CustomerInquiriesSection({ prefillProduct }) {
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
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(prefillProduct?._id || '');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (prefillProduct) {
      setSelectedProductId(prefillProduct._id);
      setShowNewForm(true);
    }
  }, [prefillProduct]);

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
  }, [selectedConv]);

  const { joinConversation, leaveConversation, sendMessage, markRead } = useSocket({
    onNewMessage: handleNewMessage,
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

  const getStatusColor = (status) => ({
    Open: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Replied: 'bg-blue-100 text-blue-700 border-blue-200',
    Closed: 'bg-slate-100 text-slate-500 border-slate-200',
  }[status] || 'bg-slate-100 text-slate-500');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Inquiries</h2>
          <p className="text-sm text-slate-500 font-medium">Tanyakan produk atau pesanan Anda</p>
        </div>
        {!showNewForm && (
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary/90 transition-all active:scale-95"
          >
            <Plus size={18} />
            Inquiry Baru
          </button>
        )}
      </div>

      {showNewForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Buat Inquiry Baru</h3>
            <button type="button" onClick={() => setShowNewForm(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
              <X size={18} />
            </button>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Produk (opsional)</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              <option value="">Inquiry Umum</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Subjek *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Contoh: Tanya stok Standing Pouch"
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Pesan *</label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Tulis pesan Anda..."
              rows={3}
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowNewForm(false)}
              className="px-4 py-2.5 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={creating || !subject.trim() || !messageText.trim()}
              className="px-6 py-2.5 rounded-2xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
              Kirim Inquiry
            </button>
          </div>
        </form>
      )}

      {selectedConv ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <button onClick={closeConversation} className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-all">
                <ChevronRight size={18} className="rotate-180" />
              </button>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{selectedConv.subject}</h3>
                <p className="text-xs text-slate-400">{selectedConv.product?.name || 'Inquiry Umum'}</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(selectedConv.status)}`}>
              {selectedConv.status}
            </span>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
            {msgLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-20">Belum ada pesan</p>
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
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        isMe
                          ? 'bg-primary text-white rounded-br-md'
                          : 'bg-white border border-slate-200 rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="text-xs font-bold mb-1 opacity-70">
                        {msg.sender?.name || 'Tidak Dikenal'}
                      </p>
                      <p className="text-sm">{msg.text}</p>
                      <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {msg.readAt ? (
                          <CheckCheck size={12} className="opacity-50" />
                        ) : (
                          <Clock size={12} className="opacity-30" />
                        )}
                        <span className={`text-[10px] ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
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

          {selectedConv.status !== 'Closed' && (
            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik balasan..."
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || sending}
                  className="p-3 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={20} />}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <MessageSquare size={48} className="mb-3 opacity-40" />
                <p className="text-sm font-bold">Belum ada inquiry</p>
                <p className="text-xs mt-1">Buat inquiry baru untuk bertanya tentang produk</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => openConversation(conv)}
                  className="w-full text-left p-4 hover:bg-slate-50 transition-all flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm text-slate-800">{conv.subject}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(conv.status)}`}>
                        {conv.status}
                      </span>
                    </div>
                    {conv.lastMessagePreview && (
                      <p className="text-xs text-slate-500 truncate">{conv.lastMessagePreview}</p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">
                      {conv.lastMessageAt ? formatDateTime(conv.lastMessageAt) : formatDateTime(conv.createdAt)}
                    </p>
                  </div>
                  {conv.product?.images?.[0] && (
                    <img
                      src={conv.product.images[0].url}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
