// src/pages/LoginPage/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';

const EyeIcon = ({ visible }) => (
  visible ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const passwordRequirements = [
  { test: (p) => p.length >= 8,        label: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p),      label: 'One uppercase letter' },
  { test: (p) => /[a-z]/.test(p),      label: 'One lowercase letter' },
  { test: (p) => /[0-9]/.test(p),      label: 'One number' },
  { test: (p) => /[!@#$%^&*]/.test(p), label: 'One special character (!@#$%^&*)' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, completePasswordChange, isAuthenticated, userRole, requiresPasswordChange } = useAuth();

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [loginError, setLoginError]     = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeError, setChangeError]         = useState('');
  const [changeLoading, setChangeLoading]     = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);

  // Already authenticated — send to dashboard, replace so back can't return to login
  useEffect(() => {
    if (isAuthenticated && userRole && !requiresPasswordChange) {
      navigate(userRole === 'admin' ? '/admin' : '/ra', { replace: true });
    }
  }, [isAuthenticated, userRole, requiresPasswordChange, navigate]);

  const allReqsMet     = passwordRequirements.every(r => r.test(newPassword));
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit      = allReqsMet && passwordsMatch && !changeLoading;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const result = await login(email, password);
      if (result.requiresPasswordChange) return;
      navigate(result.role === 'admin' ? '/admin' : '/ra', { replace: true });
    } catch (err) {
      if (err.code === 'NotAuthorizedException')     setLoginError('Incorrect email or password.');
      else if (err.code === 'UserNotFoundException') setLoginError('No account found with this email.');
      else setLoginError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChangeError('');
    if (!canSubmit) return;
    setChangeLoading(true);
    try {
      const result = await completePasswordChange(newPassword);
      navigate(result.role === 'admin' ? '/admin' : '/ra', { replace: true });
    } catch (err) {
      if (err.message?.includes('Password does not conform')) {
        setChangeError('Password does not meet the requirements.');
      } else if (err.message?.includes('expired') || err.message?.includes('Invalid session')) {
        setChangeError('Session expired. Please sign in again.');
      } else {
        setChangeError(err.message || 'Failed to set password. Please try again.');
      }
    } finally {
      setChangeLoading(false);
    }
  };

  // ── CHANGE PASSWORD SCREEN ───────────────────────────────────────────────
  if (requiresPasswordChange) {
    return (
      <div className="lp-bg">
        <div className="lp-card">
          <div className="lp-logo">
            <span className="lp-logo-mark">RC</span>
            <span className="lp-logo-name">RoomCheck</span>
          </div>
          <div className="lp-divider" />
          <h2 className="lp-heading">Create your password</h2>
          <p className="lp-subheading">
            Your identity has been verified. Choose a permanent password to activate your account.
          </p>
          <form onSubmit={handlePasswordChange} className="lp-form" noValidate>
            {changeError && <div className="lp-error">{changeError}</div>}

            <div className="lp-field">
              <label className="lp-label" htmlFor="newPw">New password</label>
              <div className="lp-input-wrap">
                <input id="newPw" type={showNew ? 'text' : 'password'} className="lp-input"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password" disabled={changeLoading}
                  autoFocus autoComplete="new-password" />
                <button type="button" className="lp-eye" onClick={() => setShowNew(v => !v)}
                  aria-label={showNew ? 'Hide password' : 'Show password'}>
                  <EyeIcon visible={showNew} />
                </button>
              </div>
            </div>

            {newPassword.length > 0 && (
              <ul className="lp-reqs">
                {passwordRequirements.map((req, i) => {
                  const met = req.test(newPassword);
                  return (
                    <li key={i} className={`lp-req ${met ? 'met' : ''}`}>
                      <span className="lp-req-icon">
                        {met ? <CheckIcon /> : <span className="lp-req-dot" />}
                      </span>
                      {req.label}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="lp-field">
              <label className="lp-label" htmlFor="confirmPw">Confirm password</label>
              <div className="lp-input-wrap">
                <input id="confirmPw" type={showConfirm ? 'text' : 'password'}
                  className={`lp-input ${confirmPassword && !passwordsMatch ? 'lp-input-error' : ''}`}
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password" disabled={changeLoading}
                  autoComplete="new-password" />
                <button type="button" className="lp-eye" onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                  <EyeIcon visible={showConfirm} />
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="lp-field-error">Passwords do not match</p>
              )}
            </div>

            <button type="submit"
              className={`lp-btn ${canSubmit ? 'lp-btn-active' : 'lp-btn-disabled'}`}
              disabled={!canSubmit}>
              {changeLoading ? <span className="lp-spinner" /> : 'Set password and continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── SIGN IN SCREEN ───────────────────────────────────────────────────────
  return (
    <div className="lp-bg">
      <div className="lp-card">
        <div className="lp-logo">
          <span className="lp-logo-mark">RC</span>
          <span className="lp-logo-name">RoomCheck</span>
        </div>
        <div className="lp-divider" />
        <h2 className="lp-heading">Sign in</h2>
        <p className="lp-subheading">Room Inspection Management System</p>

        <form onSubmit={handleLogin} className="lp-form" noValidate>
          {loginError && <div className="lp-error">{loginError}</div>}

          <div className="lp-field">
            <label className="lp-label" htmlFor="email">Email address</label>
            <input id="email" type="email" className="lp-input" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              required disabled={loginLoading} autoFocus autoComplete="email" />
          </div>

          <div className="lp-field">
            <label className="lp-label" htmlFor="password">Password</label>
            <input id="password" type="password" className="lp-input" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="Enter your password"
              required disabled={loginLoading} autoComplete="current-password" />
          </div>

          <button type="submit"
            className={`lp-btn ${!loginLoading ? 'lp-btn-active' : 'lp-btn-disabled'}`}
            disabled={loginLoading}>
            {loginLoading ? <span className="lp-spinner" /> : 'Sign in'}
          </button>
        </form>

        <p className="lp-footer">Having trouble? Contact your system administrator.</p>
      </div>
    </div>
  );
}
