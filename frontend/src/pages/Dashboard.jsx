import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";

const StatCard = ({ icon, label, value, color, sub }) => (
  <div style={{
    background: 'rgba(5,25,55,0.7)',
    border: `1px solid ${color}33`,
    borderRadius: '16px',
    padding: '24px',
    display: 'flex', flexDirection: 'column', gap: '8px',
    position: 'relative', overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = `0 8px 30px ${color}22`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <div style={{
      position: 'absolute', top: '-10px', right: '-10px',
      fontSize: '60px', opacity: 0.06,
    }}>{icon}</div>
    <div style={{ fontSize: '28px' }}>{icon}</div>
    <div style={{ fontSize: '28px', fontWeight: '800', color, fontFamily: "'Nunito', sans-serif" }}>
      {value}
    </div>
    <div style={{ fontSize: '13px', color: 'rgba(180,220,240,0.7)', fontFamily: "'Nunito', sans-serif" }}>
      {label}
    </div>
    {sub && (
      <div style={{ fontSize: '11px', color: 'rgba(6,182,212,0.6)', fontFamily: "'Nunito', sans-serif" }}>
        {sub}
      </div>
    )}
  </div>
);

const QuickLink = ({ icon, label, desc, path, color }) => (
  <a href={path} style={{
    background: 'rgba(5,25,55,0.6)',
    border: `1px solid ${color}22`,
    borderRadius: '14px',
    padding: '20px',
    display: 'flex', alignItems: 'center', gap: '16px',
    textDecoration: 'none',
    transition: 'all 0.2s',
  }}
    onMouseEnter={e => {
      e.currentTarget.style.background = `${color}11`;
      e.currentTarget.style.borderColor = `${color}44`;
      e.currentTarget.style.transform = 'translateX(4px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'rgba(5,25,55,0.6)';
      e.currentTarget.style.borderColor = `${color}22`;
      e.currentTarget.style.transform = 'translateX(0)';
    }}
  >
    <div style={{
      width: '46px', height: '46px',
      background: `${color}22`,
      borderRadius: '12px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '22px', flexShrink: 0,
    }}>{icon}</div>
    <div>
      <div style={{ color: '#e0f7ff', fontFamily: "'Nunito', sans-serif", fontWeight: '700', fontSize: '14px' }}>
        {label}
      </div>
      <div style={{ color: 'rgba(148,210,230,0.6)', fontFamily: "'Nunito', sans-serif", fontSize: '12px', marginTop: '2px' }}>
        {desc}
      </div>
    </div>
    <div style={{ marginLeft: 'auto', color: color, fontSize: '18px' }}>→</div>
  </a>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  const getHeaders = () => {
    const token = JSON.parse(localStorage.getItem('frms_user') || '{}')?.token;
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    const url = user?.role === 'fisherman' ? '/api/reports/my-stats' : '/api/reports/summary';
    axios.get(url, { headers: getHeaders() })
      .then(r => setStats(r.data))
      .catch(() => {});
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '🌅 Good Morning';
    if (h < 17) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  };

  const adminStats = [
    { icon:'👤', label:'Total Fishermen',   value: stats?.totalFishermen  ?? '—', color:'#06b6d4', sub:'Registered users'  },
    { icon:'🚢', label:'Total Vessels',     value: stats?.totalVessels    ?? '—', color:'#10b981', sub:'Active vessels'     },
    { icon:'📋', label:'Active Licenses',   value: stats?.totalLicenses   ?? '—', color:'#f59e0b', sub:'Valid licenses'     },
    { icon:'🐠', label:'Catch Reports',     value: stats?.totalCatches    ?? '—', color:'#8b5cf6', sub:'Total submitted'    },
    { icon:'📊', label:'Pending Licenses',  value: stats?.pendingLicenses ?? '—', color:'#ec4899', sub:'Need attention'     },
    { icon:'⚠️', label:'Flagged Catches',   value: stats?.flaggedCatches  ?? '—', color:'#ef4444', sub:'Warning flags'      },
  ];

  const officerStats = [
    { icon:'📋', label:'Pending Licenses',  value: stats?.pendingLicenses ?? '—', color:'#f59e0b', sub:'Awaiting review'    },
    { icon:'🐠', label:'Catch Reports',     value: stats?.pendingCatches  ?? '—', color:'#06b6d4', sub:'To verify'          },
    { icon:'🚢', label:'Pending Vessels',  value: stats?.pendingVessels  ?? '—', color:'#8b5cf6', sub:'Awaiting approval' },
    { icon:'🚨', label:'Critical Stock',    value: stats?.criticalStock   ?? '—', color:'#ef4444', sub:'Low stock warnings'  },
  ];

  const fishermanStats = [
    { icon:'📋', label:'My Licenses',    value: stats?.myLicenses  ?? '—', color:'#06b6d4', sub:'Active licenses'  },
    { icon:'🐠', label:'My Catches',     value: stats?.myCatches   ?? '—', color:'#10b981', sub:'Total reports'    },
    { icon:'🚢', label:'My Vessels',     value: stats?.myVessels   ?? '—', color:'#f59e0b', sub:'Registered boats' },
    { icon:'✅', label:'Verified Catch', value: stats?.myVerified  ?? '—', color:'#8b5cf6', sub:'Approved reports' },
  ];

  const adminLinks = [
    { icon:'👤', label:'Register Fisherman', desc:'Add new fisherman to system',   path:'/fishermen', color:'#06b6d4' },
    { icon:'🚢', label:'Register Vessel',    desc:'Add a new vessel/boat',          path:'/vessels',   color:'#10b981' },
    { icon:'📋', label:'Issue License',      desc:'Create a new fishing license',   path:'/licenses',  color:'#f59e0b' },
    { icon:'🐠', label:'View Catch Reports', desc:'Review submitted catch data',    path:'/catches',   color:'#8b5cf6' },
    { icon:'📊', label:'Update Fish Stock',  desc:'Manage species & stock levels',  path:'/stock',     color:'#ec4899' },
    { icon:'📈', label:'View Reports',       desc:'Analytics & compliance reports', path:'/reports',   color:'#22d3ee' },
  ];

  const officerLinks = [
    { icon:'📋', label:'Review Licenses',  desc:'Approve or reject applications', path:'/licenses', color:'#f59e0b' },
    { icon:'🐠', label:'Verify Catches',   desc:'Validate submitted catch data',  path:'/catches',  color:'#06b6d4' },
    { icon:'🚢', label:'Approve Vessels',  desc:'Review vessel registrations',    path:'/vessels',  color:'#10b981' },
    { icon:'📊', label:'Monitor Stock',    desc:'Check fish stock levels',        path:'/stock',    color:'#ec4899' },
  ];

  const fishermanLinks = [
    { icon:'📋', label:'Request License', desc:'Apply for a fishing license',  path:'/licenses', color:'#06b6d4' },
    { icon:'🐠', label:'Submit Catch',    desc:"Report your today's catch",    path:'/catches',  color:'#10b981' },
    { icon:'🚢', label:'Register Vessel', desc:'Add your boat to the system',  path:'/vessels',  color:'#f59e0b' },
    { icon:'📈', label:'My Reports',      desc:'View your fishing statistics', path:'/reports',  color:'#8b5cf6' },
  ];

  const statsList = user?.role === 'admin' ? adminStats : user?.role === 'officer' ? officerStats : fishermanStats;
  const links     = user?.role === 'admin' ? adminLinks : user?.role === 'officer' ? officerLinks : fishermanLinks;

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Nunito:wght@400;600;700;800&display=swap');
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .dash-grid  { display:grid; grid-template-columns:repeat(auto-fill, minmax(200px,1fr)); gap:16px; }
        .links-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(280px,1fr)); gap:12px; }
        .section { animation: fadeSlideUp 0.5s ease forwards; }
        .section:nth-child(2) { animation-delay:0.1s; }
        .section:nth-child(3) { animation-delay:0.2s; }
      `}</style>

      <div style={{ padding:'32px', maxWidth:'1200px' }}>

        {/* Header */}
        <div className="section" style={{ marginBottom:'32px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
            <div>
              <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:'24px', fontWeight:'900', background:'linear-gradient(135deg, #22d3ee, #06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:'6px' }}>
                {greeting()}, {user?.name?.split(' ')[0]}!
              </h1>
              <p style={{ color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito',sans-serif", fontSize:'14px' }}>
                Welcome to FRMS •
                <span style={{
                  marginLeft:'8px', padding:'2px 10px',
                  background: user?.role==='admin' ? 'rgba(239,68,68,0.15)' : user?.role==='officer' ? 'rgba(245,158,11,0.15)' : 'rgba(6,182,212,0.15)',
                  border:`1px solid ${user?.role==='admin' ? 'rgba(239,68,68,0.3)' : user?.role==='officer' ? 'rgba(245,158,11,0.3)' : 'rgba(6,182,212,0.3)'}`,
                  borderRadius:'20px',
                  color: user?.role==='admin' ? '#fca5a5' : user?.role==='officer' ? '#fcd34d' : '#67e8f9',
                  fontSize:'12px', fontWeight:'700', textTransform:'capitalize',
                }}>
                  {user?.role==='admin' ? '🛡️' : user?.role==='officer' ? '🧭' : '🎣'} {user?.role}
                </span>
              </p>
            </div>
            <div style={{ padding:'10px 18px', background:'rgba(6,182,212,0.08)', border:'1px solid rgba(6,182,212,0.2)', borderRadius:'12px', color:'rgba(148,210,230,0.8)', fontFamily:"'Nunito',sans-serif", fontSize:'13px' }}>
              📅 {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="section" style={{ marginBottom:'32px' }}>
          <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:'16px', fontWeight:'800', color:'rgba(148,210,230,0.8)', marginBottom:'16px', textTransform:'uppercase', letterSpacing:'1px' }}>
            📊 Overview
          </h2>
          <div className="dash-grid">
            {statsList.map((s,i) => <StatCard key={i} {...s} />)}
          </div>
        </div>

        <div style={{ height:'1px', background:'rgba(6,182,212,0.1)', marginBottom:'32px' }} />

        {/* Quick Actions */}
        <div className="section">
          <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:'16px', fontWeight:'800', color:'rgba(148,210,230,0.8)', marginBottom:'16px', textTransform:'uppercase', letterSpacing:'1px' }}>
            ⚡ Quick Actions
          </h2>
          <div className="links-grid">
            {links.map((l,i) => <QuickLink key={i} {...l} />)}
          </div>
        </div>

        <div style={{ marginTop:'40px', paddingTop:'20px', borderTop:'1px solid rgba(6,182,212,0.08)', textAlign:'center', color:'rgba(148,210,230,0.3)', fontFamily:"'Nunito',sans-serif", fontSize:'12px' }}>
          🐟 Fisheries Resource Management System v1.0 • {new Date().getFullYear()}
        </div>
      </div>
    </Layout>
  );
}
  
