import React from 'react';

const wrapperStyle = {
  display: 'flex',
  justifyContent: 'flex-start',
  animation: 'slideInLeft 0.3s var(--ease-out)',
};

const rowStyle = {
  display: 'flex',
  gap: '10px',
  alignItems: 'flex-start',
};

const avatarStyle = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  fontWeight: 700,
  background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))',
  color: '#fff',
  flexShrink: 0,
  marginTop: '4px',
};

const bubbleStyle = {
  padding: '14px 20px',
  borderRadius: 'var(--radius-lg)',
  borderBottomLeftRadius: '6px',
  background: 'var(--bg-glass)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid var(--border-glass)',
  display: 'flex',
  gap: '5px',
  alignItems: 'center',
};

const dotStyle = (delay) => ({
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  background: 'var(--accent-1)',
  animation: `pulse 1.2s ease-in-out ${delay}ms infinite`,
});

function TypingIndicator() {
  return (
    <div style={wrapperStyle}>
      <div style={rowStyle}>
        <div style={avatarStyle}>M</div>
        <div style={bubbleStyle}>
          <div style={dotStyle(0)} />
          <div style={dotStyle(200)} />
          <div style={dotStyle(400)} />
        </div>
      </div>
    </div>
  );
}

export default TypingIndicator;
