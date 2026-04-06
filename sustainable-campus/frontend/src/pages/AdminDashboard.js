import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Modal } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Navbar from '../components/Navbar';
import ScoreRing from '../components/ScoreRing';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const TABS = ['overview', 'sustainability', 'events', 'feedback'];
const TAB_LABELS = [
  { id: 'overview', label: 'Overview', icon: 'grid-1x2' },
  { id: 'sustainability', label: 'Add Data', icon: 'plus-circle' },
  { id: 'events', label: 'Events', icon: 'calendar3' },
  { id: 'feedback', label: 'Feedback', icon: 'chat-dots' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Sustainability form
  const [susForm, setSusForm] = useState({
    energyCurrent: '', energyMax: '',
    waterCurrent: '', waterMax: '',
    wasteRecycled: '', wasteTotal: ''
  });
  const [susLoading, setSusLoading] = useState(false);

  // Event form
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '' });
  const [eventLoading, setEventLoading] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3500);
  };

  const fetchAll = useCallback(async () => {
    try {
      const [latRes, histRes, evRes, fbRes] = await Promise.all([
        API.get('/sustainability/latest'),
        API.get('/sustainability'),
        API.get('/events'),
        API.get('/feedback')
      ]);
      setLatest(latRes.data);
      setHistory(histRes.data.slice(0, 10).reverse());
      setEvents(evRes.data);
      setFeedback(fbRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Sustainability submit
  const handleSusSubmit = async e => {
    e.preventDefault();
    setSusLoading(true);
    try {
      await API.post('/sustainability', susForm);
      showMsg('success', '✅ Sustainability data saved and scores calculated!');
      setSusForm({ energyCurrent: '', energyMax: '', waterCurrent: '', waterMax: '', wasteRecycled: '', wasteTotal: '' });
      fetchAll();
      setTab('overview');
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to save data');
    } finally {
      setSusLoading(false);
    }
  };

  // Delete sustainability
  const handleDeleteSus = async (id) => {
    if (!window.confirm('Delete this sustainability record?')) return;
    try {
      await API.delete(`/sustainability/${id}`);
      showMsg('success', 'Record deleted');
      fetchAll();
    } catch { showMsg('error', 'Delete failed'); }
  };

  // Event submit
  const handleEventSubmit = async e => {
    e.preventDefault();
    setEventLoading(true);
    try {
      if (editEvent) {
        await API.put(`/events/${editEvent._id}`, eventForm);
        showMsg('success', '✅ Event updated!');
      } else {
        await API.post('/events', eventForm);
        showMsg('success', '✅ Event created!');
      }
      setEventForm({ title: '', description: '', date: '' });
      setEditEvent(null);
      setShowEventModal(false);
      fetchAll();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to save event');
    } finally {
      setEventLoading(false);
    }
  };

  const openEditEvent = (ev) => {
    setEditEvent(ev);
    setEventForm({ title: ev.title, description: ev.description, date: ev.date?.substring(0, 10) });
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await API.delete(`/events/${id}`);
      showMsg('success', 'Event deleted');
      fetchAll();
    } catch { showMsg('error', 'Delete failed'); }
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await API.delete(`/feedback/${id}`);
      showMsg('success', 'Feedback deleted');
      fetchAll();
    } catch { showMsg('error', 'Delete failed'); }
  };

  const getScoreClass = (s) => {
    if (!s && s !== 0) return '';
    if (s >= 70) return 'high';
    if (s >= 40) return 'mid';
    return 'low';
  };

  const formatDate = (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <div className="full-loader"><div className="loader-ring"></div></div>;

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-main">
        <div className="dashboard-greeting">
          <h2>Admin Dashboard</h2>
          <p>Welcome back, <strong>{user?.name}</strong> — manage campus sustainability data</p>
        </div>

        {msg.text && <div className={`sc-alert ${msg.type}`}>{msg.text}</div>}

        {/* Tabs */}
        <div className="sc-tabs">
          {TAB_LABELS.map(t => (
            <button key={t.id} className={`sc-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              <i className={`bi bi-${t.icon}`}></i> {t.label}
              {t.id === 'feedback' && feedback.length > 0 && (
                <span style={{ background: '#5aad6e', color: 'white', borderRadius: '50px', fontSize: '0.7rem', padding: '0 6px', marginLeft: '2px' }}>
                  {feedback.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="fade-in">
            {/* Overall Hero */}
            {latest ? (
              <>
                <div className="overall-hero">
                  <div className="overall-hero-ring">
                    <ScoreRing score={latest.sustainabilityScore} type="overall" size={110} />
                  </div>
                  <div className="overall-hero-info">
                    <h3>Overall Sustainability Score</h3>
                    <div className="big-score">{latest.sustainabilityScore?.toFixed(1)}</div>
                    <div className="score-grade">
                      {latest.sustainabilityScore >= 80 ? '🌟 Excellent performance' :
                       latest.sustainabilityScore >= 60 ? '✅ Good progress' :
                       latest.sustainabilityScore >= 40 ? '⚠️ Needs improvement' : '❌ Critical attention needed'}
                      {' · '}Last updated {formatDate(latest.date)}
                    </div>
                  </div>
                </div>

                {/* 3 Metric Cards */}
                <Row className="g-3 mb-3">
                  {[
                    { key: 'energy', label: 'Energy Score', icon: 'lightning-charge-fill', score: latest.energyScore, current: latest.energyCurrent, max: latest.energyMax, unit: 'kWh' },
                    { key: 'water', label: 'Water Score', icon: 'droplet-fill', score: latest.waterScore, current: latest.waterCurrent, max: latest.waterMax, unit: 'L' },
                    { key: 'waste', label: 'Waste Score', icon: 'recycle', score: latest.wasteScore, current: latest.wasteRecycled, max: latest.wasteTotal, unit: 'kg' },
                  ].map(m => (
                    <Col md={4} key={m.key}>
                      <div className="metric-card">
                        <div className="metric-card-header">
                          <div className={`metric-icon ${m.key}`}>
                            <i className={`bi bi-${m.icon}`}></i>
                          </div>
                          <div>
                            <div className="metric-title">{m.label}</div>
                            <div className="metric-sub">{m.current?.toLocaleString()} / {m.max?.toLocaleString()} {m.unit}</div>
                          </div>
                        </div>
                        <div className="progress-label">
                          <span>Score</span>
                          <span className="progress-score">{m.score?.toFixed(1)}%</span>
                        </div>
                        <div className="sc-progress">
                          <div className={`sc-progress-bar ${m.key}`} style={{ width: `${Math.max(0, m.score)}%` }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.25rem' }}>
                          <ScoreRing score={m.score} type={m.key} label={m.label} size={100} />
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>

                {/* History Chart */}
                {history.length > 1 && (
                  <div className="section-card">
                    <div className="section-card-title"><i className="bi bi-graph-up"></i> Score Trends</div>
                    <div className="chart-wrapper" style={{ height: 280 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history.map(h => ({
                          date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                          Energy: parseFloat(h.energyScore?.toFixed(1)),
                          Water: parseFloat(h.waterScore?.toFixed(1)),
                          Waste: parseFloat(h.wasteScore?.toFixed(1)),
                          Overall: parseFloat(h.sustainabilityScore?.toFixed(1)),
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e8efe9" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8a9e90' }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#8a9e90' }} />
                          <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e8efe9', fontSize: '0.8rem' }} />
                          <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                          <Line type="monotone" dataKey="Energy" stroke="#d4a843" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="Water" stroke="#3d7a52" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="Waste" stroke="#5aad6e" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="Overall" stroke="#1a3a2a" strokeWidth={2.5} dot={false} strokeDasharray="5 3" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* History Table */}
                <div className="section-card">
                  <div className="section-card-title"><i className="bi bi-table"></i> Sustainability Records</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="sc-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Energy Score</th>
                          <th>Water Score</th>
                          <th>Waste Score</th>
                          <th>Overall</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...history].reverse().map(h => (
                          <tr key={h._id}>
                            <td>{formatDate(h.date)}</td>
                            <td><span className={`score-badge ${getScoreClass(h.energyScore)}`}>{h.energyScore?.toFixed(1)}%</span></td>
                            <td><span className={`score-badge ${getScoreClass(h.waterScore)}`}>{h.waterScore?.toFixed(1)}%</span></td>
                            <td><span className={`score-badge ${getScoreClass(h.wasteScore)}`}>{h.wasteScore?.toFixed(1)}%</span></td>
                            <td><span className={`score-badge ${getScoreClass(h.sustainabilityScore)}`}>{h.sustainabilityScore?.toFixed(1)}%</span></td>
                            <td><button className="btn-sc-danger" onClick={() => handleDeleteSus(h._id)}><i className="bi bi-trash"></i></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="section-card">
                <div className="no-data">
                  <i className="bi bi-bar-chart-line"></i>
                  <p>No sustainability data yet. Add your first entry in the <strong>Add Data</strong> tab.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ADD DATA TAB */}
        {tab === 'sustainability' && (
          <div className="fade-in">
            <Row className="justify-content-center">
              <Col lg={8}>
                <div className="section-card">
                  <div className="section-card-title"><i className="bi bi-plus-circle"></i> Add Sustainability Data</div>
                  <p style={{ fontSize: '0.85rem', color: '#8a9e90', marginBottom: '1.5rem' }}>
                    Enter the raw metrics below. Scores will be calculated automatically using the platform formulas.
                  </p>
                  <form onSubmit={handleSusSubmit}>
                    <div style={{ background: '#f5f0e8', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontFamily: 'Syne', fontWeight: 700, fontSize: '0.9rem', color: '#1a3a2a' }}>
                        <i className="bi bi-lightning-charge-fill" style={{ color: '#d4a843' }}></i> Energy Usage (kWh)
                      </div>
                      <Row className="g-3">
                        <Col sm={6}>
                          <label className="sc-form-label">Current Consumption</label>
                          <input className="sc-input" type="number" min="0" step="any" placeholder="e.g. 4500" required
                            value={susForm.energyCurrent} onChange={e => setSusForm({ ...susForm, energyCurrent: e.target.value })} />
                        </Col>
                        <Col sm={6}>
                          <label className="sc-form-label">Maximum Allowed</label>
                          <input className="sc-input" type="number" min="1" step="any" placeholder="e.g. 6000" required
                            value={susForm.energyMax} onChange={e => setSusForm({ ...susForm, energyMax: e.target.value })} />
                        </Col>
                      </Row>
                    </div>

                    <div style={{ background: '#f5f0e8', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontFamily: 'Syne', fontWeight: 700, fontSize: '0.9rem', color: '#1a3a2a' }}>
                        <i className="bi bi-droplet-fill" style={{ color: '#3d7a52' }}></i> Water Usage (Litres)
                      </div>
                      <Row className="g-3">
                        <Col sm={6}>
                          <label className="sc-form-label">Current Consumption</label>
                          <input className="sc-input" type="number" min="0" step="any" placeholder="e.g. 20000" required
                            value={susForm.waterCurrent} onChange={e => setSusForm({ ...susForm, waterCurrent: e.target.value })} />
                        </Col>
                        <Col sm={6}>
                          <label className="sc-form-label">Maximum Allowed</label>
                          <input className="sc-input" type="number" min="1" step="any" placeholder="e.g. 30000" required
                            value={susForm.waterMax} onChange={e => setSusForm({ ...susForm, waterMax: e.target.value })} />
                        </Col>
                      </Row>
                    </div>

                    <div style={{ background: '#f5f0e8', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontFamily: 'Syne', fontWeight: 700, fontSize: '0.9rem', color: '#1a3a2a' }}>
                        <i className="bi bi-recycle" style={{ color: '#5aad6e' }}></i> Waste Management (kg)
                      </div>
                      <Row className="g-3">
                        <Col sm={6}>
                          <label className="sc-form-label">Waste Recycled</label>
                          <input className="sc-input" type="number" min="0" step="any" placeholder="e.g. 300" required
                            value={susForm.wasteRecycled} onChange={e => setSusForm({ ...susForm, wasteRecycled: e.target.value })} />
                        </Col>
                        <Col sm={6}>
                          <label className="sc-form-label">Total Waste Generated</label>
                          <input className="sc-input" type="number" min="1" step="any" placeholder="e.g. 500" required
                            value={susForm.wasteTotal} onChange={e => setSusForm({ ...susForm, wasteTotal: e.target.value })} />
                        </Col>
                      </Row>
                    </div>

                    {/* Score preview */}
                    {susForm.energyCurrent && susForm.energyMax && susForm.waterCurrent && susForm.waterMax && susForm.wasteRecycled && susForm.wasteTotal && (() => {
                      const es = (1 - susForm.energyCurrent / susForm.energyMax) * 100;
                      const ws = (1 - susForm.waterCurrent / susForm.waterMax) * 100;
                      const wts = (susForm.wasteRecycled / susForm.wasteTotal) * 100;
                      const overall = (es + ws + wts) / 3;
                      return (
                        <div style={{ background: '#1a3a2a', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', color: '#b8d9c0' }}>
                          <div style={{ fontFamily: 'Syne', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: '#8ecfa0' }}>
                            <i className="bi bi-calculator me-2"></i>Score Preview
                          </div>
                          <Row className="g-2 text-center">
                            {[
                              { label: 'Energy', val: es, c: '#d4a843' },
                              { label: 'Water', val: ws, c: '#5aad6e' },
                              { label: 'Waste', val: wts, c: '#8ecfa0' },
                              { label: 'Overall', val: overall, c: 'white' },
                            ].map(s => (
                              <Col key={s.label}>
                                <div style={{ fontSize: '1.4rem', fontFamily: 'Syne', fontWeight: 800, color: s.c }}>{s.val.toFixed(1)}</div>
                                <div style={{ fontSize: '0.72rem', color: '#8a9e90' }}>{s.label}</div>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      );
                    })()}

                    <button className="btn-sc-primary" type="submit" disabled={susLoading}>
                      {susLoading ? <><div className="loader-ring" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Saving...</> : <><i className="bi bi-check2-circle"></i> Save &amp; Calculate Scores</>}
                    </button>
                  </form>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* EVENTS TAB */}
        {tab === 'events' && (
          <div className="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: '#1a3a2a' }}>
                <i className="bi bi-calendar3 me-2"></i>Sustainability Events ({events.length})
              </div>
              <button className="btn-sc-green" onClick={() => { setEditEvent(null); setEventForm({ title: '', description: '', date: '' }); setShowEventModal(true); }}>
                <i className="bi bi-plus-lg"></i> New Event
              </button>
            </div>

            {events.length === 0 ? (
              <div className="section-card">
                <div className="no-data">
                  <i className="bi bi-calendar-x"></i>
                  <p>No events yet. Create your first sustainability event!</p>
                </div>
              </div>
            ) : (
              events.map(ev => {
                const dt = new Date(ev.date);
                return (
                  <div key={ev._id} className="event-card">
                    <div className="event-card-date">
                      <div className="month">{dt.toLocaleDateString('en-US', { month: 'short' })}</div>
                      <div className="day">{dt.getDate()}</div>
                    </div>
                    <div className="event-card-body">
                      <div className="event-card-title">{ev.title}</div>
                      <div className="event-card-desc">{ev.description}</div>
                      <div className="event-card-actions">
                        <button className="btn-sc-outline" onClick={() => openEditEvent(ev)}>
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                        <button className="btn-sc-danger" onClick={() => handleDeleteEvent(ev._id)}>
                          <i className="bi bi-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Event Modal */}
            <Modal show={showEventModal} onHide={() => setShowEventModal(false)} centered>
              <Modal.Header style={{ background: '#1a3a2a', color: '#f5f0e8', border: 'none', borderRadius: '16px 16px 0 0' }}>
                <Modal.Title style={{ fontFamily: 'Syne', fontSize: '1rem', fontWeight: 700 }}>
                  {editEvent ? 'Edit Event' : 'Create New Event'}
                </Modal.Title>
                <button onClick={() => setShowEventModal(false)} style={{ background: 'none', border: 'none', color: '#8ecfa0', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
              </Modal.Header>
              <Modal.Body style={{ background: '#fdfaf4', borderRadius: '0 0 16px 16px', padding: '1.5rem' }}>
                <form onSubmit={handleEventSubmit}>
                  <div className="form-group">
                    <label className="sc-form-label">Event Title</label>
                    <input className="sc-input" type="text" placeholder="e.g. Campus Clean-Up Day" required
                      value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="sc-form-label">Description</label>
                    <textarea className="sc-input sc-textarea" placeholder="Describe the event..." required
                      value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })}></textarea>
                  </div>
                  <div className="form-group">
                    <label className="sc-form-label">Event Date</label>
                    <input className="sc-input" type="date" required
                      value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} />
                  </div>
                  <button className="btn-sc-primary" type="submit" disabled={eventLoading}>
                    {eventLoading ? 'Saving...' : editEvent ? '✅ Update Event' : '✅ Create Event'}
                  </button>
                </form>
              </Modal.Body>
            </Modal>
          </div>
        )}

        {/* FEEDBACK TAB */}
        {tab === 'feedback' && (
          <div className="fade-in">
            <div className="section-card-title mb-3">
              <i className="bi bi-chat-dots"></i> Student Feedback ({feedback.length})
            </div>
            {feedback.length === 0 ? (
              <div className="section-card">
                <div className="no-data">
                  <i className="bi bi-chat-square"></i>
                  <p>No feedback submitted yet.</p>
                </div>
              </div>
            ) : (
              feedback.map(fb => (
                <div key={fb._id} className="feedback-card">
                  <div className="feedback-card-meta">
                    <div className="feedback-student">
                      <i className="bi bi-person-circle"></i>
                      {fb.studentId?.name || fb.studentName || 'Student'}
                      <span style={{ fontSize: '0.75rem', color: '#8a9e90', fontWeight: 400 }}>
                        · {fb.studentId?.email}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="feedback-date">{new Date(fb.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <button className="btn-sc-danger" onClick={() => handleDeleteFeedback(fb._id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div className="feedback-msg">{fb.message}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
