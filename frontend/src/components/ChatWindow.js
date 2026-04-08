import React, { useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';

const containerStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
};

const messagesStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '24px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

function ChatWindow() {
  const { messages, isLoading, sendText, sendImage } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div style={containerStyle}>
      <div style={messagesStyle}>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSendText={sendText} onSendImage={sendImage} disabled={isLoading} />
    </div>
  );
}

export default ChatWindow;
