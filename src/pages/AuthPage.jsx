import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Check if we arrived via a password recovery link
    if (location.hash.includes('type=recovery')) {
      setIsRecovery(true);
      return;
    }

    const savedEmail = localStorage.getItem('pmintel_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [location]);

  // Redirect if already logged in AND we are not trying to recover a password
  if (user && !isRecovery) {
    navigate('/');
    return null;
  }

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    if (rememberMe && !isRecovery) {
      localStorage.setItem('pmintel_remembered_email', email);
    } else if (!isRecovery) {
      localStorage.removeItem('pmintel_remembered_email');
    }
    
    try {
      if (isRecovery) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please try again.');
        }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage('Password updated successfully! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/auth',
        });
        if (error) throw error;
        setMessage('Password reset email sent! Please check your inbox.');
      } else if (isMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({ 
          email,
          options: { emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        setMessage('Magic link sent! Please check your email to sign in.');
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage('Logged in successfully!');
        navigate('/'); // Redirect to home on success
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please try again.');
        }
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Sign up successful! Please check your email to confirm.');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page active">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isRecovery ? 'Set New Password' : isForgotPassword ? 'Reset Password' : isMagicLink ? 'Magic Link Login' : isLogin ? 'Welcome back' : 'Create an account'}</h2>
          <p>{isRecovery ? 'Enter your new password below' : isForgotPassword ? 'Enter your email to receive a reset link' : isMagicLink ? 'Enter your email to receive a secure sign-in link' : isLogin ? 'Sign in to access your intelligence layer' : 'Join to save your workspace and reports'}</p>
        </div>
        
        <form onSubmit={handleAuth}>
          {!isRecovery && (
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@company.com" 
                required 
              />
            </div>
          )}
          
          {(!isForgotPassword && !isMagicLink) || isRecovery ? (
            <>
              <div className="form-group" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '6px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>{isRecovery ? 'New Password' : 'Password'}</label>
                  {isLogin && !isRecovery && (
                    <button 
                      type="button" 
                      onClick={() => { setIsForgotPassword(true); setIsMagicLink(false); }}
                      style={{ background: 'none', border: 'none', color: 'var(--ink3)', fontSize: '11px', fontFamily: 'DM Mono, monospace', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    required 
                    style={{ paddingRight: '40px' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink3)', display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {(!isLogin || isRecovery) && (
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="••••••••" 
                      required 
                      style={{ paddingRight: '40px' }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : null}

          {!isForgotPassword && !isMagicLink && isLogin && !isRecovery && (
            <div className="form-group">
              <label className="check-pill" style={{ display: 'inline-flex', padding: '4px 10px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)} 
                  style={{ display: 'inline-block', width: 'auto', marginRight: '8px' }}
                />
                <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '13px', color: 'var(--ink2)', letterSpacing: '0', textTransform: 'none' }}>Remember my email</span>
              </label>
            </div>
          )}
          
          {message && (
            <div className="form-group" style={{ color: message.includes('success') || message.includes('sent') ? 'green' : 'var(--accent)', fontSize: '13px' }}>
              {message}
            </div>
          )}

          <button type="submit" className="btn-run" style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem' }} disabled={loading}>
            {loading ? 'Processing...' : isRecovery ? 'Update Password' : isForgotPassword ? 'Send Reset Link' : isMagicLink ? 'Send Magic Link' : isLogin ? 'Sign In' : 'Sign Up'} <span className="arrow">→</span>
          </button>
          
          {(!isForgotPassword && !isMagicLink && !isRecovery) && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: 'var(--ink3)' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border2)' }}></div>
                <span style={{ padding: '0 10px', fontSize: '12px', fontFamily: 'DM Mono, monospace' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border2)' }}></div>
              </div>
              
              <button 
                type="button" 
                onClick={async () => {
                  await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { 
                      // Use the full current path (including /pm-intel/ if on github pages)
                      redirectTo: window.location.origin + window.location.pathname 
                    }
                  });
                }}
                className="nav-tab" 
                style={{ width: '100%', justifyContent: 'center', background: 'white', border: '1px solid var(--border2)', color: 'var(--ink)', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.83 15.71 17.61V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                  <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.61C14.73 18.27 13.48 18.66 12 18.66C9.14 18.66 6.71 16.73 5.84 14.15H2.15V17C4.01 20.69 7.74 23 12 23Z" fill="#34A853"/>
                  <path d="M5.84 14.15C5.62 13.49 5.49 12.76 5.49 12C5.49 11.24 5.62 10.51 5.84 9.85V7H2.15C1.38 8.54 0.94 10.22 0.94 12C0.94 13.78 1.38 15.46 2.15 17L5.84 14.15Z" fill="#FBBC05"/>
                  <path d="M12 5.34C13.62 5.34 15.08 5.9 16.22 6.99L19.35 3.86C17.45 2.09 14.97 1 12 1C7.74 1 4.01 3.31 2.15 7L5.84 9.85C6.71 7.27 9.14 5.34 12 5.34Z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}
        </form>

        {!isRecovery && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '1.5rem' }}>
            {(isForgotPassword || isMagicLink) ? (
              <button className="auth-link" onClick={() => { setIsForgotPassword(false); setIsMagicLink(false); setIsLogin(true); }}>
                Back to Sign In
              </button>
            ) : (
              <>
                {isLogin && (
                  <button className="auth-link" onClick={() => { setIsMagicLink(true); setIsForgotPassword(false); }}>
                    Sign in with Magic Link (Passwordless)
                  </button>
                )}
                <button className="auth-link" onClick={() => { setIsLogin(!isLogin); setPassword(''); setConfirmPassword(''); }}>
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
