import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const STATUS_COLORS = {
  pending:  { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#fcd34d' },
  approved: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', text: '#6ee7b7' },
  rejected: { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',  text: '#fca5a5' },
};

const Badge = ({ status }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      textTransform: 'capitalize', fontFamily: "'Nunito', sans-serif",
    }}>{status}</span>
  );
};

export default function FishermanPage() {
  const { user } = useAuth();
  const [fishermen, setFishermen] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [message, setMessage]     = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    idProof: '', idNumber: '', experience: '',
  });

  const token = JSON.parse(localStorage.getItem('frms_user') || '{}')?.token;
  const headers = { Authorization: `Bearer ${token}` };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user?.role === 'fisherman') {
      axios.get('/api/fishermen/me', { headers })
        .then(r => setMyProfile(r.data)).catch(() => {});
    } else {
      axios.get('/api/fishermen', { headers })
        .then(r => setFishermen(r.data)).catch(() => {});
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.idProof) return setMessage('❌ Please select an ID Proof type');
    if (!form.experience) return setMessage('❌ Please select experience level');
    setLoading(true);
    try {
      await axios.post('/api/fishermen', form, { headers });
      setMessage('✅ Registration submitted successfully!');
      setShowForm(false);
      const r = await axios.get('/api/fishermen/me', { headers });
      setMyProfile(r.data);
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Error submitting'));
    }
    setLoading(false);
  };

  const handleStatus = async (id, status) => {
    try {
      await axios.put(`/api/fishermen/${id}`, { status }, { headers });
      setFishermen(fishermen.map(f => f._id === id ? { ...f, status } : f));
    } catch { alert('Error updating status'); }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,0.06)',
    border: '1.5px solid rgba(6,182,212,0.25)',
    borderRadius: '10px', color: '#e0f7ff',
    fontSize: '14px', fontFamily: "'Nunito', sans-serif",
    outline: 'none',
  };

  const labelStyle = {
    display: 'block', marginBottom: '6px',
    color: 'rgba(148,210,230,0.8)',
    fontFamily: "'Nunito', sans-serif",
    fontSize: '13px', fontWeight: '600',
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

      <div style={{ padding: '32px' }}>

        {/* Header */}
        <div className="fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <h1 style={{ fontFamily:"'Cinzel', serif", fontSize:'22px', fontWeight:'700', background:'linear-gradient(135deg, #22d3ee, #06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              👤 Fisherman Registration
            </h1>
            <p style={{ color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito', sans-serif", fontSize:'13px', marginTop:'4px' }}>
              {user?.role === 'fisherman' ? 'Your registration profile' : 'Manage fisherman registrations'}
            </p>
          </div>
          {(user?.role === 'fisherman' && !myProfile) && (
            <button onClick={() => setShowForm(!showForm)} style={{
              padding:'10px 20px', background:'linear-gradient(135deg, #0891b2, #06b6d4)',
              border:'none', borderRadius:'10px', color:'white',
              fontFamily:"'Nunito', sans-serif", fontWeight:'700', fontSize:'14px', cursor:'pointer',
            }}>
              {showForm ? '✕ Cancel' : '+ Register Now'}
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

        {/* Registration Form */}
        {showForm && (
          <div className="fade-up" style={{ background:'rgba(5,25,55,0.8)', border:'1px solid rgba(6,182,212,0.2)', borderRadius:'16px', padding:'28px', marginBottom:'28px' }}>
            <h2 style={{ fontFamily:"'Nunito', sans-serif", fontSize:'16px', fontWeight:'800', color:'#22d3ee', marginBottom:'20px' }}>
              📝 Fisherman Registration Form
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:'16px' }}>

                {/* Text inputs */}
                {[
                  { label:'Full Name', name:'name',     type:'text',  placeholder:'Enter full name' },
                  { label:'Email',     name:'email',    type:'email', placeholder:'Enter email' },
                  { label:'Phone',     name:'phone',    type:'text',  placeholder:'Enter phone number' },
                  { label:'ID Number', name:'idNumber', type:'text',  placeholder:'Enter ID number' },
                ].map(f => (
                  <div key={f.name}>
                    <label style={labelStyle}>{f.label}</label>
                    <input className="inp" style={inputStyle} type={f.type}
                      placeholder={f.placeholder} value={form[f.name]}
                      onChange={e => setForm({...form, [f.name]: e.target.value})} required />
                  </div>
                ))}

                {/* Address - full width */}
                <div style={{ gridColumn:'1 / -1' }}>
                  <label style={labelStyle}>Address</label>
                  <textarea className="inp" style={{ ...inputStyle, height:'80px', resize:'vertical' }}
                    placeholder="Enter full address" value={form.address}
                    onChange={e => setForm({...form, address: e.target.value})} required />
                </div>

                {/* ID Proof */}
                <div>
                  <label style={labelStyle}>ID Proof Type</label>
                  <select className="inp" style={{ ...inputStyle, cursor:'pointer' }}
                    value={form.idProof} onChange={e => setForm({...form, idProof: e.target.value})} required>
                    <option value="">-- Select ID Proof --</option>
                    <option value="Aadhaar">🪪 Aadhaar Card</option>
                    <option value="PAN">💳 PAN Card</option>
                    <option value="Voter">🗳️ Voter ID</option>
                    <option value="Passport">📘 Passport</option>
                    <option value="Driving">🚗 Driving License</option>
                    <option value="Ration">🏠 Ration Card</option>
                    <option value="Fisherman ID">🐟 Fisherman ID Card</option>
                  </select>
                </div>

                {/* Experience */}
                <div>
                  <label style={labelStyle}>Experience Level</label>
                  <select className="inp" style={{ ...inputStyle, cursor:'pointer' }}
                    value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} required>
                    <option value="">-- Select Experience --</option>
                    <option value="beginner">🟢 Beginner (0-2 years)</option>
                    <option value="intermediate">🟡 Intermediate (3-7 years)</option>
                    <option value="expert">🔴 Expert (8+ years)</option>
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
                {loading ? '🌊 Submitting...' : '✅ Submit Registration'}
              </button>
            </form>
          </div>
        )}

        {/* My Profile Card */}
        {user?.role === 'fisherman' && myProfile && (
          <div className="fade-up" style={{ background:'rgba(5,25,55,0.8)', border:'1px solid rgba(6,182,212,0.2)', borderRadius:'16px', padding:'28px' }}>
            <h2 style={{ fontFamily:"'Nunito', sans-serif", fontSize:'16px', fontWeight:'800', color:'#22d3ee', marginBottom:'20px' }}>
              🪪 My Profile
            </h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'16px' }}>
              {[
                { label:'Name',       value: myProfile.name },
                { label:'Email',      value: myProfile.email },
                { label:'Phone',      value: myProfile.phone },
                { label:'ID Proof',   value: `${myProfile.idProof}: ${myProfile.idNumber}` },
                { label:'Experience', value: myProfile.experience },
                { label:'Status',     value: myProfile.status, isStatus: true },
              ].map((item, i) => (
                <div key={i} style={{ background:'rgba(6,182,212,0.06)', borderRadius:'10px', padding:'14px' }}>
                  <div style={{ color:'rgba(148,210,230,0.5)', fontFamily:"'Nunito', sans-serif", fontSize:'11px', fontWeight:'600', textTransform:'uppercase', marginBottom:'6px' }}>{item.label}</div>
                  {item.isStatus
                    ? <Badge status={item.value} />
                    : <div style={{ color:'#e0f7ff', fontFamily:"'Nunito', sans-serif", fontSize:'14px', fontWeight:'600', textTransform:'capitalize' }}>{item.value}</div>
                  }
                </div>
              ))}
            </div>
            {myProfile.status === 'rejected' && myProfile.rejectionReason && (
              <div style={{ marginTop:'16px', padding:'12px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px', color:'#fca5a5', fontFamily:"'Nunito', sans-serif", fontSize:'13px' }}>
                ⚠️ Rejection Reason: {myProfile.rejectionReason}
              </div>
            )}
          </div>
        )}

        {/* No profile yet - fisherman */}
        {user?.role === 'fisherman' && !myProfile && !showForm && (
          <div className="fade-up" style={{ textAlign:'center', padding:'60px 20px', background:'rgba(5,25,55,0.6)', border:'1px dashed rgba(6,182,212,0.2)', borderRadius:'16px' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>🎣</div>
            <p style={{ color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito', sans-serif", fontSize:'15px', marginBottom:'20px' }}>
              You haven't registered your fisherman profile yet.
            </p>
            <button onClick={() => setShowForm(true)} style={{
              padding:'12px 28px', background:'linear-gradient(135deg, #0891b2, #06b6d4)',
              border:'none', borderRadius:'10px', color:'white',
              fontFamily:"'Nunito', sans-serif", fontWeight:'700', fontSize:'14px', cursor:'pointer',
            }}>+ Register Now</button>
          </div>
        )}

        {/* Table - admin/officer */}
        {(user?.role === 'admin' || user?.role === 'officer') && (
          <div className="fade-up" style={{ background:'rgba(5,25,55,0.8)', border:'1px solid rgba(6,182,212,0.15)', borderRadius:'16px', overflow:'hidden' }}>
            <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(6,182,212,0.1)' }}>
              <h2 style={{ fontFamily:"'Nunito', sans-serif", fontSize:'16px', fontWeight:'800', color:'#22d3ee' }}>
                All Registrations ({fishermen.length})
              </h2>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'rgba(6,182,212,0.08)' }}>
                    {['Name','Email','Phone','ID Proof','Experience','Status','Actions'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito', sans-serif", fontSize:'12px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fishermen.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding:'40px', textAlign:'center', color:'rgba(148,210,230,0.4)', fontFamily:"'Nunito', sans-serif" }}>No registrations yet</td></tr>
                  ) : fishermen.map(f => (
                    <tr key={f._id} className="tbl-row" style={{ borderBottom:'1px solid rgba(6,182,212,0.06)', transition:'background 0.2s' }}>
                      <td style={{ padding:'12px 16px', color:'#e0f7ff', fontFamily:"'Nunito', sans-serif", fontWeight:'600' }}>{f.name}</td>
                      <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito', sans-serif", fontSize:'13px' }}>{f.email}</td>
                      <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito', sans-serif", fontSize:'13px' }}>{f.phone}</td>
                      <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito', sans-serif", fontSize:'13px' }}>{f.idProof}: {f.idNumber}</td>
                      <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito', sans-serif", fontSize:'13px', textTransform:'capitalize' }}>{f.experience}</td>
                      <td style={{ padding:'12px 16px' }}><Badge status={f.status} /></td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', gap:'6px' }}>
                          {f.status !== 'approved' && (
                            <button className="action-btn" onClick={() => handleStatus(f._id, 'approved')}
                              style={{ background:'rgba(16,185,129,0.2)', color:'#6ee7b7', border:'1px solid rgba(16,185,129,0.3)' }}>✓ Approve</button>
                          )}
                          {f.status !== 'rejected' && (
                            <button className="action-btn" onClick={() => handleStatus(f._id, 'rejected')}
                              style={{ background:'rgba(239,68,68,0.2)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.3)' }}>✕ Reject</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}