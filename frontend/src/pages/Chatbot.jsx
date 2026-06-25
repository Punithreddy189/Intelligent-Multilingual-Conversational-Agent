import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import Sidebar from '../components/Sidebar';
import AudioPlayer from '../components/AudioPlayer';
import Loader from '../components/Loader';
import { 
  Send, Mic, MicOff, Download, ChevronDown, ChevronUp, 
  Calculator, Atom, Code, Globe, HelpCircle, AlertCircle,
  GraduationCap
} from 'lucide-react';

export default function Chatbot() {
  const { 
    messages, currentSessionId, activeSubject, setActiveSubject, 
    sendMessage, sendingMessage, loadingMessages, sessions
  } = useChat();

  const [inputText, setInputText] = useState('');
  const [expandedNlpId, setExpandedNlpId] = useState(null);
  
  // Speech Recognition state
  const [isRecording, setIsRecording] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState('en-US'); // ta-IN, te-IN, hi-IN, en-US
  const [recordingStatus, setRecordingStatus] = useState('');
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of message list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sendingMessage]);

  const startListening = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
      setIsRecording(false);
      setRecordingStatus('');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecordingStatus("Browser does not support speech recognition");
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    // 9. Verify microphone permissions
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = speechLanguage;

          recognition.onstart = () => {
            setIsRecording(true);
            setRecordingStatus("🎤 Listening...");
            console.log("Recording started");
            console.log("Language:", recognition.lang);
          };

          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputText(transcript);
            setRecordingStatus("✔ Speech captured");
            console.log("Transcript:", transcript);
          };

          recognition.onerror = (event) => {
            console.error("Speech error:", event.error);
            setIsRecording(false);
            if (event.error === 'not-allowed') {
              setRecordingStatus("Microphone permission denied");
            } else if (event.error === 'no-speech') {
              setRecordingStatus("No speech detected");
            } else {
              setRecordingStatus(`Speech error: ${event.error}`);
            }
          };

          recognition.onend = () => {
            setIsRecording(false);
          };

          recognitionRef.current = recognition;
          recognition.start();
        } catch (err) {
          console.error(err);
        }
      })
      .catch((err) => {
        console.error("Microphone permission denied:", err);
        setRecordingStatus("Microphone permission denied");
      });
  };

  const handleSend = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!inputText.trim() || sendingMessage) return;

    // 6. Add debugging logs (Frontend)
    console.log("Sending:", inputText);
    console.log("Subject:", activeSubject);

    sendMessage(inputText);
    setInputText('');
  };

  const toggleNlpDetails = (msgId) => {
    setExpandedNlpId(expandedNlpId === msgId ? null : msgId);
  };

  // Download session transcript as file
  const handleDownloadTranscript = () => {
    if (messages.length === 0) return;
    
    // Find active session title
    const activeSession = sessions.find(s => s.id === currentSessionId);
    const title = activeSession ? activeSession.title : 'Discussion';

    let content = `==================================================================\n`;
    content += `INTELLIGENT MULTILINGUAL CONVERSATIONAL TUTOR TRANSCRIPT\n`;
    content += `Session Title: ${title}\n`;
    content += `Subject Area: ${activeSubject}\n`;
    content += `Export Date: ${new Date().toLocaleString()}\n`;
    content += `==================================================================\n\n`;

    messages.forEach((msg, idx) => {
      const time = new Date(msg.created_at).toLocaleTimeString();
      if (msg.sender === 'user') {
        content += `[${time}] STUDENT:\n`;
        content += `  - Input: "${msg.original_text}"\n`;
        if (msg.detected_language !== 'English') {
          content += `  - Language Detected: ${msg.detected_language}\n`;
          content += `  - English Translation: "${msg.translated_text}"\n`;
        }
        content += `  - Detected Intent: ${msg.intent || 'General'}\n`;
        if (msg.entities) {
          content += `  - Extracted Entities: ${msg.entities}\n`;
        }
      } else {
        content += `[${time}] TUTOR AI:\n`;
        content += `  - Response (${msg.detected_language || 'English'}): "${msg.response_text}"\n`;
        if (msg.detected_language !== 'English') {
          content += `  - English Conceptual Reply: "${msg.translated_text}"\n`;
        }
      }
      content += `\n------------------------------------------------------------------\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EduAI_Transcript_${currentSessionId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const subjects = [
    { name: 'General Knowledge', icon: <Globe size={16} /> },
    { name: 'Mathematics', icon: <Calculator size={16} /> },
    { name: 'Science', icon: <Atom size={16} /> },
    { name: 'Programming', icon: <Code size={16} /> }
  ];

  return (
    <div className="main-content" style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 100px)', marginTop: '8px' }}>
      
      {/* Sidebar history */}
      <Sidebar />

      {/* Main Chat Area */}
      <div 
        className="glass-panel" 
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          height: 'calc(100vh - 100px)',
          overflow: 'hidden',
          background: 'var(--bg-glass)'
        }}
      >
        
        {/* Chat Header (Subject select & transcript download) */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '12px 20px', 
            borderBottom: '1px solid var(--border-glass)',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {/* Subject Toolbar */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {subjects.map((subj) => {
              const isSelected = activeSubject === subj.name;
              return (
                <button
                  key={subj.name}
                  onClick={() => setActiveSubject(subj.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--color-cyan)' : 'var(--border-glass)',
                    background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                    color: isSelected ? 'var(--color-cyan)' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {subj.icon}
                  {subj.name}
                </button>
              );
            })}
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleDownloadTranscript}
              className="btn-secondary"
              style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', gap: '6px' }}
            >
              <Download size={14} />
              Export Transcript
            </button>
          )}
        </div>

        {/* Message View Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
              <GraduationCap size={48} style={{ color: 'var(--color-cyan)' }} />
              <div>
                <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>How can I help you study today?</h3>
                <p style={{ fontSize: '0.85rem', marginTop: '6px', maxWidth: '400px', lineHeight: '1.5' }}>
                  Ask questions in <b>Hindi, Tamil, Telugu or English</b>. You can also click the microphone to speak your question aloud.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              const parsedEntities = msg.entities ? (typeof msg.entities === 'string' ? JSON.parse(msg.entities) : msg.entities) : {};
              
              return (
                <div 
                  key={msg.id} 
                  className="animate-fade-in"
                  style={{ 
                    display: 'flex', 
                    justifyContent: isBot ? 'flex-start' : 'flex-end',
                    width: '100%'
                  }}
                >
                  <div 
                    style={{ 
                      maxWidth: '80%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '6px',
                      alignItems: isBot ? 'flex-start' : 'flex-end'
                    }}
                  >
                    {/* Message Bubble */}
                    <div 
                      className={isBot ? "glass-panel" : ""}
                      style={{
                        padding: '14px 18px',
                        borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                        background: isBot ? 'var(--bg-glass)' : 'var(--msg-user-bg)',
                        color: isBot ? 'var(--text-primary)' : '#ffffff',
                        border: isBot ? '1px solid var(--border-glass)' : 'none',
                        fontSize: '0.95rem',
                        lineHeight: '1.5',
                        boxShadow: isBot ? 'var(--shadow-glass)' : 'var(--shadow-brand)',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {isBot ? msg.response_text : msg.original_text}
                    </div>

                    {/* Metadata indicators (underneath user message or inside chatbot message detail drawer) */}
                    {isBot && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 4px' }}>
                        {/* Audio TTS controls */}
                        <AudioPlayer text={msg.response_text} language={msg.detected_language || 'English'} />
                        
                        {/* Language & Metadata Toggle */}
                        <button
                          onClick={() => toggleNlpDetails(msg.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 500
                          }}
                        >
                          NLP Debug
                          {expandedNlpId === msg.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      </div>
                    )}

                    {/* Collapsible NLP Debug Panel */}
                    {isBot && expandedNlpId === msg.id && (
                      <div 
                        className="glass-panel"
                        style={{
                          width: '100%',
                          minWidth: '280px',
                          padding: '12px 16px',
                          marginTop: '4px',
                          background: 'rgba(0,0,0,0.15)',
                          fontSize: '0.8rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div>
                          <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>Detected Language:</span>{' '}
                          <span style={{ color: 'var(--text-primary)' }}>{msg.detected_language || 'English'}</span>
                        </div>
                        {msg.detected_language !== 'English' && (
                          <div>
                            <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>Translated Input:</span>{' '}
                            <span style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>"{msg.translated_text}"</span>
                          </div>
                        )}
                        <div>
                          <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>Classification Intent:</span>{' '}
                          <span style={{ color: 'var(--text-primary)' }}>{msg.intent || 'General Question'}</span>
                        </div>
                        {Object.keys(parsedEntities).length > 0 && (
                          <div>
                            <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>Extracted Entities:</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                              {Object.entries(parsedEntities).map(([key, val]) => (
                                <span 
                                  key={key} 
                                  style={{ 
                                    background: 'rgba(255,255,255,0.05)', 
                                    padding: '2px 6px', 
                                    borderRadius: '4px', 
                                    fontSize: '0.7rem',
                                    border: '1px solid var(--border-glass)',
                                    color: 'var(--text-secondary)'
                                  }}
                                >
                                  {key}: {String(val)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {sendingMessage && <Loader message="Analyzing multilingual syntax..." />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Section */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-glass)' }}>
          {recordingStatus && (
            <div style={{ fontSize: '0.85rem', color: 'var(--color-cyan)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {recordingStatus}
            </div>
          )}
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            
            {/* Dictation Language Select */}
            <select
              value={speechLanguage}
              onChange={(e) => {
                const selectedLanguage = e.target.value;
                setSpeechLanguage(selectedLanguage);
                if (recognitionRef.current) {
                  recognitionRef.current.lang = selectedLanguage;
                  console.log("Language:", recognitionRef.current.lang);
                }
              }}
              className="glass-panel"
              style={{
                padding: '10px',
                borderRadius: '12px',
                background: 'var(--bg-glass)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-glass)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                outline: 'none'
              }}
              title="Dictation Language"
            >
              <option value="en-US">Dictate: English</option>
              <option value="hi-IN">Dictate: Hindi (हिन्दी)</option>
              <option value="ta-IN">Dictate: Tamil (தமிழ்)</option>
              <option value="te-IN">Dictate: Telugu (తెలుగు)</option>
            </select>
 
            {/* Mic Dictation Trigger */}
            <button
              type="button"
              onClick={startListening}
              className="glass-panel"
              style={{
                background: isRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                border: '1px solid',
                borderColor: isRecording ? '#ef4444' : 'var(--border-glass)',
                color: isRecording ? '#ef4444' : 'var(--text-primary)',
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              title={isRecording ? "Stop listening" : "Start speaking question"}
            >
              🎤
            </button>

            {/* Chat Text Input */}
            <input
              type="text"
              placeholder={isRecording ? "Listening to voice..." : `Ask about ${activeSubject}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend(e);
                }
              }}
              className="input-field"
              style={{ flex: 1, height: '44px' }}
              disabled={sendingMessage}
            />

            {/* Submit Send Button */}
            <button
              type="submit"
              onClick={handleSend}
              className="btn-primary"
              style={{
                width: '44px',
                height: '44px',
                padding: 0,
                borderRadius: '12px',
                flexShrink: 0
              }}
              disabled={sendingMessage || !inputText.trim()}
            >
              <Send size={16} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
