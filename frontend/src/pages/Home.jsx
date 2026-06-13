import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Languages, MessageSquare, Mic, BookOpen, BarChart3, ArrowRight, Code } from 'lucide-react';

export default function Home() {
  const languages = [
    { name: 'English', desc: 'Global instruction and fallback processing', code: 'EN' },
    { name: 'Hindi (हिन्दी)', desc: 'Full vocabulary definition & explanations', code: 'HI' },
    { name: 'Tamil (தமிழ்)', desc: 'Real-time query detection and translation', code: 'TA' },
    { name: 'Telugu (తెలుగు)', desc: 'Detailed educational response generation', code: 'TE' },
  ];

  const features = [
    {
      icon: <Languages size={24} />,
      title: 'Multilingual Processing',
      desc: 'Type or speak in Hindi, Tamil, Telugu, or English. The agent automatically detects the language and translates queries.'
    },
    {
      icon: <MessageSquare size={24} />,
      title: 'AI Subject Tutoring',
      desc: 'Expert response generation for Mathematics, Science, Programming, and General Knowledge powered by Gemini.'
    },
    {
      icon: <Mic size={24} />,
      title: 'Voice Conversations',
      desc: 'Browser-based Speech-to-Text allows dictation, while backend gTTS provides auditory text playback.'
    },
    {
      icon: <BookOpen size={24} />,
      title: 'Vector PDF Question-Answering',
      desc: 'Drag & drop syllabus PDFs. Our TF-IDF semantic search allows asking questions and retrieving precise document references.'
    },
    {
      icon: <BarChart3 size={24} />,
      title: 'Analytics & Insights',
      desc: 'Visualized dashboards track query stats, active threads, and language trends using custom SVG graphs.'
    }
  ];

  return (
    <div className="main-content animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingBottom: '80px' }}>
      
      {/* Hero Section */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '60px 40px', 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: '24px',
          background: 'radial-gradient(circle at top right, rgba(124, 58, 237, 0.15), transparent), var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          boxShadow: 'var(--shadow-glass)',
          position: 'relative',
          overflow: 'hidden',
          marginTop: '20px'
        }}
      >
        <div 
          style={{
            background: 'var(--gradient-brand)',
            padding: '16px',
            borderRadius: '24px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-brand)',
            marginBottom: '8px'
          }}
        >
          <GraduationCap size={48} />
        </div>
        
        <h1 
          style={{ 
            fontSize: '2.5rem', 
            lineHeight: '1.2', 
            fontFamily: 'var(--font-title)', 
            fontWeight: 800,
            maxWidth: '900px',
            background: 'linear-gradient(135deg, var(--text-primary) 20%, var(--color-cyan) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.03em'
          }}
        >
          Intelligent Multilingual Conversational Agent for Educational Assistance
        </h1>
        
        <p 
          style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1.1rem', 
            maxWidth: '700px', 
            lineHeight: '1.6',
            fontWeight: 400
          }}
        >
          An AI-powered academic helper bridging language barriers. Dictate or type questions in your regional tongue and obtain instant answers and learning resource references.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          <Link to="/chat" className="btn-primary">
            Start Learning
            <ArrowRight size={16} />
          </Link>
          <Link to="/resources" className="btn-secondary">
            Browse Study Resources
          </Link>
        </div>
      </div>

      {/* Supported Languages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>
            Bridging Language Barriers
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.95rem' }}>
            We support regional Indian languages to aid comprehensive studying.
          </p>
        </div>

        <div className="grid-cols-auto">
          {languages.map((lang, idx) => (
            <div key={idx} className="glass-panel-interactive" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div 
                style={{ 
                  color: 'var(--color-cyan)', 
                  fontWeight: 800, 
                  fontSize: '1.5rem', 
                  fontFamily: 'var(--font-title)',
                  background: 'rgba(6, 182, 212, 0.08)',
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(6, 182, 212, 0.1)'
                }}
              >
                {lang.code}
              </div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{lang.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>{lang.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Core Project Features */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-title)', textAlign: 'center', color: 'var(--text-primary)' }}>
          Application Core Modules
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {features.map((feat, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px' }}>
              <div 
                style={{ 
                  color: '#fff', 
                  background: 'var(--gradient-brand)',
                  borderRadius: '12px',
                  padding: '12px',
                  height: '48px',
                  width: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-brand)',
                  flexShrink: 0
                }}
              >
                {feat.icon}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{feat.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <Code size={20} style={{ color: 'var(--color-cyan)' }} />
          Technology Architecture
        </h2>
        
        <div 
          style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            gap: '12px', 
            maxWidth: '800px'
          }}
        >
          {['React.js', 'Vite', 'FastAPI', 'SQLite', 'SQLAlchemy', 'JWT OAuth2', 'Gemini API', 'spaCy NLP', 'deep-translator', 'gTTS', 'PyPDF2'].map((tech, idx) => (
            <span 
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-secondary)',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 500
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
