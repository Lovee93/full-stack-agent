import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Copy, Check, AlertCircle } from 'lucide-react';

export default function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';
  const isError = message.isError;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`message-wrapper ${isUser ? 'user' : 'agent'} animate-fade-in`}>
      <div className={`avatar-mini ${isUser ? 'user' : 'agent'}`}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      <div className="message-content-box" style={{ maxWidth: '100%' }}>
        <div className="message-bubble" style={isError ? { borderColor: 'rgba(239, 68, 68, 0.5)', background: 'rgba(239, 68, 68, 0.1)' } : {}}>
          {isError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fca5a5', marginBottom: '4px', fontWeight: 600 }}>
              <AlertCircle size={14} />
              <span>Connection Error</span>
            </div>
          )}
          {isUser ? (
            <p>{message.text}</p>
          ) : (
            <ReactMarkdown>{message.text}</ReactMarkdown>
          )}
        </div>

        <div className="message-meta">
          <span>{message.timestamp}</span>
          {!isUser && !isError && (
            <button
              onClick={handleCopy}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '2px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
              }}
              title="Copy response"
            >
              {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
