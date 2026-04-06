import React from 'react';

const colorMap = {
  energy: '#d4a843',
  water: '#3d7a52',
  waste: '#5aad6e',
  overall: '#5aad6e'
};

export default function ScoreRing({ score, type, label, size = 120 }) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const safeScore = Math.min(100, Math.max(0, score || 0));
  const offset = circ - (safeScore / 100) * circ;
  const color = colorMap[type] || '#5aad6e';

  const getGrade = (s) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="score-ring-container">
      <div className="score-ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle className="score-ring-bg" cx={size/2} cy={size/2} r={r} />
          <circle
            className="score-ring-fill"
            cx={size/2} cy={size/2} r={r}
            stroke={color}
            strokeDasharray={circ}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="score-ring-text">
          <span className="score-num" style={{ color }}>{safeScore.toFixed(1)}</span>
          <span className="score-pct">/ 100</span>
        </div>
      </div>
      {label && (
        <div className="score-ring-label">
          {label}<br />
          <small style={{ fontSize: '0.7rem', color: '#8a9e90' }}>{getGrade(safeScore)}</small>
        </div>
      )}
    </div>
  );
}
