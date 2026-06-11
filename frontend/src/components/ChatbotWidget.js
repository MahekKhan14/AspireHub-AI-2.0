import React, { useState, useRef, useEffect } from 'react';
import { api } from '../context/AuthContext';
import '../styles/components/Chatbot.css';

const SUGGESTIONS = [
  "What career is best for a CS student?",
  "How do I prepare for a tech interview?",
  "What skills are in demand in 2025?",
  "How to build a strong portfolio?",
  "Best certifications for data science?",
  "How to switch careers into AI/ML?"
];

const BotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>
  </svg>
);

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'model',
      content: "Hi! I'm **AspireBot** 🤖 Your AI career counsellor assistant!\n\nI can help you with career guidance, course recommendations, interview tips, and much more. What's on your mind?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen, isMinimized]);

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || isTyping) return;

    const userMsg = { id: Date.now(), role: 'user', content: messageText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await api.post('/chatbot/message', {
        message: messageText,
        sessionId
      });

      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'model',
        content: data.response, timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'model',
        content: "Sorry, I'm having trouble connecting. Please try again in a moment.",
        timestamp: new Date(), isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 1, role: 'model',
      content: "Chat cleared! I'm ready to help you again. What would you like to know? 🚀",
      timestamp: new Date()
    }]);
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        className={`chatbot-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open career chatbot"
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <>
            <BotIcon />
            <div className="chatbot-toggle__pulse"></div>
          </>
        )}
        <span className="chatbot-toggle__label">AspireBot</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`chatbot-window ${isMinimized ? 'minimized' : ''}`}>
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header__info">
              <div className="chatbot-header__avatar">
                <BotIcon />
                <div className="chatbot-header__status"></div>
              </div>
              <div>
                <h4 className="chatbot-header__name">AspireBot</h4>
                <span className="chatbot-header__subtitle">AI Career Counsellor</span>
              </div>
            </div>
            <div className="chatbot-header__actions">
              <button className="chatbot-header__btn" onClick={clearChat} title="Clear chat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                </svg>
              </button>
              <button className="chatbot-header__btn" onClick={() => setIsMinimized(!isMinimized)} title="Minimize">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <button className="chatbot-header__btn" onClick={() => setIsOpen(false)} title="Close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="chatbot-messages">
                {messages.map((msg) => (
                  <div key={msg.id} className={`chat-msg chat-msg--${msg.role} ${msg.isError ? 'chat-msg--error' : ''}`}>
                    {msg.role === 'model' && (
                      <div className="chat-msg__avatar"><BotIcon /></div>
                    )}
                    <div className="chat-msg__bubble">
                      <div
                        className="chat-msg__text"
                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                      />
                      <span className="chat-msg__time">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="chat-msg chat-msg--model">
                    <div className="chat-msg__avatar"><BotIcon /></div>
                    <div className="chat-msg__bubble">
                      <div className="typing-dots">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {messages.length <= 2 && (
                <div className="chatbot-suggestions">
                  <p className="chatbot-suggestions__label">Quick questions:</p>
                  <div className="chatbot-suggestions__list">
                    {SUGGESTIONS.slice(0, 3).map((s, i) => (
                      <button key={i} className="chatbot-suggestion-btn" onClick={() => sendMessage(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="chatbot-input">
                <textarea
                  ref={inputRef}
                  className="chatbot-input__field"
                  placeholder="Ask me anything about careers..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  maxLength={1000}
                  disabled={isTyping}
                />
                <button
                  className="chatbot-input__send"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
              <p className="chatbot-footer">Powered by Gemini AI · Press Enter to send</p>
            </>
          )}
        </div>
      )}
    </>
  );
}
