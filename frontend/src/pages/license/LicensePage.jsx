import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const getHeaders = () => {
  const token = JSON.parse(localStorage.getItem('frms_user') || '{}')?.token;
  return { Authorization: `Bearer ${token}` };
};

const STATUS_COLORS = {
  approved: { bg:'rgba(16,185,129,0.15)',  border:'rgba(16,185,129,0.4)',  text:'#6ee7b7' },
  pending:  { bg:'rgba(245,158,11,0.15)',  border:'rgba(245,158,11,0.4)',  text:'#fcd34d' },
  rejected: { bg:'rgba(239,68,68,0.15)',   border:'rgba(239,68,68,0.4)',   text:'#fca5a5' },
  expired:  { bg:'rgba(148,163,184,0.15)', border:'rgba(148,163,184,0.4)', text:'#cbd5e1' },
};
const STATUS_ICONS = { approved:'✅', pending:'⏳', rejected:'❌', expired:'📅' };

const ZONES        = ['Zone A','Zone B','Zone C','Zone D','Zone E','Zone F'];
const LICENSE_TYPES= ['Coastal Fishing','Deep Sea Fishing','Inland Fishing','Trawling','Aquaculture','Sport Fishing'];

const Badge = ({ status }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700', background:c.bg, border:`1px solid ${c.border}`, color:c.text, textTransform:'capitalize', fontFamily:"'Nunito',sans-serif" }}>
      {STATUS_ICONS[status]} {status}
    </span>
  );
};

// ── Fisherman default license card ──
const DefaultLicenseCard = ({ license }) => {
  const isExpired = new Date(license.validTo) < new Date();
  return (
    <div style={{
      background:'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(6,182,212,0.1))',
      border:'2px solid rgba(16,185,129,0.4)',
      borderRadius:'16px', padding:'24px', marginBottom:'24px',
      position:'relative', overflow:'hidden',
    }}>
      {/* Glow */}
      <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'120px', height:'120px', background:'rgba(16,185,129,0.1)', borderRadius:'50%', filter:'blur(30px)' }} />

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px', marginBottom:'16px' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
            <span style={{ fontSize:'20px' }}>🏅</span>
            <h3 style={{ fontFamily:"'Cinzel',serif", fontSize:'14px', fontWeight:'700', color:'#6ee7b7' }}>
              Default License
            </h3>
            {license.isDefault && (
              <span style={{ padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:'700', background:'rgba(16,185,129,0.2)', border:'1px solid rgba(16,185,129,0.4)', color:'#6ee7b7', fontFamily:"'Nunito',sans-serif" }}>
                ISSUED BY ADMIN
              </span>
            )}
          </div>
          <p style={{ color:'rgba(148,210,230,0.5)', fontFamily:"'Nunito',sans-serif", fontSize:'12px' }}>
            Your verified fishing license
          </p>
        </div>
        <Badge status={isExpired ? 'expired' : license.status} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'12px' }}>
        {[
          { icon:'🪪', label:'License No',   value: license.licenseNo   },
          { icon:'📋', label:'Type',         value: license.licenseType },
          { icon:'🌊', label:'Zone',         value: license.zone        },
          { icon:'📅', label:'Valid From',   value: new Date(license.validFrom).toLocaleDateString('en-IN') },
          { icon:'📅', label:'Valid Until',  value: new Date(license.validTo).toLocaleDateString('en-IN')   },
        ].map((item, i) => (
          <div key={i} style={{ background:'rgba(0,0,0,0.2)', borderRadius:'10px', padding:'12px' }}>
            <div style={{ color:'rgba(148,210,230,0.5)', fontFamily:"'Nunito',sans-serif", fontSize:'11px', marginBottom:'4px' }}>
              {item.icon} {item.label}
            </div>
            <div style={{ color:'#e0f7ff', fontFamily:"'Nunito',sans-serif", fontSize:'13px', fontWeight:'700' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {isExpired && (
        <div style={{ marginTop:'14px', padding:'10px 14px', background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', color:'#fca5a5', fontFamily:"'Nunito',sans-serif", fontSize:'13px' }}>
          ⚠️ This license has expired. Apply for a new license below.
        </div>
      )}
    </div>
  );
};

export default function LicensePage() {
  const { user } = useAuth();
  const [licenses,     setLicenses]     = useState([]);
  const [fishermen,    setFishermen]    = useState([]);
  const [users,        setUsers]        = useState([]);
  const [showForm,     setShowForm]     = useState(false);
  const [rejectModal,  setRejectModal]  = useState({ open:false, id:null, reason:'' });
  const [message,      setMessage]      = useState('');
  const [loading,      setLoading]      = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const initForm = {
    fisherman:'', licenseType:'', zone:'',
    validFrom:'', validTo:'', isDefault: false,
  };
  const [form, setForm] = useState(initForm);

  useEffect(() => {
    fetchLicenses();
    if (user?.role === 'admin' || user?.role === 'officer') {
      // Fetch users with fisherman role for dropdown
      axios.get('/api/auth/users', { headers: getHeaders() })
        .then(r => setUsers(r.data.filter(u => u.role === 'fisherman')))
        .catch(() => {});
    }
  }, []);

  const fetchLicenses = () => {
    axios.get('/api/licenses', { headers: getHeaders() })
      .then(r => setLicenses(r.data)).catch(() => {});
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await axios.post('/api/licenses', form, { headers: getHeaders() });
      setLicenses([data, ...licenses]);
      setMessage('✅ License created successfully!');
      setShowForm(false); setForm(initForm);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Error creating license'));
    }
    setLoading(false);
  };

  const updateStatus = async (id, status, rejectionReason = '') => {
    try {
      const { data } = await axios.put(`/api/licenses/${id}`,
        { status, rejectionReason }, { headers: getHeaders() });
      setLicenses(licenses.map(l => l._id === id ? data : l));
      setMessage(`✅ License ${status}`);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Error updating'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this license?')) return;
    try {
      await axios.delete(`/api/licenses/${id}`, { headers: getHeaders() });
      setLicenses(licenses.filter(l => l._id !== id));
      setMessage('✅ License deleted.');
    } catch { setMessage('❌ Error deleting'); }
  };

  const inputStyle = {
    width:'100%', padding:'10px 14px',
    background:'rgba(255,255,255,0.06)',
    border:'1.5px solid rgba(6,182,212,0.25)',
    borderRadius:'10px', color:'#e0f7ff',
    fontSize:'14px', fontFamily:"'Nunito',sans-serif", outline:'none',
  };
  const labelStyle = {
    display:'block', marginBottom:'6px',
    color:'rgba(148,210,230,0.8)',
    fontFamily:"'Nunito',sans-serif", fontSize:'13px', fontWeight:'600',
  };

  // Separate default license from others for fisherman
  const defaultLicense = licenses.find(l => l.isDefault);
  const otherLicenses  = licenses.filter(l => !l.isDefault);
  const filtered = (user?.role === 'fisherman' ? otherLicenses : licenses)
    .filter(l => !filterStatus || l.status === filterStatus);

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Nunito:wght@400;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp 0.4s ease forwards; }
        .tbl-row:hover { background:rgba(6,182,212,0.05) !important; }
        .inp:focus { border-color:#06b6d4 !important; background:rgba(6,182,212,0.08) !important; }
        .inp option { background:#0d2b4e; color:#e0f7ff; }
        .action-btn { padding:5px 12px; border-radius:6px; border:none; font-size:12px; font-weight:700; cursor:pointer; font-family:'Nunito',sans-serif; transition:all 0.2s; }
        .modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:1000; }
      `}</style>

      <div style={{ padding:'32px' }}>

        {/* Header */}
        <div className="fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:'22px', fontWeight:'700', background:'linear-gradient(135deg,#22d3ee,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              📋 {user?.role === 'fisherman' ? 'My Licenses' : 'License Management'}
            </h1>
            <p style={{ color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito',sans-serif", fontSize:'13px', marginTop:'4px' }}>
              {user?.role === 'fisherman' ? 'Your fishing licenses and applications' : 'Manage and verify fishing licenses'}
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{
            padding:'10px 20px', background:'linear-gradient(135deg,#0891b2,#06b6d4)',
            border:'none', borderRadius:'10px', color:'white',
            fontFamily:"'Nunito',sans-serif", fontWeight:'700', fontSize:'14px', cursor:'pointer',
          }}>
            {showForm ? '✕ Cancel' : user?.role === 'fisherman' ? '+ Apply for License' : '+ Issue License'}
          </button>
        </div>

        {message && (
          <div style={{ padding:'12px 16px', borderRadius:'10px', marginBottom:'20px',
            background: message.includes('✅') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            border:`1px solid ${message.includes('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: message.includes('✅') ? '#6ee7b7' : '#fca5a5',
            fontFamily:"'Nunito',sans-serif", fontSize:'14px',
          }}>{message}</div>
        )}

        {/* Default License Card — fisherman only */}
        {user?.role === 'fisherman' && defaultLicense && (
          <div className="fade-up">
            <DefaultLicenseCard license={defaultLicense} />
          </div>
        )}

        {/* No default license notice for fisherman */}
        {user?.role === 'fisherman' && !defaultLicense && (
          <div className="fade-up" style={{ padding:'16px 20px', borderRadius:'12px', marginBottom:'24px', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', color:'#fcd34d', fontFamily:"'Nunito',sans-serif", fontSize:'13px' }}>
            ℹ️ No default license assigned yet. Contact your admin or apply for a new license below.
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="fade-up" style={{ background:'rgba(5,25,55,0.8)', border:'1px solid rgba(6,182,212,0.2)', borderRadius:'16px', padding:'28px', marginBottom:'24px' }}>
            <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:'16px', fontWeight:'800', color:'#22d3ee', marginBottom:'20px' }}>
              {user?.role === 'fisherman' ? '📝 Apply for New License' : '➕ Issue New License'}
            </h2>
            <form onSubmit={handleCreate}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'16px' }}>

                {/* Admin/Officer — pick fisherman */}
                {(user?.role === 'admin' || user?.role === 'officer') && (
                  <div>
                    <label style={labelStyle}>Fisherman</label>
                    <select className="inp" style={{ ...inputStyle, cursor:'pointer' }}
                      value={form.fisherman} onChange={e => setForm({...form, fisherman:e.target.value})} required>
                      <option value="">Select fisherman...</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id}>{u.name} — {u.email}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label style={labelStyle}>License Type</label>
                  <select className="inp" style={{ ...inputStyle, cursor:'pointer' }}
                    value={form.licenseType} onChange={e => setForm({...form, licenseType:e.target.value})} required>
                    <option value="">Select type...</option>
                    {LICENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Zone</label>
                  <select className="inp" style={{ ...inputStyle, cursor:'pointer' }}
                    value={form.zone} onChange={e => setForm({...form, zone:e.target.value})} required>
                    <option value="">Select zone...</option>
                    {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Valid From</label>
                  <input className="inp" style={inputStyle} type="date"
                    value={form.validFrom} onChange={e => setForm({...form, validFrom:e.target.value})} required />
                </div>

                <div>
                  <label style={labelStyle}>Valid To</label>
                  <input className="inp" style={inputStyle} type="date"
                    value={form.validTo} onChange={e => setForm({...form, validTo:e.target.value})} required />
                </div>

                {/* Admin only — mark as default */}
                {user?.role === 'admin' && (
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', paddingTop:'28px' }}>
                    <input type="checkbox" id="isDefault" checked={form.isDefault}
                      onChange={e => setForm({...form, isDefault:e.target.checked})}
                      style={{ width:'18px', height:'18px', cursor:'pointer', accentColor:'#06b6d4' }} />
                    <label htmlFor="isDefault" style={{ ...labelStyle, marginBottom:0, cursor:'pointer' }}>
                      🏅 Mark as Default License (auto-approved)
                    </label>
                  </div>
                )}
              </div>

              {form.isDefault && (
                <div style={{ marginTop:'14px', padding:'12px 14px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'10px', color:'#6ee7b7', fontFamily:"'Nunito',sans-serif", fontSize:'13px' }}>
                  ✅ This license will be <strong>automatically approved</strong> and shown as the fisherman's default verified license.
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                marginTop:'16px', padding:'11px 28px',
                background:'linear-gradient(135deg,#0891b2,#06b6d4)',
                border:'none', borderRadius:'10px', color:'white',
                fontFamily:"'Nunito',sans-serif", fontWeight:'700', fontSize:'14px', cursor:'pointer',
              }}>
                {loading ? '🌊 Saving...' : user?.role === 'fisherman' ? '📝 Submit Application' : '✅ Issue License'}
              </button>
            </form>
          </div>
        )}

        {/* Filter */}
        {(user?.role === 'admin' || user?.role === 'officer') && (
          <div className="fade-up" style={{ display:'flex', gap:'10px', marginBottom:'16px', flexWrap:'wrap' }}>
            {['','pending','approved','rejected','expired'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding:'7px 16px', borderRadius:'20px', border:'1px solid',
                cursor:'pointer', fontFamily:"'Nunito',sans-serif", fontSize:'12px', fontWeight:'700', transition:'all 0.2s',
                background: filterStatus === s ? 'rgba(6,182,212,0.2)' : 'transparent',
                borderColor: filterStatus === s ? 'rgba(6,182,212,0.6)' : 'rgba(6,182,212,0.2)',
                color: filterStatus === s ? '#22d3ee' : 'rgba(148,210,230,0.6)',
              }}>
                {s === '' ? '👁️ All' : `${STATUS_ICONS[s]} ${s.charAt(0).toUpperCase()+s.slice(1)}`}
              </button>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="fade-up" style={{ background:'rgba(5,25,55,0.8)', border:'1px solid rgba(6,182,212,0.15)', borderRadius:'16px', overflow:'hidden' }}>
          <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(6,182,212,0.1)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:'16px', fontWeight:'800', color:'#22d3ee' }}>
              {user?.role === 'fisherman' ? '📋 My License Applications' : `📋 All Licenses (${filtered.length})`}
            </h2>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(6,182,212,0.08)' }}>
                  {[
                    'License No', 'Type', 'Zone',
                    ...(user?.role !== 'fisherman' ? ['Fisherman'] : []),
                    'Valid From', 'Valid To', 'Status',
                    ...(user?.role !== 'fisherman' ? ['Actions'] : []),
                  ].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito',sans-serif", fontSize:'12px', fontWeight:'700', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding:'40px', textAlign:'center', color:'rgba(148,210,230,0.4)', fontFamily:"'Nunito',sans-serif" }}>
                    {user?.role === 'fisherman' ? 'No license applications yet. Click "Apply for License" to get started.' : 'No licenses found'}
                  </td></tr>
                ) : filtered.map(l => (
                  <tr key={l._id} className="tbl-row" style={{ borderBottom:'1px solid rgba(6,182,212,0.06)', transition:'background 0.2s' }}>
                    <td style={{ padding:'12px 16px', color:'#06b6d4', fontFamily:"'Nunito',sans-serif", fontSize:'13px', fontWeight:'700', whiteSpace:'nowrap' }}>{l.licenseNo}</td>
                    <td style={{ padding:'12px 16px', color:'#e0f7ff', fontFamily:"'Nunito',sans-serif", fontSize:'13px' }}>{l.licenseType}</td>
                    <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.8)', fontFamily:"'Nunito',sans-serif", fontSize:'13px' }}>{l.zone}</td>
                    {user?.role !== 'fisherman' && (
                      <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.8)', fontFamily:"'Nunito',sans-serif", fontSize:'13px' }}>{l.fisherman?.name || '—'}</td>
                    )}
                    <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito',sans-serif", fontSize:'12px' }}>{new Date(l.validFrom).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito',sans-serif", fontSize:'12px' }}>{new Date(l.validTo).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <Badge status={new Date(l.validTo) < new Date() ? 'expired' : l.status} />
                      {l.isDefault && <span style={{ marginLeft:'6px', fontSize:'10px', color:'#6ee7b7' }}>🏅</span>}
                    </td>
                    {user?.role !== 'fisherman' && (
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                          {l.status === 'pending' && (
                            <>
                              <button className="action-btn"
                                onClick={() => updateStatus(l._id, 'approved')}
                                style={{ background:'rgba(16,185,129,0.2)', color:'#6ee7b7', border:'1px solid rgba(16,185,129,0.3)' }}>
                                ✅ Approve
                              </button>
                              <button className="action-btn"
                                onClick={() => setRejectModal({ open:true, id:l._id, reason:'' })}
                                style={{ background:'rgba(239,68,68,0.2)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.3)' }}>
                                ❌ Reject
                              </button>
                            </>
                          )}
                          {user?.role === 'admin' && (
                            <button className="action-btn"
                              onClick={() => handleDelete(l._id)}
                              style={{ background:'rgba(148,163,184,0.15)', color:'#94a3b8', border:'1px solid rgba(148,163,184,0.2)' }}>
                              🗑️
                            </button>
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
            borderRadius:'16px', padding:'28px', width:'100%', maxWidth:'400px',
          }}>
            <h3 style={{ fontFamily:"'Nunito',sans-serif", fontSize:'16px', fontWeight:'800', color:'#fca5a5', marginBottom:'12px' }}>
              ❌ Reject License
            </h3>
            <textarea
              style={{ ...inputStyle, height:'100px', resize:'vertical' }}
              placeholder="Enter rejection reason..."
              value={rejectModal.reason}
              onChange={e => setRejectModal({...rejectModal, reason:e.target.value})}
            />
            <div style={{ display:'flex', gap:'10px', marginTop:'14px' }}>
              <button onClick={() => { updateStatus(rejectModal.id, 'rejected', rejectModal.reason); setRejectModal({ open:false, id:null, reason:'' }); }} style={{
                flex:1, padding:'11px', background:'rgba(239,68,68,0.2)',
                border:'1px solid rgba(239,68,68,0.4)', borderRadius:'10px', color:'#fca5a5',
                fontFamily:"'Nunito',sans-serif", fontWeight:'700', fontSize:'14px', cursor:'pointer',
              }}>❌ Confirm Reject</button>
              <button onClick={() => setRejectModal({ open:false, id:null, reason:'' })} style={{
                flex:1, padding:'11px', background:'rgba(6,182,212,0.1)',
                border:'1px solid rgba(6,182,212,0.2)', borderRadius:'10px', color:'#06b6d4',
                fontFamily:"'Nunito',sans-serif", fontWeight:'700', fontSize:'14px', cursor:'pointer',
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
