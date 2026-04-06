import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col } from 'react-bootstrap';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import Navbar from '../components/Navbar';
import ScoreRing from '../components/ScoreRing';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const TAB_LABELS = [
  { id: 'overview', label: 'Overview', icon: 'grid-1x2' },
  { id: 'events', label: 'Events', icon: 'calendar3' },
  { id: 'feedback', label: 'Submit Feedback', icon: 'chat-heart' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [latest, setLatest] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [fbLoading, setFbLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3500);
  };

  const fetchData = useCallback(async () => {
    try {
      const [latRes, evRes] = await Promise.all([
        API.get('/sustainability/latest'),
        API.get('/events')
      ]);
      setLatest(latRes.data);
      setEvents(evRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFeedbackSubmit = async e => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setFbLoading(true);
    try {
      await API.post('/feedback', { message: feedback });
      setFeedback('');
      showMsg('success', '✅ Feedback submitted! Thank you for your contribution.');
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setFbLoading(false);
    }
  };

  const formatDate = (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getGradeInfo = (s) => {
    if (!s && s !== 0) return { label: 'N/A', color: '#8a9e90' };
    if (s >= 80) return { label: 'Excellent 🌟', color: '#1e7a3c' };
    if (s >= 60) return { label: 'Good ✅', color: '#3d7a52' };
    if (s >= 40) return { label: 'Fair ⚠️', color: '#8a6a10' };
    return { label: 'Needs Work ❌', color: '#c0392b' };
  };

  if (loading) return <div className="full-loader"><div className="loader-ring"></div></div>;

  const radarData = latest ? [
    { subject: 'Energy', score: Math.max(0, latest.energyScore || 0) },
    { subject: 'Water', score: Math.max(0, latest.waterScore || 0) },
    { subject: 'Waste', score: Math.max(0, latest.wasteScore || 0) },
  ] : [];

  const overall = getGradeInfo(latest?.sustainabilityScore);

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main">
        <div className="dashboard-greeting">
          <h2>Student Dashboard</h2>
          <p>Welcome, <strong>{user?.name}</strong> — explore campus sustainability performance</p>
        </div>

        {msg.text && <div className={`sc-alert ${msg.type}`}>{msg.text}</div>}

        {/* Tabs */}
        <div className="sc-tabs">
          {TAB_LABELS.map(t => (
            <button key={t.id} className={`sc-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              <i className={`bi bi-${t.icon}`}></i> {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="fade-in">
            {latest ? (
              <>
                {/* Overall Hero */}
                <div className="overall-hero">
                  <div className="overall-hero-ring">
                    <ScoreRing score={latest.sustainabilityScore} type="overall" size={110} />
                  </div>
                  <div className="overall-hero-info">
                    <h3>Campus Sustainability Score</h3>
                    <div className="big-score">{latest.sustainabilityScore?.toFixed(1)}</div>
                    <div className="score-grade" style={{ color: overall.color }}>
                      {overall.label}
                    </div>
                    <div className="score-grade" style={{ marginTop: '0.25rem' }}>
                      Last updated {formatDate(latest.date)}
                    </div>
                  </div>
                </div>

                <Row className="g-3 mb-3">
                  {/* Score Rings */}
                  <Col md={7}>
                    <div className="metric-card" style={{ height: '100%' }}>
                      <div className="section-card-title"><i className="bi bi-speedometer2"></i> Metric Scores</div>
                      <Row className="g-0 text-center">
                        {[
                          { key: 'energy', label: 'Energy', score: latest.energyScore, icon: 'lightning-charge-fill', color: '#d4a843' },
                          { key: 'water', label: 'Water', score: latest.waterScore, icon: 'droplet-fill', color: '#3d7a52' },
                          { key: 'waste', label: 'Waste', score: latest.wasteScore, icon: 'recycle', color: '#5aad6e' },
                        ].map(m => (
                          <Col key={m.key} xs={4}>
                            <div style={{ padding: '0.75rem' }}>
                              <div style={{ fontSize: '1.2rem', color: m.color, marginBottom: '0.5rem' }}>
                                <i className={`bi bi-${m.icon}`}></i>
                              </div>
                              <ScoreRing score={m.score} type={m.key} label={m.label} size={90} />
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </Col>

                  {/* Radar Chart */}
                  <Col md={5}>
                    <div className="metric-card" style={{ height: '100%' }}>
                      <div className="section-card-title"><i className="bi bi-diagram-3"></i> Radar View</div>
                      <div style={{ height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="#e8efe9" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#1a3a2a', fontFamily: 'Syne', fontWeight: 600 }} />
                            <Radar name="Score" dataKey="score" stroke="#5aad6e" fill="#5aad6e" fillOpacity={0.2} strokeWidth={2} />
                            <Tooltip formatter={(v) => [`${v.toFixed(1)}%`, 'Score']} contentStyle={{ borderRadius: '8px', fontSize: '0.8rem' }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Progress breakdown */}
                <div className="section-card">
                  <div className="section-card-title"><i className="bi bi-bar-chart-steps"></i> Detailed Breakdown</div>
                  {[
                    { key: 'energy', label: 'Energy Efficiency', score: latest.energyScore, current: latest.energyCurrent, max: latest.energyMax, unit: 'kWh', icon: 'lightning-charge-fill', color: '#d4a843' },
                    { key: 'water', label: 'Water Conservation', score: latest.waterScore, current: latest.waterCurrent, max: latest.waterMax, unit: 'L', icon: 'droplet-fill', color: '#3d7a52' },
                    { key: 'waste', label: 'Recycling Rate', score: latest.wasteScore, current: latest.wasteRecycled, max: latest.wasteTotal, unit: 'kg', icon: 'recycle', color: '#5aad6e' },
                  ].map(m => (
                    <div key={m.key} style={{ marginBottom: '1.25rem' }}>
                      <div className="progress-label">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <i className={`bi bi-${m.icon}`} style={{ color: m.color }}></i>
                          <strong style={{ fontFamily: 'Syne', fontSize: '0.85rem' }}>{m.label}</strong>
                          <span style={{ color: '#8a9e90', fontSize: '0.78rem' }}>({m.current?.toLocaleString()} / {m.max?.toLocaleString()} {m.unit})</span>
                        </span>
                        <span className="progress-score" style={{ color: m.color }}>{m.score?.toFixed(1)}%</span>
                      </div>
                      <div className="sc-progress">
                        <div className={`sc-progress-bar ${m.key}`} style={{ width: `${Math.max(0, m.score)}%` }}></div>
                      </div>
                      <div style={{ fontSize: '0.73rem', color: '#8a9e90', marginTop: '0.2rem' }}>
                        {getGradeInfo(m.score).label}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="section-card">
                <div className="no-data">
                  <i className="bi bi-hourglass"></i>
                  <p>No sustainability data available yet. Check back later!</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EVENTS TAB */}
        {tab === 'events' && (
          <div className="fade-in">
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: '#1a3a2a', marginBottom: '1.25rem' }}>
              <i className="bi bi-calendar-event me-2"></i>Upcoming Sustainability Events
            </div>
            {events.length === 0 ? (
              <div className="section-card">
                <div className="no-data">
                  <i className="bi bi-calendar-x"></i>
                  <p>No events posted yet. Check back soon!</p>
                </div>
              </div>
            ) : (
              events.map(ev => {
                const dt = new Date(ev.date);
                const isPast = dt < new Date();
                return (
                  <div key={ev._id} className="event-card" style={{ opacity: isPast ? 0.7 : 1 }}>
                    <div className="event-card-date" style={{ background: isPast ? '#6b7c70' : '#1a3a2a' }}>
                      <div className="month">{dt.toLocaleDateString('en-US', { month: 'short' })}</div>
                      <div className="day">{dt.getDate()}</div>
                    </div>
                    <div className="event-card-body">
                      <div className="event-card-title">
                        {ev.title}
                        {isPast && <span style={{ fontSize: '0.72rem', color: '#8a9e90', marginLeft: '0.5rem', fontWeight: 400 }}>(Past)</span>}
                      </div>
                      <div className="event-card-desc">{ev.description}</div>
                      <div style={{ fontSize: '0.75rem', color: '#8a9e90', marginTop: '0.4rem' }}>
                        <i className="bi bi-calendar2 me-1"></i>{formatDate(ev.date)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* FEEDBACK TAB */}
        {tab === 'feedback' && (
          <div className="fade-in">
            <Row className="justify-content-center">
              <Col lg={7}>
                <div className="section-card">
                  <div className="section-card-title"><i className="bi bi-chat-heart"></i> Share Your Feedback</div>
                  <p style={{ fontSize: '0.875rem', color: '#8a9e90', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                    Have ideas to improve campus sustainability? Your feedback is valuable and reviewed by campus administrators.
                  </p>

                  {msg.text && <div className={`sc-alert ${msg.type}`}>{msg.text}</div>}

                  <form onSubmit={handleFeedbackSubmit}>
                    <div className="form-group">
                      <label className="sc-form-label">Your Message</label>
                      <textarea
                        className="sc-input sc-textarea"
                        placeholder="Share your suggestions, observations, or ideas about campus sustainability..."
                        style={{ minHeight: '160px' }}
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        required
                      ></textarea>
                      <div style={{ fontSize: '0.75rem', color: '#8a9e90', marginTop: '0.35rem' }}>
                        {feedback.length} characters
                      </div>
                    </div>
                    <button className="btn-sc-primary" type="submit" disabled={fbLoading || !feedback.trim()}>
                      {fbLoading ? <><div className="loader-ring" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Submitting...</> : <><i className="bi bi-send-fill"></i> Submit Feedback</>}
                    </button>
                  </form>

                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f5f0e8', borderRadius: '10px' }}>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.85rem', color: '#1a3a2a', marginBottom: '0.5rem' }}>
                      <i className="bi bi-lightbulb me-1" style={{ color: '#d4a843' }}></i> Ideas to consider
                    </div>
                    {['Suggest energy saving initiatives in classrooms', 'Report water leaks or wasteful practices', 'Propose new recycling stations', 'Share ideas for sustainability events'].map((idea, i) => (
                      <div key={i} style={{ fontSize: '0.82rem', color: '#5a7060', padding: '0.3rem 0', borderBottom: i < 3 ? '1px solid #e8efe9' : 'none', cursor: 'pointer' }}
                        onClick={() => setFeedback(idea)}>
                        <i className="bi bi-arrow-right me-2" style={{ color: '#5aad6e' }}></i>{idea}
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </div>
    </div>
  );
}
