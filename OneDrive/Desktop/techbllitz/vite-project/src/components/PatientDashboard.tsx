import { 
  Search, Bell, Settings, Sparkles, 
  Plus, Calendar, Activity,
  MapPin, Clock, CalendarCheck, CalendarX,
  Stethoscope, ChevronRight, PhoneCall, CheckCircle2
} from 'lucide-react';
import clinicoLogo from '../assets/Clinico-removebg-preview.png';

interface DashboardProps {
  onLogout: () => void;
}

const PatientDashboard: React.FC<DashboardProps> = ({ onLogout }) => {
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

          /* --- TOP NAVIGATION --- */
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

          .nav-left {
            display: flex;
            align-items: center;
            gap: 32px;
          }

          .brand-logo {
            height: 38px;
            width: auto;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05));
          }

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
          .search-container:focus-within {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          }

          .search-container input {
            border: none;
            background: transparent;
            margin-left: 10px;
            outline: none;
            width: 100%;
            font-size: 14px;
            font-family: inherit;
            color: var(--text-main);
          }
          .search-container input::placeholder { color: #94a3b8; }

          .nav-right {
            display: flex;
            align-items: center;
            gap: 16px;
          }

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
          .btn-ai:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
          }

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

          /* --- MAIN CONTENT LAYOUT --- */
          .content-area {
            padding: 32px 40px;
            max-width: 1500px;
            margin: 0 auto;
          }

          .welcome-header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            margin-bottom: 32px;
          }

          .greeting h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 32px;
            font-weight: 800;
            color: var(--text-main);
            margin: 0 0 4px 0;
            letter-spacing: -0.5px;
          }
          .greeting p {
            font-size: 15px;
            color: var(--text-muted);
            margin: 0;
            font-weight: 500;
          }

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
          }
          .btn-book:hover {
            transform: translateY(-2px);
            background: #1e293b;
            box-shadow: 0 12px 24px rgba(15, 23, 42, 0.2);
          }

          /* --- PREMIUM CARDS --- */
          .card {
            background: var(--card-bg);
            border-radius: 20px;
            border: 1px solid rgba(226, 232, 240, 0.6);
            padding: 24px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          }

          .card-title {
            font-size: 18px;
            font-weight: 800;
            color: var(--text-main);
            font-family: 'Outfit', sans-serif;
            margin: 0 0 20px 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          /* --- SCHEDULING KPI ROW --- */
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 24px;
          }

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

          .kpi-icon {
            width: 52px;
            height: 52px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .icon-blue { background: rgba(37, 99, 235, 0.1); color: var(--primary); }
          .icon-green { background: rgba(16, 185, 129, 0.1); color: var(--success); }
          .icon-orange { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
          .icon-red { background: rgba(239, 68, 68, 0.1); color: var(--danger); }

          .kpi-data h3 {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 4px 0;
          }
          .kpi-data .val {
            font-size: 28px;
            font-weight: 800;
            color: var(--text-main);
            margin: 0;
            line-height: 1;
            font-family: 'Outfit', sans-serif;
          }

          /* --- MAIN DASHBOARD ROW --- */
          .dashboard-grid {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 24px;
            margin-bottom: 24px;
          }

          /* UPCOMING APPOINTMENT (Replacing Health Metrics) */
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

          .hero-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            position: relative;
            z-index: 2;
          }

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
            width: 8px;
            height: 8px;
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

          .hero-time {
            text-align: right;
          }
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
          
          .hero-doc-avatar {
            width: 64px;
            height: 64px;
            border-radius: 16px;
            border: 2px solid rgba(255,255,255,0.3);
          }

          .hero-doc-info h3 { margin: 0; font-size: 22px; font-weight: 800; font-family: 'Outfit', sans-serif; }
          .hero-doc-info p { margin: 4px 0 0 0; font-size: 15px; opacity: 0.9; display: flex; align-items: center; gap: 6px; }

          .hero-actions {
            display: flex;
            gap: 16px;
            position: relative;
            z-index: 2;
          }

          .btn-reschedule {
            background: white;
            color: var(--primary-dark);
            border: none;
            padding: 14px 24px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            cursor: pointer;
            flex: 1;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .btn-reschedule:hover { background: #f8fafc; transform: translateY(-2px); }

          .btn-cancel {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 14px 24px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            cursor: pointer;
            flex: 1;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .btn-cancel:hover { background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.5); }

          /* CLINIC INFO PANEL */
          .clinic-panel {
            background: var(--card-bg);
            border-radius: 20px;
            border: 1px solid rgba(226, 232, 240, 0.6);
            padding: 24px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .clinic-detail-item {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 20px;
          }
          .clinic-icon-box {
            width: 44px;
            height: 44px;
            background: #f1f5f9;
            color: var(--text-main);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
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
            background-image: url('https://themes.pixelbuddha.net/monochrome/assets/images/map-placeholder.png');
            background-size: cover;
            background-position: center;
          }

          /* --- RECENT APPOINTMENTS TABLE --- */
          .table-header-filters {
            display: flex;
            gap: 12px;
          }
          .filter-btn {
            background: #f1f5f9;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-muted);
            cursor: pointer;
            transition: all 0.2s;
          }
          .filter-btn.active {
            background: var(--primary);
            color: white;
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
          }

          .table-container {
            width: 100%;
            overflow-x: auto;
            margin-top: 10px;
          }
          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 12px;
            font-size: 14px;
          }
          th {
            text-align: left;
            padding: 0 16px 12px 16px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.5px;
          }
          td {
            padding: 16px;
            background: #f8fafc;
            color: var(--text-main);
            font-weight: 500;
          }
          tr td:first-child { border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
          tr td:last-child { border-top-right-radius: 12px; border-bottom-right-radius: 12px; }
          
          .appt-date { display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--text-main); }
          .appt-date svg { color: var(--primary); }

          .appt-status {
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
          .st-confirmed { background: rgba(16, 185, 129, 0.1); color: var(--success); }
          .st-completed { background: rgba(37, 99, 235, 0.1); color: var(--primary); }
          .st-cancelled { background: rgba(239, 68, 68, 0.1); color: var(--danger); }

          .action-more {
            background: white;
            border: 1px solid var(--border-light);
            border-radius: 8px;
            padding: 6px;
            color: var(--text-muted);
            cursor: pointer;
          }
          .action-more:hover { color: var(--text-main); background: #f1f5f9; }

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
          <div className="nav-icon"><Settings size={20} /></div>
          <div className="nav-icon">
            <Bell size={20} />
            <div className="notification-dot"></div>
          </div>
          <div className="user-profile" onClick={onLogout} title="Sign Out">
            Ay
          </div>
        </div>
      </nav>

      {/* MAIN DASHBOARD CONTENT */}
      <div className="content-area">
        
        {/* WELCOME AREA */}
        <div className="welcome-header">
          <div className="greeting">
            <h1>Good morning, Ayush! 👋</h1>
            <p>Here is your scheduling overview and clinic updates.</p>
          </div>
          <button className="btn-book"><Plus size={20} /> Book Appointment</button>
        </div>

        {/* KPI ROW */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon icon-blue"><CalendarCheck size={26} /></div>
            <div className="kpi-data">
              <h3>Total Visits</h3>
              <p className="val">14</p>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon icon-orange"><Clock size={26} /></div>
            <div className="kpi-data">
              <h3>Upcoming</h3>
              <p className="val">2</p>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon icon-red"><CalendarX size={26} /></div>
            <div className="kpi-data">
              <h3>Cancelled</h3>
              <p className="val">1</p>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon icon-green"><Activity size={26} /></div>
            <div className="kpi-data">
              <h3>Last Visit</h3>
              <p className="val" style={{fontSize: 20, paddingTop: 6}}>12 May</p>
            </div>
          </div>
        </div>

        {/* HERO ROW: UPCOMING APPT & CLINIC INFO */}
        <div className="dashboard-grid">
          
          {/* UPCOMING APPOINTMENT */}
          <div className="hero-appointment">
            <div className="hero-header">
              <div className="status-pulse">
                <div className="pulse-dot"></div>
                Confirmed
              </div>
              <div className="hero-time">
                <span>Tomorrow</span>
                <h2>10:30 AM</h2>
              </div>
            </div>

            <div className="hero-doctor">
              <img src="https://ui-avatars.com/api/?name=Sarah+Johnson&background=eff6ff&color=2563eb" className="hero-doc-avatar" alt="Doctor" />
              <div className="hero-doc-info">
                <h3>Dr. Sarah Johnson</h3>
                <p><Stethoscope size={16} /> Primary Care Physician • Room 204</p>
              </div>
            </div>

            <div className="hero-actions">
              <button className="btn-reschedule"><Clock size={18} /> Reschedule</button>
              <button className="btn-cancel"><CalendarX size={18} /> Cancel Appointment</button>
            </div>
          </div>

          {/* CLINIC PROFILE */}
          <div className="clinic-panel">
            <h2 className="card-title" style={{margin: '0 0 16px 0'}}>My Clinic Profile</h2>
            
            <div>
              <div className="clinic-detail-item">
                <div className="clinic-icon-box"><MapPin size={22} /></div>
                <div className="clinic-text">
                  <h4>Clinico Care Central</h4>
                  <p>124 Health Avenue, Suite 300<br/>San Francisco, CA 94103</p>
                </div>
              </div>

              <div className="clinic-detail-item">
                <div className="clinic-icon-box"><PhoneCall size={22} /></div>
                <div className="clinic-text">
                  <h4>Contact Desk</h4>
                  <p>+1 (555) 123-4567<br/>support@clinico.care</p>
                </div>
              </div>
            </div>

            <div className="clinic-map-placeholder"></div>
          </div>

        </div>

        {/* RECENT APPOINTMENTS TABLE */}
        <div className="card">
          <div className="card-title">
            Appointment History
            <div className="table-header-filters">
              <button className="filter-btn active">All</button>
              <button className="filter-btn">Completed</button>
              <button className="filter-btn">Cancelled</button>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Consultation Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="appt-date"><Calendar size={18}/> 12 May 2025, 02:00 PM</div>
                  </td>
                  <td>Routine Checkup (In-Person)</td>
                  <td>
                    <span className="appt-status st-completed"><CheckCircle2 size={14}/> Completed</span>
                  </td>
                  <td style={{width: 80}}>
                    <button className="action-more"><ChevronRight size={18} /></button>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div className="appt-date"><Calendar size={18}/> 05 Apr 2025, 11:15 AM</div>
                  </td>
                  <td>Follow-up & Reports (Online)</td>
                  <td>
                    <span className="appt-status st-completed"><CheckCircle2 size={14}/> Completed</span>
                  </td>
                  <td>
                    <button className="action-more"><ChevronRight size={18} /></button>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div className="appt-date"><Calendar size={18}/> 28 Feb 2025, 09:30 AM</div>
                  </td>
                  <td>General Consultation (In-Person)</td>
                  <td>
                    <span className="appt-status st-cancelled"><CalendarX size={14}/> Cancelled</span>
                  </td>
                  <td>
                    <button className="action-more"><ChevronRight size={18} /></button>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div className="appt-date"><Calendar size={18}/> 10 Jan 2025, 04:45 PM</div>
                  </td>
                  <td>Initial Assessment (In-Person)</td>
                  <td>
                    <span className="appt-status st-completed"><CheckCircle2 size={14}/> Completed</span>
                  </td>
                  <td>
                    <button className="action-more"><ChevronRight size={18} /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientDashboard;
