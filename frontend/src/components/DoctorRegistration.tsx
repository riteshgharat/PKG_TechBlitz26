import React, { useState } from 'react';
import clinicoLogo from '../assets/Clinico-removebg-preview.png';
import { Stethoscope, Briefcase, BookOpen, ArrowRight, ArrowLeft, LogOut, CheckCircle2 } from 'lucide-react';
import { saveMyDoctorProfile } from '../api/doctors';
import { updateUserProfile } from '../api/users';

interface Props { onComplete: () => void; onLogout: () => void; }
type Step = 1 | 2 | 3;

const SPECIALIZATIONS = ['General Physician', 'Cardiologist', 'Dermatologist', 'Orthopedist', 'Pediatrician', 'Neurologist', 'Psychiatrist', 'Gynecologist', 'Ophthalmologist', 'ENT Specialist', 'Radiologist', 'Oncologist', 'Other'];

const DoctorRegistration: React.FC<Props> = ({ onComplete, onLogout }) => {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [experience, setExperience] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [bio, setBio] = useState('');

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (step === 1 && !name.trim()) { setError('Please enter your full name.'); return; }
    if (step < 3) setStep(s => (s + 1) as Step);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await Promise.all([
        saveMyDoctorProfile({ name: name.trim(), specialization: specialization || undefined, qualifications: qualifications.trim() || undefined, experience: experience ? Number(experience) : undefined, consultationFee: consultationFee ? Number(consultationFee) : undefined, bio: bio.trim() || undefined }),
        updateUserProfile(name.trim(), 'doctor'),
      ]);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Personal', 'Professional', 'About'];
  const icons = [<Stethoscope size={18} />, <Briefcase size={18} />, <BookOpen size={18} />];

  return (
    <div style={pg}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');`}</style>
      <div style={hdr}>
        <div style={hdrL}><img src={clinicoLogo} alt="Clinico" style={logoS} /> <span style={brd}>Clinico</span></div>
        <button style={logoutS} onClick={onLogout}><LogOut size={16} /> Sign Out</button>
      </div>
      <div style={card}>
        <div style={heroCard}>
          <div>
            <div style={heroEyebrow}>Doctor Workspace</div>
            <h1 style={heroTitle}>Set up your public practice card</h1>
            <p style={heroCopy}>Show patients your specialty, qualifications, fee structure, and clinical focus before they book.</p>
          </div>
          <div style={heroBadge}>
            <span style={heroBadgeLabel}>Outcome</span>
            <strong style={heroBadgeValue}>Ready for appointments</strong>
          </div>
        </div>

        <div style={progRow}>
          {steps.map((label, i) => (
            <div key={label} style={stepItem}>
              <div style={{ ...stepCircle, ...(i + 1 < step ? stepDone : i + 1 === step ? stepAct : {}) }}>
                {i + 1 < step ? <CheckCircle2 size={18} /> : icons[i]}
              </div>
              <span style={{ ...stepLbl, ...(i + 1 === step ? stepLblAct : {}) }}>{label}</span>
              {i < steps.length - 1 && <div style={{ ...stepLine, ...(i + 1 < step ? stepLineDone : {}) }} />}
            </div>
          ))}
        </div>
        {error && <div style={errBox}>{error}</div>}

        {step === 1 && (
          <form onSubmit={next}>
            <h2 style={ttl}>Personal Information</h2>
            <p style={sub}>Your name and primary specialization.</p>
            <div style={grid}>
              <div style={full}><label style={lbl}>Full Name *</label><input style={inp} required placeholder="Dr. Aditi Gupta" value={name} onChange={e => setName(e.target.value)} autoFocus /></div>
              <div style={full}>
                <label style={lbl}>Specialization</label>
                <select style={inp} value={specialization} onChange={e => setSpecialization(e.target.value)}>
                  <option value="">Select specialization</option>
                  {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" style={pBtn}>Next <ArrowRight size={18} /></button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={next}>
            <h2 style={ttl}>Professional Details</h2>
            <p style={sub}>Your qualifications and practice information.</p>
            <div style={grid}>
              <div style={full}><label style={lbl}>Qualifications</label><input style={inp} placeholder="MBBS, MD (Cardiology)" value={qualifications} onChange={e => setQualifications(e.target.value)} /></div>
              <div><label style={lbl}>Years of Experience</label><input style={inp} type="number" min={0} max={60} placeholder="10" value={experience} onChange={e => setExperience(e.target.value)} /></div>
              <div><label style={lbl}>Consultation Fee (₹)</label><input style={inp} type="number" min={0} placeholder="500" value={consultationFee} onChange={e => setConsultationFee(e.target.value)} /></div>
            </div>
            <div style={btnRow}><button type="button" style={sBtn} onClick={() => setStep(1)}><ArrowLeft size={18} /> Back</button><button type="submit" style={pBtn}>Next <ArrowRight size={18} /></button></div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <h2 style={ttl}>About You</h2>
            <p style={sub}>A brief description for patients.</p>
            <div style={grid}>
              <div style={full}><label style={lbl}>Bio / Description</label><textarea style={{ ...inp, height: 120, resize: 'vertical' }} placeholder="Experienced cardiologist specialising in preventive care and heart disease management…" value={bio} onChange={e => setBio(e.target.value)} /></div>
            </div>
            <div style={btnRow}><button type="button" style={sBtn} onClick={() => setStep(2)}><ArrowLeft size={18} /> Back</button><button type="submit" style={pBtn} disabled={loading}>{loading ? 'Saving…' : 'Complete Registration'} <CheckCircle2 size={18} /></button></div>
          </form>
        )}
      </div>
    </div>
  );
};

const P = '#2563EB';
const pg: React.CSSProperties = { minHeight: '100vh', background: 'radial-gradient(circle at top left,#fff 0%,#f0fdf4 100%)', fontFamily: "'Outfit',sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px 40px' };
const hdr: React.CSSProperties = { width: '100%', maxWidth: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0' };
const hdrL: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12 };
const logoS: React.CSSProperties = { height: 36, background: 'white', borderRadius: '50%', padding: 6, boxShadow: '0 2px 8px rgba(37,99,235,0.15)' };
const brd: React.CSSProperties = { fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: -0.5 };
const logoutS: React.CSSProperties = { background: 'none', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748b', fontFamily: 'inherit' };
const card: React.CSSProperties = { background: 'white', borderRadius: 24, boxShadow: '0 20px 50px rgba(37,99,235,0.1)', padding: 40, width: '100%', maxWidth: 640 };
const heroCard: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start', padding: 20, borderRadius: 20, border: '1px solid #bbf7d0', background: 'linear-gradient(135deg,#f0fdf4 0%,#f7fee7 100%)', marginBottom: 28 };
const heroEyebrow: React.CSSProperties = { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, color: '#15803d', marginBottom: 10 };
const heroTitle: React.CSSProperties = { fontSize: 28, lineHeight: 1.05, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' };
const heroCopy: React.CSSProperties = { fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0, maxWidth: 400 };
const heroBadge: React.CSSProperties = { minWidth: 150, padding: '14px 16px', borderRadius: 16, background: 'white', border: '1px solid #86efac', boxShadow: '0 10px 24px rgba(22,163,74,0.08)' };
const heroBadgeLabel: React.CSSProperties = { display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, color: '#64748b', marginBottom: 8 };
const heroBadgeValue: React.CSSProperties = { display: 'block', fontSize: 16, color: '#0f172a' };
const progRow: React.CSSProperties = { display: 'flex', alignItems: 'center', marginBottom: 36 };
const stepItem: React.CSSProperties = { display: 'flex', alignItems: 'center', flex: 1, position: 'relative' };
const stepCircle: React.CSSProperties = { width: 44, height: 44, borderRadius: '50%', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexShrink: 0, zIndex: 1, background: 'white' };
const stepAct: React.CSSProperties = { border: `2px solid ${P}`, color: P, boxShadow: `0 0 0 4px rgba(37,99,235,0.1)` };
const stepDone: React.CSSProperties = { border: `2px solid ${P}`, background: P, color: 'white' };
const stepLbl: React.CSSProperties = { position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: 12, fontWeight: 600, color: '#94a3b8' };
const stepLblAct: React.CSSProperties = { color: P };
const stepLine: React.CSSProperties = { flex: 1, height: 2, background: '#e2e8f0', margin: '0 4px' };
const stepLineDone: React.CSSProperties = { background: P };
const errBox: React.CSSProperties = { background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', color: '#ef4444', padding: '11px 15px', borderRadius: 11, fontSize: 13, marginBottom: 16 };
const ttl: React.CSSProperties = { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '24px 0 6px' };
const sub: React.CSSProperties = { fontSize: 14, color: '#64748b', margin: '0 0 24px' };
const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 };
const full: React.CSSProperties = { gridColumn: '1 / -1' };
const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 7 };
const inp: React.CSSProperties = { width: '100%', padding: '13px 14px', border: '2px solid #e2e8f0', borderRadius: 12, fontFamily: 'inherit', fontSize: 14, color: '#0f172a', background: '#f8fafc', boxSizing: 'border-box', outline: 'none' };
const btnRow: React.CSSProperties = { display: 'flex', gap: 12 };
const pBtn: React.CSSProperties = { flex: 1, padding: '14px 20px', background: `linear-gradient(135deg,${P} 0%,#1d4ed8 100%)`, color: 'white', border: 'none', borderRadius: 13, fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 18px -6px rgba(37,99,235,0.4)' };
const sBtn: React.CSSProperties = { padding: '14px 20px', background: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: 13, fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 };

export default DoctorRegistration;
