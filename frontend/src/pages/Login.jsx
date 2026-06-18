import { useState } from "react";
import axios from "axios";

const Fish = ({ style, className }) => (
  <svg viewBox="0 0 80 40" style={style} className={className}>
    <path d="M60 20 C50 8, 20 5, 5 20 C20 35, 50 35, 60 20Z" fill="currentColor" opacity="0.9"/>
    <path d="M60 20 L75 10 L70 20 L75 30 Z" fill="currentColor" opacity="0.9"/>
    <circle cx="18" cy="17" r="3" fill="rgba(255,255,255,0.8)"/>
    <circle cx="17" cy="16" r="1.2" fill="#1a1a2e"/>
  </svg>
);

const Bubble = ({ style }) => (
  <div style={{
    position:'absolute', borderRadius:'50%',
    border:'2px solid rgba(255,255,255,0.4)',
    background:'rgba(255,255,255,0.08)',
    animation:'bubbleRise 4s ease-in infinite', ...style,
  }} />
);

const Seaweed = ({ left, delay }) => (
  <div style={{
    position:'absolute', bottom:0, left,
    width:'18px', height:'80px',
    animation:`sway 3s ease-in-out ${delay}s infinite`,
    transformOrigin:'bottom center',
  }}>
    {[0,1,2,3,4].map(i => (
      <div key={i} style={{
        width: i%2===0 ? '18px':'14px', height:'18px',
        borderRadius:'50% 50% 0 50%',
        background:`rgba(34,197,94,${0.5+i*0.08})`,
        marginLeft: i%2===0 ? '0':'4px',
        marginBottom:'-4px',
        transform: i%2===0 ? 'rotate(-10deg)':'rotate(10deg)',
      }} />
    ))}
  </div>
);

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [form,    setForm]    = useState({ email:'', password:'' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await axios.post('/api/auth/login', form);
      localStorage.setItem('frms_user', JSON.stringify(data));
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(180deg,#0a1628 0%,#0d2b4e 25%,#0a4a6e 60%,#0d6b8e 80%,#1a8fa8 100%)',
      overflow:'hidden', position:'relative',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Nunito:wght@400;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fishSwim {
          0%   { transform:translateX(-120px) scaleX(1); opacity:0; }
          10%  { opacity:1; }
          45%  { transform:translateX(calc(50vw - 60px)) scaleX(1); }
          50%  { transform:translateX(calc(50vw - 60px)) scaleX(-1); }
          100% { transform:translateX(-120px) scaleX(-1); opacity:0; }
        }
        @keyframes fishSwim2 {
          0%   { transform:translateX(110vw) scaleX(-1); opacity:0; }
          10%  { opacity:0.7; }
          100% { transform:translateX(-200px) scaleX(-1); opacity:0; }
        }
        @keyframes bubbleRise {
          0%   { transform:translateY(0) scale(1); opacity:0.6; }
          100% { transform:translateY(-300px) scale(1.4); opacity:0; }
        }
        @keyframes sway {
          0%,100% { transform:rotate(-8deg); }
          50%     { transform:rotate(8deg); }
        }
        @keyframes float {
          0%,100% { transform:translateY(0px) rotate(-2deg); }
          50%     { transform:translateY(-12px) rotate(2deg); }
        }
        @keyframes waveFlow {
          0%   { transform:translateX(0); }
          100% { transform:translateX(-50%); }
        }
        @keyframes glow {
          0%,100% { box-shadow:0 0 20px rgba(6,182,212,0.4),0 0 60px rgba(6,182,212,0.1); }
          50%     { box-shadow:0 0 40px rgba(6,182,212,0.7),0 0 80px rgba(6,182,212,0.2); }
        }
        @keyframes slideUp {
          from { transform:translateY(40px); opacity:0; }
          to   { transform:translateY(0); opacity:1; }
        }
        @keyframes netDrift {
          0%,100% { transform:translateX(0) translateY(0); }
          50%     { transform:translateX(10px) translateY(5px); }
        }
        .auth-card { animation:slideUp 0.7s ease forwards, glow 3s ease-in-out infinite; }
        .auth-input {
          width:100%; padding:13px 16px 13px 44px;
          background:rgba(255,255,255,0.07);
          border:1.5px solid rgba(6,182,212,0.3);
          border-radius:10px; color:#e0f7ff;
          font-size:15px; font-family:'Nunito',sans-serif;
          outline:none; transition:all 0.3s;
        }
        .auth-input::placeholder { color:rgba(180,220,240,0.5); }
        .auth-input:focus {
          border-color:#06b6d4;
          background:rgba(6,182,212,0.12);
          box-shadow:0 0 0 3px rgba(6,182,212,0.15);
        }
        .submit-btn {
          width:100%; padding:14px;
          background:linear-gradient(135deg,#0891b2,#06b6d4,#22d3ee);
          border:none; border-radius:10px; color:white;
          font-size:16px; font-weight:700; font-family:'Cinzel',serif;
          cursor:pointer; transition:all 0.3s; letter-spacing:1px;
        }
        .submit-btn:hover { transform:translateY(-2px); box-shadow:0 8px 25px rgba(6,182,212,0.5); }
        .submit-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .input-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:17px; pointer-events:none; }
        .wave-layer { position:absolute; bottom:0; left:0; width:200%; height:80px; animation:waveFlow 8s linear infinite; }
        .fish-layer { position:absolute; width:100%; height:100%; top:0; left:0; pointer-events:none; }
        .fish1 { position:absolute; color:rgba(34,211,238,0.35); width:70px; top:35%; animation:fishSwim 16s ease-in-out infinite; }
        .fish2 { position:absolute; color:rgba(16,185,129,0.3); width:45px; top:55%; animation:fishSwim2 20s linear infinite; animation-delay:-8s; }
        .fish3 { position:absolute; color:rgba(167,139,250,0.3); width:55px; top:20%; animation:fishSwim2 22s linear infinite; animation-delay:-12s; }
        .logo-float { animation:float 4s ease-in-out infinite; }
        .error-msg {
          background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4);
          color:#fca5a5; padding:10px 14px; border-radius:8px;
          font-size:13px; font-family:'Nunito',sans-serif;
        }
        .net-bg {
          position:absolute; top:0; left:0; right:0; bottom:0;
          background-image:linear-gradient(rgba(6,182,212,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.06) 1px,transparent 1px);
          background-size:30px 30px; animation:netDrift 6s ease-in-out infinite;
        }
        .stars {
          position:absolute; top:0; left:0; width:100%; height:40%;
          background-image:radial-gradient(circle,rgba(255,255,255,0.8) 1px,transparent 1px);
          background-size:60px 60px; opacity:0.4;
        }
      `}</style>

      <div className="stars" />
      <div className="net-bg" />

      <div className="fish-layer">
        <div className="fish1"><Fish /></div>
        <div className="fish2"><Fish /></div>
        <div className="fish3"><Fish /></div>
      </div>

      {[
        { width:'10px', height:'10px', left:'10%', bottom:'20%', animationDelay:'0s',   animationDuration:'5s'   },
        { width:'6px',  height:'6px',  left:'20%', bottom:'10%', animationDelay:'1s',   animationDuration:'4s'   },
        { width:'14px', height:'14px', left:'75%', bottom:'30%', animationDelay:'2s',   animationDuration:'6s'   },
        { width:'8px',  height:'8px',  left:'85%', bottom:'15%', animationDelay:'0.5s', animationDuration:'4.5s' },
        { width:'12px', height:'12px', left:'50%', bottom:'5%',  animationDelay:'1.5s', animationDuration:'5.5s' },
      ].map((b,i) => <Bubble key={i} style={b} />)}

      {[
        { left:'3%',  delay:0   }, { left:'7%',  delay:0.5 },
        { left:'93%', delay:0.8 }, { left:'97%', delay:1.3 },
      ].map((s,i) => <Seaweed key={i} left={s.left} delay={s.delay} />)}

      <div style={{ position:'absolute', bottom:0, left:0, width:'100%', overflow:'hidden', height:'60px', zIndex:1 }}>
        <svg className="wave-layer" viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ height:'60px' }}>
          <path d="M0,30 C180,60 360,0 540,30 C720,60 900,0 1080,30 C1260,60 1440,0 1440,30 L1440,60 L0,60 Z" fill="rgba(6,182,212,0.15)" />
          <path d="M0,40 C180,10 360,50 540,40 C720,10 900,50 1080,40 C1260,10 1440,50 1440,40 L1440,60 L0,60 Z" fill="rgba(14,116,144,0.2)" />
        </svg>
      </div>

      {/* Login Card */}
      <div className="auth-card" style={{
        width:'100%', maxWidth:'420px', margin:'20px',
        background:'rgba(5,25,55,0.75)', backdropFilter:'blur(20px)',
        border:'1px solid rgba(6,182,212,0.25)', borderRadius:'24px',
        padding:'40px 36px', position:'relative', zIndex:10,
      }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div className="logo-float" style={{ display:'inline-block', marginBottom:'12px' }}>
            <div style={{
              width:'72px', height:'72px',
              background:'linear-gradient(135deg,#0891b2,#06b6d4)',
              borderRadius:'50%', display:'flex', alignItems:'center',
              justifyContent:'center', margin:'0 auto',
              boxShadow:'0 0 30px rgba(6,182,212,0.5)', fontSize:'34px',
            }}>🐟</div>
          </div>
          <h1 style={{
            fontFamily:"'Cinzel',serif", fontSize:'24px', fontWeight:'900',
            background:'linear-gradient(135deg,#22d3ee,#06b6d4,#a5f3fc)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            letterSpacing:'3px', marginBottom:'6px',
          }}>FRMS</h1>
          <p style={{ color:'rgba(148,210,230,0.7)', fontSize:'11px', fontFamily:"'Nunito',sans-serif", letterSpacing:'3px' }}>
            FISHERIES RESOURCE MANAGEMENT
          </p>
          <div style={{
            marginTop:'12px', padding:'6px 16px', display:'inline-block',
            background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.2)',
            borderRadius:'20px', color:'rgba(148,210,230,0.7)',
            fontFamily:"'Nunito',sans-serif", fontSize:'12px',
          }}>
            🔐 Government Portal — Authorized Access Only
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div style={{ position:'relative' }}>
            <span className="input-icon">📧</span>
            <input className="auth-input" type="email" placeholder="Official Email Address"
              value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
          </div>
          <div style={{ position:'relative' }}>
            <span className="input-icon">🔒</span>
            <input className="auth-input" type="password" placeholder="Password"
              value={form.password} onChange={e => setForm({...form, password:e.target.value})} required />
          </div>

          {error && <div className="error-msg">⚠️ {error}</div>}

          <button className="submit-btn" type="submit" disabled={loading} style={{ marginTop:'4px' }}>
            {loading ? '🌊 Verifying...' : '🎣 SIGN IN'}
          </button>
        </form>

        {/* Footer note */}
        <p style={{
          textAlign:'center', marginTop:'20px',
          color:'rgba(148,210,230,0.4)', fontSize:'12px',
          fontFamily:"'Nunito',sans-serif", lineHeight:'1.6',
        }}>
          🔒 Access is provided by your department administrator.<br/>
          Contact your admin if you need credentials.
        </p>

        <div style={{ position:'absolute', top:'16px', right:'16px', color:'rgba(6,182,212,0.2)', fontSize:'28px', animation:'float 5s ease-in-out infinite', animationDelay:'1s' }}>🐠</div>
      </div>
    </div>
  );
}