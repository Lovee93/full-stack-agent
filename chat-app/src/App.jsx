import React, { useState } from 'react';
import ChatWidget from './components/ChatWidget';
import { Bot, Sparkles, Terminal, Cpu, Globe, Server, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState('widget'); // 'widget' | 'embedded'

  return (
    <div className="app-container">
      {/* Top Header Nav */}
      <header
        style={{
          padding: '18px 32px',
          borderBottom: '1px solid var(--border-glass)',
          background: 'rgba(11, 15, 25, 0.8)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="agent-avatar-icon" style={{ width: '32px', height: '32px' }}>
            <Bot size={18} />
          </div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem' }}>
            Search Agent Frontend
          </span>
          <span className="hero-badge" style={{ margin: 0, padding: '2px 10px', fontSize: '0.72rem' }}>
            FastAPI BFF Connected
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="starter-btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              borderColor: viewMode === 'widget' ? 'var(--accent-primary)' : 'var(--border-glass)',
              background: viewMode === 'widget' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            }}
            onClick={() => setViewMode('widget')}
          >
            Floating Widget Mode
          </button>
          <button
            className="starter-btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              borderColor: viewMode === 'embedded' ? 'var(--accent-primary)' : 'var(--border-glass)',
              background: viewMode === 'embedded' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            }}
            onClick={() => setViewMode('embedded')}
          >
            Embedded Chat View
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <section className="hero-section">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>Powered by ADK + FastAPI BFF</span>
          </div>

          <h1 className="hero-title">
            Search Agent <span>Chat Interface</span>
          </h1>

          <p className="hero-subtitle">
            Minimal, ultra-responsive React chat frontend communicating directly with your{' '}
            <code style={{ color: '#a5b4fc', background: 'rgba(15,23,42,0.6)', padding: '2px 8px', borderRadius: '4px' }}>
              bff/main.py
            </code>{' '}
            backend services.
          </p>

          {/* Endpoint Architecture Grid */}
          <div className="endpoint-cards">
            <div className="endpoint-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="method">POST</span>
                <CheckCircle2 size={16} color="#10b981" />
              </div>
              <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Session Creation
              </p>
              <code>/api/chat/session</code>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Instantiates a isolated agent engine session on Vertex AI / Reasoning Engine via BFF.
              </p>
            </div>

            <div className="endpoint-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="method">POST</span>
                <CheckCircle2 size={16} color="#10b981" />
              </div>
              <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Query & Response
              </p>
              <code>/api/chat</code>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Sends prompt with <code style={{ color: '#a5b4fc' }}>user_id</code> and <code style={{ color: '#a5b4fc' }}>session_id</code> and returns synthesized text.
              </p>
            </div>

            <div className="endpoint-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="method" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>FASTAPI</span>
                <Server size={16} color="#34d399" />
              </div>
              <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                Lifespan & CORS
              </p>
              <code>http://localhost:8080</code>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Zero per-request setup latency with pre-initialized Vertex client connection pool.
              </p>
            </div>
          </div>

          {/* Embedded View Mode Render */}
          {viewMode === 'embedded' && (
            <div style={{ width: '100%', marginTop: '40px' }}>
              <ChatWidget embedded={true} />
            </div>
          )}
        </section>
      </main>

      {/* Floating Widget Mode Render */}
      {viewMode === 'widget' && <ChatWidget embedded={false} />}
    </div>
  );
}
