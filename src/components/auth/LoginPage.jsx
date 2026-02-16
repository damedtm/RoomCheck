// src/components/auth/LoginPage.jsx
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
  const { login, completePasswordChange, forgotPassword, confirmPasswordReset, isAuthenticated, userRole, requiresPasswordChange } = useAuth();

  // Login state
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [loginError, setLoginError]     = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Password change state
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeError, setChangeError]         = useState('');
  const [changeLoading, setChangeLoading]     = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail]               = useState('');
  const [forgotLoading, setForgotLoading]           = useState(false);
  const [forgotError, setForgotError]               = useState('');
  const [codeSent, setCodeSent]                     = useState(false);
  
  // Rate limiting for forgot password
  const [resetAttempts, setResetAttempts]   = useState(0);
  const [resetCooldown, setResetCooldown]   = useState(false);
  const [cooldownTimer, setCooldownTimer]   = useState(0);
  
  // Password reset confirmation state
  const [verificationCode, setVerificationCode]     = useState('');
  const [resetPassword, setResetPassword]           = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword]   = useState(false);
  const [showResetConfirm, setShowResetConfirm]     = useState(false);
  const [resetLoading, setResetLoading]             = useState(false);
  const [resetSuccess, setResetSuccess]             = useState(false);

  // Already authenticated — send to dashboard, replace so back can't return to login
  useEffect(() => {
    if (isAuthenticated && userRole && !requiresPasswordChange) {
      navigate(userRole === 'admin' ? '/admin' : '/ra', { replace: true });
    }
  }, [isAuthenticated, userRole, requiresPasswordChange, navigate]);

  // Cooldown timer countdown
  useEffect(() => {
    if (cooldownTimer > 0) {
      const timer = setTimeout(() => {
        setCooldownTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (cooldownTimer === 0 && resetCooldown) {
      setResetCooldown(false);
    }
  }, [cooldownTimer, resetCooldown]);

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
      if (err.code === 'NotAuthorizedException') {
        setLoginError('Incorrect email or password.');
      } else if (err.code === 'UserNotFoundException') {
        setLoginError('No account found with this email. Please contact your administrator.');
      } else if (err.code === 'UserNotConfirmedException') {
        setLoginError('Account not activated. Please contact your administrator.');
      } else if (err.code === 'PasswordResetRequiredException') {
        setLoginError('Password reset required. Please use "Forgot password" below.');
      } else {
        setLoginError(err.message || 'Sign in failed. Please try again.');
      }
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    
    // Validation
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    // Rate limiting check
    if (resetCooldown) {
      setForgotError(`Please wait ${cooldownTimer} seconds before requesting another code.`);
      return;
    }

    // Check attempt limit
    if (resetAttempts >= 3) {
      setForgotError('Too many attempts. Please try again in 5 minutes.');
      setResetCooldown(true);
      setCooldownTimer(300); // 5 minutes
      setTimeout(() => {
        setResetAttempts(0);
        setResetCooldown(false);
        setCooldownTimer(0);
      }, 300000);
      return;
    }

    setForgotLoading(true);
    try {
      await forgotPassword(forgotEmail);
      
      
      setCodeSent(true);
      setResetAttempts(prev => prev + 1);
      
     
    } catch (err) {
      if (err.code === 'LimitExceededException') {
        setForgotError('Too many reset attempts. Please try again later.');
        setResetCooldown(true);
        setCooldownTimer(300);
      } else if (err.code === 'InvalidParameterException') {
        setForgotError('Unable to process password reset. Please contact your administrator.');
      } else {
        setForgotError(err.message || 'Failed to send reset code. Please try again.');
      }
      
      // Increment attempts even on failure to prevent spam
      setResetAttempts(prev => prev + 1);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleConfirmPasswordReset = async (e) => {
    e.preventDefault();
    setForgotError('');

    // Validation
    if (!verificationCode || verificationCode.length !== 6) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }

    const resetReqsMet = passwordRequirements.every(r => r.test(resetPassword));
    if (!resetReqsMet) {
      setForgotError('Password does not meet the requirements.');
      return;
    }

    if (resetPassword !== resetConfirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setResetLoading(true);
    try {
      await confirmPasswordReset(forgotEmail, verificationCode, resetPassword);
      setResetSuccess(true);
      setResetAttempts(0);
    } catch (err) {
      if (err.code === 'CodeMismatchException') {
        setForgotError('Invalid verification code. Please check and try again.');
        setResetAttempts(prev => prev + 1);
      } else if (err.code === 'ExpiredCodeException') {
        setForgotError('Verification code has expired. Please request a new one.');
      } else if (err.code === 'InvalidPasswordException') {
        setForgotError('Password does not meet the requirements.');
      } else if (err.code === 'LimitExceededException') {
        setForgotError('Too many attempts. Please try again later.');
        setResetCooldown(true);
        setCooldownTimer(300);
      } else if (err.code === 'UserNotFoundException') {
        setForgotError('Account not found. Please contact your administrator.');
      } else {
        setForgotError(err.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  // Helper function to reset all forgot password state
  const resetForgotPasswordState = () => {
    setShowForgotPassword(false);
    setResetSuccess(false);
    setCodeSent(false);
    setForgotEmail('');
    setForgotError('');
    setVerificationCode('');
    setResetPassword('');
    setResetConfirmPassword('');
    setLoginError(''); 
  };

  // ── FORGOT PASSWORD SCREEN ───────────────────────────────────────────────
  if (showForgotPassword) {

    if (resetSuccess) {
      return (
        <div className="lp-bg">
          <div className="lp-card">
            <div className="lp-logo">
              <span className="lp-logo-mark">RC</span>
              <span className="lp-logo-name">RoomCheck</span>
            </div>
            <div className="lp-divider" />
            <h2 className="lp-heading">Password reset successful</h2>
            <div className="lp-success">
              <p style={{ marginBottom: '12px', fontWeight: 500 }}>
                ✓ Your password has been reset!
              </p>
              <p style={{ fontSize: '13px', lineHeight: '1.5', marginBottom: '20px' }}>
                You can now sign in with your new password.
              </p>
              <button 
                onClick={resetForgotPasswordState}
                className="lp-btn lp-btn-active"
              >
                Return to sign in
              </button>
            </div>
          </div>
        </div>
      );
    }

   
    if (codeSent) {
      const resetReqsMet = passwordRequirements.every(r => r.test(resetPassword));
      const resetPasswordsMatch = resetPassword === resetConfirmPassword && resetConfirmPassword.length > 0;
      const canSubmitReset = verificationCode.length === 6 && resetReqsMet && resetPasswordsMatch && !resetLoading;

      return (
        <div className="lp-bg">
          <div className="lp-card">
            <div className="lp-logo">
              <span className="lp-logo-mark">RC</span>
              <span className="lp-logo-name">RoomCheck</span>
            </div>
            <div className="lp-divider" />
            <h2 className="lp-heading">Enter verification code</h2>
            <p className="lp-subheading">
              We sent a 6-digit code to {forgotEmail}. Enter it below along with your new password.
            </p>

            <form onSubmit={handleConfirmPasswordReset} className="lp-form" noValidate>
              {forgotError && <div className="lp-error">{forgotError}</div>}

              <div className="lp-field">
                <label className="lp-label" htmlFor="verificationCode">Verification code</label>
                <input 
                  id="verificationCode" 
                  type="text" 
                  className="lp-input" 
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                  placeholder="000000"
                  maxLength="6"
                  required 
                  disabled={resetLoading} 
                  autoFocus 
                  autoComplete="off"
                  style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '18px' }}
                />
              </div>

              <div className="lp-field">
                <label className="lp-label" htmlFor="resetPassword">New password</label>
                <div className="lp-input-wrap">
                  <input 
                    id="resetPassword" 
                    type={showResetPassword ? 'text' : 'password'} 
                    className="lp-input"
                    value={resetPassword} 
                    onChange={e => setResetPassword(e.target.value)}
                    placeholder="Enter new password" 
                    disabled={resetLoading}
                    autoComplete="new-password" 
                  />
                  <button type="button" className="lp-eye" onClick={() => setShowResetPassword(v => !v)}
                    aria-label={showResetPassword ? 'Hide password' : 'Show password'}>
                    <EyeIcon visible={showResetPassword} />
                  </button>
                </div>
              </div>

              {resetPassword.length > 0 && (
                <ul className="lp-reqs">
                  {passwordRequirements.map((req, i) => {
                    const met = req.test(resetPassword);
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
                <label className="lp-label" htmlFor="resetConfirmPassword">Confirm password</label>
                <div className="lp-input-wrap">
                  <input 
                    id="resetConfirmPassword" 
                    type={showResetConfirm ? 'text' : 'password'}
                    className={`lp-input ${resetConfirmPassword && !resetPasswordsMatch ? 'lp-input-error' : ''}`}
                    value={resetConfirmPassword} 
                    onChange={e => setResetConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password" 
                    disabled={resetLoading}
                    autoComplete="new-password" 
                  />
                  <button type="button" className="lp-eye" onClick={() => setShowResetConfirm(v => !v)}
                    aria-label={showResetConfirm ? 'Hide password' : 'Show password'}>
                    <EyeIcon visible={showResetConfirm} />
                  </button>
                </div>
                {resetConfirmPassword && !resetPasswordsMatch && (
                  <p className="lp-field-error">Passwords do not match</p>
                )}
              </div>

              <button 
                type="submit"
                className={`lp-btn ${canSubmitReset ? 'lp-btn-active' : 'lp-btn-disabled'}`}
                disabled={!canSubmitReset}
              >
                {resetLoading ? <span className="lp-spinner" /> : 'Reset password'}
              </button>

              <button 
                type="button"
                onClick={() => {
                  setCodeSent(false);
                  setForgotError('');
                  setVerificationCode('');
                  setResetPassword('');
                  setResetConfirmPassword('');
                  
                }}
                className="lp-link-btn"
                disabled={resetLoading}
              >
                ← Didn't receive code? Try again
              </button>
            </form>
          </div>
        </div>
      );
    }

   
    return (
      <div className="lp-bg">
        <div className="lp-card">
          <div className="lp-logo">
            <span className="lp-logo-mark">RC</span>
            <span className="lp-logo-name">RoomCheck</span>
          </div>
          <div className="lp-divider" />
          <h2 className="lp-heading">Reset your password</h2>
          <p className="lp-subheading">
            Enter your email address and we'll send you a verification code.
          </p>

          <form onSubmit={handleForgotPassword} className="lp-form" noValidate>
            {forgotError && <div className="lp-error">{forgotError}</div>}

            <div className="lp-field">
              <label className="lp-label" htmlFor="forgotEmail">Email address</label>
              <input 
                id="forgotEmail" 
                type="email" 
                className="lp-input" 
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)} 
                placeholder="you@example.com"
                required 
                disabled={forgotLoading || resetCooldown} 
                autoFocus 
                autoComplete="email" 
              />
            </div>

            {resetCooldown && cooldownTimer > 0 && (
              <p style={{ fontSize: '13px', color: '#5f6368', marginTop: '-10px' }}>
                Please wait {cooldownTimer} seconds before requesting another code.
              </p>
            )}

            <button 
              type="submit"
              className={`lp-btn ${(!forgotLoading && !resetCooldown) ? 'lp-btn-active' : 'lp-btn-disabled'}`}
              disabled={forgotLoading || resetCooldown}
            >
              {forgotLoading ? <span className="lp-spinner" /> : 'Send verification code'}
            </button>

            <button 
              type="button"
              onClick={resetForgotPasswordState}
              className="lp-link-btn"
              disabled={forgotLoading}
            >
              ← Back to sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

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
            <div className="lp-input-wrap">
              <input id="password" type={showPassword ? 'text' : 'password'} className="lp-input" 
                value={password} onChange={e => setPassword(e.target.value)} 
                placeholder="Enter your password" required disabled={loginLoading} 
                autoComplete="current-password" />
              <button type="button" className="lp-eye" onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}>
                <EyeIcon visible={showPassword} />
              </button>
            </div>
          </div>

          <button type="submit"
            className={`lp-btn ${!loginLoading ? 'lp-btn-active' : 'lp-btn-disabled'}`}
            disabled={loginLoading}>
            {loginLoading ? <span className="lp-spinner" /> : 'Sign in'}
          </button>

          <button 
            type="button"
            onClick={() => {
              setShowForgotPassword(true);
              setLoginError(''); 
            }}
            className="lp-link-btn"
            disabled={loginLoading}
          >
            Forgot password?
          </button>
        </form>

        <p className="lp-footer">Having trouble? Contact your system administrator.</p>
      </div>
    </div>
  );
}
