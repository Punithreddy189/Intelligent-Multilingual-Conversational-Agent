import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { token, authenticatedFetch, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeSubject, setActiveSubject] = useState('General Knowledge');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch all chat sessions for the logged-in user
  const fetchSessions = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await authenticatedFetch('/api/chatbot/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
        // Default to the most recent session if none selected
        if (data.length > 0 && !currentSessionId) {
          setCurrentSessionId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  };

  // Fetch messages for a specific session
  const fetchMessages = async (sessionId) => {
    if (!isAuthenticated || !sessionId) return;
    setLoadingMessages(true);
    try {
      const response = await authenticatedFetch(`/api/chatbot/sessions/${sessionId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Create a new chat session
  const createNewSession = async (title = 'New Discussion') => {
    if (!isAuthenticated) return null;
    try {
      const response = await authenticatedFetch('/api/chatbot/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      });
      if (response.ok) {
        const newSession = await response.json();
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        setMessages([]);
        return newSession.id;
      }
    } catch (error) {
      console.error('Error creating new session:', error);
    }
    return null;
  };

  // Send a message to the chatbot
  const sendMessage = async (text) => {
    if (!isAuthenticated || !text.trim()) return;
    setSendingMessage(true);

    let sessionId = currentSessionId;
    // Create session on the fly if none exists
    if (!sessionId) {
      const newId = await createNewSession(text.slice(0, 25) + '...');
      if (!newId) {
        setSendingMessage(false);
        return;
      }
      sessionId = newId;
    }

    // Proactively add user message to UI for fast typing feedback
    const tempUserMsg = {
      id: Date.now(),
      sender: 'user',
      original_text: text,
      detected_language: 'English', // temporary
      response_text: '',
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await authenticatedFetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          session_id: sessionId,
          subject: activeSubject
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Replace temp messages with database-synced message logs
        fetchMessages(sessionId);
        // Refresh session list to update title/timestamps
        fetchSessions();
      } else {
        console.error('Failed to send message:', await response.text());
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  // Reload messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      fetchMessages(currentSessionId);
    } else {
      setMessages([]);
    }
  }, [currentSessionId]);

  // Load sessions on login
  useEffect(() => {
    if (isAuthenticated) {
      fetchSessions();
    } else {
      setSessions([]);
      setCurrentSessionId(null);
      setMessages([]);
    }
  }, [isAuthenticated]);

  return (
    <ChatContext.Provider value={{
      sessions,
      currentSessionId,
      setCurrentSessionId,
      messages,
      activeSubject,
      setActiveSubject,
      loadingMessages,
      sendingMessage,
      sendMessage,
      createNewSession,
      refreshSessions: fetchSessions
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
