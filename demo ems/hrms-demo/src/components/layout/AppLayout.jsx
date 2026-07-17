import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { SkeletonPage } from '../ui/SkeletonLoader';

export default function AppLayout({ role, user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 480);
    return () => clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [location.pathname]);

  return (
    <div className="flex h-full overflow-hidden bg-slate-100 dark:bg-slate-950">
      <Sidebar
        role={role}
        user={user}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onLogout={onLogout}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar user={user} role={role} onLogout={onLogout} />

        <main
          ref={mainRef}
          className="flex-1 scrollbar-thin bg-slate-100 dark:bg-slate-950"
          style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            padding: '24px',
          }}
        >
          {loading ? (
            <SkeletonPage />
          ) : (
            <div className="animate-fade-in">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
