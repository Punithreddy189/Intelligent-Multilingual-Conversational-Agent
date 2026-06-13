import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ChartCard from '../components/ChartCard';
import Loader from '../components/Loader';
import { Users, MessageCircle, Layers, Award, BarChart2 } from 'lucide-react';

export default function Dashboard() {
  const { authenticatedFetch } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const response = await authenticatedFetch('/api/analytics/summary');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader message="Querying analytics engine logs..." />
      </div>
    );
  }

  // Ensure arrays are present and map variables correctly
  const totalUsers = data?.total_users || 0;
  const questionsAsked = data?.questions_asked || 0;
  const activeSessions = data?.active_sessions || 0;

  // Language counts
  const languagesData = (data?.most_used_languages || []).map(lang => ({
    label: lang.language,
    value: lang.count
  }));

  // Daily activity
  const dailyData = (data?.daily_activity || []).map(d => ({
    label: d.date.split('-').slice(1).join('/'), // format as MM/DD
    value: d.count
  }));

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: <Users size={20} />, color: 'var(--color-cyan)', bg: 'rgba(6,182,212,0.08)' },
    { label: 'Questions Asked', value: questionsAsked, icon: <MessageCircle size={20} />, color: 'var(--color-violet)', bg: 'rgba(124,58,237,0.08)' },
    { label: 'Active Sessions', value: activeSessions, icon: <Layers size={20} />, color: 'var(--color-indigo)', bg: 'rgba(79,70,229,0.08)' },
    { label: 'User Engagement', value: `${questionsAsked > 0 && totalUsers > 0 ? (questionsAsked / totalUsers).toFixed(1) : 0} Qs/User`, icon: <Award size={20} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' }
  ];

  return (
    <div className="main-content animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '60px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>System Analytics Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
          Real-time activity logs, multilingual engagement, and tutor performance indicators.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {stats.map((s, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div 
              style={{ 
                color: s.color, 
                background: s.bg, 
                padding: '12px', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {s.label}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', fontFamily: 'var(--font-title)' }}>
                {s.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Daily Activity Line Chart */}
        <div style={{ gridColumn: 'span 2' }}>
          <ChartCard 
            title="Daily Query Volume Trend"
            type="line"
            data={dailyData}
            xKey="label"
            yKey="value"
          />
        </div>

        {/* Language Distribution Bar Chart */}
        <ChartCard 
          title="Most Frequently Used Languages (Total Counts)"
          type="bar"
          data={languagesData}
          xKey="label"
          yKey="value"
        />

        {/* Language Breakdown share Donut chart */}
        <ChartCard 
          title="Language Share Distribution"
          type="pie"
          data={languagesData}
          xKey="label"
          yKey="value"
        />

      </div>

    </div>
  );
}
