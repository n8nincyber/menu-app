import React from 'react';
import MenuTable from './MenuTable';

const wrapperStyle = (isUser) => ({
  display: 'flex',
  justifyContent: isUser ? 'flex-end' : 'flex-start',
  animation: isUser ? 'slideInRight 0.3s var(--ease-out)' : 'slideInLeft 0.3s var(--ease-out)',
  maxWidth: '100%',
});

const bubbleBase = {
  maxWidth: 'min(85%, 640px)',
  padding: '14px 18px',
  borderRadius: 'var(--radius-lg)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid var(--border-glass)',
  lineHeight: 1.6,
  fontSize: '14px',
  wordBreak: 'break-word',
};

const userBubble = {
  ...bubbleBase,
  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.2))',
  borderColor: 'var(--border-accent)',
  borderBottomRightRadius: '6px',
  color: 'var(--text-primary)',
};

const botBubble = {
  ...bubbleBase,
  background: 'var(--bg-glass)',
  borderBottomLeftRadius: '6px',
  color: 'var(--text-primary)',
};

const avatarStyle = (isUser) => ({
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  fontWeight: 700,
  flexShrink: 0,
  marginTop: '4px',
  background: isUser
    ? 'linear-gradient(135deg, var(--accent-2), var(--accent-3))'
    : 'linear-gradient(135deg, var(--accent-1), var(--accent-2))',
  color: '#fff',
});

const rowStyle = (isUser) => ({
  display: 'flex',
  gap: '10px',
  alignItems: 'flex-start',
  flexDirection: isUser ? 'row-reverse' : 'row',
  maxWidth: '100%',
});

const imagePreviewStyle = {
  maxWidth: '240px',
  maxHeight: '200px',
  borderRadius: 'var(--radius-md)',
  objectFit: 'cover',
  border: '1px solid var(--border-glass)',
  marginTop: '8px',
};

const errorStyle = {
  color: '#f87171',
  background: 'rgba(248, 113, 113, 0.08)',
  border: '1px solid rgba(248, 113, 113, 0.2)',
};

const restaurantListStyle = {
  listStyle: 'none',
  padding: 0,
  margin: '8px 0 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const restaurantItemStyle = {
  padding: '8px 12px',
  background: 'var(--bg-elevated)',
  borderRadius: 'var(--radius-sm)',
  fontSize: '13px',
  fontFamily: 'var(--font-mono)',
  border: '1px solid var(--border-glass)',
};

const timestampStyle = {
  fontSize: '10px',
  color: 'var(--text-muted)',
  marginTop: '6px',
  fontFamily: 'var(--font-mono)',
};

function ChatMessage({ message }) {
  const { role, type, content, imageUrl, items, restaurant, restaurants, timestamp } = message;
  const isUser = role === 'user';
  const bubble = isUser ? userBubble : { ...botBubble, ...(type === 'error' ? errorStyle : {}) };

  const renderContent = () => {
    switch (type) {
      case 'image':
        return (
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>📎 {content}</div>
            {imageUrl && <img src={imageUrl} alt="Menu" style={imagePreviewStyle} />}
          </div>
        );

      case 'menuTable':
        return (
          <div>
            <div style={{ marginBottom: '10px', whiteSpace: 'pre-wrap' }}>{content}</div>
            {items && items.length > 0 && <MenuTable items={items} restaurant={restaurant} />}
          </div>
        );

      case 'restaurantList':
        return (
          <div>
            <div style={{ marginBottom: '6px' }}>{content}</div>
            <ul style={restaurantListStyle}>
              {restaurants?.map((r, i) => (
                <li key={i} style={restaurantItemStyle}>
                  {r.name}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'error':
        return <div>⚠️ {content}</div>;

      default:
        return <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>;
    }
  };

  return (
    <div style={wrapperStyle(isUser)}>
      <div style={rowStyle(isUser)}>
        <div style={avatarStyle(isUser)}>{isUser ? 'U' : 'M'}</div>
        <div>
          <div style={bubble}>{renderContent()}</div>
          <div style={{ ...timestampStyle, textAlign: isUser ? 'right' : 'left' }}>
            {timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
