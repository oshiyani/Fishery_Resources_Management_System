import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#060f1e' }}>
      <Sidebar activePath={location.pathname} />
      <main style={{
        flex: 1,
        overflowY: 'auto',
        background: 'linear-gradient(135deg, #060f1e 0%, #0a1628 50%, #071830 100%)',
      }}>
        {children}
      </main>
    </div>
  );
}