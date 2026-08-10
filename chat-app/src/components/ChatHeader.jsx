import React from 'react';
import { Bot, RefreshCw, Maximize2, Minimize2, X, Sparkles } from 'lucide-react';

export default function ChatHeader({
  status,
  sessionId,
  onNewSession,
  isFullScreen,
  onToggleFullScreen,
  onClose,
}) {
  return (
    <div className="chat-header">
      <div className="chat-header-info">
        <div className="agent-avatar-icon">
          <Bot size={20} />
        </div>
        <div className="chat-header-titles">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3>Search Agent</h3>
            <Sparkles size={14} color="#a5b4fc" />
          </div>
          <div className="status-pill" style={{ marginTop: '2px', padding: '2px 8px' }}>
            <span className={`status-dot ${status}`}></span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {status === 'connected'
                ? `Session: ${sessionId ? sessionId.slice(0, 8) + '...' : 'Active'}`
                : status === 'connecting'
                ? 'Connecting to BFF...'
                : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      <div className="chat-header-actions">
        <button
          className="icon-btn"
          onClick={onNewSession}
          title="New Chat Session"
          disabled={status === 'connecting'}
        >
          <RefreshCw size={16} className={status === 'connecting' ? 'animate-spin' : ''} />
        </button>

        {onToggleFullScreen && (
          <button className="icon-btn" onClick={onToggleFullScreen} title={isFullScreen ? "Restore Widget" : "Expand View"}>
            {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        )}

        {onClose && (
          <button className="icon-btn" onClick={onClose} title="Close Chat">
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
