import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, CheckCircle2, Users, Stethoscope, Edit3, X, LogOut, Bell, Activity, ChevronRight, Star, Trash2, AlertTriangle } from 'lucide-react';
import clinicoLogo from '../assets/Clinico-removebg-preview.png';
import { getDashboardToday, type Appointment } from '../api/dashboard';
import { getMyDoctorProfile, updateMyDoctorProfile, type Doctor } from '../api/doctors';
import { updateUserProfile, deleteAccount } from '../api/users';

interface Props { onLogout: () => void; }

const SPECIALIZATIONS = ['General Physician', 'Cardiologist', 'Dermatologist', 'Orthopedist', 'Pediatrician', 'Neurologist', 'Psychiatrist', 'Gynecologist', 'Ophthalmologist', 'ENT Specialist', 'Radiologist', 'Oncologist', 'Other'];

function fmt(iso: string) { return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }); }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
function greet() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }

const DoctorDashboard: React.FC<Props> = ({ onLogout }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<{ total: number; upcoming: number; cancelled: number; completed: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Profile edit form
  const [pName, setPName] = useState('');
  const [pSpec, setPSpec] = useState('');
  const [pQual, setPQual] = useState('');
  const [pExp, setPExp] = useState('');
  const [pFee, setPFee] = useState('');
  const [pBio, setPBio] = useState('');

  const load = useCallback(async () => {
    try {
      const [doc, dash] = await Promise.all([getMyDoctorProfile(), getDashboardToday()]);
      setDoctor(doc);
      setAppointments(dash.appointments || []);
      setStats(dash.stats || null);
    } catch { /* profile might not exist yet */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openProfile = () => {
    if (doctor) { setPName(doctor.name || ''); setPSpec(doctor.specialization || ''); setPQual(doctor.qualifications || ''); setPExp(doctor.experience?.toString() || ''); setPFee(doctor.consultationFee?.toString() || ''); setPBio(doctor.bio || ''); }
    setSaveError('');
    setShowDeleteConfirm(false);
    setShowProfile(true);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSaveError('');
    try {
      const updates = { name: pName, specialization: pSpec || undefined, qualifications: pQual || undefined, experience: pExp ? Number(pExp) : undefined, consultationFee: pFee ? Number(pFee) : undefined, bio: pBio || undefined };
      const [updated] = await Promise.all([updateMyDoctorProfile(updates), updateUserProfile(pName)]);
      setDoctor(updated);
      setShowProfile(false);
    } catch (err) { setSaveError(err instanceof Error ? err.message : 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      onLogout();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Delete failed. Please try again.');
      setShowDeleteConfirm(false);
      setDeleting(false);
    }
  };

  const initials = (doctor?.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="ddb-wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800&display=swap');
        :root{--p:#2563EB;--pd:#1E3A8A;--bg:#f4f7fe;--card:#fff;--tm:#0f172a;--mu:#64748b;--bdr:#e2e8f0;--green:#10b981;--warn:#f59e0b;--red:#ef4444;}
        .ddb-wrap{min-height:100vh;background:var(--bg);font-family:'Plus Jakarta Sans',sans-serif;color:var(--tm);}
        .nav{background:rgba(255,255,255,.88);backdrop-filter:blur(12px);padding:14px 32px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(226,232,240,.8);position:sticky;top:0;z-index:100;}
        .nav-l{display:flex;align-items:center;gap:16px;}
        .brand-logo{height:36px;filter:drop-shadow(0 3px 5px rgba(0,0,0,.05));}
        .nav-date{font-size:13px;font-weight:500;color:var(--mu);}
        .nav-r{display:flex;align-items:center;gap:12px;}
        .nav-icon{background:white;border:1px solid var(--bdr);border-radius:12px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--mu);transition:all .2s;}
        .nav-icon:hover{background:#f8fafc;color:var(--p);}
        .logout-btn{display:flex;align-items:center;gap:7px;padding:8px 16px;background:white;border:1px solid var(--bdr);border-radius:12px;color:var(--mu);font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;}
        .logout-btn:hover{background:#fef2f2;border-color:#fca5a5;color:var(--red);}
        .avatar{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#38BDF8,var(--p));color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;cursor:pointer;box-shadow:0 4px 10px rgba(37,99,235,.2);transition:transform .2s;}
        .avatar:hover{transform:scale(1.05);}
        .main{padding:28px 36px;max-width:1400px;margin:0 auto;}
        .top-row{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:28px;}
        .greeting h1{font-family:'Outfit',sans-serif;font-size:28px;font-weight:800;margin:0 0 4px;letter-spacing:-.5px;}
        .greeting p{font-size:14px;color:var(--mu);margin:0;font-weight:500;}
        .edit-profile-btn{display:flex;align-items:center;gap:8px;padding:11px 20px;background:white;border:2px solid var(--p);border-radius:13px;color:var(--p);font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;}
        .edit-profile-btn:hover{background:var(--p);color:white;}
        .kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-bottom:24px;}
        .kpi{background:white;border-radius:16px;padding:18px;border:1px solid rgba(226,232,240,.6);box-shadow:0 4px 18px rgba(0,0,0,.02);display:flex;align-items:center;gap:14px;transition:transform .3s;}
        .kpi:hover{transform:translateY(-3px);}
        .kpi-ic{width:48px;height:48px;border-radius:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .ib{background:rgba(37,99,235,.1);color:var(--p);}
        .ig{background:rgba(16,185,129,.1);color:var(--green);}
        .io{background:rgba(245,158,11,.1);color:var(--warn);}
        .ir{background:rgba(239,68,68,.1);color:var(--red);}
        .kpi-data h3{font-size:12px;font-weight:600;color:var(--mu);text-transform:uppercase;letter-spacing:.5px;margin:0 0 4px;}
        .kpi-data .val{font-size:26px;font-weight:800;font-family:'Outfit',sans-serif;margin:0;line-height:1;}
        .dash-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:22px;}
        .card{background:white;border-radius:20px;border:1px solid rgba(226,232,240,.6);padding:24px;box-shadow:0 4px 18px rgba(0,0,0,.02);}
        .card-title{font-size:17px;font-weight:800;font-family:'Outfit',sans-serif;margin:0 0 18px;display:flex;align-items:center;justify-content:space-between;}
        .appt-list{display:flex;flex-direction:column;gap:12px;}
        .appt-item{display:flex;align-items:center;gap:14px;padding:14px;background:#f8fafc;border-radius:14px;border:1px solid var(--bdr);}
        .appt-time{font-size:13px;font-weight:700;color:var(--p);background:rgba(37,99,235,.08);padding:6px 10px;border-radius:8px;white-space:nowrap;min-width:80px;text-align:center;}
        .appt-info{flex:1;}
        .appt-name{font-size:14px;font-weight:700;color:var(--tm);margin:0 0 2px;}
        .appt-status{font-size:12px;font-weight:600;padding:4px 10px;border-radius:6px;display:inline-flex;align-items:center;gap:5px;}
        .st-booked{background:rgba(16,185,129,.1);color:var(--green);}
        .st-completed{background:rgba(37,99,235,.1);color:var(--p);}
        .st-cancelled{background:rgba(239,68,68,.1);color:var(--red);}
        .no-appts{text-align:center;padding:40px 20px;color:var(--mu);font-weight:600;}
        .profile-card{display:flex;flex-direction:column;gap:16px;}
        .profile-avatar{width:80px;height:80px;border-radius:20px;background:linear-gradient(135deg,#38BDF8,var(--p));color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:28px;margin:0 auto 8px;}
        .profile-name{font-size:20px;font-weight:800;font-family:'Outfit',sans-serif;text-align:center;}
        .profile-spec{font-size:14px;color:var(--mu);text-align:center;margin-bottom:4px;}
        .profile-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--bdr);}
        .profile-row:last-child{border:none;}
        .profile-row-label{font-size:12px;font-weight:600;color:var(--mu);text-transform:uppercase;letter-spacing:.5px;min-width:110px;}
        .profile-row-val{font-size:14px;font-weight:600;color:var(--tm);}
        .loading{display:flex;align-items:center;justify-content:center;min-height:60vh;font-size:15px;color:var(--mu);font-weight:600;}
        /* Modal */
        .overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;}
        .modal{background:white;border-radius:22px;padding:32px;width:100%;max-width:540px;box-shadow:0 25px 50px rgba(0,0,0,.18);max-height:90vh;overflow-y:auto;animation:fadeUp .3s ease;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .modal-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;}
        .modal-title{font-size:20px;font-weight:800;font-family:'Outfit',sans-serif;margin:0;}
        .close-btn{background:#f1f5f9;border:none;border-radius:10px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--mu);}
        .close-btn:hover{background:#e2e8f0;color:var(--tm);}
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;}
        .f-full{grid-column:1/-1;}
        .f-label{display:block;font-size:12px;font-weight:600;color:var(--tm);margin-bottom:6px;}
        .f-input{width:100%;padding:12px 13px;border:2px solid var(--bdr);border-radius:11px;font-family:inherit;font-size:14px;color:var(--tm);background:#f8fafc;box-sizing:border-box;outline:none;transition:border-color .2s;}
        .f-input:focus{border-color:#60A5FA;background:white;}
        .modal-err{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);color:var(--red);padding:10px 14px;border-radius:10px;font-size:13px;margin-bottom:14px;}
        .save-btn{width:100%;padding:14px;background:linear-gradient(135deg,var(--p) 0%,#1d4ed8 100%);color:white;border:none;border-radius:12px;font-family:inherit;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 8px 18px -6px rgba(37,99,235,.4);}
        .save-btn:disabled{opacity:.6;cursor:not-allowed;}
        .danger-zone{margin-top:24px;padding-top:20px;border-top:1px dashed #fca5a5;}
        .danger-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--red);margin:0 0 10px;display:flex;align-items:center;gap:6px;}
        .delete-btn{width:100%;padding:12px;background:white;border:2px solid #fca5a5;border-radius:12px;color:var(--red);font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s;}
        .delete-btn:hover{background:#fef2f2;border-color:var(--red);}
        .delete-confirm{background:#fef2f2;border:1px solid #fca5a5;border-radius:12px;padding:16px;margin-top:12px;}
        .delete-confirm p{font-size:13px;color:#991b1b;font-weight:500;margin:0 0 14px;line-height:1.5;}
        .delete-confirm-btns{display:flex;gap:10px;}
        .btn-cancel-del{flex:1;padding:10px;background:white;border:1px solid var(--bdr);border-radius:9px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;color:var(--tm);}
        .btn-confirm-del{flex:1;padding:10px;background:var(--red);border:none;border-radius:9px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;color:white;}
        .btn-confirm-del:disabled{opacity:.6;cursor:not-allowed;}
      `}</style>

      {/* Navbar */}
      <nav className="nav">
        <div className="nav-l">
          <img src={clinicoLogo} alt="Clinico" className="brand-logo" />
          <span className="nav-date">{today}</span>
        </div>
        <div className="nav-r">
          <div className="nav-icon"><Bell size={18} /></div>
          <button className="logout-btn" onClick={onLogout}><LogOut size={15} />Sign Out</button>
          <div className="avatar" onClick={openProfile} title="Edit Profile">{initials}</div>
        </div>
      </nav>

      {loading ? <div className="loading">Loading dashboard…</div> : (
        <div className="main">
          <div className="top-row">
            <div className="greeting">
              <h1>{greet()}, Dr. {doctor?.name?.split(' ')[0] || 'Doctor'}!</h1>
              <p>Here's your schedule and clinic overview for today.</p>
            </div>
            <button className="edit-profile-btn" onClick={openProfile}><Edit3 size={16} /> Edit Profile</button>
          </div>

          {/* KPI */}
          <div className="kpi-row">
            <div className="kpi"><div className="kpi-ic ib"><Calendar size={24} /></div><div className="kpi-data"><h3>Today's Appts</h3><p className="val">{stats?.upcoming ?? '—'}</p></div></div>
            <div className="kpi"><div className="kpi-ic ig"><CheckCircle2 size={24} /></div><div className="kpi-data"><h3>Completed</h3><p className="val">{stats?.completed ?? '—'}</p></div></div>
            <div className="kpi"><div className="kpi-ic io"><Clock size={24} /></div><div className="kpi-data"><h3>Pending</h3><p className="val">{stats?.upcoming ?? '—'}</p></div></div>
            <div className="kpi"><div className="kpi-ic ir"><Users size={24} /></div><div className="kpi-data"><h3>Total Visits</h3><p className="val">{stats?.total ?? '—'}</p></div></div>
          </div>

          {/* Grid */}
          <div className="dash-grid">
            {/* Today's Schedule */}
            <div className="card">
              <div className="card-title">Today's Schedule <Activity size={18} color="#2563EB" /></div>
              {appointments.length === 0 ? (
                <div className="no-appts">No appointments today.</div>
              ) : (
                <div className="appt-list">
                  {appointments.map(a => (
                    <div key={a.id} className="appt-item">
                      <div className="appt-time">{fmt(a.start_time)}</div>
                      <div className="appt-info">
                        <p className="appt-name">Appointment</p>
                        <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{fmtDate(a.start_time)}</p>
                      </div>
                      <span className={`appt-status ${a.status === 'completed' ? 'st-completed' : a.status === 'cancelled' ? 'st-cancelled' : 'st-booked'}`}>
                        {a.status}
                      </span>
                      <ChevronRight size={16} color="#94a3b8" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Card */}
            <div className="card">
              <div className="card-title">My Profile <Star size={16} color="#f59e0b" /></div>
              {doctor ? (
                <div className="profile-card">
                  <div className="profile-avatar">{initials}</div>
                  <p className="profile-name">{doctor.name}</p>
                  <p className="profile-spec"><Stethoscope size={14} style={{ display: 'inline', marginRight: 5 }} />{doctor.specialization || 'Not specified'}</p>
                  {doctor.qualifications && <div className="profile-row"><span className="profile-row-label">Qualifications</span><span className="profile-row-val">{doctor.qualifications}</span></div>}
                  {doctor.experience != null && <div className="profile-row"><span className="profile-row-label">Experience</span><span className="profile-row-val">{doctor.experience} years</span></div>}
                  {doctor.consultationFee != null && <div className="profile-row"><span className="profile-row-label">Fee</span><span className="profile-row-val">₹{doctor.consultationFee}</span></div>}
                  {doctor.bio && <div className="profile-row"><span className="profile-row-label">About</span><span className="profile-row-val" style={{ fontWeight: 400, lineHeight: 1.5 }}>{doctor.bio}</span></div>}
                </div>
              ) : (
                <div className="no-appts">Profile not found. <button onClick={openProfile} style={{ color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Set up profile</button></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfile && (
        <div className="overlay" onClick={() => setShowProfile(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <h2 className="modal-title">Edit Profile</h2>
              <button className="close-btn" onClick={() => setShowProfile(false)}><X size={17} /></button>
            </div>
            {saveError && <div className="modal-err">{saveError}</div>}
            <form onSubmit={saveProfile}>
              <div className="form-grid">
                <div className="f-full"><label className="f-label">Full Name *</label><input className="f-input" required value={pName} onChange={e => setPName(e.target.value)} /></div>
                <div className="f-full">
                  <label className="f-label">Specialization</label>
                  <select className="f-input" value={pSpec} onChange={e => setPSpec(e.target.value)}>
                    <option value="">Select</option>
                    {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="f-full"><label className="f-label">Qualifications</label><input className="f-input" placeholder="MBBS, MD…" value={pQual} onChange={e => setPQual(e.target.value)} /></div>
                <div><label className="f-label">Experience (yrs)</label><input className="f-input" type="number" min={0} value={pExp} onChange={e => setPExp(e.target.value)} /></div>
                <div><label className="f-label">Consultation Fee (₹)</label><input className="f-input" type="number" min={0} value={pFee} onChange={e => setPFee(e.target.value)} /></div>
                <div className="f-full"><label className="f-label">Bio</label><textarea className="f-input" style={{ height: 90, resize: 'vertical' }} value={pBio} onChange={e => setPBio(e.target.value)} /></div>
              </div>
              <button type="submit" className="save-btn" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </form>

            {/* Danger Zone */}
            <div className="danger-zone">
              <p className="danger-title"><AlertTriangle size={13} /> Danger Zone</p>
              {!showDeleteConfirm ? (
                <button className="delete-btn" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 size={15} /> Delete My Account
                </button>
              ) : (
                <div className="delete-confirm">
                  <p>This will permanently delete your account, profile, and all associated data. This action <strong>cannot be undone</strong>.</p>
                  <div className="delete-confirm-btns">
                    <button className="btn-cancel-del" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>Cancel</button>
                    <button className="btn-confirm-del" onClick={handleDeleteAccount} disabled={deleting}>{deleting ? 'Deleting…' : 'Yes, Delete'}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
