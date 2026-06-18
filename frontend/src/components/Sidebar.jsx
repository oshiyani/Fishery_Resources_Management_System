import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const navItems = {
  admin: [
    { icon:'🏠', label:'Dashboard',    path:'/dashboard' },
    { icon:'👥', label:'User Mgmt',    path:'/users'     },
    { icon:'👤', label:'Fishermen',    path:'/fishermen' },
    { icon:'🚢', label:'Vessels',      path:'/vessels'   },
    { icon:'📋', label:'Licenses',     path:'/licenses'  },
    { icon:'🐠', label:'Catch Reports',path:'/catches'   },
    { icon:'📊', label:'Fish Stock',   path:'/stock'     },
    { icon:'📈', label:'Reports',      path:'/reports'   },
    { icon:'🔑', label:'Change Password', path:'/change-password' },
  ],
  officer: [
    { icon:'🏠', label:'Dashboard',    path:'/dashboard' },
    { icon:'👤', label:'Fishermen',    path:'/fishermen' },
    { icon:'🚢', label:'Vessels',      path:'/vessels'   },
    { icon:'📋', label:'Licenses',     path:'/licenses'  },
    { icon:'🐠', label:'Catch Reports',path:'/catches'   },
    { icon:'📊', label:'Fish Stock',   path:'/stock'     },
    { icon:'📈', label:'Reports',      path:'/reports'   },
    { icon:'🔑', label:'Change Password', path:'/change-password' },
  ],
  fisherman: [
    { icon:'🏠', label:'Dashboard',    path:'/dashboard' },
    { icon:'👤', label:'My Profile',   path:'/fishermen' },
    { icon:'🚢', label:'My Vessels',   path:'/vessels'   },
    { icon:'📋', label:'My Licenses',  path:'/licenses'  },
    { icon:'🐠', label:'My Catches',   path:'/catches'   },
    { icon:'📈', label:'My Reports',   path:'/reports'   },
    { icon:'🔑', label:'Change Password', path:'/change-password' },
  ],
};

export default function Sidebar({ activePath }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const items = navItems[user?.role] || navItems.fisherman;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Nunito:wght@400;600;700&display=swap');
        .sidebar {
          width:${collapsed ? '70px' : '240px'};
          min-height:100vh;
          background:linear-gradient(180deg,#040f24 0%,#071830 50%,#040f24 100%);
          border-right:1px solid rgba(6,182,212,0.15);
          display:flex; flex-direction:column;
          transition:width 0.3s ease;
          position:relative; z-index:100; flex-shrink:0;
        }
        .sidebar-logo { padding:24px 16px 20px; border-bottom:1px solid rgba(6,182,212,0.1); display:flex; align-items:center; gap:12px; overflow:hidden; }
        .logo-icon { width:38px; height:38px; background:linear-gradient(135deg,#0891b2,#06b6d4); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; box-shadow:0 0 15px rgba(6,182,212,0.4); }
        .logo-text { font-family:'Cinzel',serif; font-size:16px; font-weight:700; background:linear-gradient(135deg,#22d3ee,#06b6d4); -webkit-background-clip:text; -webkit-text-fill-color:transparent; white-space:nowrap; }
        .nav-section { flex:1; padding:16px 8px; overflow-y:auto; overflow-x:hidden; }
        .nav-item { display:flex; align-items:center; gap:12px; padding:11px 12px; border-radius:10px; cursor:pointer; transition:all 0.2s; margin-bottom:4px; text-decoration:none; overflow:hidden; border:1px solid transparent; }
        .nav-item:hover { background:rgba(6,182,212,0.1); border-color:rgba(6,182,212,0.2); }
        .nav-item.active { background:linear-gradient(135deg,rgba(8,145,178,0.25),rgba(6,182,212,0.15)); border-color:rgba(6,182,212,0.35); box-shadow:0 0 12px rgba(6,182,212,0.1); }
        .nav-icon { font-size:18px; flex-shrink:0; width:24px; text-align:center; }
        .nav-label { font-family:'Nunito',sans-serif; font-size:14px; font-weight:600; color:rgba(180,220,240,0.8); white-space:nowrap; }
        .nav-item.active .nav-label { color:#22d3ee; }
        .collapse-btn { position:absolute; top:26px; right:-12px; width:24px; height:24px; background:#0891b2; border:none; border-radius:50%; color:white; font-size:11px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(6,182,212,0.4); z-index:101; transition:all 0.2s; }
        .collapse-btn:hover { background:#06b6d4; transform:scale(1.1); }
        .user-section { padding:12px 8px; border-top:1px solid rgba(6,182,212,0.1); }
        .user-card { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; background:rgba(6,182,212,0.06); overflow:hidden; margin-bottom:6px; }
        .user-avatar { width:32px; height:32px; background:linear-gradient(135deg,#0891b2,#06b6d4); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
        .user-name { font-family:'Nunito',sans-serif; font-size:13px; font-weight:700; color:#e0f7ff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .user-role { font-family:'Nunito',sans-serif; font-size:11px; color:rgba(6,182,212,0.8); text-transform:capitalize; }
        .logout-btn { width:100%; padding:9px 12px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); border-radius:10px; color:#fca5a5; font-family:'Nunito',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; gap:8px; justify-content:${collapsed ? 'center' : 'flex-start'}; }
        .logout-btn:hover { background:rgba(239,68,68,0.2); border-color:rgba(239,68,68,0.4); }
      `}</style>

      <div className="sidebar">
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '→' : '←'}
        </button>
        <div className="sidebar-logo">
          <div className="logo-icon">🐟</div>
          {!collapsed && <span className="logo-text">FRMS</span>}
        </div>
        <nav className="nav-section">
          {items.map(item => (
            <a key={item.path} href={item.path}
              className={`nav-item ${activePath === item.path ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </a>
          ))}
        </nav>
        <div className="user-section">
          <div className="user-card">
            <div className="user-avatar">
              {user?.role === 'admin' ? '🛡️' : user?.role === 'officer' ? '🧭' : '🎣'}
            </div>
            {!collapsed && (
              <div style={{ overflow:'hidden' }}>
                <div className="user-name">{user?.name}</div>
                <div className="user-role">{user?.role}</div>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={logout}>
            🚪 {!collapsed && 'Logout'}
          </button>
        </div>
      </div>
    </>
  );
}