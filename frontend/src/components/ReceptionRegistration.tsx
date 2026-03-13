import React, { useState } from 'react';
import clinicoLogo from '../assets/Clinico-removebg-preview.png';
import { User, ArrowRight, LogOut, CheckCircle2, ClipboardList } from 'lucide-react';
import { updateUserProfile } from '../api/users';

interface Props { onComplete: () => void; onLogout: () => void; }

const ReceptionRegistration: React.FC<Props> = ({ onComplete, onLogout }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name.'); return; }
    setError('');
    setLoading(true);
    try {
      await updateUserProfile(name.trim());
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pg}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');`}</style>
      <div style={hdr}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={clinicoLogo} alt="Clinico" style={logoS} />
          <span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: -0.5 }}>Clinico</span>
        </div>
        <button style={logoutBtn} onClick={onLogout}><LogOut size={16} /> Sign Out</button>
      </div>

      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={iconCircle}><ClipboardList size={32} color="#2563EB" /></div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', margin: '16px 0 8px' }}>Welcome, Receptionist!</h2>
          <p style={{ color: '#64748b', fontSize: 15 }}>Let's get your account set up quickly.</p>
        </div>

        {error && <div style={errBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={lbl}>Your Full Name</label>
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <span style={iconWrap}><User size={18} color="#94a3b8" /></span>
            <input style={inp} placeholder="Alex Johnson" required value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <button type="submit" style={pBtn} disabled={loading}>
            {loading ? 'Setting up…' : 'Start Working'} <ArrowRight size={18} />
          </button>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 16 }}>You can update your name anytime from your profile.</p>
        </form>
      </div>
    </div>
  );
};

const P = '#2563EB';
const pg: React.CSSProperties = { minHeight: '100vh', background: 'radial-gradient(circle at top,#fff 0%,#f0f9ff 100%)', fontFamily: "'Outfit',sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px 40px' };
const hdr: React.CSSProperties = { width: '100%', maxWidth: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0' };
const logoS: React.CSSProperties = { height: 36, background: 'white', borderRadius: '50%', padding: 6, boxShadow: '0 2px 8px rgba(37,99,235,0.15)' };
const logoutBtn: React.CSSProperties = { background: 'none', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748b', fontFamily: 'inherit' };
const card: React.CSSProperties = { background: 'white', borderRadius: 24, boxShadow: '0 20px 50px rgba(37,99,235,0.1)', padding: 40, width: '100%', maxWidth: 480, marginTop: 20 };
const iconCircle: React.CSSProperties = { width: 72, height: 72, borderRadius: '50%', background: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' };
const errBox: React.CSSProperties = { background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', color: '#ef4444', padding: '11px 15px', borderRadius: 11, fontSize: 13, marginBottom: 16 };
const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 8 };
const iconWrap: React.CSSProperties = { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' };
const inp: React.CSSProperties = { width: '100%', padding: '14px 14px 14px 46px', border: '2px solid #e2e8f0', borderRadius: 13, fontFamily: 'inherit', fontSize: 15, color: '#0f172a', background: '#f8fafc', boxSizing: 'border-box', outline: 'none' };
const pBtn: React.CSSProperties = { width: '100%', padding: '15px', background: `linear-gradient(135deg,${P} 0%,#1d4ed8 100%)`, color: 'white', border: 'none', borderRadius: 13, fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 18px -6px rgba(37,99,235,0.4)' };

export default ReceptionRegistration;
