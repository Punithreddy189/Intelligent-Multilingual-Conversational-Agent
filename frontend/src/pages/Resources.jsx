import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { 
  Upload, FileText, Video, HelpCircle, FileDown, 
  ArrowRight, Search, PlusCircle, CheckCircle, AlertCircle
} from 'lucide-react';

export default function Resources() {
  const { authenticatedFetch } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('');
  
  // Upload state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('General Knowledge');
  const [uploadDesc, setUploadDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Q&A state
  const [qaDoc, setQaDoc] = useState(null); // Selected resource for QA
  const [qaQuery, setQaQuery] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');
  const [qaChunks, setQaChunks] = useState([]);
  const [qaLoading, setQaLoading] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const url = subjectFilter ? `/api/resources?subject=${encodeURIComponent(subjectFilter)}` : '/api/resources';
      const response = await authenticatedFetch(url);
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [subjectFilter]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (!selectedFile) {
      setUploadError('Please select a PDF file first.');
      return;
    }
    if (!uploadTitle.trim()) {
      setUploadError('Please provide a document title.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadTitle);
      formData.append('subject', uploadSubject);
      formData.append('description', uploadDesc);
      formData.append('file', selectedFile);

      const response = await authenticatedFetch('/upload-pdf', {
        method: 'POST',
        body: formData
        // Note: fetch automatically sets the Content-Type header with boundaries for FormData. Do not specify content-type.
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      setUploadSuccess('Document uploaded and analyzed successfully!');
      setUploadTitle('');
      setUploadDesc('');
      setSelectedFile(null);
      
      // Reset input element
      const fileInput = document.getElementById('pdf-file-input');
      if (fileInput) fileInput.value = '';

      fetchResources();
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!qaQuery.trim() || !qaDoc) return;

    setQaLoading(true);
    setQaAnswer('');
    setQaChunks([]);

    try {
      const response = await authenticatedFetch('/pdf-qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pdf_path: qaDoc.url_or_path,
          question: qaQuery
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQaAnswer(data.answer);
        setQaChunks(data.matched_chunks);
      } else {
        setQaAnswer('Could not fetch response from document QA module.');
      }
    } catch (error) {
      console.error('QA request error:', error);
      setQaAnswer('Network error occurred during document analysis.');
    } finally {
      setQaLoading(false);
    }
  };

  const subjects = ['General Knowledge', 'Mathematics', 'Science', 'Programming'];

  return (
    <div className="main-content animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '60px' }}>
      
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Learning & Syllabus Resources</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
          Upload reference books or study guides to extract concepts and ask questions directly.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left column: Upload Panel & Subject Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* File Upload Panel */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={18} style={{ color: 'var(--color-cyan)' }} />
              Upload Study Syllabus (PDF)
            </h3>

            {uploadError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', gap: '6px' }}>
                <AlertCircle size={14} />
                {uploadError}
              </div>
            )}

            {uploadSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', gap: '6px' }}>
                <CheckCircle size={14} />
                {uploadSuccess}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Class 10 Biology Ch-3"
                  className="input-field"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  disabled={uploading}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Subject Focus</label>
                <select
                  value={uploadSubject}
                  onChange={(e) => setUploadSubject(e.target.value)}
                  className="input-field"
                  disabled={uploading}
                  style={{ background: 'rgba(0,0,0,0.2)', cursor: 'pointer' }}
                >
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Short Description</label>
                <textarea
                  placeholder="Summarize file chapters..."
                  className="input-field"
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  disabled={uploading}
                  style={{ height: '70px', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                <div 
                  style={{
                    border: '1px dashed var(--border-glass)',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onClick={() => document.getElementById('pdf-file-input').click()}
                >
                  <Upload size={24} style={{ color: 'var(--color-cyan)' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {selectedFile ? selectedFile.name : 'Click to select or drag PDF file'}
                  </span>
                  <input
                    id="pdf-file-input"
                    type="file"
                    accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={uploading}
                style={{ width: '100%', marginTop: '6px', height: '40px' }}
              >
                {uploading ? 'Analyzing Document Syntax...' : 'Upload & Parse PDF'}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Document Q&A Panel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '440px' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} style={{ color: 'var(--color-cyan)' }} />
            Ask Questions from Uploaded PDF
          </h3>

          {/* Select PDF */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Syllabus Document</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                onChange={(e) => {
                  const id = e.target.value;
                  const res = resources.find(r => r.id === parseInt(id));
                  setQaDoc(res || null);
                  setQaAnswer('');
                  setQaChunks([]);
                }}
                className="input-field"
                value={qaDoc ? qaDoc.id : ''}
                style={{ flex: 1, background: 'rgba(0,0,0,0.2)', cursor: 'pointer' }}
              >
                <option value="">-- Choose an Uploaded PDF --</option>
                {resources
                  .filter(r => r.type === 'pdf' && r.url_or_path.includes('uploads'))
                  .map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.title} ({doc.subject})</option>
                  ))
                }
              </select>
            </div>
          </div>

          {qaDoc ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }} className="animate-fade-in">
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-glass)', fontSize: '0.85rem' }}>
                <strong>Selected:</strong> {qaDoc.title}<br />
                <span style={{ color: 'var(--text-muted)' }}>{qaDoc.description || 'No description provided.'}</span>
              </div>

              {/* QA Form */}
              <form onSubmit={handleAskQuestion} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Ask something about this book..."
                  className="input-field"
                  value={qaQuery}
                  onChange={(e) => setQaQuery(e.target.value)}
                  disabled={qaLoading}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn-primary" disabled={qaLoading || !qaQuery.trim()}>
                  Ask Document
                </button>
              </form>

              {qaLoading && <Loader message="Scanning PDF text blocks using TF-IDF similarity..." />}

              {/* Answer Display */}
              {qaAnswer && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="animate-fade-in">
                  <div style={{ background: 'rgba(6, 182, 212, 0.04)', borderLeft: '3px solid var(--color-cyan)', padding: '16px', borderRadius: '0 12px 12px 0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    <strong style={{ color: 'var(--color-cyan)', display: 'block', marginBottom: '8px' }}>AI Answer:</strong>
                    <div style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{qaAnswer}</div>
                  </div>

                  {/* Matched Chunks */}
                  {qaChunks.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Source Passages Extracted
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {qaChunks.map((chunk, idx) => (
                          <div 
                            key={idx} 
                            style={{ 
                              background: 'rgba(255,255,255,0.02)', 
                              border: '1px solid var(--border-glass)', 
                              borderRadius: '8px', 
                              padding: '10px 14px', 
                              fontSize: '0.8rem', 
                              color: 'var(--text-secondary)',
                              lineHeight: '1.4',
                              fontStyle: 'italic'
                            }}
                          >
                            "... {chunk.trim()} ..."
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px', color: 'var(--text-muted)', textAlign: 'center', border: '1px dashed var(--border-glass)', borderRadius: '12px' }}>
              <FileText size={32} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
              <span style={{ fontSize: '0.85rem' }}>Select a document from the dropdown above to start PDF-based Question Answering</span>
            </div>
          )}
        </div>
      </div>

      {/* Subject Selector Filter for Resource Library */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-title)' }}>Resource Reference Library</h2>
          
          {/* Subject Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setSubjectFilter('')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: subjectFilter === '' ? 'var(--color-cyan)' : 'var(--border-glass)',
                background: subjectFilter === '' ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                color: subjectFilter === '' ? 'var(--color-cyan)' : 'var(--text-secondary)',
              }}
            >
              All Subjects
            </button>
            {subjects.map(s => (
              <button
                key={s}
                onClick={() => setSubjectFilter(s)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: subjectFilter === s ? 'var(--color-cyan)' : 'var(--border-glass)',
                  background: subjectFilter === s ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                  color: subjectFilter === s ? 'var(--color-cyan)' : 'var(--text-secondary)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <Loader message="Loading library resources..." />
        ) : resources.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }} className="glass-panel">
            No resources found for this category. Upload one to get started!
          </div>
        ) : (
          <div className="grid-cols-auto">
            {resources.map((res) => {
              const isVideo = res.type === 'video';
              const isPdf = res.type === 'pdf';
              
              return (
                <div 
                  key={res.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '20px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px',
                    height: '320px',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Header: Type and Subject */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span 
                        style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 700, 
                          color: 'var(--color-cyan)', 
                          background: 'rgba(6,182,212,0.08)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          textTransform: 'uppercase'
                        }}
                      >
                        {res.type}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {res.subject}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {isVideo ? <Video size={16} /> : <FileText size={16} />}
                      {res.title}
                    </h4>

                    {/* Description */}
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {res.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Actions / Viewer */}
                  <div>
                    {isVideo ? (
                      <div style={{ borderRadius: '8px', overflow: 'hidden', height: '110px', width: '100%', background: '#000' }}>
                        {res.url_or_path.includes('youtube.com/embed') ? (
                          <iframe
                            src={res.url_or_path}
                            title={res.title}
                            frameBorder="0"
                            width="100%"
                            height="100%"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <a 
                            href={res.url_or_path} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', gap: '6px' }}
                          >
                            <Video size={24} />
                            Watch YouTube Video
                          </a>
                        )}
                      </div>
                    ) : (
                      <a
                        href={res.url_or_path.startsWith('http') ? res.url_or_path : '#'}
                        onClick={(e) => {
                          if (!res.url_or_path.startsWith('http')) {
                            e.preventDefault();
                            alert(`Local PDF file path: ${res.url_or_path}\nThis document is parsed and available in the PDF Q&A panel above.`);
                          }
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px', justifyContent: 'center' }}
                      >
                        <FileDown size={14} />
                        {isPdf && !res.url_or_path.startsWith('http') ? 'Analyze in Q&A Panel' : 'Download Document'}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
