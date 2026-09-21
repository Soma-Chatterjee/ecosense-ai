import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Leaf, User, TreePine, Sprout } from 'lucide-react';
import chatbot from '../../engine/chatbot';
import knowledgeBase from '../../engine/knowledgeBase';
import { Utensils, Car, Zap, Recycle } from 'lucide-react';

const welcomeActions = [
  { icon: Utensils, title: 'Diet Impact', desc: 'Learn how food choices affect emissions', prompt: "What's my carbon footprint if I eat meat daily?" },
  { icon: Car, title: 'Travel Smarter', desc: 'Greener commute options', prompt: 'How can I reduce my travel emissions?' },
  { icon: Zap, title: 'Save Energy', desc: 'Reduce home electricity use', prompt: 'Give me tips to save energy at home' },
  { icon: Recycle, title: 'Waste & Recycling', desc: 'Smart waste management', prompt: 'How do I start recycling properly?' },
];

function formatMessageText(text) {
  let html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^>\s*(.+)$/gm, '<blockquote style="border-left: 3px solid var(--color-primary); padding-left: 12px; margin: 8px 0; color: var(--text-secondary); font-style: italic;">$1</blockquote>')
    .replace(/^### (.+)$/gm, '<strong style="font-size: 14px;">$1</strong>')
    .replace(/^[•\-]\s+(.+)$/gm, '<div style="display: flex; gap: 8px; margin: 2px 0;"><span style="color: var(--color-primary);">•</span><span>$1</span></div>')
    .replace(/\|(.+)\|/g, (match) => {
      if (/^\|[\s\-|]+\|$/.test(match)) return '';
      const cells = match.split('|').filter(c => c.trim());
      return `<div style="display: flex; gap: 16px; padding: 4px 0; font-size: 13px;">${cells.map(c => `<span style="min-width: 80px;">${c.trim()}</span>`).join('')}</div>`;
    })
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  return `<p>${html}</p>`;
}

function TipCard({ tip }) {
  const catInfo = knowledgeBase.getCategoryInfo(tip.category) || {};
  return (
    <div className="tip-card">
      <div className="tip-card-header">
        <span className="tip-card-category" style={{ background: `${catInfo.color || '#10B981'}22`, color: catInfo.color || '#10B981' }}>
          {catInfo.name || tip.category}
        </span>
      </div>
      <div className="tip-card-title">{tip.title}</div>
      <div className="tip-card-body">{tip.description}</div>
      <div className="tip-card-footer">
        <span className="tip-card-stat saving"><Sprout size={12} /> Saves ~{tip.co2_saving_kg_year} kg CO₂/year</span>
        <span className={`tip-difficulty ${tip.difficulty}`}>{tip.difficulty}</span>
      </div>
    </div>
  );
}

export default function ChatView() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async (text) => {
    const msg = text || inputValue.trim();
    if (!msg) return;
    if (!chatStarted) setChatStarted(true);
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: msg, id: Date.now() }]);
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
    const response = await chatbot.processMessage(msg);
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'bot', text: response.text, tips: response.tips || [], quickReplies: response.quickReplies || [], id: Date.now() + 1 }]);
  }, [inputValue, chatStarted]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="chat-view">
      <AnimatePresence mode="wait">
        {!chatStarted ? (
          <motion.div key="welcome" className="welcome-screen" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <div className="welcome-icon"><Leaf size={36} strokeWidth={1.5} /></div>
            <h2 className="welcome-title">Welcome to EcoSense AI</h2>
            <p className="welcome-subtitle">I'm your personal sustainability advisor. Ask me about your carbon footprint, get eco-friendly tips, or explore ways to live more sustainably.</p>
            <div className="welcome-actions">
              {welcomeActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.button key={i} className="welcome-action-btn" onClick={() => sendMessage(action.prompt)} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
                    <div className="action-icon"><Icon size={18} /></div>
                    <div className="action-title">{action.title}</div>
                    <div className="action-desc">{action.desc}</div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div key="messages" className="chat-messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {messages.map((msg) => (
              <motion.div key={msg.id} className={`message ${msg.role}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <div className="message-avatar">
                  {msg.role === 'bot' ? <Leaf size={16} /> : <User size={16} />}
                </div>
                <div className="message-content">
                  <div dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }} />
                  {msg.tips && msg.tips.map(tip => <TipCard key={tip.id} tip={tip} />)}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="quick-replies">
                      {msg.quickReplies.map((qr, i) => (
                        <button key={i} className="quick-reply-btn" onClick={() => sendMessage(qr)}>{qr}</button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div className="message bot" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="message-avatar"><Leaf size={16} /></div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <input type="text" className="chat-input" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask about your carbon footprint, get eco tips, or explore sustainability..." autoComplete="off" />
          <button className="chat-send-btn" onClick={() => sendMessage()} disabled={!inputValue.trim()}>
            <Send size={16} />
          </button>
        </div>
        <div className="chat-hint">Try: "What's the carbon footprint of fast fashion?" or "Compare car vs bus"</div>
      </div>
    </div>
  );
}
