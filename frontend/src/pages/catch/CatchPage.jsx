import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const STATUS_COLORS = {
  pending:  { bg:'rgba(245,158,11,0.15)', border:'rgba(245,158,11,0.4)', text:'#fcd34d' },
  verified: { bg:'rgba(16,185,129,0.15)', border:'rgba(16,185,129,0.4)', text:'#6ee7b7' },
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

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';

export default function CatchPage() {
  const { user } = useAuth();
  const [catches, setCatches]   = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [vessels, setVessels]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState('');
  const [rejectModal, setRejectModal] = useState({ open:false, id:null, reason:'' });
  const [form, setForm] = useState({
    license:'', vessel:'', species:'', quantity:'',
    unit:'kg', catchDate:'', location:'', zone:'', method:'', notes:'',
  });

  const token = JSON.parse(localStorage.getItem('frms_user') || '{}')?.token;
  const headers = { Authorization: `Bearer ${token}` };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const catchUrl = user?.role === 'fisherman' ? '/api/catches/me' : '/api/catches';
    axios.get(catchUrl, { headers }).then(r => setCatches(r.data)).catch(() => {});

    if (user?.role === 'fisherman') {
      axios.get('/api/licenses/me', { headers })
        .then(r => setLicenses(r.data.filter(l => l.status === 'approved'))).catch(() => {});
      axios.get('/api/vessels/me', { headers })
        .then(r => setVessels(r.data.filter(v => v.status === 'approved'))).catch(() => {});
    }
  }, []);

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.license)  return setMessage('❌ Please select a license');
    if (!form.species)  return setMessage('❌ Please enter species name');
    if (!form.method)   return setMessage('❌ Please select fishing method');
    if (!form.zone)     return setMessage('❌ Please select a zone');
    setLoading(true);
    try {
      // ✅ FIX: Remove empty vessel string before sending
      const submitData = { ...form, vessel: form.vessel || undefined };

      const { data } = await axios.post('/api/catches', submitData, { headers });
      setCatches([data, ...catches]);
      setMessage(data.warningFlag
        ? '⚠️ Report submitted but flagged: ' + data.warningNote
        : '✅ Catch report submitted successfully!');
      setShowForm(false);
      setForm({ license:'', vessel:'', species:'', quantity:'', unit:'kg', catchDate:'', location:'', zone:'', method:'', notes:'' });
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Error submitting'));
    }
    setLoading(false);
  };

  const handleVerify = async (id) => {
    try {
      const { data } = await axios.put(`/api/catches/${id}`, { status:'verified' }, { headers });
      setCatches(catches.map(c => c._id === id ? data : c));
      setMessage('✅ Catch report verified!');
    } catch { setMessage('❌ Error verifying'); }
  };

  const handleReject = async () => {
    try {
      const { data } = await axios.put(`/api/catches/${rejectModal.id}`,
        { status:'rejected', rejectionReason: rejectModal.reason }, { headers });
      setCatches(catches.map(c => c._id === rejectModal.id ? data : c));
      setRejectModal({ open:false, id:null, reason:'' });
      setMessage('✅ Catch report rejected.');
    } catch { setMessage('❌ Error rejecting'); }
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

  const pendingCount  = catches.filter(c => c.status === 'pending').length;
  const verifiedCount = catches.filter(c => c.status === 'verified').length;
  const warningCount  = catches.filter(c => c.warningFlag).length;
  const totalQty      = catches.filter(c => c.status === 'verified')
    .reduce((sum, c) => sum + (c.quantity || 0), 0);

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
        .modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:1000; }
      `}</style>

      <div style={{ padding:'32px' }}>

        {/* Header */}
        <div className="fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <h1 style={{ fontFamily:"'Cinzel', serif", fontSize:'22px', fontWeight:'700', background:'linear-gradient(135deg, #22d3ee, #06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              🐠 Catch Reporting
            </h1>
            <p style={{ color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito', sans-serif", fontSize:'13px', marginTop:'4px' }}>
              {user?.role === 'fisherman' ? 'Submit and track your catch reports' : 'Review and verify catch submissions'}
            </p>
          </div>
          {user?.role === 'fisherman' && (
            <button onClick={() => setShowForm(!showForm)} style={{
              padding:'10px 20px', background:'linear-gradient(135deg, #0891b2, #06b6d4)',
              border:'none', borderRadius:'10px', color:'white',
              fontFamily:"'Nunito', sans-serif", fontWeight:'700', fontSize:'14px', cursor:'pointer',
            }}>
              {showForm ? '✕ Cancel' : '+ Submit Catch'}
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap:'14px', marginBottom:'24px' }}>
          {[
            { label:'Total Reports',    value: catches.length, color:'#06b6d4', icon:'🐠' },
            { label:'Pending Review',   value: pendingCount,   color:'#f59e0b', icon:'⏳' },
            { label:'Verified',         value: verifiedCount,  color:'#10b981', icon:'✅' },
            { label:'⚠️ Flagged',       value: warningCount,   color:'#ef4444', icon:'🚨' },
            { label:'Total Catch (kg)', value: totalQty,       color:'#8b5cf6', icon:'⚖️' },
          ].map((s,i) => (
            <div key={i} style={{ background:'rgba(5,25,55,0.7)', border:`1px solid ${s.color}33`, borderRadius:'12px', padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:'22px', marginBottom:'6px' }}>{s.icon}</div>
              <div style={{ fontSize:'22px', fontWeight:'800', color:s.color, fontFamily:"'Nunito', sans-serif" }}>{s.value}</div>
              <div style={{ fontSize:'12px', color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito', sans-serif" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {message && (
          <div style={{
            padding:'12px 16px', borderRadius:'10px', marginBottom:'20px',
            background: message.includes('✅') ? 'rgba(16,185,129,0.15)' : message.includes('⚠️') ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${message.includes('✅') ? 'rgba(16,185,129,0.3)' : message.includes('⚠️') ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: message.includes('✅') ? '#6ee7b7' : message.includes('⚠️') ? '#fcd34d' : '#fca5a5',
            fontFamily:"'Nunito', sans-serif", fontSize:'14px',
          }}>{message}</div>
        )}

        {/* Submit Form */}
        {showForm && (
          <div className="fade-up" style={{ background:'rgba(5,25,55,0.8)', border:'1px solid rgba(6,182,212,0.2)', borderRadius:'16px', padding:'28px', marginBottom:'24px' }}>
            <h2 style={{ fontFamily:"'Nunito', sans-serif", fontSize:'16px', fontWeight:'800', color:'#22d3ee', marginBottom:'20px' }}>
              📝 Submit Catch Report
            </h2>

            {licenses.length === 0 ? (
              <div style={{ padding:'20px', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:'10px', color:'#fcd34d', fontFamily:"'Nunito', sans-serif", fontSize:'14px' }}>
                ⚠️ You need an <strong>approved license</strong> before submitting a catch report.
                <a href="/licenses" style={{ color:'#06b6d4', marginLeft:'8px' }}>Request a license →</a>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px,1fr))', gap:'16px' }}>

                  {/* License */}
                  <div>
                    <label style={labelStyle}>Select License</label>
                    <select className="inp" style={{ ...inputStyle, cursor:'pointer' }}
                      value={form.license} onChange={e => setForm({...form, license:e.target.value})} required>
                      <option value="">-- Select License --</option>
                      {licenses.map(l => (
                        <option key={l._id} value={l._id}>
                          {l.licenseNo} — {l.zone}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Vessel */}
                  <div>
                    <label style={labelStyle}>Select Vessel (optional)</label>
                    <select className="inp" style={{ ...inputStyle, cursor:'pointer' }}
                      value={form.vessel} onChange={e => setForm({...form, vessel:e.target.value})}>
                      <option value="">-- Select Vessel --</option>
                      {vessels.map(v => (
                        <option key={v._id} value={v._id}>{v.vesselName} ({v.vesselId})</option>
                      ))}
                    </select>
                  </div>

                  {/* Species */}
                  <div>
                    <label style={labelStyle}>Fish Species</label>
                    <select className="inp" style={{ ...inputStyle, cursor:'pointer' }}
                      value={form.species} onChange={e => setForm({...form, species:e.target.value})} required>
                      <option value="">-- Select Species --</option>
                      <option value="Rohu">🐟 Rohu</option>
                      <option value="Catla">🐟 Catla</option>
                      <option value="Tilapia">🐠 Tilapia</option>
                      <option value="Pomfret">🐡 Pomfret</option>
                      <option value="Sardine">🐟 Sardine</option>
                      <option value="Mackerel">🐠 Mackerel</option>
                      <option value="Tuna">🐋 Tuna</option>
                      <option value="Prawn">🦐 Prawn</option>
                      <option value="Crab">🦀 Crab</option>
                      <option value="Lobster">🦞 Lobster</option>
                      <option value="Squid">🦑 Squid</option>
                      <option value="Salmon">🐟 Salmon</option>
                      <option value="Hilsa">🐟 Hilsa</option>
                      <option value="Other">🐠 Other</option>
                    </select>
                  </div>

                  {/* Fishing Method */}
                  <div>
                    <label style={labelStyle}>Fishing Method</label>
                    <select className="inp" style={{ ...inputStyle, cursor:'pointer' }}
                      value={form.method} onChange={e => setForm({...form, method:e.target.value})} required>
                      <option value="">-- Select Method --</option>
                      <option value="net">🕸️ Net Fishing</option>
                      <option value="hook">🪝 Hook & Line</option>
                      <option value="trap">🪤 Trap</option>
                      <option value="trawl">🚢 Trawling</option>
                      <option value="other">🔧 Other</option>
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label style={labelStyle}>Quantity</label>
                    <input className="inp" style={inputStyle} type="number" min="1"
                      placeholder="Enter quantity" value={form.quantity}
                      onChange={e => setForm({...form, quantity:e.target.value})} required />
                  </div>

                  {/* Unit */}
                  <div>
                    <label style={labelStyle}>Unit</label>
                    <select className="inp" style={{ ...inputStyle, cursor:'pointer' }}
                      value={form.unit} onChange={e => setForm({...form, unit:e.target.value})}>
                      <option value="kg">⚖️ Kilograms (kg)</option>
                      <option value="tons">🏋️ Tons</option>
                      <option value="count">🔢 Count (pieces)</option>
                    </select>
                  </div>

                  {/* Catch Date */}
                  <div>
                    <label style={labelStyle}>Catch Date</label>
                    <input className="inp" style={{ ...inputStyle, colorScheme:'dark' }} type="date"
                      value={form.catchDate} onChange={e => setForm({...form, catchDate:e.target.value})} required />
                  </div>

                  {/* Zone */}
                  <div>
                    <label style={labelStyle}>Fishing Zone</label>
                    <select className="inp" style={{ ...inputStyle, cursor:'pointer' }}
                      value={form.zone} onChange={e => setForm({...form, zone:e.target.value})} required>
                      <option value="">-- Select Zone --</option>
                      <option value="Zone A - Coastal">🌊 Zone A - Coastal Waters</option>
                      <option value="Zone B - Deep Sea">🐋 Zone B - Deep Sea</option>
                      <option value="Zone C - Inland">🏞️ Zone C - Inland Waters</option>
                      <option value="Zone D - Estuarine">🦀 Zone D - Estuarine</option>
                      <option value="Zone E - Reef">🐠 Zone E - Reef Zone</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label style={labelStyle}>Location / Area Name</label>
                    <input className="inp" style={inputStyle} type="text"
                      placeholder="e.g. Chennai Coast, Gulf of Mannar"
                      value={form.location} onChange={e => setForm({...form, location:e.target.value})} required />
                  </div>

                  {/* Notes */}
                  <div style={{ gridColumn:'1 / -1' }}>
                    <label style={labelStyle}>Additional Notes (optional)</label>
                    <textarea className="inp" style={{ ...inputStyle, height:'70px', resize:'vertical' }}
                      placeholder="Any additional information about this catch..."
                      value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} />
                  </div>

                </div>
                <button type="submit" disabled={loading} style={{
                  marginTop:'20px', padding:'12px 28px',
                  background:'linear-gradient(135deg, #0891b2, #06b6d4)',
                  border:'none', borderRadius:'10px', color:'white',
                  fontFamily:"'Nunito', sans-serif", fontWeight:'700', fontSize:'14px',
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                }}>
                  {loading ? '🌊 Submitting...' : '🐠 Submit Catch Report'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Catches Table */}
        <div className="fade-up" style={{ background:'rgba(5,25,55,0.8)', border:'1px solid rgba(6,182,212,0.15)', borderRadius:'16px', overflow:'hidden' }}>
          <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(6,182,212,0.1)' }}>
            <h2 style={{ fontFamily:"'Nunito', sans-serif", fontSize:'16px', fontWeight:'800', color:'#22d3ee' }}>
              {user?.role === 'fisherman' ? 'My Catch Reports' : 'All Catch Reports'} ({catches.length})
            </h2>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(6,182,212,0.08)' }}>
                  {[
                    'Date', 'Species', 'Quantity', 'Method', 'Zone', 'Location',
                    ...(user?.role !== 'fisherman' ? ['Fisherman'] : []),
                    'Status', 'Flag',
                    ...(user?.role !== 'fisherman' ? ['Actions'] : []),
                  ].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito', sans-serif", fontSize:'12px', fontWeight:'700', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {catches.length === 0 ? (
                  <tr><td colSpan={11} style={{ padding:'40px', textAlign:'center', color:'rgba(148,210,230,0.4)', fontFamily:"'Nunito', sans-serif" }}>
                    {user?.role === 'fisherman' ? '🐠 No catch reports yet. Submit your first catch!' : 'No catch reports submitted yet'}
                  </td></tr>
                ) : catches.map(c => (
                  <tr key={c._id} className="tbl-row" style={{
                    borderBottom:'1px solid rgba(6,182,212,0.06)',
                    transition:'background 0.2s',
                    background: c.warningFlag ? 'rgba(239,68,68,0.03)' : 'transparent',
                  }}>
                    <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito', sans-serif", fontSize:'13px' }}>{formatDate(c.catchDate)}</td>
                    <td style={{ padding:'12px 16px', color:'#e0f7ff', fontFamily:"'Nunito', sans-serif", fontWeight:'600', fontSize:'14px' }}>{c.species}</td>
                    <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.8)', fontFamily:"'Nunito', sans-serif", fontSize:'13px' }}>{c.quantity} {c.unit}</td>
                    <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito', sans-serif", fontSize:'13px', textTransform:'capitalize' }}>{c.method}</td>
                    <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito', sans-serif", fontSize:'13px' }}>{c.zone}</td>
                    <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito', sans-serif", fontSize:'13px' }}>{c.location}</td>
                    {user?.role !== 'fisherman' && (
                      <td style={{ padding:'12px 16px', color:'#e0f7ff', fontFamily:"'Nunito', sans-serif", fontSize:'13px', fontWeight:'600' }}>
                        {c.fisherman?.name || '—'}
                      </td>
                    )}
                    <td style={{ padding:'12px 16px' }}><Badge status={c.status} /></td>
                    <td style={{ padding:'12px 16px' }}>
                      {c.warningFlag
                        ? <span title={c.warningNote} style={{ color:'#fcd34d', fontSize:'16px', cursor:'help' }}>⚠️</span>
                        : <span style={{ color:'rgba(148,210,230,0.3)', fontSize:'13px' }}>—</span>
                      }
                    </td>
                    {user?.role !== 'fisherman' && (
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', gap:'6px' }}>
                          {c.status === 'pending' && (
                            <>
                              <button className="action-btn" onClick={() => handleVerify(c._id)}
                                style={{ background:'rgba(16,185,129,0.2)', color:'#6ee7b7', border:'1px solid rgba(16,185,129,0.3)' }}>
                                ✓ Verify
                              </button>
                              <button className="action-btn"
                                onClick={() => setRejectModal({ open:true, id:c._id, reason:'' })}
                                style={{ background:'rgba(239,68,68,0.2)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.3)' }}>
                                ✕ Reject
                              </button>
                            </>
                          )}
                          {c.status !== 'pending' && (
                            <span style={{ color:'rgba(148,210,230,0.4)', fontSize:'12px', fontFamily:"'Nunito', sans-serif", textTransform:'capitalize' }}>
                              {c.status} ✓
                            </span>
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

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="modal-overlay" onClick={() => setRejectModal({ open:false, id:null, reason:'' })}>
          <div onClick={e => e.stopPropagation()} style={{
            background:'#071830', border:'1px solid rgba(239,68,68,0.3)',
            borderRadius:'16px', padding:'28px', width:'100%', maxWidth:'420px',
            boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <h3 style={{ fontFamily:"'Nunito', sans-serif", fontSize:'16px', fontWeight:'800', color:'#fca5a5', marginBottom:'16px' }}>
              ✕ Reject Catch Report
            </h3>
            <p style={{ color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito', sans-serif", fontSize:'13px', marginBottom:'14px' }}>
              Please provide a reason for rejection:
            </p>
            <textarea style={{
              width:'100%', height:'100px', resize:'vertical',
              background:'rgba(255,255,255,0.06)',
              border:'1.5px solid rgba(239,68,68,0.3)',
              borderRadius:'10px', color:'#e0f7ff',
              fontSize:'14px', fontFamily:"'Nunito', sans-serif",
              outline:'none', padding:'11px 14px',
            }}
              placeholder="Enter rejection reason..."
              value={rejectModal.reason}
              onChange={e => setRejectModal({...rejectModal, reason:e.target.value})}
            />
            <div style={{ display:'flex', gap:'10px', marginTop:'16px' }}>
              <button onClick={handleReject} style={{
                flex:1, padding:'11px',
                background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.4)',
                borderRadius:'10px', color:'#fca5a5',
                fontFamily:"'Nunito', sans-serif", fontWeight:'700', fontSize:'14px', cursor:'pointer',
              }}>✕ Confirm Reject</button>
              <button onClick={() => setRejectModal({ open:false, id:null, reason:'' })} style={{
                flex:1, padding:'11px',
                background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.2)',
                borderRadius:'10px', color:'#06b6d4',
                fontFamily:"'Nunito', sans-serif", fontWeight:'700', fontSize:'14px', cursor:'pointer',
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}