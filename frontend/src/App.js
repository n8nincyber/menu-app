import React from 'react';
import ChatWindow from './components/ChatWindow';

const appStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100vw',
  position: 'relative',
  zIndex: 1,
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px 24px',
  borderBottom: '1px solid var(--border-glass)',
  background: 'var(--bg-surface)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  flexShrink: 0,
};

const logoStyle = {
  width: '36px',
  height: '36px',
  borderRadius: 'var(--radius-sm)',
  background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  fontWeight: 700,
  color: '#fff',
  flexShrink: 0,
};

const titleStyle = {
  fontSize: '18px',
  fontWeight: 600,
  letterSpacing: '-0.02em',
  background: 'linear-gradient(135deg, var(--text-primary), var(--accent-2))',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const subtitleStyle = {
  fontSize: '12px',
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.05em',
};

function App() {
  return (
    <div style={appStyle}>
      <header style={headerStyle}>
        <div style={logoStyle}>M</div>
        <div>
          <div style={titleStyle}>MenuLens</div>
          <div style={subtitleStyle}>MENU DIGITIZATION</div>
        </div>
      </header>
      <ChatWindow />
    </div>
  );
}

export default App;
