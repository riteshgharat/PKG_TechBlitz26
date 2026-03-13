import React, { useState } from 'react';
import clinicoLogo from '../assets/Clinico-removebg-preview.png';
import { User, MapPin, HeartPulse, ArrowRight, ArrowLeft, LogOut, CheckCircle2 } from 'lucide-react';
import { registerPatient } from '../api/patients';
import { updateUserProfile } from '../api/users';

interface Props { onComplete: () => void; onLogout: () => void; }

type Step = 1 | 2 | 3;

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const PatientRegistration: React.FC<Props> = ({ onComplete, onLogout }) => {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (step === 1 && !name.trim()) { setError('Please enter your name.'); return; }
    if (step < 3) setStep(s => (s + 1) as Step);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await Promise.all([
        registerPatient({ name: name.trim(), age: age ? Number(age) : undefined, gender: gender || undefined, bloodGroup: bloodGroup || undefined, address: address.trim() || undefined, medicalHistory: medicalHistory.trim() || undefined }),
        updateUserProfile(name.trim()),
      ]);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Personal', 'Location', 'Medical'];
  const icons = [<User size={18} />, <MapPin size={18} />, <HeartPulse size={18} />];

  return (
    <div style={styles.page}>
      <style>{css}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <img src={clinicoLogo} alt="Clinico" style={styles.logo} />
          <span style={styles.brand}>Clinico</span>
        </div>
        <button style={styles.logoutBtn} onClick={onLogout}><LogOut size={16} /> Sign Out</button>
      </div>

      {/* Card */}
      <div style={styles.card}>
        {/* Progress */}
        <div style={styles.progressRow}>
          {steps.map((label, i) => (
            <div key={label} style={styles.stepItem}>
              <div style={{ ...styles.stepCircle, ...(i + 1 < step ? styles.stepDone : i + 1 === step ? styles.stepActive : {}) }}>
                {i + 1 < step ? <CheckCircle2 size={18} /> : icons[i]}
              </div>
              <span style={{ ...styles.stepLabel, ...(i + 1 === step ? styles.stepLabelActive : {}) }}>{label}</span>
              {i < steps.length - 1 && <div style={{ ...styles.stepLine, ...(i + 1 < step ? styles.stepLineDone : {}) }} />}
            </div>
          ))}
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Step 1: Personal */}
        {step === 1 && (
          <form onSubmit={next}>
            <h2 style={styles.stepTitle}>Personal Information</h2>
            <p style={styles.stepSub}>Let us know who you are.</p>
            <div style={styles.fieldGrid}>
              <div style={styles.fieldFull}>
                <label style={styles.label}>Full Name *</label>
                <input style={styles.input} placeholder="John Doe" required value={name} onChange={e => setName(e.target.value)} autoFocus />
              </div>
              <div>
                <label style={styles.label}>Age</label>
                <input style={styles.input} type="number" placeholder="25" min={1} max={120} value={age} onChange={e => setAge(e.target.value)} />
              </div>
              <div>
                <label style={styles.label}>Gender</label>
                <select style={styles.input} value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">Select</option>
                  {GENDERS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" style={styles.primaryBtn}>Next <ArrowRight size={18} /></button>
          </form>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <form onSubmit={next}>
            <h2 style={styles.stepTitle}>Your Location</h2>
            <p style={styles.stepSub}>Help us know where you are for a better experience.</p>
            <div style={styles.fieldGrid}>
              <div style={styles.fieldFull}>
                <label style={styles.label}>Address</label>
                <textarea style={{ ...styles.input, height: 100, resize: 'vertical' }} placeholder="123 Main Street, City, State" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
            </div>
            <div style={styles.btnRow}>
              <button type="button" style={styles.secondaryBtn} onClick={() => setStep(1)}><ArrowLeft size={18} /> Back</button>
              <button type="submit" style={styles.primaryBtn}>Next <ArrowRight size={18} /></button>
            </div>
          </form>
        )}

        {/* Step 3: Medical */}
        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <h2 style={styles.stepTitle}>Medical History</h2>
            <p style={styles.stepSub}>This helps doctors understand your health background.</p>
            <div style={styles.fieldGrid}>
              <div>
                <label style={styles.label}>Blood Group</label>
                <select style={styles.input} value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
                  <option value="">Unknown</option>
                  {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div style={styles.fieldFull}>
                <label style={styles.label}>Previous Diseases / Conditions</label>
                <textarea style={{ ...styles.input, height: 110, resize: 'vertical' }} placeholder="e.g. Diabetes Type 2, Hypertension, Asthma…" value={medicalHistory} onChange={e => setMedicalHistory(e.target.value)} />
              </div>
            </div>
            <div style={styles.btnRow}>
              <button type="button" style={styles.secondaryBtn} onClick={() => setStep(2)}><ArrowLeft size={18} /> Back</button>
              <button type="submit" style={styles.primaryBtn} disabled={loading}>
                {loading ? 'Saving…' : 'Complete Registration'} <CheckCircle2 size={18} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const P = '#2563EB';
const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'radial-gradient(circle at top left,#fff 0%,#edf4ff 100%)', fontFamily: "'Outfit',sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px 40px' },
  header: { width: '100%', maxWidth: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  logo: { height: 36, background: 'white', borderRadius: '50%', padding: 6, boxShadow: '0 2px 8px rgba(37,99,235,0.15)' },
  brand: { fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: -0.5 },
  logoutBtn: { background: 'none', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748b', fontFamily: 'inherit' },
  card: { background: 'white', borderRadius: 24, boxShadow: '0 20px 50px rgba(37,99,235,0.1)', padding: 40, width: '100%', maxWidth: 640 },
  progressRow: { display: 'flex', alignItems: 'center', marginBottom: 36 },
  stepItem: { display: 'flex', alignItems: 'center', flex: 1, position: 'relative' },
  stepCircle: { width: 44, height: 44, borderRadius: '50%', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexShrink: 0, zIndex: 1, background: 'white' },
  stepActive: { border: `2px solid ${P}`, color: P, boxShadow: `0 0 0 4px rgba(37,99,235,0.1)` },
  stepDone: { border: `2px solid ${P}`, background: P, color: 'white' },
  stepLabel: { position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: 12, fontWeight: 600, color: '#94a3b8' },
  stepLabelActive: { color: P },
  stepLine: { flex: 1, height: 2, background: '#e2e8f0', margin: '0 4px' },
  stepLineDone: { background: P },
  errorBox: { background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', color: '#ef4444', padding: '11px 15px', borderRadius: 11, fontSize: 13, marginBottom: 16 },
  stepTitle: { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 6px', marginTop: 24 },
  stepSub: { fontSize: 14, color: '#64748b', margin: '0 0 24px' },
  fieldGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 },
  fieldFull: { gridColumn: '1 / -1' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 7 },
  input: { width: '100%', padding: '13px 14px', border: '2px solid #e2e8f0', borderRadius: 12, fontFamily: 'inherit', fontSize: 14, color: '#0f172a', background: '#f8fafc', boxSizing: 'border-box', transition: 'border-color 0.2s', outline: 'none' },
  btnRow: { display: 'flex', gap: 12 },
  primaryBtn: { flex: 1, padding: '14px 20px', background: `linear-gradient(135deg,${P} 0%,#1d4ed8 100%)`, color: 'white', border: 'none', borderRadius: 13, fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 18px -6px rgba(37,99,235,0.4)' },
  secondaryBtn: { padding: '14px 20px', background: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: 13, fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
};

const css = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
.reg-input:focus { border-color: #60A5FA !important; background: white !important; box-shadow: 0 0 0 3px rgba(96,165,250,0.12); }`;

export default PatientRegistration;
