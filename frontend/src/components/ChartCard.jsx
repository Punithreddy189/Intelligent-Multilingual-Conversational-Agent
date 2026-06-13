import React from 'react';

export default function ChartCard({ title, type = 'line', data = [], xKey = 'label', yKey = 'value' }) {
  
  const renderLineChart = () => {
    if (data.length === 0) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No data available</div>;

    const width = 500;
    const height = 200;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxVal = Math.max(...data.map(d => d[yKey] || 0), 1);
    
    // Generate SVG coordinates
    const points = data.map((d, index) => {
      const x = paddingLeft + (index / (data.length - 1 || 1)) * chartWidth;
      const y = paddingTop + chartHeight - ((d[yKey] || 0) / maxVal) * chartHeight;
      return { x, y, label: d[xKey], val: d[yKey] };
    });

    // Create Path String
    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    // Area Path string (closes the path at the bottom for gradient fill)
    const areaD = points.length > 0 
      ? `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
      : '';

    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-cyan)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-indigo)" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = paddingTop + chartHeight * ratio;
          const valLabel = Math.round(maxVal * (1 - ratio));
          return (
            <g key={idx}>
              <line 
                x1={paddingLeft} 
                y1={y} 
                x2={width - paddingRight} 
                y2={y} 
                stroke="var(--border-glass)" 
                strokeDasharray="4,4" 
              />
              <text 
                x={paddingLeft - 10} 
                y={y + 4} 
                fill="var(--text-muted)" 
                fontSize="10" 
                textAnchor="end"
              >
                {valLabel}
              </text>
            </g>
          );
        })}

        {/* Shaded Area Under Line */}
        {areaD && <path d={areaD} fill="url(#lineGrad)" />}

        {/* Line Plot */}
        {pathD && (
          <path 
            d={pathD} 
            fill="none" 
            stroke="var(--color-cyan)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        )}

        {/* Data Circles */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="4" 
              fill="var(--bg-secondary)" 
              stroke="var(--color-cyan)" 
              strokeWidth="2"
            />
            {/* Value Tooltip above node */}
            <text 
              x={p.x} 
              y={p.y - 8} 
              fill="var(--text-primary)" 
              fontSize="9" 
              fontWeight="bold" 
              textAnchor="middle"
            >
              {p.val}
            </text>
            {/* X Axis Labels */}
            {idx % Math.max(1, Math.round(data.length / 5)) === 0 && (
              <text 
                x={p.x} 
                y={height - 10} 
                fill="var(--text-muted)" 
                fontSize="9" 
                textAnchor="middle"
              >
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    );
  };

  const renderBarChart = () => {
    if (data.length === 0) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No data available</div>;

    const width = 500;
    const height = 200;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxVal = Math.max(...data.map(d => d[yKey] || 0), 1);
    const barWidth = (chartWidth / data.length) * 0.6;
    const barSpacing = (chartWidth / data.length) * 0.4;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-violet)" />
            <stop offset="100%" stopColor="var(--color-indigo)" />
          </linearGradient>
        </defs>

        {/* Y Axis Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = paddingTop + chartHeight * ratio;
          return (
            <g key={idx}>
              <line 
                x1={paddingLeft} 
                y1={y} 
                x2={width - paddingRight} 
                y2={y} 
                stroke="var(--border-glass)" 
                strokeDasharray="4,4" 
              />
              <text 
                x={paddingLeft - 10} 
                y={y + 4} 
                fill="var(--text-muted)" 
                fontSize="10" 
                textAnchor="end"
              >
                {Math.round(maxVal * (1 - ratio))}
              </text>
            </g>
          );
        })}

        {/* Render Bars */}
        {data.map((d, index) => {
          const x = paddingLeft + index * (barWidth + barSpacing) + barSpacing / 2;
          const y = paddingTop + chartHeight - ((d[yKey] || 0) / maxVal) * chartHeight;
          const barHeight = ((d[yKey] || 0) / maxVal) * chartHeight;

          return (
            <g key={index}>
              {/* Bar Rect */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(1, barHeight)}
                fill="url(#barGrad)"
                rx="4"
                style={{ transition: 'height 0.5s ease, y 0.5s ease' }}
              />
              {/* Value Text */}
              <text
                x={x + barWidth / 2}
                y={y - 6}
                fill="var(--text-primary)"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
              >
                {d[yKey]}
              </text>
              {/* X Axis label */}
              <text
                x={x + barWidth / 2}
                y={height - 10}
                fill="var(--text-muted)"
                fontSize="10"
                textAnchor="middle"
              >
                {d[xKey]}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderDonutChart = () => {
    if (data.length === 0) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No data available</div>;

    const width = 400;
    const height = 200;
    const radius = 60;
    const cx = 110;
    const cy = 100;
    const strokeWidth = 14;
    const circumference = 2 * Math.PI * radius;

    const total = data.reduce((acc, d) => acc + (d[yKey] || 0), 0) || 1;
    
    // Pre-defined palette colors for slices
    const colors = ['var(--color-violet)', 'var(--color-cyan)', 'var(--color-indigo)', '#f59e0b', '#10b981'];

    let accumulatedPercentage = 0;

    return (
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ flex: '1.2' }}>
          {/* Donut rings */}
          {data.map((d, index) => {
            const percentage = (d[yKey] || 0) / total;
            const strokeDasharray = `${percentage * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercentage * circumference;
            accumulatedPercentage += percentage;

            return (
              <circle
                key={index}
                cx={cx}
                cy={cy}
                r={radius}
                fill="transparent"
                stroke={colors[index % colors.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${cx} ${cy})`}
                strokeLinecap="round"
              />
            );
          })}
          {/* Central Label */}
          <text x={cx} y={cy + 4} textAnchor="middle" fill="var(--text-primary)" fontSize="12" fontWeight="bold">
            Total Queries
          </text>
          <text x={cx} y={cy + 22} textAnchor="middle" fill="var(--color-cyan)" fontSize="14" fontWeight="800">
            {total}
          </text>
        </svg>
        
        {/* Chart Legends */}
        <div style={{ flex: '0.8', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '20px' }}>
          {data.map((d, index) => {
            const percentage = Math.round(((d[yKey] || 0) / total) * 100);
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                <div 
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '4px', 
                    background: colors[index % colors.length] 
                  }} 
                />
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500, flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {d[xKey]}
                </span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {percentage}% ({d[yKey]})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '20px', height: '270px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600, borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
        {title}
      </h3>
      <div style={{ flex: 1, minHeight: 0 }}>
        {type === 'line' && renderLineChart()}
        {type === 'bar' && renderBarChart()}
        {type === 'pie' && renderDonutChart()}
      </div>
    </div>
  );
}
