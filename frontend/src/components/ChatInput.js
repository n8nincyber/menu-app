import React, { useState, useRef } from 'react';

const ACCEPTED_TYPES = '.jpg,.jpeg,.png,.webp,.tiff,.bmp';

const barStyle = {
  padding: '12px 16px 20px',
  borderTop: '1px solid var(--border-glass)',
  background: 'var(--bg-surface)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  flexShrink: 0,
};

const formStyle = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: '8px',
  maxWidth: '780px',
  margin: '0 auto',
  background: 'var(--bg-glass)',
  border: '1px solid var(--border-glass)',
  borderRadius: 'var(--radius-xl)',
  padding: '6px 6px 6px 16px',
  transition: 'border-color 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out)',
};

const formFocusStyle = {
  borderColor: 'var(--border-accent)',
  boxShadow: 'var(--shadow-glow)',
};

const inputStyle = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: 'var(--text-primary)',
  fontSize: '14px',
  fontFamily: 'var(--font-body)',
  resize: 'none',
  lineHeight: 1.5,
  maxHeight: '120px',
  padding: '8px 0',
};

const iconBtnStyle = (disabled) => ({
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  border: 'none',
  background: 'transparent',
  color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s var(--ease-out)',
  flexShrink: 0,
  fontSize: '18px',
});

const sendBtnStyle = (active) => ({
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  border: 'none',
  background: active
    ? 'linear-gradient(135deg, var(--accent-1), var(--accent-2))'
    : 'rgba(99, 102, 241, 0.15)',
  color: active ? '#fff' : 'var(--text-muted)',
  cursor: active ? 'pointer' : 'default',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s var(--ease-out)',
  flexShrink: 0,
  fontSize: '16px',
});

const previewBarStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 12px',
  marginBottom: '6px',
  maxWidth: '780px',
  margin: '0 auto 6px',
  background: 'rgba(168, 85, 247, 0.08)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid rgba(168, 85, 247, 0.15)',
  fontSize: '12px',
  color: 'var(--text-secondary)',
  animation: 'fadeInUp 0.2s var(--ease-out)',
};

const previewImgStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '6px',
  objectFit: 'cover',
  border: '1px solid var(--border-glass)',
};

const clearBtnStyle = {
  marginLeft: 'auto',
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  fontSize: '16px',
  padding: '2px 6px',
  borderRadius: '4px',
};

function ChatInput({ onSendText, onSendImage, disabled }) {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [focused, setFocused] = useState(false);
  const fileRef = useRef(null);
  const inputRef = useRef(null);

  const handleSend = () => {
    if (disabled) return;

    if (selectedFile) {
      onSendImage(selectedFile);
      setSelectedFile(null);
      setPreviewUrl(null);
      setText('');
      return;
    }

    if (text.trim()) {
      onSendText(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = '';
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const canSend = (text.trim() || selectedFile) && !disabled;

  return (
    <div style={barStyle}>
      {/* File preview bar */}
      {selectedFile && (
        <div style={previewBarStyle}>
          {previewUrl && <img src={previewUrl} alt="Preview" style={previewImgStyle} />}
          <span>{selectedFile.name}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
            ({(selectedFile.size / 1024).toFixed(0)} KB)
          </span>
          <button style={clearBtnStyle} onClick={clearFile} title="Remove">
            ✕
          </button>
        </div>
      )}

      <div style={{ ...formStyle, ...(focused ? formFocusStyle : {}) }}>
        <textarea
          ref={inputRef}
          style={inputStyle}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={selectedFile ? 'Press Enter to upload...' : 'Ask about a menu or upload an image...'}
          rows={1}
          disabled={disabled}
        />

        {/* Image upload button */}
        <button
          style={iconBtnStyle(disabled)}
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          title="Upload menu image"
          type="button"
        >
          📷
        </button>

        {/* Send button */}
        <button style={sendBtnStyle(canSend)} onClick={handleSend} disabled={!canSend} title="Send">
          ↑
        </button>

        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_TYPES}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
}

export default ChatInput;
