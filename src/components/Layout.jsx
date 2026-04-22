import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <>
      <nav>
        <NavLink to="/" className="nav-logo">
          pm<span>intel</span>
        </NavLink>
        <div className="nav-tabs">
          <NavLink to="/" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`} end>
            Home
          </NavLink>
          <NavLink to="/competitive" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
            Competitive
          </NavLink>
          <NavLink to="/market" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
            Market
          </NavLink>
          <NavLink to="/feature" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
            Feature
          </NavLink>
          
          {user ? (
            <>
              <NavLink to="/reports" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
                Reports
              </NavLink>
              <button onClick={handleSignOut} className="nav-tab">
                Sign Out
              </button>
            </>
          ) : (
            <NavLink to="/auth" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
              Sign In
            </NavLink>
          )}
        </div>
        <div className="nav-tag">for product managers</div>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}
