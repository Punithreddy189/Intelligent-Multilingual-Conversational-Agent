import React from 'react';
import { Award, BookOpen, Layers, Settings, Users } from 'lucide-react';

export default function About() {
  const modules = [
    { title: 'Module 1: Multilingual Parsing', desc: 'Detects Tamil, Telugu, Hindi, or English input instantly. Uses deep-translator to compile queries to English and parses syntactic intents/entities locally.' },
    { title: 'Module 2: AI Tutoring Agent', desc: 'Interfaces with Gemini API and features context-aware learning trees for Science, Maths, Coding, and General Knowledge with history retention.' },
    { title: 'Module 3: Speech Interaction', desc: 'Integrates HTML5 browser-based speech dictation tools with a backend gTTS streaming text-to-speech converter.' },
    { title: 'Module 4: Syllabus Q&A Search', desc: 'Uploads textbook PDFs, chunks text, and ranks them by cosine similarity via a custom-designed TF-IDF embedding search.' },
    { title: 'Module 5: Analytics & Logging', desc: 'Maintains user logins and queries records in an AnalyticsLog database table to plot daily activity logs and language shares.' }
  ];

  return (
    <div className="main-content animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingBottom: '60px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>About the Project</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
          Technical documentation and academic details for the final-year engineering project.
        </p>
      </div>

      {/* Project Card */}
      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--color-cyan)', fontFamily: 'var(--font-title)' }}>
          Intelligent Multilingual Conversational Agent for Educational Assistance
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
          Language barriers often impede student learning, particularly in rural and semi-urban communities where education is delivered in regional dialects. This project implements a full-stack, AI-powered multilingual tutoring agent. By translating regional dialects (Hindi, Tamil, Telugu) into a common vector base (English), the chatbot answers academic queries and identifies reference passages from syllabus textbooks using semantic vector mapping.
        </p>
      </div>

      {/* Modules list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} style={{ color: 'var(--color-cyan)' }} />
          Implementation Modules
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {modules.map((m, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>{m.title}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px', lineHeight: '1.5' }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Tech Stack */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={16} style={{ color: 'var(--color-cyan)' }} />
            Software Architecture
          </h3>
          <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: '1.5' }}>
            <li><strong>Frontend Framework:</strong> React.js + Vite (HTML5, Custom CSS, Glassmorphic variables)</li>
            <li><strong>Application Server:</strong> Python FastAPI (REST APIs, CORS routers, secure JWT cookies)</li>
            <li><strong>Database Storage:</strong> SQLite engine backed by SQLAlchemy ORM schemas</li>
            <li><strong>Natural Language AI:</strong> Google Gemini API (fallback local token matching)</li>
            <li><strong>Syntax Processing:</strong> spaCy en_core_web_sm pipeline (entity, token, classification)</li>
            <li><strong>Language Translator:</strong> deep-translator package (GoogleTranslate auto-detect wrapper)</li>
            <li><strong>Speech & Audio:</strong> Browser Web Speech Recognition + Backend gTTS synthesizer</li>
          </ul>
        </div>

        {/* Development Team */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} style={{ color: 'var(--color-cyan)' }} />
            Academic Development Team
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderLeft: '3px solid var(--color-violet)', paddingLeft: '12px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Student Investigator</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Final Year Engineering Candidate</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Dept. of Computer Science and Engineering</div>
            </div>
            <div style={{ borderLeft: '3px solid var(--color-indigo)', paddingLeft: '12px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Project Guide & Mentor</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Assistant Professor, Department of CSE</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Cognitive Systems & Natural Language Laboratory</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
