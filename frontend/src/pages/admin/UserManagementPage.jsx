import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const ROLE_COLORS = {
  admin:    { bg:'rgba(239,68,68,0.15)',  border:'rgba(239,68,68,0.3)',  text:'#fca5a5' },
  officer:  { bg:'rgba(245,158,11,0.15)', border:'rgba(245,158,11,0.3)', text:'#fcd34d' },
  fisherman:{ bg:'rgba(6,182,212,0.15)',  border:'rgba(6,182,212,0.3)',  text:'#67e8f9' },
};
const ROLE_ICONS = { admin:'🛡️', officer:'🧭', fisherman:'🎣' };

const getHeaders = () => {
  const token = JSON.parse(localStorage.getItem('frms_user') || '{}')?.token;
  return { Authorization: `Bearer ${token}` };
};

const Badge = ({ role }) => {
  const c = ROLE_COLORS[role] || ROLE_COLORS.fisherman;
  return (
    <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700', background:c.bg, border:`1px solid ${c.border}`, color:c.text, textTransform:'capitalize', fontFamily:"'Nunito',sans-serif" }}>
      {ROLE_ICONS[role]} {role}
    </span>
  );
};

export default function UserManagementPage() {
  const { user } = useAuth();
  const [users,    setUsers]    = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [message,  setMessage]  = useState('');
  const [resetModal, setResetModal] = useState({ open:false, id:null, name:'', pwd:'' });
  const [search,   setSearch]   = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'fisherman' });

  useEffect(() => {
    axios.get('/api/auth/users', { headers: getHeaders() })
      .then(r => setUsers(r.data)).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/users', form, { headers: getHeaders() });
      setUsers([data, ...users]);
      setMessage('✅ User created successfully!');
      setShowForm(false);
      setForm({ name:'', email:'', password:'', role:'fisherman' });
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Error creating user'));
    }
    setLoading(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/auth/users/${id}`, { headers: getHeaders() });
      setUsers(users.filter(u => u._id !== id));
      setMessage('✅ User deleted.');
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Error deleting'));
    }
  };

  const handleResetPassword = async () => {
    if (!resetModal.pwd) return setMessage('❌ Please enter a new password');
    try {
      await axios.put(`/api/auth/users/${resetModal.id}/password`,
        { password: resetModal.pwd }, { headers: getHeaders() });
      setMessage(`✅ Password reset for ${resetModal.name}`);
      setResetModal({ open:false, id:null, name:'', pwd:'' });
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Error resetting'));
    }
  };

  const inputStyle = {
    width:'100%', padding:'11px 14px',
    background:'rgba(255,255,255,0.06)',
    border:'1.5px solid rgba(6,182,212,0.25)',
    borderRadius:'10px', color:'#e0f7ff',
    fontSize:'14px', fontFamily:"'Nunito',sans-serif", outline:'none',
  };

  const labelStyle = {
    display:'block', marginBottom:'6px',
    color:'rgba(148,210,230,0.8)',
    fontFamily:"'Nunito',sans-serif",
    fontSize:'13px', fontWeight:'600',
  };

  const filtered = users.filter(u => {
    if (filterRole && u.role !== filterRole) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase())
               && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const adminCount    = users.filter(u => u.role === 'admin').length;
  const officerCount  = users.filter(u => u.role === 'officer').length;
  const fishermanCount= users.filter(u => u.role === 'fisherman').length;

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Nunito:wght@400;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .tbl-row:hover { background:rgba(6,182,212,0.05) !important; }
        .action-btn { padding:5px 12px; border-radius:6px; border:none; font-size:12px; font-weight:700; cursor:pointer; font-family:'Nunito',sans-serif; transition:all 0.2s; }
        .inp:focus { border-color:#06b6d4 !important; background:rgba(6,182,212,0.1) !important; }
        .inp option { background:#0d2b4e; color:#e0f7ff; }
        .modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:1000; }
        .search-input { padding:9px 14px; background:rgba(255,255,255,0.06); border:1.5px solid rgba(6,182,212,0.25); border-radius:10px; color:#e0f7ff; font-size:13px; font-family:'Nunito',sans-serif; outline:none; }
        .search-input:focus { border-color:#06b6d4; }
      `}</style>

      <div style={{ padding:'32px' }}>

        {/* Header */}
        <div className="fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:'22px', fontWeight:'700', background:'linear-gradient(135deg,#22d3ee,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              👥 User Management
            </h1>
            <p style={{ color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito',sans-serif", fontSize:'13px', marginTop:'4px' }}>
              Create and manage system access for officers and fishermen
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{
            padding:'10px 20px', background:'linear-gradient(135deg,#0891b2,#06b6d4)',
            border:'none', borderRadius:'10px', color:'white',
            fontFamily:"'Nunito',sans-serif", fontWeight:'700', fontSize:'14px', cursor:'pointer',
          }}>
            {showForm ? '✕ Cancel' : '+ Create User'}
          </button>
        </div>

        {/* Stats */}
        <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'14px', marginBottom:'24px' }}>
          {[
            { icon:'👥', label:'Total Users',  value: users.length,    color:'#06b6d4' },
            { icon:'🛡️', label:'Admins',       value: adminCount,      color:'#ef4444' },
            { icon:'🧭', label:'Officers',     value: officerCount,    color:'#f59e0b' },
            { icon:'🎣', label:'Fishermen',    value: fishermanCount,  color:'#10b981' },
          ].map((s,i) => (
            <div key={i} style={{ background:'rgba(5,25,55,0.7)', border:`1px solid ${s.color}33`, borderRadius:'12px', padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:'22px', marginBottom:'6px' }}>{s.icon}</div>
              <div style={{ fontSize:'24px', fontWeight:'800', color:s.color, fontFamily:"'Nunito',sans-serif" }}>{s.value}</div>
              <div style={{ fontSize:'12px', color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito',sans-serif" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {message && (
          <div style={{
            padding:'12px 16px', borderRadius:'10px', marginBottom:'20px',
            background: message.includes('✅') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            border:`1px solid ${message.includes('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: message.includes('✅') ? '#6ee7b7' : '#fca5a5',
            fontFamily:"'Nunito',sans-serif", fontSize:'14px',
          }}>{message}</div>
        )}

        {/* Create User Form */}
        {showForm && (
          <div className="fade-up" style={{ background:'rgba(5,25,55,0.8)', border:'1px solid rgba(6,182,212,0.2)', borderRadius:'16px', padding:'28px', marginBottom:'24px' }}>
            <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:'16px', fontWeight:'800', color:'#22d3ee', marginBottom:'20px' }}>
              ➕ Create New User
            </h2>
            <form onSubmit={handleCreate}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'16px' }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input className="inp" style={inputStyle} type="text" placeholder="Enter full name"
                    value={form.name} onChange={e => setForm({...form, name:e.target.value})} required />
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input className="inp" style={inputStyle} type="email" placeholder="Enter official email"
                    value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
                </div>
                <div>
                  <label style={labelStyle}>Password</label>
                  <input className="inp" style={inputStyle} type="password" placeholder="Set initial password"
                    value={form.password} onChange={e => setForm({...form, password:e.target.value})} required />
                </div>
                <div>
                  <label style={labelStyle}>Role</label>
                  <select className="inp" style={{ ...inputStyle, cursor:'pointer' }}
                    value={form.role} onChange={e => setForm({...form, role:e.target.value})}>
                    <option value="fisherman">🎣 Fisherman</option>
                    <option value="officer">🧭 Fishery Officer</option>
                    <option value="admin">🛡️ Administrator</option>
                  </select>
                </div>
              </div>

              {/* Info box */}
              <div style={{ marginTop:'16px', padding:'12px 14px', background:'rgba(6,182,212,0.06)', border:'1px solid rgba(6,182,212,0.15)', borderRadius:'10px', color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito',sans-serif", fontSize:'12px' }}>
                💡 Share the email and password with the user. They can login at the main portal.
              </div>

              <button type="submit" disabled={loading} style={{
                marginTop:'16px', padding:'12px 28px',
                background:'linear-gradient(135deg,#0891b2,#06b6d4)',
                border:'none', borderRadius:'10px', color:'white',
                fontFamily:"'Nunito',sans-serif", fontWeight:'700', fontSize:'14px',
                cursor: loading ? 'not-allowed':'pointer', opacity: loading ? 0.7:1,
              }}>
                {loading ? '🌊 Creating...' : '➕ Create User'}
              </button>
            </form>
          </div>
        )}

        {/* Search + Filter */}
        <div className="fade-up" style={{ display:'flex', gap:'12px', marginBottom:'16px', flexWrap:'wrap' }}>
          <input className="search-input" placeholder="🔍 Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex:1, minWidth:'200px' }} />
          <select style={{ ...inputStyle, width:'auto', padding:'9px 14px', fontSize:'13px', cursor:'pointer',background:'rgba(5,25,55,0.7)' }}
            value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            <option value="">👥 All Roles</option>
            <option value="admin">🛡️ Admin</option>
            <option value="officer">🧭 Officer</option>
            <option value="fisherman">🎣 Fisherman</option>
          </select>
          {(search || filterRole) && (
            <button onClick={() => { setSearch(''); setFilterRole(''); }} style={{
              padding:'9px 14px', background:'rgba(239,68,68,0.15)',
              border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px',
              color:'#fca5a5', fontFamily:"'Nunito',sans-serif", fontSize:'13px', fontWeight:'700', cursor:'pointer',
            }}>✕ Clear</button>
          )}
        </div>

        {/* Users Table */}
        <div className="fade-up" style={{ background:'rgba(5,25,55,0.8)', border:'1px solid rgba(6,182,212,0.15)', borderRadius:'16px', overflow:'hidden' }}>
          <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(6,182,212,0.1)' }}>
            <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:'16px', fontWeight:'800', color:'#22d3ee' }}>
              All Users ({filtered.length})
            </h2>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(6,182,212,0.08)' }}>
                  {['Name','Email','Role','Created','Actions'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito',sans-serif", fontSize:'12px', fontWeight:'700', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding:'40px', textAlign:'center', color:'rgba(148,210,230,0.4)', fontFamily:"'Nunito',sans-serif" }}>No users found</td></tr>
                ) : filtered.map(u => (
                  <tr key={u._id} className="tbl-row" style={{ borderBottom:'1px solid rgba(6,182,212,0.06)', transition:'background 0.2s' }}>
                    <td style={{ padding:'12px 16px', color:'#e0f7ff', fontFamily:"'Nunito',sans-serif", fontWeight:'600' }}>
                      {u.name}
                      {u._id === user?._id && <span style={{ marginLeft:'6px', color:'#06b6d4', fontSize:'11px' }}>● YOU</span>}
                    </td>
                    <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito',sans-serif", fontSize:'13px' }}>{u.email}</td>
                    <td style={{ padding:'12px 16px' }}><Badge role={u.role} /></td>
                    <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.5)', fontFamily:"'Nunito',sans-serif", fontSize:'12px' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button className="action-btn"
                          onClick={() => setResetModal({ open:true, id:u._id, name:u.name, pwd:'' })}
                          style={{ background:'rgba(245,158,11,0.2)', color:'#fcd34d', border:'1px solid rgba(245,158,11,0.3)' }}>
                          🔑 Reset Pwd
                        </button>
                        {u._id !== user?._id && (
                          <button className="action-btn"
                            onClick={() => handleDelete(u._id, u.name)}
                            style={{ background:'rgba(239,68,68,0.2)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.3)' }}>
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetModal.open && (
        <div className="modal-overlay" onClick={() => setResetModal({ open:false, id:null, name:'', pwd:'' })}>
          <div onClick={e => e.stopPropagation()} style={{
            background:'#071830', border:'1px solid rgba(245,158,11,0.3)',
            borderRadius:'16px', padding:'28px', width:'100%', maxWidth:'400px',
            boxShadow:'0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <h3 style={{ fontFamily:"'Nunito',sans-serif", fontSize:'16px', fontWeight:'800', color:'#fcd34d', marginBottom:'8px' }}>
              🔑 Reset Password
            </h3>
            <p style={{ color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito',sans-serif", fontSize:'13px', marginBottom:'16px' }}>
              Setting new password for <strong style={{ color:'#e0f7ff' }}>{resetModal.name}</strong>
            </p>
            <input
              style={{ ...inputStyle, border:'1.5px solid rgba(245,158,11,0.3)' }}
              type="password" placeholder="Enter new password"
              value={resetModal.pwd}
              onChange={e => setResetModal({...resetModal, pwd:e.target.value})}
              autoFocus
            />
            <div style={{ display:'flex', gap:'10px', marginTop:'16px' }}>
              <button onClick={handleResetPassword} style={{
                flex:1, padding:'11px',
                background:'rgba(245,158,11,0.2)', border:'1px solid rgba(245,158,11,0.4)',
                borderRadius:'10px', color:'#fcd34d',
                fontFamily:"'Nunito',sans-serif", fontWeight:'700', fontSize:'14px', cursor:'pointer',
              }}>🔑 Reset Password</button>
              <button onClick={() => setResetModal({ open:false, id:null, name:'', pwd:'' })} style={{
                flex:1, padding:'11px',
                background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.2)',
                borderRadius:'10px', color:'#06b6d4',
                fontFamily:"'Nunito',sans-serif", fontWeight:'700', fontSize:'14px', cursor:'pointer',
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}