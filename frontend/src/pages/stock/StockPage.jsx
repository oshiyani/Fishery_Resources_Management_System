import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const STATUS_CONFIG = {
  healthy:  { bg:'rgba(16,185,129,0.15)',  border:'rgba(16,185,129,0.4)',  text:'#6ee7b7',  icon:'✅', label:'Healthy'  },
  low:      { bg:'rgba(245,158,11,0.15)',  border:'rgba(245,158,11,0.4)',  text:'#fcd34d',  icon:'⚠️', label:'Low'     },
  critical: { bg:'rgba(239,68,68,0.15)',   border:'rgba(239,68,68,0.4)',   text:'#fca5a5',  icon:'🚨', label:'Critical' },
};

const Badge = ({ status }) => {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.healthy;
  return (
    <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700', background:c.bg, border:`1px solid ${c.border}`, color:c.text, fontFamily:"'Nunito', sans-serif" }}>
      {c.icon} {c.label}
    </span>
  );
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';

const ZONES = [
  'Zone A - Coastal Waters',
  'Zone B - Deep Sea',
  'Zone C - Inland Waters',
  'Zone D - Estuarine',
  'Zone E - Reef Zone',
];

const SPECIES = [
  'Rohu','Catla','Tilapia','Pomfret','Sardine',
  'Mackerel','Tuna','Prawn','Crab','Lobster',
  'Squid','Salmon','Hilsa','Other',
];

// ✅ getHeaders as module-level function — always reads fresh token
const getHeaders = () => {
  const token = JSON.parse(localStorage.getItem('frms_user') || '{}')?.token;
  return { Authorization: `Bearer ${token}` };
};

export default function StockPage() {
  const { user } = useAuth();
  const [stocks, setStocks]             = useState([]);
  const [showForm, setShowForm]         = useState(false);
  const [editStock, setEditStock]       = useState(null);
  const [loading, setLoading]           = useState(false);
  const [message, setMessage]           = useState('');
  const [filterZone, setFilterZone]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({
    species:'', zone:'', currentStock:'',
    unit:'kg', alertThreshold:'', notes:'',
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    axios.get('/api/stock', { headers: getHeaders() })
      .then(r => setStocks(r.data))
      .catch(err => console.log('Stock error:', err.response?.data));
  }, []);

  const openEdit = (s) => {
    setEditStock(s);
    setForm({
      species: s.species, zone: s.zone,
      currentStock: s.currentStock, unit: s.unit,
      alertThreshold: s.alertThreshold, notes: s.notes || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditStock(null);
    setForm({ species:'', zone:'', currentStock:'', unit:'kg', alertThreshold:'', notes:'' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.species) return setMessage('❌ Please select a species');
    if (!form.zone)    return setMessage('❌ Please select a zone');
    setLoading(true);
    try {
      if (editStock) {
        // ✅ using getHeaders()
        const { data } = await axios.put(`/api/stock/${editStock._id}`, form, { headers: getHeaders() });
        setStocks(stocks.map(s => s._id === editStock._id ? data : s));
        setMessage('✅ Stock record updated successfully!');
      } else {
        // ✅ using getHeaders()
        const { data } = await axios.post('/api/stock', form, { headers: getHeaders() });
        setStocks([data, ...stocks]);
        setMessage('✅ Stock record added successfully!');
      }
      resetForm();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Error saving'));
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this stock record?')) return;
    try {
      // ✅ using getHeaders()
      await axios.delete(`/api/stock/${id}`, { headers: getHeaders() });
      setStocks(stocks.filter(s => s._id !== id));
      setMessage('✅ Stock record deleted.');
    } catch { setMessage('❌ Error deleting record'); }
  };

  const inputStyle = {
    width:'100%', padding:'11px 14px',
    background:'rgba(255,255,255,0.06)',
    border:'1.5px solid rgba(6,182,212,0.25)',
    borderRadius:'10px', color:'#e0f7ff',
    fontSize:'14px', fontFamily:"'Nunito', sans-serif", outline:'none',
  };

  const labelStyle = {
    display:'block', marginBottom:'6px',
    color:'rgba(148,210,230,0.8)',
    fontFamily:"'Nunito', sans-serif",
    fontSize:'13px', fontWeight:'600',
  };

  const filtered = stocks.filter(s => {
    if (filterZone   && !s.zone.includes(filterZone)) return false;
    if (filterStatus && s.status !== filterStatus)     return false;
    return true;
  });

  const healthyCount  = stocks.filter(s => s.status === 'healthy').length;
  const lowCount      = stocks.filter(s => s.status === 'low').length;
  const criticalCount = stocks.filter(s => s.status === 'critical').length;
  const totalStock    = stocks.reduce((sum, s) => sum + (s.currentStock || 0), 0);

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Nunito:wght@400;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .action-btn { padding:5px 12px; border-radius:6px; border:none; font-size:12px; font-weight:700; cursor:pointer; font-family:'Nunito',sans-serif; transition:all 0.2s; }
        .inp:focus { border-color:#06b6d4 !important; background:rgba(6,182,212,0.1) !important; }
        .inp option { background:#0d2b4e; color:#e0f7ff; }
        .stock-bar-bg { background: rgba(255,255,255,0.08); border-radius:20px; height:8px; overflow:hidden; }
      `}</style>

      <div style={{ padding:'32px' }}>

        {/* Header */}
        <div className="fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <h1 style={{ fontFamily:"'Cinzel', serif", fontSize:'22px', fontWeight:'700', background:'linear-gradient(135deg, #22d3ee, #06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              📊 Fish Stock Monitoring
            </h1>
            <p style={{ color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito', sans-serif", fontSize:'13px', marginTop:'4px' }}>
              {user?.role === 'fisherman' ? 'Current fish stock levels by zone' : 'Monitor and manage fish population levels'}
            </p>
          </div>
          {(user?.role === 'admin' || user?.role === 'officer') && (
            <button onClick={() => { resetForm(); setShowForm(!showForm); }} style={{
              padding:'10px 20px', background:'linear-gradient(135deg, #0891b2, #06b6d4)',
              border:'none', borderRadius:'10px', color:'white',
              fontFamily:"'Nunito', sans-serif", fontWeight:'700', fontSize:'14px', cursor:'pointer',
            }}>
              {showForm ? '✕ Cancel' : '+ Add Stock Record'}
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap:'14px', marginBottom:'24px' }}>
          {[
            { label:'Total Records', value: stocks.length,                  color:'#06b6d4', icon:'📊' },
            { label:'Healthy',       value: healthyCount,                   color:'#10b981', icon:'✅' },
            { label:'Low Stock',     value: lowCount,                       color:'#f59e0b', icon:'⚠️' },
            { label:'Critical',      value: criticalCount,                  color:'#ef4444', icon:'🚨' },
            { label:'Total Stock',   value: totalStock.toLocaleString(),    color:'#8b5cf6', icon:'⚖️' },
          ].map((s,i) => (
            <div key={i} style={{ background:'rgba(5,25,55,0.7)', border:`1px solid ${s.color}33`, borderRadius:'12px', padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:'22px', marginBottom:'6px' }}>{s.icon}</div>
              <div style={{ fontSize:'22px', fontWeight:'800', color:s.color, fontFamily:"'Nunito', sans-serif" }}>{s.value}</div>
              <div style={{ fontSize:'12px', color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito', sans-serif" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Critical Alert Banner */}
        {criticalCount > 0 && (
          <div className="fade-up" style={{
            padding:'14px 18px', borderRadius:'12px', marginBottom:'20px',
            background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
            display:'flex', alignItems:'center', gap:'12px',
          }}>
            <span style={{ fontSize:'20px' }}>🚨</span>
            <div>
              <div style={{ color:'#fca5a5', fontFamily:"'Nunito', sans-serif", fontWeight:'700', fontSize:'14px' }}>
                Critical Alert: {criticalCount} species at dangerously low levels!
              </div>
              <div style={{ color:'rgba(252,165,165,0.7)', fontFamily:"'Nunito', sans-serif", fontSize:'12px', marginTop:'2px' }}>
                Immediate action required — consider restricting fishing in affected zones.
              </div>
            </div>
          </div>
        )}

        {message && (
          <div style={{
            padding:'12px 16px', borderRadius:'10px', marginBottom:'20px',
            background: message.includes('✅') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${message.includes('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: message.includes('✅') ? '#6ee7b7' : '#fca5a5',
            fontFamily:"'Nunito', sans-serif", fontSize:'14px',
          }}>{message}</div>
        )}

        {/* Add / Edit Form */}
        {showForm && (user?.role === 'admin' || user?.role === 'officer') && (
          <div className="fade-up" style={{ background:'rgba(5,25,55,0.8)', border:'1px solid rgba(6,182,212,0.2)', borderRadius:'16px', padding:'28px', marginBottom:'24px' }}>
            <h2 style={{ fontFamily:"'Nunito', sans-serif", fontSize:'16px', fontWeight:'800', color:'#22d3ee', marginBottom:'20px' }}>
              {editStock ? '✏️ Update Stock Record' : '➕ Add Stock Record'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px,1fr))', gap:'16px' }}>

                <div>
                  <label style={labelStyle}>Fish Species</label>
                  <select className="inp" style={{ ...inputStyle, cursor:'pointer' }}
                    value={form.species} onChange={e => setForm({...form, species:e.target.value})} required>
                    <option value="">-- Select Species --</option>
                    {SPECIES.map(s => <option key={s} value={s}>🐟 {s}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Fishing Zone</label>
                  <select className="inp" style={{ ...inputStyle, cursor:'pointer' }}
                    value={form.zone} onChange={e => setForm({...form, zone:e.target.value})} required>
                    <option value="">-- Select Zone --</option>
                    {ZONES.map(z => <option key={z} value={z}>🌊 {z}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Current Stock Level</label>
                  <input className="inp" style={inputStyle} type="number" min="0"
                    placeholder="e.g. 5000" value={form.currentStock}
                    onChange={e => setForm({...form, currentStock:e.target.value})} required />
                </div>

                <div>
                  <label style={labelStyle}>Unit</label>
                  <select className="inp" style={{ ...inputStyle, cursor:'pointer' }}
                    value={form.unit} onChange={e => setForm({...form, unit:e.target.value})}>
                    <option value="kg">⚖️ Kilograms (kg)</option>
                    <option value="tons">🏋️ Tons</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Alert Threshold</label>
                  <input className="inp" style={inputStyle} type="number" min="0"
                    placeholder="e.g. 1000 (warn when below this)"
                    value={form.alertThreshold}
                    onChange={e => setForm({...form, alertThreshold:e.target.value})} required />
                </div>

                <div>
                  <label style={labelStyle}>Survey Notes (optional)</label>
                  <input className="inp" style={inputStyle} type="text"
                    placeholder="e.g. Post-monsoon survey"
                    value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} />
                </div>

              </div>

              {form.currentStock && form.alertThreshold && (
                <div style={{ marginTop:'16px', padding:'14px', background:'rgba(6,182,212,0.06)', borderRadius:'10px', border:'1px solid rgba(6,182,212,0.15)' }}>
                  <div style={{ color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito', sans-serif", fontSize:'12px', marginBottom:'8px', fontWeight:'600' }}>
                    STOCK HEALTH PREVIEW
                  </div>
                  <div className="stock-bar-bg">
                    <div style={{
                      height:'8px', borderRadius:'20px',
                      width:`${Math.min((form.currentStock / form.alertThreshold) * 50, 100)}%`,
                      background: (form.currentStock / form.alertThreshold) <= 0.3 ? '#ef4444'
                        : (form.currentStock / form.alertThreshold) <= 0.7 ? '#f59e0b' : '#10b981',
                      transition:'width 0.3s',
                    }} />
                  </div>
                  <div style={{ color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito', sans-serif", fontSize:'11px', marginTop:'6px' }}>
                    {form.currentStock} / {form.alertThreshold} threshold
                  </div>
                </div>
              )}

              <div style={{ display:'flex', gap:'12px', marginTop:'20px' }}>
                <button type="submit" disabled={loading} style={{
                  padding:'12px 28px',
                  background:'linear-gradient(135deg, #0891b2, #06b6d4)',
                  border:'none', borderRadius:'10px', color:'white',
                  fontFamily:"'Nunito', sans-serif", fontWeight:'700', fontSize:'14px',
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                }}>
                  {loading ? '🌊 Saving...' : editStock ? '✏️ Update Record' : '➕ Add Record'}
                </button>
                {editStock && (
                  <button type="button" onClick={resetForm} style={{
                    padding:'12px 20px',
                    background:'rgba(255,255,255,0.05)',
                    border:'1px solid rgba(6,182,212,0.2)', borderRadius:'10px',
                    color:'rgba(148,210,230,0.7)',
                    fontFamily:"'Nunito', sans-serif", fontWeight:'700', fontSize:'14px', cursor:'pointer',
                  }}>Cancel Edit</button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="fade-up" style={{ display:'flex', gap:'12px', marginBottom:'16px', flexWrap:'wrap' }}>
          <select style={{ ...inputStyle, width:'auto', padding:'8px 14px', fontSize:'13px', cursor:'pointer' }}
            value={filterZone} onChange={e => setFilterZone(e.target.value)}>
            <option value="">🌊 All Zones</option>
            {ZONES.map(z => <option key={z} value={z.split(' - ')[0]}>{z}</option>)}
          </select>
          <select style={{ ...inputStyle, width:'auto', padding:'8px 14px', fontSize:'13px', cursor:'pointer' }}
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">📊 All Status</option>
            <option value="healthy">✅ Healthy</option>
            <option value="low">⚠️ Low</option>
            <option value="critical">🚨 Critical</option>
          </select>
          {(filterZone || filterStatus) && (
            <button onClick={() => { setFilterZone(''); setFilterStatus(''); }} style={{
              padding:'8px 14px', background:'rgba(239,68,68,0.15)',
              border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px',
              color:'#fca5a5', fontFamily:"'Nunito', sans-serif",
              fontSize:'13px', fontWeight:'700', cursor:'pointer',
            }}>✕ Clear Filters</button>
          )}
        </div>

        {/* Stock Cards */}
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', background:'rgba(5,25,55,0.6)', border:'1px dashed rgba(6,182,212,0.2)', borderRadius:'16px' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>📊</div>
            <p style={{ color:'rgba(148,210,230,0.5)', fontFamily:"'Nunito', sans-serif", fontSize:'15px' }}>
              {stocks.length === 0 ? 'No stock records yet. Add one above!' : 'No records match your filters.'}
            </p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:'16px' }}>
            {filtered.map(s => {
              const ratio    = Math.min((s.currentStock / s.alertThreshold) * 100, 100);
              const barColor = s.status === 'critical' ? '#ef4444' : s.status === 'low' ? '#f59e0b' : '#10b981';
              return (
                <div key={s._id} className="fade-up" style={{
                  background:'rgba(5,25,55,0.8)',
                  border:`1px solid ${s.status === 'critical' ? 'rgba(239,68,68,0.4)' : s.status === 'low' ? 'rgba(245,158,11,0.3)' : 'rgba(6,182,212,0.2)'}`,
                  borderRadius:'14px', padding:'20px',
                  boxShadow: s.status === 'critical' ? '0 0 20px rgba(239,68,68,0.1)' : 'none',
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px' }}>
                    <div>
                      <div style={{ fontFamily:"'Nunito', sans-serif", fontSize:'16px', fontWeight:'800', color:'#e0f7ff' }}>
                        🐟 {s.species}
                      </div>
                      <div style={{ fontFamily:"'Nunito', sans-serif", fontSize:'12px', color:'rgba(148,210,230,0.5)', marginTop:'3px' }}>
                        🌊 {s.zone}
                      </div>
                    </div>
                    <Badge status={s.status} />
                  </div>

                  <div style={{ marginBottom:'12px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                      <span style={{ color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito', sans-serif", fontSize:'12px' }}>Stock Level</span>
                      <span style={{ color:barColor, fontFamily:"'Nunito', sans-serif", fontSize:'12px', fontWeight:'700' }}>
                        {s.currentStock.toLocaleString()} {s.unit}
                      </span>
                    </div>
                    <div className="stock-bar-bg">
                      <div style={{
                        height:'8px', borderRadius:'20px',
                        width:`${ratio}%`,
                        background:`linear-gradient(90deg, ${barColor}99, ${barColor})`,
                        transition:'width 0.5s ease',
                      }} />
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:'4px' }}>
                      <span style={{ color:'rgba(148,210,230,0.4)', fontFamily:"'Nunito', sans-serif", fontSize:'11px' }}>0</span>
                      <span style={{ color:'rgba(148,210,230,0.4)', fontFamily:"'Nunito', sans-serif", fontSize:'11px' }}>
                        Threshold: {s.alertThreshold.toLocaleString()} {s.unit}
                      </span>
                    </div>
                  </div>

                  <div style={{ display:'flex', justifyContent:'space-between', paddingTop:'12px', borderTop:'1px solid rgba(6,182,212,0.1)' }}>
                    <div style={{ color:'rgba(148,210,230,0.4)', fontFamily:"'Nunito', sans-serif", fontSize:'11px' }}>
                      📅 Surveyed: {formatDate(s.lastSurveyDate)}
                    </div>
                    {s.surveyedBy?.name && (
                      <div style={{ color:'rgba(148,210,230,0.4)', fontFamily:"'Nunito', sans-serif", fontSize:'11px' }}>
                        👤 {s.surveyedBy.name}
                      </div>
                    )}
                  </div>

                  {s.notes && (
                    <div style={{ marginTop:'10px', padding:'8px 10px', background:'rgba(6,182,212,0.06)', borderRadius:'8px', color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito', sans-serif", fontSize:'12px' }}>
                      📝 {s.notes}
                    </div>
                  )}

                  {(user?.role === 'admin' || user?.role === 'officer') && (
                    <div style={{ display:'flex', gap:'8px', marginTop:'14px' }}>
                      <button className="action-btn" onClick={() => openEdit(s)}
                        style={{ flex:1, padding:'8px', background:'rgba(6,182,212,0.15)', color:'#22d3ee', border:'1px solid rgba(6,182,212,0.3)' }}>
                        ✏️ Update
                      </button>
                      {user?.role === 'admin' && (
                        <button className="action-btn" onClick={() => handleDelete(s._id)}
                          style={{ padding:'8px 12px', background:'rgba(239,68,68,0.15)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.3)' }}>
                          🗑️
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}