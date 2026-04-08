import { useState, useCallback, useRef } from 'react';
import { uploadMenuImage, sendChatQuery } from '../services/api';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'bot',
  type: 'text',
  content: 'Welcome to MenuLens! Upload a restaurant menu image or ask me about stored menus.\n\nTry: "List restaurants" or "Show menu of [name]"',
  timestamp: new Date(),
};

export const useChat = () => {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const idCounter = useRef(1);

  const genId = () => `msg-${Date.now()}-${idCounter.current++}`;

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, { ...msg, id: genId(), timestamp: new Date() }]);
  }, []);

  const sendText = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    addMessage({ role: 'user', type: 'text', content: text });
    setIsLoading(true);

    try {
      const res = await sendChatQuery(text);
      const data = res.data;

      addMessage({
        role: 'bot',
        type: data.type,
        content: data.message,
        restaurant: data.restaurant,
        items: data.items,
        restaurants: data.restaurants,
      });
    } catch (err) {
      addMessage({
        role: 'bot',
        type: 'error',
        content: err.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, addMessage]);

  const sendImage = useCallback(async (file) => {
    if (isLoading) return;

    // Show image preview in chat
    const previewUrl = URL.createObjectURL(file);
    addMessage({ role: 'user', type: 'image', content: file.name, imageUrl: previewUrl });
    setIsLoading(true);

    try {
      const res = await uploadMenuImage(file);
      const data = res.data;

      addMessage({
        role: 'bot',
        type: 'menuTable',
        content: data.message,
        restaurant: data.restaurant?.name,
        items: data.menuItems,
      });
    } catch (err) {
      addMessage({
        role: 'bot',
        type: 'error',
        content: err.message || 'Failed to process the image. Try a clearer photo.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, addMessage]);

  return { messages, isLoading, sendText, sendImage };
};
