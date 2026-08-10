import React, { useState, useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { createChatSession, sendChatMessage } from '../services/api';
import { MessageSquare, Sparkles, ArrowRight, Bot } from 'lucide-react';

const STARTER_PROMPTS = [
  "🔍 Search for the latest AI agent trends in 2026",
  "⚡ What is Google ADK (Agent Development Kit)?",
  "📰 Give me a summary of current tech news",
  "💡 How does search-agent work behind the scenes?"
];

export default function ChatWidget({ embedded = false }) {
  const [isOpen, setIsOpen] = useState(embedded);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [userId, setUserId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [status, setStatus] = useState('connecting'); // 'connecting' | 'connected' | 'error'
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize or get userId
  useEffect(() => {
    let storedUser = localStorage.getItem('search_agent_user_id');
    if (!storedUser) {
      storedUser = 'user_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('search_agent_user_id', storedUser);
    }
    setUserId(storedUser);
  }, []);

  // Initialize Chat Session with BFF
  const initSession = async (user) => {
    setStatus('connecting');
    try {
      const data = await createChatSession(user);
      setSessionId(data.session_id);
      setStatus('connected');
    } catch (err) {
      console.error('Failed to create BFF session:', err);
      setStatus('error');
    }
  };

  useEffect(() => {
    if (userId) {
      initSession(userId);
    }
  }, [userId]);

  // Auto-scroll messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  const handleNewSession = () => {
    if (userId) {
      setMessages([]);
      initSession(userId);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      let currentSessionId = sessionId;

      // If session failed previously, attempt auto-reconnect
      if (!currentSessionId || status === 'error') {
        const sessionData = await createChatSession(userId);
        currentSessionId = sessionData.session_id;
        setSessionId(currentSessionId);
        setStatus('connected');
      }

      const res = await sendChatMessage({
        userId: userId,
        sessionId: currentSessionId,
        message: text,
      });

      const agentMsg = {
        id: 'msg_agent_' + Date.now(),
        sender: 'agent',
        text: res.response || 'No response received from agent.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error('Error contacting search-agent:', err);
      const errorMsg = {
        id: 'msg_err_' + Date.now(),
        sender: 'agent',
        text: `Error connecting to search-agent backend: ${err.message}. Make sure BFF (main.py) is running on http://localhost:8080`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !embedded) {
    return (
      <button
        className="chat-launcher-btn"
        onClick={() => setIsOpen(true)}
        title="Open Search Agent Chat"
      >
        <MessageSquare size={26} />
        <span className="chat-badge"></span>
      </button>
    );
  }

  return (
    <div className={`chat-widget-container ${isFullScreen ? 'full-screen' : ''} animate-fade-in`}>
      <ChatHeader
        status={status}
        sessionId={sessionId}
        onNewSession={handleNewSession}
        isFullScreen={isFullScreen}
        onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
        onClose={!embedded ? () => setIsOpen(false) : null}
      />

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div style={{ padding: '20px 10px', textAlign: 'center', margin: 'auto 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'var(--accent-gradient)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                marginBottom: '16px',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
              }}
            >
              <Bot size={30} />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
              Connected to Search Agent
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Ask anything to search the web and synthesize information in real-time.
            </p>

            <div className="starter-prompts">
              {STARTER_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  className="starter-btn"
                  onClick={() => handleSendMessage(prompt.replace(/^[\u1F300-\u1F9FF\u2600-\u26FF\u2700-\u27BF]\s*/, ''))}
                >
                  <span>{prompt}</span>
                  <ArrowRight size={14} style={{ opacity: 0.6 }} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}

        {loading && (
          <div className="message-wrapper agent animate-fade-in">
            <div className="avatar-mini agent">
              <Bot size={14} />
            </div>
            <div className="message-bubble" style={{ background: 'var(--agent-msg-bg)' }}>
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSend={handleSendMessage}
        disabled={loading || status === 'connecting'}
        placeholder={
          status === 'connecting'
            ? 'Creating agent session...'
            : 'Type your message for search-agent...'
        }
      />
    </div>
  );
}
