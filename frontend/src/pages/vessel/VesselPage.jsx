import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const STATUS_COLORS = {
  pending:  { bg:'rgba(245,158,11,0.15)', border:'rgba(245,158,11,0.4)', text:'#fcd34d' },
  approved: { bg:'rgba(16,185,129,0.15)', border:'rgba(16,185,129,0.4)', text:'#6ee7b7' },
  rejected: { bg:'rgba(239,68,68,0.15)',  border:'rgba(239,68,68,0.4)',  text:'#fca5a5' },
};

const Badge = ({ status }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700', background:c.bg, border:`1px solid ${c.border}`, color:c.text, textTransform:'capitalize', fontFamily:"'Nunito', sans-serif" }}>
      {status}
    </span>
  );
};

export default function VesselPage() {
  const { user } = useAuth();
  const [vessels, setVessels]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState('');
  const [form, setForm] = useState({
    vesselName:'', vesselId:'', type:'',
    capacity:'', enginePower:'', manufactureYear:'',
  });

  const token = JSON.parse(localStorage.getItem('frms_user') || '{}')?.token;
  const headers = { Authorization: `Bearer ${token}` };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const url = user?.role === 'fisherman' ? '/api/vessels/me' : '/api/vessels';
    axios.get(url, { headers }).then(r => setVessels(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type) return setMessage('❌ Please select a vessel type');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/vessels', form, { headers });
      setVessels([data, ...vessels]);
      setMessage('✅ Vessel registered successfully!');
      setShowForm(false);
      setForm({ vesselName:'', vesselId:'', type:'', capacity:'', enginePower:'', manufactureYear:'' });
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Error'));
    }
    setLoading(false);
  };

  const handleStatus = async (id, status) => {
    try {
      await axios.put(`/api/vessels/${id}`, { status }, { headers });
      setVessels(vessels.map(v => v._id === id ? { ...v, status } : v));
    } catch { alert('Error updating status'); }
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

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Nunito:wght@400;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .tbl-row:hover { background: rgba(6,182,212,0.05) !important; }
        .action-btn { padding:5px 12px; border-radius:6px; border:none; font-size:12px; font-weight:700; cursor:pointer; font-family:'Nunito',sans-serif; transition:all 0.2s; }
        .inp:focus { border-color:#06b6d4 !important; background:rgba(6,182,212,0.1) !important; }
        .inp option { background:#0d2b4e; color:#e0f7ff; }
      `}</style>

      <div style={{ padding:'32px' }}>

        {/* Header */}
        <div className="fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <h1 style={{ fontFamily:"'Cinzel', serif", fontSize:'22px', fontWeight:'700', background:'linear-gradient(135deg, #22d3ee, #06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              🚢 Vessel Registration
            </h1>
            <p style={{ color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito', sans-serif", fontSize:'13px', marginTop:'4px' }}>
              {user?.role === 'fisherman' ? 'Your registered vessels' : 'Manage vessel registrations'}
            </p>
          </div>
          {user?.role === 'fisherman' && (
            <button onClick={() => setShowForm(!showForm)} style={{
              padding:'10px 20px', background:'linear-gradient(135deg, #0891b2, #06b6d4)',
              border:'none', borderRadius:'10px', color:'white',
              fontFamily:"'Nunito', sans-serif", fontWeight:'700', fontSize:'14px', cursor:'pointer',
            }}>
              {showForm ? '✕ Cancel' : '+ Add Vessel'}
            </button>
          )}
        </div>

        {message && (
          <div style={{
            padding:'12px 16px', borderRadius:'10px', marginBottom:'20px',
            background: message.includes('✅') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${message.includes('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: message.includes('✅') ? '#6ee7b7' : '#fca5a5',
            fontFamily:"'Nunito', sans-serif", fontSize:'14px',
          }}>{message}</div>
        )}

        {/* Form */}
        {showForm && (
          <div className="fade-up" style={{ background:'rgba(5,25,55,0.8)', border:'1px solid rgba(6,182,212,0.2)', borderRadius:'16px', padding:'28px', marginBottom:'28px' }}>
            <h2 style={{ fontFamily:"'Nunito', sans-serif", fontSize:'16px', fontWeight:'800', color:'#22d3ee', marginBottom:'20px' }}>
              📝 Vessel Registration Form
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:'16px' }}>

                {[
                  { label:'Vessel Name',        name:'vesselName',     type:'text',   placeholder:'e.g. Sea Dragon',  req:true  },
                  { label:'Vessel ID / Reg No',  name:'vesselId',       type:'text',   placeholder:'Unique vessel ID', req:true  },
                  { label:'Capacity (tons)',     name:'capacity',        type:'number', placeholder:'e.g. 10',          req:true  },
                  { label:'Engine Power (HP)',   name:'enginePower',     type:'text',   placeholder:'e.g. 150 HP',      req:false },
                  { label:'Manufacture Year',   name:'manufactureYear', type:'number', placeholder:'e.g. 2015',        req:false },
                ].map(f => (
                  <div key={f.name}>
                    <label style={labelStyle}>{f.label}</label>
                    <input className="inp" style={inputStyle} type={f.type}
                      placeholder={f.placeholder} value={form[f.name]}
                      onChange={e => setForm({...form, [f.name]: e.target.value})}
                      required={f.req} />
                  </div>
                ))}

                {/* Vessel Type */}
                <div>
                  <label style={labelStyle}>Vessel Type</label>
                  <select className="inp" style={{ ...inputStyle, cursor:'pointer' }}
                    value={form.type} onChange={e => setForm({...form, type: e.target.value})} required>
                    <option value="">-- Select Vessel Type --</option>
                    <option value="trawler">🚢 Trawler</option>
                    <option value="canoe">🛶 Canoe</option>
                    <option value="motorboat">⛵ Motorboat</option>
                    <option value="sailboat">🌊 Sailboat</option>
                    <option value="catamaran">⚓ Catamaran</option>
                    <option value="dinghy">🚤 Dinghy</option>
                    <option value="barge">🛳️ Barge</option>
                    <option value="other">🔧 Other</option>
                  </select>
                </div>

              </div>

              <button type="submit" disabled={loading} style={{
                marginTop:'20px', padding:'12px 28px',
                background:'linear-gradient(135deg, #0891b2, #06b6d4)',
                border:'none', borderRadius:'10px', color:'white',
                fontFamily:"'Nunito', sans-serif", fontWeight:'700', fontSize:'14px',
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              }}>
                {loading ? '🌊 Submitting...' : '🚢 Register Vessel'}
              </button>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="fade-up" style={{ background:'rgba(5,25,55,0.8)', border:'1px solid rgba(6,182,212,0.15)', borderRadius:'16px', overflow:'hidden' }}>
          <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(6,182,212,0.1)' }}>
            <h2 style={{ fontFamily:"'Nunito', sans-serif", fontSize:'16px', fontWeight:'800', color:'#22d3ee' }}>
              {user?.role === 'fisherman' ? 'My Vessels' : 'All Vessels'} ({vessels.length})
            </h2>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(6,182,212,0.08)' }}>
                  {['Vessel Name','Vessel ID','Type','Capacity','Engine','Year','Status',
                    ...(user?.role !== 'fisherman' ? ['Actions'] : [])
                  ].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito', sans-serif", fontSize:'12px', fontWeight:'700', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vessels.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding:'40px', textAlign:'center', color:'rgba(148,210,230,0.4)', fontFamily:"'Nunito', sans-serif" }}>No vessels registered yet</td></tr>
                ) : vessels.map(v => (
                  <tr key={v._id} className="tbl-row" style={{ borderBottom:'1px solid rgba(6,182,212,0.06)', transition:'background 0.2s' }}>
                    <td style={{ padding:'12px 16px', color:'#e0f7ff', fontFamily:"'Nunito', sans-serif", fontWeight:'600' }}>{v.vesselName}</td>
                    <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito', sans-serif", fontSize:'13px' }}>{v.vesselId}</td>
                    <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito', sans-serif", fontSize:'13px', textTransform:'capitalize' }}>{v.type}</td>
                    <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito', sans-serif", fontSize:'13px' }}>{v.capacity} tons</td>
                    <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito', sans-serif", fontSize:'13px' }}>{v.enginePower || '—'}</td>
                    <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito', sans-serif", fontSize:'13px' }}>{v.manufactureYear || '—'}</td>
                    <td style={{ padding:'12px 16px' }}><Badge status={v.status} /></td>
                    {user?.role !== 'fisherman' && (
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', gap:'6px' }}>
                          {v.status !== 'approved' && (
                            <button className="action-btn" onClick={() => handleStatus(v._id, 'approved')}
                              style={{ background:'rgba(16,185,129,0.2)', color:'#6ee7b7', border:'1px solid rgba(16,185,129,0.3)' }}>✓ Approve</button>
                          )}
                          {v.status !== 'rejected' && (
                            <button className="action-btn" onClick={() => handleStatus(v._id, 'rejected')}
                              style={{ background:'rgba(239,68,68,0.2)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.3)' }}>✕ Reject</button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}