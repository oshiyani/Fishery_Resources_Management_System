import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const getHeaders = () => {
  const token = JSON.parse(localStorage.getItem('frms_user') || '{}')?.token;
  return { Authorization: `Bearer ${token}` };
};

export default function ChangePasswordPage({ forced = false }) {
  const { user } = useAuth();
  const [form, setForm]       = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [showPwd, setShowPwd] = useState({ current:false, new:false, confirm:false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.newPassword !== form.confirmPassword)
      return setError('New passwords do not match');
    if (form.newPassword.length < 6)
      return setError('Password must be at least 6 characters');
    if (form.currentPassword === form.newPassword)
      return setError('New password must be different from current password');
    setLoading(true);
    try {
      await axios.put('/api/auth/change-password',
        { currentPassword: form.currentPassword, newPassword: form.newPassword },
        { headers: getHeaders() }
      );
      // Update localStorage to mark first login done
      const stored = JSON.parse(localStorage.getItem('frms_user') || '{}');
      stored.isFirstLogin = false;
      localStorage.setItem('frms_user', JSON.stringify(stored));
      setSuccess('✅ Password changed successfully!');
      setTimeout(() => { window.location.href = '/dashboard'; }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  const strength = (pwd) => {
    if (!pwd) return { label:'', color:'transparent', width:'0%' };
    let score = 0;
    if (pwd.length >= 6)  score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { label:'Weak',   color:'#ef4444', width:'25%'  };
    if (score <= 2) return { label:'Fair',   color:'#f59e0b', width:'50%'  };
    if (score <= 3) return { label:'Good',   color:'#06b6d4', width:'75%'  };
    return               { label:'Strong', color:'#10b981', width:'100%' };
  };

  const pwdStrength = strength(form.newPassword);

  const inputStyle = {
    width:'100%', padding:'12px 44px 12px 14px',
    background:'rgba(255,255,255,0.07)',
    border:'1.5px solid rgba(6,182,212,0.3)',
    borderRadius:'10px', color:'#e0f7ff',
    fontSize:'14px', fontFamily:"'Nunito',sans-serif", outline:'none',
  };

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(180deg,#0a1628 0%,#0d2b4e 40%,#0a4a6e 100%)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:'20px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Nunito:wght@400;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow {
          0%,100%{box-shadow:0 0 20px rgba(6,182,212,0.3)} 
          50%{box-shadow:0 0 40px rgba(6,182,212,0.6)}
        }
        .pwd-card { animation:fadeUp 0.5s ease forwards, glow 3s ease-in-out infinite; }
        .pwd-input { transition:border-color 0.2s, background 0.2s; }
        .pwd-input:focus { border-color:#06b6d4 !important; background:rgba(6,182,212,0.1) !important; }
        .eye-btn { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:16px; padding:4px; }
        .submit-btn { width:100%; padding:14px; background:linear-gradient(135deg,#0891b2,#06b6d4); border:none; border-radius:10px; color:white; font-size:15px; font-weight:700; font-family:'Cinzel',serif; cursor:pointer; transition:all 0.3s; letter-spacing:1px; }
        .submit-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 25px rgba(6,182,212,0.4); }
        .submit-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .net-bg { position:fixed; top:0; left:0; right:0; bottom:0; background-image:linear-gradient(rgba(6,182,212,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.04) 1px,transparent 1px); background-size:30px 30px; pointer-events:none; }
      `}</style>

      <div className="net-bg" />

      <div className="pwd-card" style={{
        width:'100%', maxWidth:'440px',
        background:'rgba(5,25,55,0.85)', backdropFilter:'blur(20px)',
        border:'1px solid rgba(6,182,212,0.25)', borderRadius:'24px', padding:'40px 36px',
        position:'relative', zIndex:10,
      }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{
            width:'70px', height:'70px', margin:'0 auto 16px',
            background: forced ? 'linear-gradient(135deg,#f59e0b,#fbbf24)' : 'linear-gradient(135deg,#0891b2,#06b6d4)',
            borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'32px', boxShadow: forced ? '0 0 30px rgba(245,158,11,0.5)' : '0 0 30px rgba(6,182,212,0.5)',
          }}>
            {forced ? '🔐' : '🔑'}
          </div>
          <h1 style={{
            fontFamily:"'Cinzel',serif", fontSize:'20px', fontWeight:'700',
            color: forced ? '#fcd34d' : '#22d3ee', marginBottom:'8px',
          }}>
            {forced ? 'Set Your Password' : 'Change Password'}
          </h1>
          <p style={{ color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito',sans-serif", fontSize:'13px', lineHeight:'1.6' }}>
            {forced
              ? `Welcome, ${user?.name?.split(' ')[0]}! 👋\nYour admin has set a temporary password.\nPlease create your own secure password to continue.`
              : 'Update your password to keep your account secure.'}
          </p>
        </div>

        {/* Forced banner */}
        {forced && (
          <div style={{
            padding:'12px 14px', borderRadius:'10px', marginBottom:'20px',
            background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.3)',
            color:'#fcd34d', fontFamily:"'Nunito',sans-serif", fontSize:'13px', fontWeight:'600',
          }}>
            ⚠️ You must change your password before accessing the system.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* Current Password */}
          <div>
            <label style={{ display:'block', marginBottom:'6px', color:'rgba(148,210,230,0.8)', fontFamily:"'Nunito',sans-serif", fontSize:'13px', fontWeight:'600' }}>
              {forced ? '🔒 Temporary Password (given by admin)' : '🔒 Current Password'}
            </label>
            <div style={{ position:'relative' }}>
              <input className="pwd-input" style={inputStyle}
                type={showPwd.current ? 'text' : 'password'}
                placeholder={forced ? 'Enter temporary password' : 'Enter current password'}
                value={form.currentPassword}
                onChange={e => setForm({...form, currentPassword:e.target.value})} required />
              <button type="button" className="eye-btn" onClick={() => setShowPwd({...showPwd, current:!showPwd.current})}>
                {showPwd.current ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label style={{ display:'block', marginBottom:'6px', color:'rgba(148,210,230,0.8)', fontFamily:"'Nunito',sans-serif", fontSize:'13px', fontWeight:'600' }}>
              🔑 New Password
            </label>
            <div style={{ position:'relative' }}>
              <input className="pwd-input" style={inputStyle}
                type={showPwd.new ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={form.newPassword}
                onChange={e => setForm({...form, newPassword:e.target.value})} required />
              <button type="button" className="eye-btn" onClick={() => setShowPwd({...showPwd, new:!showPwd.new})}>
                {showPwd.new ? '🙈' : '👁️'}
              </button>
            </div>
            {/* Strength bar */}
            {form.newPassword && (
              <div style={{ marginTop:'8px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                  <span style={{ color:'rgba(148,210,230,0.5)', fontFamily:"'Nunito',sans-serif", fontSize:'11px' }}>Password strength</span>
                  <span style={{ color:pwdStrength.color, fontFamily:"'Nunito',sans-serif", fontSize:'11px', fontWeight:'700' }}>{pwdStrength.label}</span>
                </div>
                <div style={{ height:'4px', background:'rgba(255,255,255,0.1)', borderRadius:'4px', overflow:'hidden' }}>
                  <div style={{ height:'4px', width:pwdStrength.width, background:pwdStrength.color, borderRadius:'4px', transition:'all 0.3s' }} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ display:'block', marginBottom:'6px', color:'rgba(148,210,230,0.8)', fontFamily:"'Nunito',sans-serif", fontSize:'13px', fontWeight:'600' }}>
              ✅ Confirm New Password
            </label>
            <div style={{ position:'relative' }}>
              <input className="pwd-input"
                style={{ ...inputStyle, borderColor: form.confirmPassword && form.newPassword !== form.confirmPassword ? 'rgba(239,68,68,0.5)' : form.confirmPassword && form.newPassword === form.confirmPassword ? 'rgba(16,185,129,0.5)' : 'rgba(6,182,212,0.3)' }}
                type={showPwd.confirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={form.confirmPassword}
                onChange={e => setForm({...form, confirmPassword:e.target.value})} required />
              <button type="button" className="eye-btn" onClick={() => setShowPwd({...showPwd, confirm:!showPwd.confirm})}>
                {showPwd.confirm ? '🙈' : '👁️'}
              </button>
            </div>
            {form.confirmPassword && form.newPassword !== form.confirmPassword && (
              <p style={{ color:'#fca5a5', fontFamily:"'Nunito',sans-serif", fontSize:'12px', marginTop:'4px' }}>❌ Passwords do not match</p>
            )}
            {form.confirmPassword && form.newPassword === form.confirmPassword && (
              <p style={{ color:'#6ee7b7', fontFamily:"'Nunito',sans-serif", fontSize:'12px', marginTop:'4px' }}>✅ Passwords match</p>
            )}
          </div>

          {/* Tips */}
          <div style={{ padding:'12px 14px', background:'rgba(6,182,212,0.06)', border:'1px solid rgba(6,182,212,0.15)', borderRadius:'10px' }}>
            <p style={{ color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito',sans-serif", fontSize:'12px', lineHeight:'1.8', margin:0 }}>
              💡 <strong style={{ color:'rgba(148,210,230,0.8)' }}>Tips for a strong password:</strong><br/>
              • At least 6 characters long<br/>
              • Mix uppercase, lowercase & numbers<br/>
              • Add special characters (!@#$) for extra security
            </p>
          </div>

          {error   && <div style={{ padding:'10px 14px', borderRadius:'8px', background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5', fontFamily:"'Nunito',sans-serif", fontSize:'13px' }}>⚠️ {error}</div>}
          {success && <div style={{ padding:'10px 14px', borderRadius:'8px', background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', color:'#6ee7b7', fontFamily:"'Nunito',sans-serif", fontSize:'13px' }}>{success} Redirecting...</div>}

          <button className="submit-btn" type="submit" disabled={loading} style={{ marginTop:'4px' }}>
            {loading ? '🌊 Updating...' : forced ? '🔐 SET MY PASSWORD' : '🔑 CHANGE PASSWORD'}
          </button>

          {/* Skip only if not forced */}
          {!forced && (
            <button type="button" onClick={() => window.history.back()}
              style={{ background:'none', border:'none', color:'rgba(148,210,230,0.4)', fontFamily:"'Nunito',sans-serif", fontSize:'13px', cursor:'pointer', textDecoration:'underline' }}>
              ← Go Back
            </button>
          )}
        </form>
      </div>
    </div>
  );
}