import React, { useState } from 'react';
import clinicoLogo from '../assets/Clinico-removebg-preview.png';
import { Stethoscope, ClipboardList, HeartPulse, ArrowRight, Activity, Phone, KeyRound } from 'lucide-react';
import { requestOtp, verifyOtp } from '../api/auth';
import { setToken } from '../api/client';

type Role = 'patient' | 'doctor' | 'receptionist';
type Step = 'phone' | 'otp';

export interface LoginMeta {
  role: 'patient' | 'doctor' | 'receptionist';
  isNewUser: boolean;
}

interface AuthPageProps {
  onLogin: (meta: LoginMeta) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [role, setRole] = useState<Role>('patient');
  const [step, setStep] = useState<Step>('phone');
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const switchRole = (newRole: Role) => {
    if (newRole === role) return;
    setIsAnimating(true);
    setTimeout(() => { setRole(newRole); setIsAnimating(false); }, 300);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone.trim()) { setError('Please enter your phone number.'); return; }
    setLoading(true);
    try {
      await requestOtp(phone.trim());
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) { setError('Please enter the OTP.'); return; }
    setLoading(true);
    try {
      const res = await verifyOtp(phone.trim(), otp.trim());
      setToken(res.token);
      const userRole = (
        res.user.role
          ? res.user.role.toLowerCase()
          : res.isNewUser
            ? role
            : 'patient'
      ) as LoginMeta['role'];
      onLogin({ role: userRole, isNewUser: res.isNewUser });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        :root { --primary:#2563EB; --primary-light:#60A5FA; --primary-dark:#1E3A8A; --text-main:#0f172a; --text-muted:#64748b; --border:#e2e8f0; --danger:#ef4444; }
        .auth-container { min-height:100vh; width:100vw; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle at top left,#ffffff 0%,#edf4ff 100%); font-family:'Outfit',sans-serif; padding:40px 20px; box-sizing:border-box; position:relative; overflow:hidden; }
        .bg-blob { position:fixed; border-radius:50%; pointer-events:none; z-index:0; }
        .bg-blob-1 { top:-10%; right:-5%; width:600px; height:600px; background:radial-gradient(circle,rgba(96,165,250,0.15) 0%,transparent 70%); animation:floatSlow 10s infinite alternate ease-in-out; }
        .bg-blob-2 { bottom:-20%; left:-10%; width:800px; height:800px; background:radial-gradient(circle,rgba(37,99,235,0.1) 0%,transparent 70%); animation:floatSlow 15s infinite alternate-reverse ease-in-out; }
        @keyframes floatSlow { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(30px,-40px) scale(1.05)} }
        .auth-card { background:rgba(255,255,255,0.9); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.5); border-radius:24px; box-shadow:0 25px 50px -12px rgba(37,99,235,0.15); width:100%; max-width:1100px; display:flex; overflow:hidden; z-index:10; opacity:0; transform:translateY(20px); animation:fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes fadeUp { to { opacity:1; transform:translateY(0); } }
        .auth-brand { flex:1; background:linear-gradient(135deg,var(--primary-dark) 0%,var(--primary) 100%); padding:60px 40px; display:none; flex-direction:column; justify-content:space-between; color:white; position:relative; overflow:hidden; }
        @media(min-width:900px){ .auth-brand { display:flex; } }
        .brand-logo-row { display:flex; align-items:center; gap:16px; z-index:2; }
        .brand-logo-img { width:56px; height:auto; background:white; border-radius:50%; padding:8px; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.2)); }
        .brand-name { font-size:30px; font-weight:800; letter-spacing:-0.5px; }
        .brand-tagline { font-size:46px; font-weight:700; line-height:1.1; margin-bottom:24px; z-index:2; }
        .brand-sub { font-size:17px; font-weight:300; opacity:0.9; line-height:1.6; max-width:380px; z-index:2; }
        .brand-wave { position:absolute; bottom:-80px; right:-80px; width:450px; height:450px; opacity:0.1; animation:pulseSlow 8s infinite alternate; }
        @keyframes pulseSlow { 0%{transform:scale(1);opacity:0.1} 100%{transform:scale(1.1);opacity:0.15} }
        .auth-form { flex:1.2; padding:40px 72px; display:flex; flex-direction:column; justify-content:center; background:white; transition:opacity 0.3s,transform 0.3s; }
        @media(max-width:768px){ .auth-form { padding:30px 24px; } }
        .auth-form.animating { opacity:0; transform:translateY(-5px); }
        .mobile-logo { display:flex; justify-content:center; margin-bottom:36px; }
        @media(min-width:900px){ .mobile-logo { display:none; } }
        .role-bar { display:flex; background:#f8fafc; border-radius:16px; padding:6px; margin-bottom:24px; gap:4px; border:1px solid var(--border); }
        .role-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:7px; padding:11px 0; border-radius:12px; border:none; background:transparent; color:var(--text-muted); font-family:inherit; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.3s; }
        .role-btn:hover { color:var(--primary); }
        .role-btn.active { background:white; color:var(--primary); box-shadow:0 4px 12px rgba(0,0,0,0.05); }
        .step-dots { display:flex; gap:6px; margin-bottom:28px; }
        .step-dot { height:4px; flex:1; border-radius:2px; background:var(--border); transition:background 0.3s; }
        .step-dot.done,.step-dot.active { background:var(--primary); }
        .step-dot.active { opacity:0.55; }
        .form-head { margin-bottom:26px; }
        .form-title { font-size:30px; font-weight:700; color:var(--text-main); margin:0 0 8px; letter-spacing:-0.5px; }
        .form-subtitle { color:var(--text-muted); font-size:14px; line-height:1.5; margin:0; }
        .input-group { margin-bottom:16px; }
        .input-label { display:block; font-size:13px; font-weight:600; color:var(--text-main); margin-bottom:8px; }
        .input-wrap { position:relative; display:flex; align-items:center; }
        .input-icon { position:absolute; left:15px; color:var(--text-muted); pointer-events:none; }
        .form-input { width:100%; padding:15px 15px 15px 46px; border:2px solid var(--border); border-radius:13px; font-family:inherit; font-size:15px; color:var(--text-main); background:#f8fafc; transition:all 0.3s; box-sizing:border-box; }
        .form-input:focus { outline:none; border-color:var(--primary-light); background:white; box-shadow:0 0 0 4px rgba(96,165,250,0.1); }
        .error-box { background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.3); color:var(--danger); padding:11px 15px; border-radius:11px; font-size:13px; font-weight:500; margin-bottom:14px; }
        .submit-btn { width:100%; padding:17px; background:linear-gradient(135deg,var(--primary) 0%,#1d4ed8 100%); color:white; border:none; border-radius:13px; font-family:inherit; font-size:15px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; transition:all 0.3s; box-shadow:0 10px 20px -10px rgba(37,99,235,0.5); margin-top:6px; }
        .submit-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 15px 25px -10px rgba(37,99,235,0.6); }
        .submit-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .back-link { text-align:center; margin-top:18px; font-size:13px; color:var(--text-muted); }
        .back-link span { color:var(--primary); font-weight:700; cursor:pointer; }
        .back-link span:hover { text-decoration:underline; }
      `}</style>

      <div className="bg-blob bg-blob-1" /><div className="bg-blob bg-blob-2" />

      <div className="auth-card">
        {/* Brand panel */}
        <div className="auth-brand">
          <div className="brand-logo-row">
            <img src={clinicoLogo} alt="Clinico" className="brand-logo-img" />
            <span className="brand-name">Clinico</span>
          </div>
          <div>
            <h1 className="brand-tagline">Your Health,<br />Our Priority.</h1>
            <p className="brand-sub">Next-generation healthcare management. Secure, intuitive, made for everyone.</p>
          </div>
          <Activity className="brand-wave" />
        </div>

        {/* Form panel */}
        <div className={`auth-form ${isAnimating ? 'animating' : ''}`}>
          <div className="mobile-logo">
            <img src={clinicoLogo} alt="Clinico" style={{ width: 72, background: 'white', borderRadius: '50%', padding: 8, boxShadow: '0 4px 12px rgba(37,99,235,0.15)' }} />
          </div>

          {step === 'phone' && (
            <div className="role-bar">
              {(['patient', 'doctor', 'receptionist'] as Role[]).map(r => (
                <button key={r} type="button" className={`role-btn ${role === r ? 'active' : ''}`} onClick={() => switchRole(r)}>
                  {r === 'patient' && <HeartPulse size={16} />}
                  {r === 'doctor' && <Stethoscope size={16} />}
                  {r === 'receptionist' && <ClipboardList size={16} />}
                  {r.charAt(0).toUpperCase() + r.slice(1, r === 'receptionist' ? 9 : undefined)}
                </button>
              ))}
            </div>
          )}

          <div className="step-dots">
            <div className={`step-dot ${step === 'phone' ? 'active' : 'done'}`} />
            <div className={`step-dot ${step === 'otp' ? 'active' : ''}`} />
          </div>

          <div className="form-head">
            <h2 className="form-title">{step === 'phone' ? 'Sign in to Clinico' : 'Enter your OTP'}</h2>
            <p className="form-subtitle">
              {step === 'phone'
                ? "Enter your phone number to receive a one-time verification code."
                : `We sent a 6-digit code to ${phone}. Enter it below.`}
            </p>
          </div>

          {error && <div className="error-box">{error}</div>}

          {step === 'phone' && (
            <form onSubmit={handleRequestOtp}>
              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <div className="input-wrap">
                  <Phone size={18} className="input-icon" />
                  <input type="tel" className="form-input" placeholder="9876543210" required value={phone} onChange={e => setPhone(e.target.value)} autoFocus />
                </div>
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Sending…' : 'Send OTP'} <ArrowRight size={19} />
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp}>
              <div className="input-group">
                <label className="input-label">One-Time Password</label>
                <div className="input-wrap">
                  <KeyRound size={18} className="input-icon" />
                  <input type="text" className="form-input" placeholder="123456" required maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} autoFocus />
                </div>
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify & Sign In'} <ArrowRight size={19} />
              </button>
              <div className="back-link">Wrong number? <span onClick={() => { setStep('phone'); setOtp(''); setError(''); }}>Change it</span></div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
