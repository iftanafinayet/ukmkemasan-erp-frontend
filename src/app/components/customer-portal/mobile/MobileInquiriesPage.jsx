import { MessageSquare, Send, Plus, X, Loader2, CheckCheck, Clock, ArrowLeft, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../../config/environment';
import { formatDateTime } from '../../../utils/formatters';
import useCustomerInquiries from '../../../hooks/useCustomerInquiries';
import useScrollToTop from '../../../hooks/useScrollToTop';

export default function MobileInquiriesPage({ prefillProduct }) {
  useScrollToTop();
  const navigate = useNavigate();
  const {
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
  } = useCustomerInquiries({ prefillProduct });

  const getStatusColor = (status) => ({
    Open: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Replied: 'bg-blue-100 text-blue-700 border-blue-200',
    Closed: 'bg-surface-container-high text-on-surface-variant border-outline-variant',
  }[status] || 'bg-surface-container-high text-on-surface-variant');

  if (!storage.getToken()) {
    return (
      <div className="lg:hidden bg-background min-h-[calc(100vh-112px)] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
          <LogIn size={36} />
        </div>
        <h2 className="text-xl font-bold text-on-surface mb-2 font-headline">Login Diperlukan</h2>
        <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
          Silakan login terlebih dahulu untuk mengirim pesan ke admin.
        </p>
        <button
          onClick={() => navigate('/login?redirect=/portal?menu=inquiries')}
          className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-sm shadow-card-hover shadow-primary/20 active:scale-95 transition-all duration-200"
        >
          Masuk Sekarang
        </button>
      </div>
    );
  }

  // Chat view (full-screen)
  if (selectedConv) {
    return (
      <div className="lg:hidden fixed inset-0 z-[100] bg-background flex flex-col">
        <header className="sticky top-0 z-20 border-b border-outline-variant/20 bg-surface-container-lowest/90 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
          <div className="flex h-14 items-center gap-3 px-4">
            <button onClick={closeConversation} className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low active:scale-95 transition-transform">
              <ArrowLeft size={18} className="text-on-surface" />
            </button>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-on-surface text-[14px] leading-tight truncate">{selectedConv.subject}</h3>
              <p className="text-[11px] text-muted truncate">{selectedConv.product?.name || 'Inquiry Umum'}</p>
            </div>
            <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(selectedConv.status)}`}>
              {selectedConv.status}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-container-low/30">
          {msgLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-muted py-20">Belum ada pesan</p>
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
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${isMe
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-surface-container-lowest border border-outline-variant rounded-bl-md shadow-card'
                      }`}
                  >
                    {!isMe && (
                      <p className="text-[11px] font-bold mb-0.5 opacity-70">
                        {msg.sender?.name || 'Tidak Dikenal'}
                      </p>
                    )}
                    <p className="text-[13px] leading-snug">{msg.text}</p>
                    <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {msg.readAt ? (
                        <CheckCheck size={12} className="opacity-50" />
                      ) : (
                        <Clock size={12} className="opacity-30" />
                      )}
                      <span className={`text-[10px] ${isMe ? 'text-white/60' : 'text-muted'}`}>
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
          <div className="p-3 border-t border-outline-variant bg-surface-container-lowest pb-[calc(env(safe-area-inset-bottom,0px)+12px)]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik balasan..."
                className="flex-1 rounded-2xl border border-outline-variant px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim() || sending}
                className="p-3 rounded-2xl bg-primary text-white active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="lg:hidden bg-gradient-to-b from-primary/5 to-background min-h-screen">
      <div className="px-4 pt-5 pb-24 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[24px] font-black text-on-surface leading-tight">Inquiries</h2>
            <p className="text-[12px] text-on-surface-variant">{conversations.length} percakapan dengan admin</p>
          </div>
          {!showNewForm && (
            <button
              onClick={() => setShowNewForm(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-primary text-white rounded-xl text-[13px] font-bold shadow-card shadow-primary/20 active:scale-95 transition-transform"
            >
              <Plus size={16} />
              Baru
            </button>
          )}
        </div>

        {showNewForm && (
          <form onSubmit={handleCreate} className="bg-surface-container-lowest rounded-[20px] border border-outline-variant/20 p-4 space-y-3 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-on-surface text-[14px] font-headline">Buat Inquiry Baru</h3>
              <button type="button" onClick={() => setShowNewForm(false)} className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-low text-muted active:scale-95 transition-transform">
                <X size={16} />
              </button>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-1 block">Produk (opsional)</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full rounded-xl bg-surface-container-low border-none px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Inquiry Umum</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-1 block">Subjek *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Contoh: Tanya stok Standing Pouch"
                required
                className="w-full rounded-xl bg-surface-container-low border-none px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted mb-1 block">Pesan *</label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Tulis pesan Anda..."
                rows={3}
                required
                className="w-full rounded-xl bg-surface-container-low border-none px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={creating || !subject.trim() || !messageText.trim()}
              className="w-full py-3.5 rounded-xl bg-primary text-white text-sm font-bold active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
              Kirim Inquiry
            </button>
          </form>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-[20px] border border-outline-variant/20 shadow-card flex flex-col items-center justify-center py-16 text-muted">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare size={30} className="text-primary opacity-70" />
            </div>
            <p className="text-sm font-bold text-on-surface">Belum ada inquiry</p>
            <p className="text-xs mt-1 text-center px-8">Buat inquiry baru untuk bertanya tentang produk</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => openConversation(conv)}
                className="w-full text-left bg-surface-container-lowest rounded-[20px] border border-outline-variant/20 shadow-card p-3.5 active:scale-[0.98] transition-transform flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                  {conv.product?.images?.[0] ? (
                    <img src={conv.product.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <MessageSquare size={20} className="text-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-[13px] text-on-surface truncate flex-1">{conv.subject}</span>
                    <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(conv.status)}`}>
                      {conv.status}
                    </span>
                  </div>
                  {conv.lastMessagePreview && (
                    <p className="text-[12px] text-on-surface-variant truncate">{conv.lastMessagePreview}</p>
                  )}
                  <p className="text-[10px] text-muted mt-1">
                    {conv.lastMessageAt ? formatDateTime(conv.lastMessageAt) : formatDateTime(conv.createdAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
