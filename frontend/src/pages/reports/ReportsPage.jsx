import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const getHeaders = () => {
  const token = JSON.parse(localStorage.getItem('frms_user') || '{}')?.token;
  return { Authorization: `Bearer ${token}` };
};

const COLORS = ['#06b6d4','#10b981','#f59e0b','#8b5cf6','#ec4899','#ef4444','#22d3ee','#a3e635'];

// Simple Bar Chart
const BarChart = ({ data, valueKey, labelKey, color = '#06b6d4', unit = '' }) => {
  if (!data?.length) return (
    <div style={{ textAlign:'center', padding:'40px', color:'rgba(148,210,230,0.4)', fontFamily:"'Nunito',sans-serif" }}>
      No data yet
    </div>
  );
  const max = Math.max(...data.map(d => d[valueKey]));
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
            <span style={{ color:'rgba(148,210,230,0.8)', fontFamily:"'Nunito',sans-serif", fontSize:'13px' }}>
              {d[labelKey]}
            </span>
            <span style={{ color: COLORS[i % COLORS.length], fontFamily:"'Nunito',sans-serif", fontSize:'13px', fontWeight:'700' }}>
              {d[valueKey].toLocaleString()}{unit}
            </span>
          </div>
          <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:'20px', height:'10px', overflow:'hidden' }}>
            <div style={{
              height:'10px', borderRadius:'20px',
              width: `${(d[valueKey] / max) * 100}%`,
              background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}88, ${COLORS[i % COLORS.length]})`,
              transition:'width 0.8s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
};

// Simple Donut Chart (CSS)
const DonutChart = ({ data }) => {
  if (!data?.length) return (
    <div style={{ textAlign:'center', padding:'40px', color:'rgba(148,210,230,0.4)', fontFamily:"'Nunito',sans-serif" }}>
      No data yet
    </div>
  );
  const total = data.reduce((s, d) => s + d.count, 0);
  const STATUS_COLORS = {
    approved: '#10b981', pending: '#f59e0b',
    rejected: '#ef4444', expired: '#94a3b8',
  };
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
      {data.map((d, i) => {
        const pct = Math.round((d.count / total) * 100);
        const col = STATUS_COLORS[d.status] || COLORS[i];
        return (
          <div key={i}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
              <span style={{ color:'rgba(148,210,230,0.8)', fontFamily:"'Nunito',sans-serif", fontSize:'13px', textTransform:'capitalize' }}>
                {d.status}
              </span>
              <span style={{ color:col, fontFamily:"'Nunito',sans-serif", fontSize:'13px', fontWeight:'700' }}>
                {d.count} ({pct}%)
              </span>
            </div>
            <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:'20px', height:'10px', overflow:'hidden' }}>
              <div style={{
                height:'10px', borderRadius:'20px',
                width:`${pct}%`,
                background:`linear-gradient(90deg, ${col}88, ${col})`,
                transition:'width 0.8s ease',
              }} />
            </div>
          </div>
        );
      })}
      <div style={{ textAlign:'center', marginTop:'8px', color:'rgba(148,210,230,0.5)', fontFamily:"'Nunito',sans-serif", fontSize:'12px' }}>
        Total: {total} licenses
      </div>
    </div>
  );
};

// Monthly Trend Chart
const TrendChart = ({ data }) => {
  if (!data?.length) return (
    <div style={{ textAlign:'center', padding:'40px', color:'rgba(148,210,230,0.4)', fontFamily:"'Nunito',sans-serif" }}>
      No data yet
    </div>
  );
  const max = Math.max(...data.map(d => d.totalQuantity));
  const chartH = 140;
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:'8px', height:`${chartH}px`, padding:'0 4px' }}>
        {data.map((d, i) => {
          const barH = max > 0 ? Math.max((d.totalQuantity / max) * chartH, 4) : 4;
          return (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', height:'100%', justifyContent:'flex-end' }}>
              <div style={{ fontSize:'10px', color:'#06b6d4', fontFamily:"'Nunito',sans-serif", fontWeight:'700' }}>
                {d.totalQuantity > 0 ? d.totalQuantity.toLocaleString() : ''}
              </div>
              <div style={{
                width:'100%', borderRadius:'4px 4px 0 0',
                height:`${barH}px`,
                background:`linear-gradient(180deg, #22d3ee, #0891b2)`,
                transition:'height 0.8s ease',
                cursor:'pointer',
              }} title={`${d.month}: ${d.totalQuantity} kg`} />
            </div>
          );
        })}
      </div>
      <div style={{ display:'flex', gap:'8px', marginTop:'8px', padding:'0 4px', overflowX:'auto' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex:1, textAlign:'center', color:'rgba(148,210,230,0.5)', fontFamily:"'Nunito',sans-serif", fontSize:'10px', whiteSpace:'nowrap' }}>
            {d.month}
          </div>
        ))}
      </div>
    </div>
  );
};

const ChartCard = ({ title, icon, children }) => (
  <div style={{
    background:'rgba(5,25,55,0.8)', border:'1px solid rgba(6,182,212,0.15)',
    borderRadius:'16px', padding:'24px',
  }}>
    <h3 style={{ fontFamily:"'Nunito',sans-serif", fontSize:'14px', fontWeight:'800', color:'#22d3ee', marginBottom:'20px' }}>
      {icon} {title}
    </h3>
    {children}
  </div>
);

export default function ReportsPage() {
  const { user } = useAuth();
  const [summary,   setSummary]   = useState(null);
  const [species,   setSpecies]   = useState([]);
  const [zones,     setZones]     = useState([]);
  const [trends,    setTrends]    = useState([]);
  const [licenses,  setLicenses]  = useState([]);
  const [myStats,   setMyStats]   = useState(null);
  const [loading,   setLoading]   = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const h = { headers: getHeaders() };
    if (user?.role === 'fisherman') {
      axios.get('/api/reports/my-stats', h)
        .then(r => setMyStats(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      Promise.all([
        axios.get('/api/reports/summary',          h),
        axios.get('/api/reports/catch-by-species', h),
        axios.get('/api/reports/catch-by-zone',    h),
        axios.get('/api/reports/monthly-trends',   h),
        axios.get('/api/reports/license-stats',    h),
      ]).then(([s, sp, z, t, l]) => {
        setSummary(s.data);
        setSpecies(sp.data);
        setZones(z.data);
        setTrends(t.data);
        setLicenses(l.data);
      }).catch(() => {})
        .finally(() => setLoading(false));
    }
  }, []);

  return (
    <Layout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Nunito:wght@400;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
      `}</style>

      <div style={{ padding:'32px' }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom:'28px' }}>
          <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:'22px', fontWeight:'700', background:'linear-gradient(135deg, #22d3ee, #06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            📈 Reports & Analytics
          </h1>
          <p style={{ color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito',sans-serif", fontSize:'13px', marginTop:'4px' }}>
            {user?.role === 'fisherman' ? 'Your personal fishing statistics' : 'System-wide analytics and insights'}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'80px', color:'rgba(148,210,230,0.5)', fontFamily:"'Nunito',sans-serif", fontSize:'16px' }}>
            🌊 Loading analytics...
          </div>
        ) : (
          <>
            {/* ── FISHERMAN VIEW ── */}
            {user?.role === 'fisherman' && myStats && (
              <>
                {/* My Stats Cards */}
                <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap:'14px', marginBottom:'28px' }}>
                  {[
                    { icon:'📋', label:'My Licenses',    value: myStats.myLicenses,  color:'#06b6d4' },
                    { icon:'🐠', label:'Total Catches',  value: myStats.myCatches,   color:'#10b981' },
                    { icon:'🚢', label:'My Vessels',     value: myStats.myVessels,   color:'#f59e0b' },
                    { icon:'✅', label:'Verified',        value: myStats.myVerified,  color:'#8b5cf6' },
                    { icon:'⚠️', label:'Flagged',         value: myStats.myFlagged,   color:'#ef4444' },
                  ].map((s,i) => (
                    <div key={i} style={{ background:'rgba(5,25,55,0.7)', border:`1px solid ${s.color}33`, borderRadius:'12px', padding:'16px', textAlign:'center' }}>
                      <div style={{ fontSize:'22px', marginBottom:'6px' }}>{s.icon}</div>
                      <div style={{ fontSize:'24px', fontWeight:'800', color:s.color, fontFamily:"'Nunito',sans-serif" }}>{s.value}</div>
                      <div style={{ fontSize:'12px', color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito',sans-serif" }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <ChartCard title="My Catch by Species" icon="🐟">
                  <BarChart
                    data={myStats.catchBySpecies}
                    valueKey="totalQuantity"
                    labelKey="species"
                    unit=" kg"
                  />
                </ChartCard>
              </>
            )}

            {/* ── ADMIN / OFFICER VIEW ── */}
            {(user?.role === 'admin' || user?.role === 'officer') && summary && (
              <>
                {/* Summary Cards */}
                <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(170px,1fr))', gap:'14px', marginBottom:'28px' }}>
                  {[
                    { icon:'👤', label:'Total Fishermen',   value: summary.totalFishermen,  color:'#06b6d4' },
                    { icon:'🚢', label:'Total Vessels',     value: summary.totalVessels,    color:'#10b981' },
                    { icon:'📋', label:'Active Licenses',   value: summary.totalLicenses,   color:'#f59e0b' },
                    { icon:'🐠', label:'Total Catches',     value: summary.totalCatches,    color:'#8b5cf6' },
                    { icon:'⏳', label:'Pending Licenses',  value: summary.pendingLicenses, color:'#ec4899' },
                    { icon:'📝', label:'Pending Catches',   value: summary.pendingCatches,  color:'#22d3ee' },
                    { icon:'⚠️', label:'Flagged Catches',   value: summary.flaggedCatches,  color:'#ef4444' },
                    { icon:'🚨', label:'Critical Stock',    value: summary.criticalStock,   color:'#f43f5e' },
                  ].map((s,i) => (
                    <div key={i} style={{ background:'rgba(5,25,55,0.7)', border:`1px solid ${s.color}33`, borderRadius:'12px', padding:'16px', textAlign:'center' }}>
                      <div style={{ fontSize:'22px', marginBottom:'6px' }}>{s.icon}</div>
                      <div style={{ fontSize:'24px', fontWeight:'800', color:s.color, fontFamily:"'Nunito',sans-serif" }}>{s.value}</div>
                      <div style={{ fontSize:'12px', color:'rgba(148,210,230,0.6)', fontFamily:"'Nunito',sans-serif" }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Charts Row 1 */}
                <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(380px,1fr))', gap:'16px', marginBottom:'16px' }}>
                  <ChartCard title="Top Catch by Species (kg)" icon="🐟">
                    <BarChart data={species} valueKey="totalQuantity" labelKey="species" unit=" kg" />
                  </ChartCard>
                  <ChartCard title="License Status Breakdown" icon="📋">
                    <DonutChart data={licenses} />
                  </ChartCard>
                </div>

                {/* Charts Row 2 */}
                <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(380px,1fr))', gap:'16px', marginBottom:'16px' }}>
                  <ChartCard title="Catch Activity by Zone" icon="🌊">
                    <BarChart data={zones} valueKey="count" labelKey="zone" unit=" reports" />
                  </ChartCard>
                  <ChartCard title="Monthly Catch Trends" icon="📅">
                    <TrendChart data={trends} />
                  </ChartCard>
                </div>

                {/* Zone Quantity Table */}
                <div className="fade-up" style={{ background:'rgba(5,25,55,0.8)', border:'1px solid rgba(6,182,212,0.15)', borderRadius:'16px', overflow:'hidden' }}>
                  <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(6,182,212,0.1)' }}>
                    <h3 style={{ fontFamily:"'Nunito',sans-serif", fontSize:'14px', fontWeight:'800', color:'#22d3ee' }}>
                      🌊 Zone-wise Catch Summary
                    </h3>
                  </div>
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                      <thead>
                        <tr style={{ background:'rgba(6,182,212,0.08)' }}>
                          {['Zone','Total Reports','Total Quantity (kg)','Avg per Report'].map(h => (
                            <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito',sans-serif", fontSize:'12px', fontWeight:'700', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {zones.length === 0 ? (
                          <tr><td colSpan={4} style={{ padding:'40px', textAlign:'center', color:'rgba(148,210,230,0.4)', fontFamily:"'Nunito',sans-serif" }}>No catch data yet</td></tr>
                        ) : zones.map((z, i) => (
                          <tr key={i} style={{ borderBottom:'1px solid rgba(6,182,212,0.06)' }}>
                            <td style={{ padding:'12px 16px', color:'#e0f7ff', fontFamily:"'Nunito',sans-serif", fontWeight:'600', fontSize:'14px' }}>{z.zone}</td>
                            <td style={{ padding:'12px 16px', color:'#06b6d4', fontFamily:"'Nunito',sans-serif", fontSize:'13px', fontWeight:'700' }}>{z.count}</td>
                            <td style={{ padding:'12px 16px', color:'#10b981', fontFamily:"'Nunito',sans-serif", fontSize:'13px', fontWeight:'700' }}>{z.totalQuantity.toLocaleString()} kg</td>
                            <td style={{ padding:'12px 16px', color:'rgba(148,210,230,0.7)', fontFamily:"'Nunito',sans-serif", fontSize:'13px' }}>
                              {z.count > 0 ? Math.round(z.totalQuantity / z.count).toLocaleString() : 0} kg
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}