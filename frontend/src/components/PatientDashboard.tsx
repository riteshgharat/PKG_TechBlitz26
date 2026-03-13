import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Bell, Settings, Sparkles,
  Plus, Calendar, Activity,
  MapPin, Clock, CalendarCheck, CalendarX,
  Stethoscope, ChevronRight, PhoneCall, CheckCircle2, X, ChevronDown, LogOut, Trash2
} from 'lucide-react';
import clinicoLogo from '../assets/Clinico-removebg-preview.png';
import { getUserProfile, updateUserProfile, deleteAccount } from '../api/users';
import { getDashboardToday, type Appointment, type DashboardStats } from '../api/dashboard';
import { getDoctors, type Doctor } from '../api/doctors';
import { getAvailableSlots, bookAppointment, cancelAppointment, rescheduleAppointment, type TimeSlot } from '../api/appointments';
import { getPatientProfile, updatePatientProfile, type PatientProfile } from '../api/patients';

interface DashboardProps {
  onLogout: () => void;
}

interface BookModalState {
  step: 'doctor' | 'date' | 'slot' | 'confirm';
  doctors: Doctor[];
  selectedDoctor: Doctor | null;
  date: string;
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  loading: boolean;
  error: string;
}

interface RescheduleModalState {
  appointment: Appointment | null;
  date: string;
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  loading: boolean;
  error: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatLastVisit(iso: string | null) {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getStatusClass(status: string) {
  if (status === 'completed') return 'st-completed';
  if (status === 'cancelled') return 'st-cancelled';
  if (status === 'booked') return 'st-confirmed';
  if (status === 'rescheduled') return 'st-confirmed';
  return 'st-completed';
}

function getStatusLabel(status: string) {
  if (status === 'rescheduled') return 'Rescheduled';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const today = new Date().toISOString().split('T')[0];

const PatientDashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  // Profile edit modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [pName, setPName] = useState('');
  const [pAge, setPAge] = useState('');
  const [pGender, setPGender] = useState('');
  const [pBlood, setPBlood] = useState('');
  const [pAddress, setPAddress] = useState('');
  const [pHistory, setPHistory] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileErr, setProfileErr] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState('');

  // Book modal
  const [showBook, setShowBook] = useState(false);
  const [book, setBook] = useState<BookModalState>({
    step: 'doctor', doctors: [], selectedDoctor: null,
    date: today, slots: [], selectedSlot: null, loading: false, error: '',
  });

  // Reschedule modal
  const [showReschedule, setShowReschedule] = useState(false);
  const [reschedule, setReschedule] = useState<RescheduleModalState>({
    appointment: null, date: today, slots: [], selectedSlot: null, loading: false, error: '',
  });

  // Cancel confirmation
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const [profileRes, dashRes, patientRes] = await Promise.all([
        getUserProfile(),
        getDashboardToday(),
        getPatientProfile().catch(() => null),
      ]);
      setUserName(profileRes.name);
      setPatientProfile(patientRes);
      setAppointments(dashRes.appointments || []);
      setStats(dashRes.stats || null);
    } catch (e) {
      setPageError(e instanceof Error ? e.message : 'Failed to load dashboard.');
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const nextAppointment = appointments.find(a => a.status === 'booked' || a.status === 'rescheduled');

  const filteredAppointments = appointments.filter(a => {
    if (activeFilter === 'completed') return a.status === 'completed';
    if (activeFilter === 'cancelled') return a.status === 'cancelled';
    return true;
  });

  // Profile modal handlers
  const openProfileModal = () => {
    const p = patientProfile;
    setPName(p?.name || userName || '');
    setPAge(p?.age?.toString() || '');
    setPGender(p?.gender || '');
    setPBlood(p?.bloodGroup || '');
    setPAddress(p?.address || '');
    setPHistory(p?.medicalHistory || '');
    setProfileErr('');
    setShowDeleteConfirm(false);
    setDeleteErr('');
    setShowProfileModal(true);
  };

  const saveProfileData = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true); setProfileErr('');
    try {
      const patch = { name: pName, age: pAge ? Number(pAge) : undefined, gender: pGender || undefined, bloodGroup: pBlood || undefined, address: pAddress || undefined, medicalHistory: pHistory || undefined };
      const [updated] = await Promise.all([
        updatePatientProfile(patch),
        updateUserProfile(pName),
      ]);
      setPatientProfile(updated);
      setUserName(pName);
      setShowProfileModal(false);
    } catch (err) {
      setProfileErr(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true); setDeleteErr('');
    try {
      await deleteAccount();
      onLogout();
    } catch (err) {
      setDeleteErr(err instanceof Error ? err.message : 'Failed to delete account.');
      setDeleting(false);
    }
  };

  // Book modal handlers
  const openBookModal = async () => {
    setBook(prev => ({ ...prev, step: 'doctor', selectedDoctor: null, date: today, slots: [], selectedSlot: null, loading: true, error: '' }));
    setShowBook(true);
    try {
      const doctors = await getDoctors();
      setBook(prev => ({ ...prev, doctors: Array.isArray(doctors) ? doctors : [], loading: false }));
    } catch (e) {
      setBook(prev => ({ ...prev, error: e instanceof Error ? e.message : 'Failed to load doctors.', loading: false }));
    }
  };

  const bookSelectDoctor = (doctor: Doctor) => {
    setBook(prev => ({ ...prev, selectedDoctor: doctor, step: 'date', error: '' }));
  };

  const bookFetchSlots = async () => {
    if (!book.selectedDoctor || !book.date) return;
    setBook(prev => ({ ...prev, loading: true, error: '', slots: [], selectedSlot: null }));
    try {
      const slots = await getAvailableSlots(book.selectedDoctor.id, book.date);
      setBook(prev => ({ ...prev, slots: Array.isArray(slots) ? slots : [], loading: false, step: 'slot' }));
    } catch (e) {
      setBook(prev => ({ ...prev, error: e instanceof Error ? e.message : 'Failed to load slots.', loading: false }));
    }
  };

  const bookConfirm = async () => {
    if (!book.selectedDoctor || !book.selectedSlot) return;
    setBook(prev => ({ ...prev, loading: true, error: '' }));
    try {
      await bookAppointment(book.selectedDoctor.id, book.selectedSlot.startTime, book.selectedSlot.endTime);
      setShowBook(false);
      await loadDashboard();
    } catch (e) {
      setBook(prev => ({ ...prev, error: e instanceof Error ? e.message : 'Booking failed.', loading: false }));
    }
  };

  // Cancel handlers
  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await cancelAppointment(cancelTarget.id);
      setCancelTarget(null);
      await loadDashboard();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to cancel appointment.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Reschedule handlers
  const openReschedule = (appt: Appointment) => {
    setReschedule({ appointment: appt, date: today, slots: [], selectedSlot: null, loading: false, error: '' });
    setShowReschedule(true);
  };

  const rescheduleFetchSlots = async () => {
    if (!reschedule.appointment?.doctor || !reschedule.date) return;
    setReschedule(prev => ({ ...prev, loading: true, error: '', slots: [], selectedSlot: null }));
    try {
      const slots = await getAvailableSlots(reschedule.appointment.doctor.id, reschedule.date);
      setReschedule(prev => ({ ...prev, slots: Array.isArray(slots) ? slots : [], loading: false }));
    } catch (e) {
      setReschedule(prev => ({ ...prev, error: e instanceof Error ? e.message : 'Failed to load slots.', loading: false }));
    }
  };

  const rescheduleConfirm = async () => {
    if (!reschedule.appointment || !reschedule.selectedSlot) return;
    setReschedule(prev => ({ ...prev, loading: true, error: '' }));
    try {
      await rescheduleAppointment(reschedule.appointment.id, reschedule.selectedSlot.startTime, reschedule.selectedSlot.endTime);
      setShowReschedule(false);
      await loadDashboard();
    } catch (e) {
      setReschedule(prev => ({ ...prev, error: e instanceof Error ? e.message : 'Reschedule failed.', loading: false }));
    }
  };

  const initials = userName
    ? userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="dashboard-wrapper">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

          :root {
            --primary: #2563EB;
            --primary-dark: #1E3A8A;
            --accent: #38BDF8;
            --bg-main: #f4f7fe;
            --card-bg: #ffffff;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --border-light: #e2e8f0;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
          }

          .dashboard-wrapper {
            min-height: 100vh;
            background-color: var(--bg-main);
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: var(--text-main);
            overflow-x: hidden;
          }

          .navbar {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            padding: 16px 32px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid rgba(226, 232, 240, 0.8);
            position: sticky;
            top: 0;
            z-index: 100;
          }

          .nav-left { display: flex; align-items: center; gap: 32px; }
          .brand-logo { height: 38px; width: auto; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05)); }

          .search-container {
            display: flex;
            align-items: center;
            background-color: white;
            padding: 10px 18px;
            border-radius: 12px;
            width: 320px;
            border: 1px solid var(--border-light);
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            transition: all 0.3s ease;
          }
          .search-container:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
          .search-container input { border: none; background: transparent; margin-left: 10px; outline: none; width: 100%; font-size: 14px; font-family: inherit; color: var(--text-main); }
          .search-container input::placeholder { color: #94a3b8; }

          .nav-right { display: flex; align-items: center; gap: 16px; }

          .btn-ai {
            background: linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .btn-ai:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3); }

          .nav-icon {
            background: white;
            border: 1px solid var(--border-light);
            color: var(--text-muted);
            border-radius: 12px;
            width: 42px;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
          }
          .nav-icon:hover { background: #f8fafc; color: var(--primary); }

          .notification-dot {
            position: absolute;
            top: 10px;
            right: 12px;
            width: 8px;
            height: 8px;
            background: var(--danger);
            border-radius: 50%;
            border: 2px solid white;
          }

          .user-profile {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            background: linear-gradient(135deg, #38BDF8 0%, #2563EB 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
          }

          .content-area { padding: 32px 40px; max-width: 1500px; margin: 0 auto; }

          .welcome-header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            margin-bottom: 32px;
          }

          .greeting h1 { font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 800; color: var(--text-main); margin: 0 0 4px 0; letter-spacing: -0.5px; }
          .greeting p { font-size: 15px; color: var(--text-muted); margin: 0; font-weight: 500; }

          .btn-book {
            background: var(--text-main);
            color: white;
            border: none;
            padding: 14px 24px;
            border-radius: 14px;
            font-weight: 700;
            font-size: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            box-shadow: 0 8px 20px rgba(15, 23, 42, 0.15);
            transition: all 0.3s ease;
            font-family: inherit;
          }
          .btn-book:hover { transform: translateY(-2px); background: #1e293b; box-shadow: 0 12px 24px rgba(15, 23, 42, 0.2); }

          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }

          .kpi-card {
            background: var(--card-bg);
            border-radius: 16px;
            padding: 20px;
            border: 1px solid rgba(226, 232, 240, 0.6);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
            transition: transform 0.3s;
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .kpi-card:hover { transform: translateY(-3px); }

          .kpi-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .icon-blue { background: rgba(37, 99, 235, 0.1); color: var(--primary); }
          .icon-green { background: rgba(16, 185, 129, 0.1); color: var(--success); }
          .icon-orange { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
          .icon-red { background: rgba(239, 68, 68, 0.1); color: var(--danger); }

          .kpi-data h3 { font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px 0; }
          .kpi-data .val { font-size: 28px; font-weight: 800; color: var(--text-main); margin: 0; line-height: 1; font-family: 'Outfit', sans-serif; }

          .dashboard-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 24px; margin-bottom: 24px; }

          .hero-appointment {
            background: linear-gradient(145deg, var(--primary-dark) 0%, var(--primary) 100%);
            border-radius: 20px;
            padding: 32px;
            color: white;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(37, 99, 235, 0.25);
          }
          .hero-appointment::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -20%;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%);
            border-radius: 50%;
            pointer-events: none;
          }

          .hero-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; position: relative; z-index: 2; }

          .status-pulse {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            padding: 6px 14px;
            border-radius: 100px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .pulse-dot {
            width: 8px; height: 8px;
            background: #4ade80;
            border-radius: 50%;
            box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
            animation: pulse 1.5s infinite;
          }
          @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(74, 222, 128, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
          }

          .hero-time { text-align: right; }
          .hero-time span { font-size: 13px; font-weight: 500; opacity: 0.8; }
          .hero-time h2 { font-size: 28px; font-weight: 800; margin: 4px 0 0 0; font-family: 'Outfit', sans-serif; }

          .hero-doctor {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 32px;
            position: relative;
            z-index: 2;
            background: rgba(0, 0, 0, 0.1);
            padding: 16px;
            border-radius: 16px;
            backdrop-filter: blur(5px);
          }
          .hero-doc-avatar { width: 64px; height: 64px; border-radius: 16px; border: 2px solid rgba(255,255,255,0.3); }
          .hero-doc-info h3 { margin: 0; font-size: 22px; font-weight: 800; font-family: 'Outfit', sans-serif; }
          .hero-doc-info p { margin: 4px 0 0 0; font-size: 15px; opacity: 0.9; display: flex; align-items: center; gap: 6px; }

          .hero-actions { display: flex; gap: 16px; position: relative; z-index: 2; }

          .btn-reschedule {
            background: white; color: var(--primary-dark); border: none;
            padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 15px;
            cursor: pointer; flex: 1; transition: all 0.2s;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            font-family: inherit;
          }
          .btn-reschedule:hover { background: #f8fafc; transform: translateY(-2px); }

          .btn-cancel {
            background: rgba(255, 255, 255, 0.1); color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 14px 24px; border-radius: 12px; font-weight: 700; font-size: 15px;
            cursor: pointer; flex: 1; transition: all 0.2s;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            font-family: inherit;
          }
          .btn-cancel:hover { background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.5); }

          .no-appt {
            position: relative;
            z-index: 2;
            text-align: center;
            padding: 32px 0;
            opacity: 0.8;
          }
          .no-appt p { font-size: 16px; font-weight: 600; margin: 0 0 12px 0; }

          .clinic-panel {
            background: var(--card-bg);
            border-radius: 20px;
            border: 1px solid rgba(226, 232, 240, 0.6);
            padding: 24px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .clinic-detail-item { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px; }
          .clinic-icon-box { width: 44px; height: 44px; background: #f1f5f9; color: var(--text-main); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .clinic-text h4 { margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: var(--text-main); }
          .clinic-text p { margin: 0; font-size: 14px; color: var(--text-muted); line-height: 1.5; }

          .clinic-map-placeholder {
            height: 120px;
            background: #e2e8f0;
            border-radius: 12px;
            margin-top: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-muted);
            font-weight: 600;
            font-size: 13px;
            background: radial-gradient(#e2e8f0 20%, transparent 20%),
                        radial-gradient(#e2e8f0 20%, transparent 20%);
            background-color: #f1f5f9;
            background-position: 0 0, 10px 10px;
            background-size: 20px 20px;
          }

          .card { background: var(--card-bg); border-radius: 20px; border: 1px solid rgba(226, 232, 240, 0.6); padding: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); }
          .card-title { font-size: 18px; font-weight: 800; color: var(--text-main); font-family: 'Outfit', sans-serif; margin: 0 0 20px 0; display: flex; align-items: center; justify-content: space-between; }

          .table-header-filters { display: flex; gap: 12px; }
          .filter-btn { background: #f1f5f9; border: none; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all 0.2s; font-family: inherit; }
          .filter-btn.active { background: var(--primary); color: white; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2); }

          .table-container { width: 100%; overflow-x: auto; margin-top: 10px; }
          table { width: 100%; border-collapse: separate; border-spacing: 0 12px; font-size: 14px; }
          th { text-align: left; padding: 0 16px 12px 16px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
          td { padding: 16px; background: #f8fafc; color: var(--text-main); font-weight: 500; }
          tr td:first-child { border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
          tr td:last-child { border-top-right-radius: 12px; border-bottom-right-radius: 12px; }

          .appt-date { display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--text-main); }
          .appt-date svg { color: var(--primary); }

          .appt-status { padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; }
          .st-confirmed { background: rgba(16, 185, 129, 0.1); color: var(--success); }
          .st-completed { background: rgba(37, 99, 235, 0.1); color: var(--primary); }
          .st-cancelled { background: rgba(239, 68, 68, 0.1); color: var(--danger); }

          .action-more { background: white; border: 1px solid var(--border-light); border-radius: 8px; padding: 6px; color: var(--text-muted); cursor: pointer; }
          .action-more:hover { color: var(--text-main); background: #f1f5f9; }

          /* Loading & Error states */
          .page-loading {
            display: flex; align-items: center; justify-content: center;
            min-height: 50vh; font-size: 16px; color: var(--text-muted); font-weight: 600;
          }
          .page-error {
            margin: 32px 40px;
            background: rgba(239,68,68,0.08);
            border: 1px solid rgba(239,68,68,0.3);
            color: var(--danger);
            padding: 20px 24px;
            border-radius: 16px;
            font-weight: 600;
          }

          /* Modal overlay */
          .modal-overlay {
            position: fixed; inset: 0;
            background: rgba(15, 23, 42, 0.5);
            backdrop-filter: blur(4px);
            z-index: 1000;
            display: flex; align-items: center; justify-content: center;
            padding: 20px;
          }

          .modal-card {
            background: white;
            border-radius: 20px;
            padding: 32px;
            width: 100%;
            max-width: 520px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.2);
            animation: fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .modal-header {
            display: flex; align-items: center; justify-content: space-between;
            margin-bottom: 24px;
          }
          .modal-title { font-size: 22px; font-weight: 800; color: var(--text-main); font-family: 'Outfit', sans-serif; margin: 0; }

          .modal-close {
            background: #f1f5f9; border: none; border-radius: 10px;
            width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
            cursor: pointer; color: var(--text-muted); transition: all 0.2s;
          }
          .modal-close:hover { background: #e2e8f0; color: var(--text-main); }

          .modal-error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3); color: var(--danger); padding: 12px 16px; border-radius: 10px; font-size: 14px; font-weight: 500; margin-bottom: 16px; }

          .doctor-list { display: flex; flex-direction: column; gap: 10px; max-height: 320px; overflow-y: auto; }
          .doctor-item {
            display: flex; align-items: center; gap: 14px;
            padding: 14px; border-radius: 12px; border: 2px solid var(--border-light);
            cursor: pointer; transition: all 0.2s; font-family: inherit;
            background: white; text-align: left;
          }
          .doctor-item:hover { border-color: var(--primary); background: #f0f6ff; }
          .doctor-item.selected { border-color: var(--primary); background: #f0f6ff; }
          .doctor-avatar { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #eff6ff, #dbeafe); display: flex; align-items: center; justify-content: center; color: var(--primary); flex-shrink: 0; }
          .doctor-item-name { font-size: 15px; font-weight: 700; color: var(--text-main); margin: 0 0 2px; }
          .doctor-item-spec { font-size: 13px; color: var(--text-muted); font-weight: 500; margin: 0; }

          .date-input-group { margin-bottom: 20px; }
          .date-input-group label { display: block; font-size: 14px; font-weight: 600; color: var(--text-main); margin-bottom: 8px; }
          .date-input-group input[type="date"] {
            width: 100%; padding: 14px 16px; border: 2px solid var(--border-light);
            border-radius: 12px; font-family: inherit; font-size: 15px;
            color: var(--text-main); background: #f8fafc; box-sizing: border-box;
            transition: all 0.2s;
          }
          .date-input-group input[type="date"]:focus { outline: none; border-color: var(--primary); background: white; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

          .slots-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; max-height: 240px; overflow-y: auto; margin-bottom: 20px; }
          .slot-btn {
            padding: 10px 8px; border: 2px solid var(--border-light); border-radius: 10px;
            background: white; font-family: inherit; font-size: 13px; font-weight: 600;
            color: var(--text-main); cursor: pointer; transition: all 0.2s; text-align: center;
          }
          .slot-btn:hover { border-color: var(--primary); color: var(--primary); background: #f0f6ff; }
          .slot-btn.selected { border-color: var(--primary); background: var(--primary); color: white; }

          .no-slots { text-align: center; padding: 24px; color: var(--text-muted); font-weight: 600; font-size: 14px; }

          .modal-actions { display: flex; gap: 12px; margin-top: 24px; }
          .btn-modal-primary {
            flex: 1; padding: 14px; background: var(--primary); color: white;
            border: none; border-radius: 12px; font-family: inherit; font-size: 15px; font-weight: 700;
            cursor: pointer; transition: all 0.2s;
          }
          .btn-modal-primary:hover:not(:disabled) { background: var(--primary-dark); }
          .btn-modal-primary:disabled { opacity: 0.5; cursor: not-allowed; }

          .btn-modal-secondary {
            padding: 14px 20px; background: #f1f5f9; color: var(--text-main);
            border: none; border-radius: 12px; font-family: inherit; font-size: 15px; font-weight: 700;
            cursor: pointer; transition: all 0.2s;
          }
          .btn-modal-secondary:hover { background: #e2e8f0; }

          .confirm-detail { background: #f8fafc; border-radius: 14px; padding: 16px 20px; margin-bottom: 8px; }
          .confirm-detail-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 14px; }
          .confirm-detail-row span:first-child { color: var(--text-muted); font-weight: 500; }
          .confirm-detail-row span:last-child { color: var(--text-main); font-weight: 700; }
        `}
      </style>

      {/* TOP NAVIGATION */}
      <nav className="navbar">
        <div className="nav-left">
          <img src={clinicoLogo} alt="Clinico Logo" className="brand-logo" />
          <div className="search-container">
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="Search appointments, history..." />
          </div>
        </div>
        <div className="nav-right">
          <button className="btn-ai"><Sparkles size={16} /> Clinico AI Helper</button>
          <div className="nav-icon" onClick={openProfileModal} title="Edit Profile"><Settings size={20} /></div>
          <div className="nav-icon">
            <Bell size={20} />
            <div className="notification-dot"></div>
          </div>
          <div className="nav-icon" onClick={onLogout} title="Sign Out" style={{ color: '#ef4444' }}>
            <LogOut size={20} />
          </div>
          <div className="user-profile" onClick={openProfileModal} title="Edit Profile">
            {initials}
          </div>
        </div>
      </nav>

      {pageLoading && <div className="page-loading">Loading your dashboard…</div>}
      {pageError && <div className="page-error">{pageError}</div>}

      {!pageLoading && !pageError && (
        <div className="content-area">

          {/* WELCOME AREA */}
          <div className="welcome-header">
            <div className="greeting">
              <h1>{greeting}, {userName || 'there'}!</h1>
              <p>Here is your scheduling overview and clinic updates.</p>
            </div>
            <button className="btn-book" onClick={openBookModal}><Plus size={20} /> Book Appointment</button>
          </div>

          {/* KPI ROW */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon icon-blue"><CalendarCheck size={26} /></div>
              <div className="kpi-data">
                <h3>Total Visits</h3>
                <p className="val">{stats?.total ?? '—'}</p>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon icon-orange"><Clock size={26} /></div>
              <div className="kpi-data">
                <h3>Upcoming</h3>
                <p className="val">{stats?.upcoming ?? '—'}</p>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon icon-red"><CalendarX size={26} /></div>
              <div className="kpi-data">
                <h3>Cancelled</h3>
                <p className="val">{stats?.cancelled ?? '—'}</p>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon icon-green"><Activity size={26} /></div>
              <div className="kpi-data">
                <h3>Last Visit</h3>
                <p className="val" style={{ fontSize: 20, paddingTop: 6 }}>{formatLastVisit(stats?.lastVisit ?? null)}</p>
              </div>
            </div>
          </div>

          {/* HERO ROW */}
          <div className="dashboard-grid">
            {/* UPCOMING APPOINTMENT */}
            <div className="hero-appointment">
              {nextAppointment ? (
                <>
                  <div className="hero-header">
                    <div className="status-pulse">
                      <div className="pulse-dot"></div>
                      {getStatusLabel(nextAppointment.status)}
                    </div>
                    <div className="hero-time">
                      <span>{formatDate(nextAppointment.startTime)}</span>
                      <h2>{formatTime(nextAppointment.startTime)}</h2>
                    </div>
                  </div>
                  <div className="hero-doctor">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(nextAppointment.doctor?.name || 'Doctor')}&background=eff6ff&color=2563eb`}
                      className="hero-doc-avatar"
                      alt="Doctor"
                    />
                    <div className="hero-doc-info">
                      <h3>{nextAppointment.doctor?.name || 'Doctor'}</h3>
                      <p><Stethoscope size={16} /> {nextAppointment.doctor?.specialization || 'General Consultant'}</p>
                    </div>
                  </div>
                  <div className="hero-actions">
                    <button className="btn-reschedule" onClick={() => openReschedule(nextAppointment)}>
                      <Clock size={18} /> Reschedule
                    </button>
                    <button className="btn-cancel" onClick={() => setCancelTarget(nextAppointment)}>
                      <CalendarX size={18} /> Cancel Appointment
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-appt">
                  <p>No upcoming appointments</p>
                  <button className="btn-reschedule" style={{ display: 'inline-flex', width: 'auto' }} onClick={openBookModal}>
                    <Plus size={16} /> Book one now
                  </button>
                </div>
              )}
            </div>

            {/* CLINIC PROFILE */}
            <div className="clinic-panel">
              <h2 className="card-title" style={{ margin: '0 0 16px 0' }}>My Clinic Profile</h2>
              <div>
                <div className="clinic-detail-item">
                  <div className="clinic-icon-box"><MapPin size={22} /></div>
                  <div className="clinic-text">
                    <h4>Clinico Care Central</h4>
                    <p>124, MG Road, Indiranagar<br />Bangalore, KA 560038</p>
                  </div>
                </div>
                <div className="clinic-detail-item">
                  <div className="clinic-icon-box"><PhoneCall size={22} /></div>
                  <div className="clinic-text">
                    <h4>Contact Desk</h4>
                    <p>+91 98765 43210<br />support@clinico.in</p>
                  </div>
                </div>
              </div>
              <div className="clinic-map-placeholder">
                <span style={{ opacity: 0.5 }}>Map View</span>
              </div>
            </div>
          </div>

          {/* APPOINTMENT HISTORY TABLE */}
          <div className="card">
            <div className="card-title">
              Appointment History
              <div className="table-header-filters">
                {(['all', 'completed', 'cancelled'] as const).map(f => (
                  <button
                    key={f}
                    className={`filter-btn ${activeFilter === f ? 'active' : ''}`}
                    onClick={() => setActiveFilter(f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="table-container">
              {filteredAppointments.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontWeight: 600 }}>No appointments to show.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Doctor</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map(appt => (
                      <tr key={appt.id}>
                        <td>
                          <div className="appt-date">
                            <Calendar size={18} />
                            {formatDate(appt.startTime)}, {formatTime(appt.startTime)}
                          </div>
                        </td>
                        <td>{appt.doctor?.name || 'Doctor'}<br /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{appt.doctor?.specialization || 'General Consultant'}</span></td>
                        <td>
                          <span className={`appt-status ${getStatusClass(appt.status)}`}>
                            {appt.status === 'completed' && <CheckCircle2 size={14} />}
                            {appt.status === 'cancelled' && <CalendarX size={14} />}
                            {(appt.status === 'booked' || appt.status === 'rescheduled') && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />}
                            {getStatusLabel(appt.status)}
                          </span>
                        </td>
                        <td style={{ width: 80 }}>
                          <button className="action-more" onClick={() => (appt.status === 'booked' || appt.status === 'rescheduled') ? openReschedule(appt) : undefined}>
                            <ChevronRight size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── BOOK APPOINTMENT MODAL ── */}
      {showBook && (
        <div className="modal-overlay" onClick={() => setShowBook(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {book.step === 'doctor' && 'Choose a Doctor'}
                {book.step === 'date' && 'Pick a Date'}
                {book.step === 'slot' && 'Select a Time Slot'}
                {book.step === 'confirm' && 'Confirm Booking'}
              </h2>
              <button className="modal-close" onClick={() => setShowBook(false)}><X size={18} /></button>
            </div>

            {book.error && <div className="modal-error">{book.error}</div>}

            {book.step === 'doctor' && (
              book.loading ? <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading doctors…</p> : (
                <div className="doctor-list">
                  {book.doctors.length === 0 && <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No doctors available.</p>}
                  {book.doctors.map(doc => (
                    <button key={doc.id} className={`doctor-item ${book.selectedDoctor?.id === doc.id ? 'selected' : ''}`} onClick={() => bookSelectDoctor(doc)}>
                      <div className="doctor-avatar"><Stethoscope size={20} /></div>
                      <div>
                        <p className="doctor-item-name">{doc.name}</p>
                        <p className="doctor-item-spec">{doc.specialization}</p>
                      </div>
                      {book.selectedDoctor?.id === doc.id && <CheckCircle2 size={18} style={{ marginLeft: 'auto', color: 'var(--primary)' }} />}
                    </button>
                  ))}
                </div>
              )
            )}

            {book.step === 'date' && (
              <>
                <div className="date-input-group">
                  <label>Select Date</label>
                  <input
                    type="date"
                    min={today}
                    value={book.date}
                    onChange={e => setBook(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="modal-actions">
                  <button className="btn-modal-secondary" onClick={() => setBook(prev => ({ ...prev, step: 'doctor' }))}>Back</button>
                  <button className="btn-modal-primary" disabled={!book.date || book.loading} onClick={bookFetchSlots}>
                    {book.loading ? 'Loading…' : 'See Available Slots'} <ChevronDown size={16} style={{ display: 'inline' }} />
                  </button>
                </div>
              </>
            )}

            {book.step === 'slot' && (
              <>
                {book.slots.length === 0
                  ? <div className="no-slots">No slots available on this date.<br />Try a different date.</div>
                  : (
                    <div className="slots-grid">
                      {book.slots.map((slot, i) => (
                        <button
                          key={i}
                          className={`slot-btn ${book.selectedSlot === slot ? 'selected' : ''}`}
                          onClick={() => setBook(prev => ({ ...prev, selectedSlot: slot }))}
                        >
                          {formatTime(slot.startTime)}
                        </button>
                      ))}
                    </div>
                  )
                }
                <div className="modal-actions">
                  <button className="btn-modal-secondary" onClick={() => setBook(prev => ({ ...prev, step: 'date', slots: [], selectedSlot: null }))}>Back</button>
                  <button
                    className="btn-modal-primary"
                    disabled={!book.selectedSlot}
                    onClick={() => setBook(prev => ({ ...prev, step: 'confirm' }))}
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {book.step === 'confirm' && book.selectedDoctor && book.selectedSlot && (
              <>
                <div className="confirm-detail">
                  <div className="confirm-detail-row"><span>Doctor</span><span>{book.selectedDoctor.name}</span></div>
                  <div className="confirm-detail-row"><span>Specialization</span><span>{book.selectedDoctor.specialization}</span></div>
                  <div className="confirm-detail-row"><span>Date</span><span>{formatDate(book.selectedSlot.startTime)}</span></div>
                  <div className="confirm-detail-row"><span>Time</span><span>{formatTime(book.selectedSlot.startTime)} – {formatTime(book.selectedSlot.endTime)}</span></div>
                </div>
                <div className="modal-actions">
                  <button className="btn-modal-secondary" onClick={() => setBook(prev => ({ ...prev, step: 'slot' }))}>Back</button>
                  <button className="btn-modal-primary" disabled={book.loading} onClick={bookConfirm}>
                    {book.loading ? 'Booking…' : 'Confirm Booking'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── RESCHEDULE MODAL ── */}
      {showReschedule && reschedule.appointment && (
        <div className="modal-overlay" onClick={() => setShowReschedule(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Reschedule Appointment</h2>
              <button className="modal-close" onClick={() => setShowReschedule(false)}><X size={18} /></button>
            </div>

            {reschedule.error && <div className="modal-error">{reschedule.error}</div>}

            <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 20px' }}>
              Rescheduling with <strong>{reschedule.appointment.doctor?.name || 'Doctor'}</strong>
            </p>

            <div className="date-input-group">
              <label>New Date</label>
              <input
                type="date"
                min={today}
                value={reschedule.date}
                onChange={e => setReschedule(prev => ({ ...prev, date: e.target.value, slots: [], selectedSlot: null }))}
              />
            </div>

            <button className="btn-modal-primary" style={{ marginBottom: 16 }} disabled={!reschedule.date || reschedule.loading} onClick={rescheduleFetchSlots}>
              {reschedule.loading ? 'Loading…' : 'Load Available Slots'}
            </button>

            {reschedule.slots.length > 0 && (
              <div className="slots-grid">
                {reschedule.slots.map((slot, i) => (
                  <button
                    key={i}
                    className={`slot-btn ${reschedule.selectedSlot === slot ? 'selected' : ''}`}
                    onClick={() => setReschedule(prev => ({ ...prev, selectedSlot: slot }))}
                  >
                    {formatTime(slot.startTime)}
                  </button>
                ))}
              </div>
            )}

            {reschedule.slots.length === 0 && reschedule.loading === false && reschedule.date && (
              <div className="no-slots">Click "Load Available Slots" to see options.</div>
            )}

            <div className="modal-actions">
              <button className="btn-modal-secondary" onClick={() => setShowReschedule(false)}>Cancel</button>
              <button className="btn-modal-primary" disabled={!reschedule.selectedSlot || reschedule.loading} onClick={rescheduleConfirm}>
                {reschedule.loading ? 'Saving…' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CANCEL CONFIRMATION MODAL ── */}
      {cancelTarget && (
        <div className="modal-overlay" onClick={() => setCancelTarget(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Cancel Appointment</h2>
              <button className="modal-close" onClick={() => setCancelTarget(null)}><X size={18} /></button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }}>
              Are you sure you want to cancel your appointment with <strong>{cancelTarget.doctor?.name || 'Doctor'}</strong> on <strong>{formatDate(cancelTarget.startTime)}</strong> at <strong>{formatTime(cancelTarget.startTime)}</strong>?
            </p>
            <div className="modal-actions">
              <button className="btn-modal-secondary" onClick={() => setCancelTarget(null)}>Keep It</button>
              <button
                className="btn-modal-primary"
                style={{ background: 'var(--danger)' }}
                disabled={cancelLoading}
                onClick={handleCancel}
              >
                {cancelLoading ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PROFILE EDIT MODAL ── */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-card" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit My Profile</h2>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}><X size={18} /></button>
            </div>
            {profileErr && <div className="modal-error">{profileErr}</div>}
            <form onSubmit={saveProfileData}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Full Name *</label>
                  <input className="form-input" style={{ paddingLeft: 14 }} required value={pName} onChange={e => setPName(e.target.value)} />
                </div>
                <div>
                  <label className="input-label">Age</label>
                  <input className="form-input" style={{ paddingLeft: 14 }} type="number" min={1} max={120} value={pAge} onChange={e => setPAge(e.target.value)} />
                </div>
                <div>
                  <label className="input-label">Gender</label>
                  <select className="form-input" style={{ paddingLeft: 14 }} value={pGender} onChange={e => setPGender(e.target.value)}>
                    <option value="">Not specified</option>
                    {['Male','Female','Other','Prefer not to say'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Blood Group</label>
                  <select className="form-input" style={{ paddingLeft: 14 }} value={pBlood} onChange={e => setPBlood(e.target.value)}>
                    <option value="">Unknown</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Address</label>
                  <input className="form-input" style={{ paddingLeft: 14 }} placeholder="City, State" value={pAddress} onChange={e => setPAddress(e.target.value)} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Medical History / Previous Diseases</label>
                  <textarea className="form-input" style={{ paddingLeft: 14, height: 90, resize: 'vertical' }} placeholder="e.g. Diabetes, Hypertension…" value={pHistory} onChange={e => setPHistory(e.target.value)} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-modal-secondary" onClick={() => setShowProfileModal(false)}>Cancel</button>
                <button type="submit" className="btn-modal-primary" disabled={profileSaving}>
                  {profileSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
            {/* Danger Zone */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #fee2e2' }}>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => { setShowDeleteConfirm(true); setDeleteErr(''); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1px solid #ef4444', borderRadius: 10, color: '#ef4444', padding: '9px 16px', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%', justifyContent: 'center' }}
                >
                  <Trash2 size={15} /> Delete My Account
                </button>
              ) : (
                <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 12, padding: '14px 16px' }}>
                  <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#b91c1c' }}>This will permanently delete your account and all data. This cannot be undone.</p>
                  {deleteErr && <p style={{ margin: '0 0 8px', fontSize: 12, color: '#ef4444' }}>{deleteErr}</p>}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: '9px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 9, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#64748b' }}>Cancel</button>
                    <button onClick={handleDeleteAccount} disabled={deleting} style={{ flex: 1, padding: '9px', background: '#ef4444', border: 'none', borderRadius: 9, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: 'white', opacity: deleting ? 0.6 : 1 }}>{deleting ? 'Deleting…' : 'Confirm Delete'}</button>
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

export default PatientDashboard;
