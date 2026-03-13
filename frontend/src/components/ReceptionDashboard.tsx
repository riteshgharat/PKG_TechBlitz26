import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, CheckCircle2, X, Edit3, LogOut, Bell, CalendarX, Search, ChevronRight, Trash2, AlertTriangle } from 'lucide-react';
import clinicoLogo from '../assets/Clinico-removebg-preview.png';
import { getDashboardToday, type Appointment } from '../api/dashboard';
import { getUserProfile, updateUserProfile, deleteAccount, type UserProfile } from '../api/users';
import ReceptionScheduleManager from './ReceptionScheduleManager';

interface Props { onLogout: () => void; }

function fmt(iso: string) { return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }); }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
function greet() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
function getStatusClass(s: string) { return s === 'completed' ? 'st-comp' : s === 'cancelled' ? 'st-canc' : 'st-book'; }
function getStatusLabel(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

const ReceptionDashboard: React.FC<Props> = ({ onLogout }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<{ total: number; upcoming: number; cancelled: number; completed: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'booked' | 'completed' | 'cancelled'>('all');

  // Profile modal
  const [showProfile, setShowProfile] = useState(false);
  const [pName, setPName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [prof, dash] = await Promise.all([getUserProfile(), getDashboardToday()]);
      setProfile(prof);
      setAppointments(dash.appointments || []);
      setStats(dash.stats || null);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openProfile = () => { setPName(profile?.name || ''); setSaveErr(''); setShowDeleteConfirm(false); setShowProfile(true); };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) { setSaveErr('Name is required.'); return; }
    setSaving(true); setSaveErr('');
    try {
      const updated = await updateUserProfile(pName.trim());
      setProfile(updated);
      setShowProfile(false);
    } catch (err) { setSaveErr(err instanceof Error ? err.message : 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      onLogout();
    } catch (err) {
      setSaveErr(err instanceof Error ? err.message : 'Delete failed. Please try again.');
      setShowDeleteConfirm(false);
      setDeleting(false);
    }
  };

  const initials = (profile?.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const filtered = appointments.filter(a => {
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchSearch = !search || a.doctor?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="rdb-wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        :root{--p:#2563EB;--pd:#1E3A8A;--bg:#f4f7fe;--card:#fff;--tm:#0f172a;--mu:#64748b;--bdr:#e2e8f0;--green:#10b981;--warn:#f59e0b;--red:#ef4444;--purple:#8b5cf6;}
        .rdb-wrap{min-height:100vh;background:var(--bg);font-family:'Plus Jakarta Sans',sans-serif;color:var(--tm);}
        .nav{background:rgba(255,255,255,.88);backdrop-filter:blur(12px);padding:14px 32px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(226,232,240,.8);position:sticky;top:0;z-index:100;}
        .nav-l{display:flex;align-items:center;gap:16px;} .nav-r{display:flex;align-items:center;gap:12px;}
        .brand-logo{height:36px;filter:drop-shadow(0 3px 5px rgba(0,0,0,.05));}
        .nav-date{font-size:13px;font-weight:500;color:var(--mu);}
        .nav-icon{background:white;border:1px solid var(--bdr);border-radius:12px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--mu);transition:all .2s;}
        .nav-icon:hover{background:#f8fafc;color:var(--p);}
        .logout-btn{display:flex;align-items:center;gap:7px;padding:8px 16px;background:white;border:1px solid var(--bdr);border-radius:12px;color:var(--mu);font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;}
        .logout-btn:hover{background:#fef2f2;border-color:#fca5a5;color:var(--red);}
        .avatar{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#a78bfa,var(--purple));color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;cursor:pointer;box-shadow:0 4px 10px rgba(139,92,246,.2);transition:transform .2s;}
        .avatar:hover{transform:scale(1.05);}
        .main{padding:28px 36px;max-width:1400px;margin:0 auto;}
        .top-row{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:28px;}
        .greeting h1{font-family:'Outfit',sans-serif;font-size:28px;font-weight:800;margin:0 0 4px;letter-spacing:-.5px;}
        .greeting p{font-size:14px;color:var(--mu);margin:0;}
        .edit-btn{display:flex;align-items:center;gap:8px;padding:11px 20px;background:white;border:2px solid var(--purple);border-radius:13px;color:var(--purple);font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;}
        .edit-btn:hover{background:var(--purple);color:white;}
        .kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-bottom:24px;}
        .kpi{background:white;border-radius:16px;padding:18px;border:1px solid rgba(226,232,240,.6);box-shadow:0 4px 18px rgba(0,0,0,.02);display:flex;align-items:center;gap:14px;transition:transform .3s;}
        .kpi:hover{transform:translateY(-3px);}
        .kpi-ic{width:48px;height:48px;border-radius:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .ib{background:rgba(37,99,235,.1);color:var(--p);} .ig{background:rgba(16,185,129,.1);color:var(--green);} .io{background:rgba(245,158,11,.1);color:var(--warn);} .ir{background:rgba(239,68,68,.1);color:var(--red);}
        .kpi-data h3{font-size:12px;font-weight:600;color:var(--mu);text-transform:uppercase;letter-spacing:.5px;margin:0 0 4px;}
        .kpi-data .val{font-size:26px;font-weight:800;font-family:'Outfit',sans-serif;margin:0;line-height:1;}
        .card{background:white;border-radius:20px;border:1px solid rgba(226,232,240,.6);padding:24px;box-shadow:0 4px 18px rgba(0,0,0,.02);}
        .card-title{font-size:17px;font-weight:800;font-family:'Outfit',sans-serif;margin:0 0 18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;}
        .toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;}
        .search-wrap{display:flex;align-items:center;gap:8px;background:#f8fafc;border:1px solid var(--bdr);border-radius:10px;padding:8px 12px;}
        .search-wrap input{border:none;background:transparent;outline:none;font-size:13px;font-family:inherit;color:var(--tm);width:160px;}
        .filter-btns{display:flex;gap:6px;}
        .fbtn{background:#f1f5f9;border:none;padding:7px 13px;border-radius:8px;font-size:12px;font-weight:600;color:var(--mu);cursor:pointer;font-family:inherit;transition:all .2s;}
        .fbtn.active{background:var(--p);color:white;}
        table{width:100%;border-collapse:separate;border-spacing:0 10px;font-size:13px;}
        th{text-align:left;padding:0 14px 8px 14px;font-weight:700;color:var(--mu);text-transform:uppercase;font-size:11px;letter-spacing:.5px;}
        td{padding:14px;background:#f8fafc;font-weight:500;}
        tr td:first-child{border-top-left-radius:11px;border-bottom-left-radius:11px;}
        tr td:last-child{border-top-right-radius:11px;border-bottom-right-radius:11px;}
        .appt-status{padding:5px 10px;border-radius:7px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:5px;}
        .st-book{background:rgba(16,185,129,.1);color:var(--green);}
        .st-comp{background:rgba(37,99,235,.1);color:var(--p);}
        .st-canc{background:rgba(239,68,68,.1);color:var(--red);}
        .act-btn{background:white;border:1px solid var(--bdr);border-radius:7px;padding:5px;cursor:pointer;color:var(--mu);}
        .act-btn:hover{color:var(--tm);background:#f1f5f9;}
        .no-data{text-align:center;padding:40px;color:var(--mu);font-weight:600;}
        .loading{display:flex;align-items:center;justify-content:center;min-height:60vh;font-size:15px;color:var(--mu);font-weight:600;}
        .overlay{position:fixed;inset:0;background:rgba(15,23,42,.5);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;}
        .modal{background:white;border-radius:22px;padding:32px;width:100%;max-width:440px;box-shadow:0 25px 50px rgba(0,0,0,.18);animation:fadeUp .3s ease;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .modal-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;}
        .modal-title{font-size:20px;font-weight:800;font-family:'Outfit',sans-serif;margin:0;}
        .close-btn{background:#f1f5f9;border:none;border-radius:10px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--mu);}
        .f-label{display:block;font-size:12px;font-weight:600;color:var(--tm);margin-bottom:7px;}
        .f-input{width:100%;padding:13px 13px;border:2px solid var(--bdr);border-radius:11px;font-family:inherit;font-size:14px;color:var(--tm);background:#f8fafc;box-sizing:border-box;outline:none;}
        .f-input:focus{border-color:#60A5FA;background:white;}
        .modal-err{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);color:var(--red);padding:10px 14px;border-radius:10px;font-size:13px;margin-bottom:14px;}
        .save-btn{width:100%;padding:14px;background:linear-gradient(135deg,var(--purple) 0%,#7c3aed 100%);color:white;border:none;border-radius:12px;font-family:inherit;font-size:15px;font-weight:700;cursor:pointer;margin-top:20px;}
        .save-btn:disabled{opacity:.6;cursor:not-allowed;}
        .profile-info{background:#f8fafc;border-radius:14px;padding:16px 20px;margin-bottom:20px;text-align:center;}
        .profile-info .av{width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,#a78bfa,var(--purple));color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:22px;margin:0 auto 10px;}
        .profile-info .pn{font-size:16px;font-weight:700;margin:0 0 4px;}
        .profile-info .pr{font-size:13px;color:var(--mu);}
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
              <h1>{greet()}, {profile?.name || 'Receptionist'}!</h1>
              <p>Running the clinic floor.</p>
            </div>
            <button className="edit-btn" onClick={openProfile}><Edit3 size={16} /> Edit Profile</button>
          </div>

          {/* KPI */}
          <div className="kpi-row">
            <div className="kpi"><div className="kpi-ic ib"><Calendar size={22} /></div><div className="kpi-data"><h3>Total Today</h3><p className="val">{stats?.total ?? '—'}</p></div></div>
            <div className="kpi"><div className="kpi-ic ig"><CheckCircle2 size={22} /></div><div className="kpi-data"><h3>Completed</h3><p className="val">{stats?.completed ?? '—'}</p></div></div>
            <div className="kpi"><div className="kpi-ic io"><Clock size={22} /></div><div className="kpi-data"><h3>Upcoming</h3><p className="val">{stats?.upcoming ?? '—'}</p></div></div>
            <div className="kpi"><div className="kpi-ic ir"><CalendarX size={22} /></div><div className="kpi-data"><h3>Cancelled</h3><p className="val">{stats?.cancelled ?? '—'}</p></div></div>
          </div>

          {/* Appointments Table */}
          <div className="card">
            <div className="card-title">
              All Appointments
              <div className="toolbar">
                <div className="search-wrap">
                  <Search size={15} color="#94a3b8" />
                  <input placeholder="Search doctor…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="filter-btns">
                  {(['all', 'booked', 'completed', 'cancelled'] as const).map(f => (
                    <button key={f} className={`fbtn ${filterStatus === f ? 'active' : ''}`} onClick={() => setFilterStatus(f)}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="no-data">No appointments match the selected filter.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr><th>Date & Time</th><th>Doctor</th><th>Specialization</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(a => (
                      <tr key={a.id}>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}><Calendar size={15} color="#2563EB" /> {fmtDate(a.startTime)}, {fmt(a.startTime)}</div></td>
                        <td style={{ fontWeight: 700 }}>{a.doctor?.name || '—'}</td>
                        <td style={{ color: '#64748b' }}>{a.doctor?.specialization || '—'}</td>
                        <td><span className={`appt-status ${getStatusClass(a.status)}`}>{getStatusLabel(a.status)}</span></td>
                        <td><button className="act-btn"><ChevronRight size={16} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ marginTop: 22 }}>
            <ReceptionScheduleManager />
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfile && (
        <div className="overlay" onClick={() => setShowProfile(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <h2 className="modal-title">My Profile</h2>
              <button className="close-btn" onClick={() => setShowProfile(false)}><X size={17} /></button>
            </div>
            <div className="profile-info">
              <div className="av">{initials}</div>
              <p className="pn">{profile?.name || '—'}</p>
              <p className="pr">Receptionist • {profile?.phone}</p>
            </div>
            {saveErr && <div className="modal-err">{saveErr}</div>}
            <form onSubmit={saveProfile}>
              <label className="f-label">Display Name</label>
              <input className="f-input" required value={pName} onChange={e => setPName(e.target.value)} />
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
                  <p>This will permanently delete your account and all associated data. This action <strong>cannot be undone</strong>.</p>
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

export default ReceptionDashboard;
