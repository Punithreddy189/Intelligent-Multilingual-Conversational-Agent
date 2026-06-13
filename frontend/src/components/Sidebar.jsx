import React from 'react';
import { useChat } from '../context/ChatContext';
import { MessageSquare, Plus, Calendar } from 'lucide-react';

export default function Sidebar() {
  const { sessions, currentSessionId, setCurrentSessionId, createNewSession } = useChat();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className="glass-panel"
      style={{
        width: '280px',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 100px)',
        padding: '16px',
        gap: '16px',
        background: 'var(--bg-glass)',
      }}
    >
      {/* New Session Button */}
      <button
        onClick={() => createNewSession('New Chat Session')}
        className="btn-primary"
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '10px',
          justifyContent: 'center',
          fontSize: '0.9rem',
        }}
      >
        <Plus size={16} />
        New Discussion
      </button>

      {/* Title */}
      <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Recent Discussions
        </span>
      </div>

      {/* Session List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sessions.length === 0 ? (
          <div style={{ padding: '24px 8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No chat history found. Start a new session.
          </div>
        ) : (
          sessions.map((session) => {
            const isSelected = session.id === currentSessionId;
            return (
              <div
                key={session.id}
                onClick={() => setCurrentSessionId(session.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: isSelected ? 'rgba(124, 58, 237, 0.2)' : 'transparent',
                  background: isSelected ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div
                  style={{
                    color: isSelected ? 'var(--color-cyan)' : 'var(--text-muted)',
                    paddingTop: '2px',
                  }}
                >
                  <MessageSquare size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 600 : 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {session.title}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      marginTop: '4px',
                    }}
                  >
                    <Calendar size={10} />
                    {formatDate(session.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
