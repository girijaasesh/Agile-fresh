'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

// ─── Styles ───────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #0B1629; }

  @keyframes fadeUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: linear-gradient(135deg, #0B1629 0%, #162240 50%, #0D1F3C 100%);
    position: relative;
    overflow: hidden;
  }

  .auth-page::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%);
    top: -200px; right: -200px;
    pointer-events: none;
  }

  .auth-card {
    background: #FFFFFF;
    border-radius: 20px;
    padding: 40px;
    width: 100%;
    max-width: 440px;
    animation: fadeUp 0.5s ease;
    position: relative;
    z-index: 1;
  }

  .auth-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 28px;
    text-decoration: none;
  }

  .auth-logo-mark {
    width: 38px; height: 38px;
    background: linear-gradient(135deg, #C9A84C, #E8C97A);
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 15px; color: #0B1629;
    flex-shrink: 0;
  }

  .auth-logo-text {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    color: #0B1629;
    font-weight: 600;
  }

  .auth-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    color: #0B1629;
    margin-bottom: 6px;
    line-height: 1.2;
  }

  .auth-sub {
    font-size: 14px;
    color: #64748B;
    margin-bottom: 28px;
    line-height: 1.5;
  }

  .google-btn {
    width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    padding: 12px 20px;
    border: 1.5px solid #E2E8F0;
    border-radius: 9px;
    background: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    color: #0B1629;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 20px;
  }

  .google-btn:hover:not(:disabled) {
    border-color: #C9A84C;
    background: #FAFAF7;
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  }

  .google-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .divider {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 20px;
  }

  .divider::before, .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #E2E8F0;
  }

  .divider span {
    font-size: 12px;
    font-weight: 600;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .form-group { margin-bottom: 16px; }

  .form-label {
    display: block;
    font-size: 13px; font-weight: 600;
    color: #0B1629;
    margin-bottom: 6px;
  }

  .form-input {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid #E2E8F0;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #0B1629;
    background: white;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
  }

  .form-input:focus {
    border-color: #C9A84C;
    box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
  }

  .form-input::placeholder { color: #CBD5E1; }

  .error-box {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #991B1B;
    margin-bottom: 16px;
    display: flex; align-items: flex-start; gap: 8px;
  }

  .submit-btn {
    width: 100%;
    padding: 13px;
    background: #C9A84C;
    color: #0B1629;
    border: none;
    border-radius: 9px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-top: 4px;
  }

  .submit-btn:hover:not(:disabled) {
    background: #E8C97A;
    box-shadow: 0 8px 24px rgba(201,168,76,0.3);
    transform: translateY(-1px);
  }

  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .toggle-row {
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    color: #64748B;
  }

  .toggle-btn {
    background: none; border: none;
    color: #C9A84C; font-weight: 700; font-size: 14px;
    cursor: pointer; padding: 0;
    font-family: 'DM Sans', sans-serif;
    text-decoration: underline;
  }

  .toggle-btn:hover { color: #E8C97A; }

  .back-link {
    display: block;
    text-align: center;
    margin-top: 16px;
    font-size: 13px;
    color: #94A3B8;
    text-decoration: none;
    transition: color 0.2s;
  }

  .back-link:hover { color: #64748B; }

  .spinner {
    width: 20px; height: 20px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
    vertical-align: middle;
  }

  .spinner-page {
    width: 40px; height: 40px;
    border: 3px solid rgba(201,168,76,0.3);
    border-top-color: #C9A84C;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  .success-banner {
    background: #D1FAE5;
    border: 1px solid #6EE7B7;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #065F46;
    margin-bottom: 16px;
  }
`;

// ─── Google SVG Icon ───────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// ─── Main Auth Form ────────────────────────────────────────────────────────────

function AuthForm() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/quick-register';
  const oauthError  = searchParams.get('error');

  const ERROR_MESSAGES = {
    OAuthSignin:       'Google sign-in is not configured on the server. Please contact support or use email/password.',
    OAuthCallback:     'Google sign-in failed. Please try again or use email/password.',
    OAuthCreateAccount:'Could not create account via Google. Please try email/password.',
    AccessDenied:      'Access was denied. Please try a different account.',
    Configuration:     'Server configuration error. Please contact support.',
    Default:           'An unexpected error occurred. Please try again.',
  };

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(oauthError ? (ERROR_MESSAGES[oauthError] || ERROR_MESSAGES.Default) : '');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="auth-page">
        <div className="spinner-page" />
      </div>
    );
  }

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
    setForm({ name: '', email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Create account first
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Signup failed. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Sign in (both login and post-signup)
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          mode === 'login'
            ? 'Invalid email or password.'
            : 'Account created! But login failed — please sign in manually.'
        );
      } else {
        router.replace(callbackUrl);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn('google', { callbackUrl });
  };

  const isLoading = loading || googleLoading;

  return (
    <div className="auth-page">
      <style>{css}</style>
      <div className="auth-card">

        {/* Logo */}
        <a href="/" className="auth-logo">
          <div className="auth-logo-mark">AE</div>
          <span className="auth-logo-text">AgileEdge</span>
        </a>

        {/* Heading */}
        <h1 className="auth-title">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="auth-sub">
          {mode === 'login'
            ? 'Sign in to access your SAFe training portal'
            : 'Start your SAFe certification journey today'}
        </p>

        {/* Google SSO */}
        <button
          className="google-btn"
          onClick={handleGoogle}
          disabled={isLoading}
          type="button"
        >
          {googleLoading ? <span className="spinner" /> : <GoogleIcon />}
          Continue with Google
        </button>

        {/* Divider */}
        <div className="divider"><span>or</span></div>

        {/* Success message */}
        {successMsg && <div className="success-banner">{successMsg}</div>}

        {/* Email/password form */}
        <form onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Smith"
                required
                autoComplete="name"
                autoFocus
                disabled={isLoading}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              value={form.email}
              onChange={handleChange}
              placeholder="jane@company.com"
              required
              autoComplete="email"
              autoFocus={mode === 'login'}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              value={form.password}
              onChange={handleChange}
              placeholder={mode === 'signup' ? 'Minimum 8 characters' : '••••••••'}
              required
              minLength={mode === 'signup' ? 8 : 1}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              disabled={isLoading}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="error-box" role="alert">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {loading ? <span className="spinner" /> : (mode === 'login' ? 'Sign In →' : 'Create Account →')}
          </button>
        </form>

        {/* Toggle login/signup */}
        <p className="toggle-row">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            className="toggle-btn"
            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            type="button"
            disabled={isLoading}
          >
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>

        <a href="/" className="back-link">← Back to AgileEdge</a>
      </div>
    </div>
  );
}

// ─── Page export (Suspense required for useSearchParams in Next.js 14) ────────

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0B1629', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(201,168,76,0.3)', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
