import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Square, Loader2, Play, Pause } from 'lucide-react';

export default function AudioPlayer({ text, language }) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);

  const fetchTTS = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const response = await fetch('/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, language })
      });

      if (!response.ok) {
        throw new Error('TTS generation failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      
      // Initialize audio
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setPlaying(true);
      }
    } catch (error) {
      console.error('TTS synthesis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (loading) return;
    
    if (!audioUrl) {
      fetchTTS();
      return;
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    }
  };

  useEffect(() => {
    // Cleanup URL on unmount
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <audio
        ref={audioRef}
        onEnded={() => setPlaying(false)}
        style={{ display: 'none' }}
      />
      
      <button
        onClick={togglePlay}
        className="glass-panel"
        disabled={loading}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-glass)',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: playing ? 'var(--color-cyan)' : 'var(--text-secondary)',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
        }}
        title="Listen to response"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
        ) : playing ? (
          <Pause size={14} />
        ) : (
          <Volume2 size={14} />
        )}
      </button>

      {playing && (
        <button
          onClick={stopAudio}
          className="glass-panel"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title="Stop reading"
        >
          <Square size={12} fill="#ef4444" />
        </button>
      )}

      {playing && (
        <div style={{ display: 'flex', gap: '2px', alignItems: 'center', height: '12px' }}>
          <div style={{ width: '2px', height: '6px', background: 'var(--color-cyan)', animation: 'pulseWave 0.6s infinite alternate', animationDelay: '0.1s' }}></div>
          <div style={{ width: '2px', height: '12px', background: 'var(--color-cyan)', animation: 'pulseWave 0.6s infinite alternate', animationDelay: '0.2s' }}></div>
          <div style={{ width: '2px', height: '8px', background: 'var(--color-cyan)', animation: 'pulseWave 0.6s infinite alternate', animationDelay: '0.3s' }}></div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseWave {
          0% { height: 4px; }
          100% { height: 12px; }
        }
      `}} />
    </div>
  );
}
