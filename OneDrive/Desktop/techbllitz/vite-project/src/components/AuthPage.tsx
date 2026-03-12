import React, { useState } from 'react';
import clinicoLogo from '../assets/Clinico-removebg-preview.png';
import { Mail, Lock, User, Stethoscope, ClipboardList, HeartPulse, ArrowRight, Activity, Phone } from 'lucide-react';

type Role = 'patient' | 'doctor' | 'receptionist';
type AuthMode = 'login' | 'signup';

interface AuthPageProps {
  onLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<Role>('patient');
  const [isAnimating, setIsAnimating] = useState(false);

  const switchRole = (newRole: Role) => {
    if (newRole === role) return;
    setIsAnimating(true);
    setTimeout(() => {
      setRole(newRole);
      setIsAnimating(false);
    }, 300);
  };

  const switchMode = (newMode: AuthMode) => {
    setIsAnimating(true);
    setTimeout(() => {
      setMode(newMode);
      setIsAnimating(false);
    }, 300);
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    department: '', // For doctor
    employeeId: '', // For receptionist
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Authenticating...', { mode, role, formData });
    // Simulate auth logic before transitioning
    setTimeout(() => {
      onLogin();
    }, 500);
  };

  return (
    <div className="auth-container">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

          :root {
            --primary: #2563EB;
            --primary-light: #60A5FA;
            --primary-dark: #1E3A8A;
            --surface: #ffffff;
            --background: #f8fafc;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --border: #e2e8f0;
          }

          .auth-container {
            min-height: 100vh;
            width: 100vw;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at top left, #ffffff 0%, #edf4ff 100%);
            font-family: 'Outfit', sans-serif;
            position: relative;
            overflow-y: auto;
            overflow-x: hidden;
            margin: 0;
            padding: 40px 20px;
            box-sizing: border-box;
          }

          /* Ambient Background Elements */
          .bg-shape-1 {
            position: fixed;
            top: -10%;
            right: -5%;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
            border-radius: 50%;
            z-index: 0;
            animation: floatSlow 10s infinite alternate ease-in-out;
          }

          .bg-shape-2 {
            position: fixed;
            bottom: -20%;
            left: -10%;
            width: 800px;
            height: 800px;
            background: radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
            border-radius: 50%;
            z-index: 0;
            animation: floatSlow 15s infinite alternate-reverse ease-in-out;
          }

          @keyframes floatSlow {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(30px, -40px) scale(1.05); }
          }

          .auth-card {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(37, 99, 235, 0.15);
            width: 100%;
            max-width: 1100px;
            display: flex;
            overflow: hidden;
            z-index: 10;
            opacity: 0;
            transform: translateY(20px);
            animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          @keyframes fadeUp {
            to { opacity: 1; transform: translateY(0); }
          }

          /* Left Panel - Branding */
          .auth-brand-panel {
            flex: 1;
            background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
            padding: 60px 40px;
            display: none;
            flex-direction: column;
            justify-content: space-between;
            color: white;
            position: relative;
            overflow: hidden;
          }

          @media (min-width: 900px) {
            .auth-brand-panel {
              display: flex;
            }
          }

          .brand-logo-container {
            display: flex;
            align-items: center;
            gap: 16px;
            z-index: 2;
          }

          .brand-logo-img {
            width: 60px;
            height: auto;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));
            background: white;
            border-radius: 50%;
            padding: 8px;
          }

          .brand-name {
            font-size: 32px;
            font-weight: 800;
            letter-spacing: -0.5px;
          }

          .brand-content {
            z-index: 2;
          }

          .brand-title {
            font-size: 48px;
            font-weight: 700;
            line-height: 1.1;
            margin-bottom: 24px;
          }

          .brand-subtitle {
            font-size: 18px;
            font-weight: 300;
            opacity: 0.9;
            line-height: 1.6;
            max-width: 400px;
          }

          .brand-pattern {
            position: absolute;
            bottom: -100px;
            right: -100px;
            width: 500px;
            height: 500px;
            opacity: 0.1;
            pointer-events: none;
            animation: pulseSlow 8s infinite alternate;
          }

          @keyframes pulseSlow {
            0% { transform: scale(1); opacity: 0.1; }
            100% { transform: scale(1.1); opacity: 0.15; }
          }

          /* Right Panel - Form */
          .auth-form-panel {
            flex: 1.2;
            padding: 40px 80px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            background: white;
          }

          @media (max-width: 768px) {
            .auth-form-panel {
              padding: 30px 20px;
            }
          }

          .mobile-logo {
            display: flex;
            justify-content: center;
            margin-bottom: 40px;
          }

          @media (min-width: 900px) {
            .mobile-logo {
              display: none;
            }
          }

          .form-header {
            margin-bottom: 30px;
          }

          .form-title {
            font-size: 36px;
            font-weight: 700;
            color: var(--text-main);
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }

          .form-subtitle {
            color: var(--text-muted);
            font-size: 16px;
          }

          /* Role Selector */
          .role-selector {
            display: flex;
            background: var(--background);
            border-radius: 16px;
            padding: 6px;
            margin-bottom: 24px;
            gap: 4px;
            border: 1px solid var(--border);
          }

          .role-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 0;
            border-radius: 12px;
            border: none;
            background: transparent;
            color: var(--text-muted);
            font-family: inherit;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .role-btn:hover {
            color: var(--primary);
          }

          .role-btn.active {
            background: white;
            color: var(--primary);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          }

          .role-icon {
            width: 18px;
            height: 18px;
          }

          /* Form Inputs */
          .input-group {
            margin-bottom: 16px;
            position: relative;
          }

          .input-label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: var(--text-main);
            margin-bottom: 8px;
          }

          .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .input-icon {
            position: absolute;
            left: 16px;
            color: var(--text-muted);
            width: 20px;
            height: 20px;
            pointer-events: none;
            transition: color 0.3s ease;
          }

          .form-input {
            width: 100%;
            padding: 16px 16px 16px 48px;
            border: 2px solid var(--border);
            border-radius: 14px;
            font-family: inherit;
            font-size: 15px;
            color: var(--text-main);
            background: var(--background);
            transition: all 0.3s ease;
            box-sizing: border-box;
          }

          .form-input:focus {
            outline: none;
            border-color: var(--primary-light);
            background: white;
            box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.1);
          }

          .form-input:focus + .input-icon,
          .form-input:not(:placeholder-shown) + .input-icon {
            color: var(--primary);
          }

          .forgot-password {
            display: block;
            text-align: right;
            font-size: 14px;
            color: var(--primary);
            font-weight: 600;
            text-decoration: none;
            margin-top: -12px;
            margin-bottom: 32px;
            transition: color 0.3s ease;
          }

          .forgot-password:hover {
            color: var(--primary-dark);
          }

          /* Submit Button */
          .submit-btn {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%);
            color: white;
            border: none;
            border-radius: 14px;
            font-family: inherit;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            transition: all 0.3s ease;
            box-shadow: 0 10px 20px -10px rgba(37, 99, 235, 0.5);
          }

          .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 25px -10px rgba(37, 99, 235, 0.6);
          }

          .submit-btn:active {
            transform: translateY(0);
          }

          .mode-toggle {
            text-align: center;
            margin-top: 32px;
            font-size: 15px;
            color: var(--text-muted);
          }

          .mode-toggle span {
            color: var(--primary);
            font-weight: 700;
            cursor: pointer;
            transition: color 0.3s ease;
          }

          .mode-toggle span:hover {
            color: var(--primary-dark);
            text-decoration: underline;
          }

          /* Entry animations */
          .entrance-anim {
            animation: fadeInSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          .stagger-1 { animation-delay: 0.1s; }
          .stagger-2 { animation-delay: 0.2s; }
          .stagger-3 { animation-delay: 0.3s; }
          .stagger-4 { animation-delay: 0.4s; }

          @keyframes fadeInSlideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* State switch transition (Simplified) */
          .auth-form-panel {
            transition: opacity 0.3s ease, transform 0.3s ease;
          }

          .fade-exit {
            opacity: 0;
            transform: translateY(-5px);
          }
        `}
      </style>

      {/* Ambient Background */}
      <div className="bg-shape-1"></div>
      <div className="bg-shape-2"></div>

      <div className="auth-card">
        {/* Left Branding Panel */}
        <div className="auth-brand-panel">
          <div className="brand-logo-container">
            <img src={clinicoLogo} alt="Clinico Logo" className="brand-logo-img" />
            <span className="brand-name">Clinico</span>
          </div>

          <div className="brand-content">
            <h1 className="brand-title">Your Health,<br />Our Priority.</h1>
            <p className="brand-subtitle">
              Experience the next generation of healthcare management. Secure, intuitive, and designed for everywhere you go.
            </p>
          </div>

          {/* Decorative Pattern / Icon */}
          <Activity className="brand-pattern" />
        </div>

        {/* Right Form Panel */}
        <div className={`auth-form-panel ${isAnimating ? 'fade-exit' : ''}`}>
          <div className="mobile-logo entrance-anim">
            <img src={clinicoLogo} alt="Clinico Logo" style={{ width: '80px', filter: 'drop-shadow(0 4px 12px rgba(37,99,235,0.2))' }} />
          </div>

          <div className="form-header entrance-anim stagger-1">
            <h2 className="form-title">
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="form-subtitle">
              {mode === 'login' 
                ? 'Enter your credentials to access your dashboard.' 
                : 'Join Clinico to manage your healthcare journey.'}
            </p>
          </div>

          {/* Role Selection */}
          <div className="role-selector entrance-anim stagger-2">
            <button 
              className={`role-btn ${role === 'patient' ? 'active' : ''}`}
              onClick={() => switchRole('patient')}
              type="button"
            >
              <HeartPulse className="role-icon" /> Patient
            </button>
            <button 
              className={`role-btn ${role === 'doctor' ? 'active' : ''}`}
              onClick={() => switchRole('doctor')}
              type="button"
            >
              <Stethoscope className="role-icon" /> Doctor
            </button>
            <button 
              className={`role-btn ${role === 'receptionist' ? 'active' : ''}`}
              onClick={() => switchRole('receptionist')}
              type="button"
            >
              <ClipboardList className="role-icon" /> Reception
            </button>
          </div>

          {/* Login/Signup Form */}
          <form className="form-content entrance-anim stagger-3" onSubmit={handleSubmit}>

            {mode === 'signup' && (
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  <User className="input-icon" />
                </div>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <Mail className="input-icon" />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <div className="input-wrapper">
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                <Phone className="input-icon" />
              </div>
            </div>

            {/* Role Specific Fields for User Creation (Signup only, or maybe login uses IDs) */}
            {mode === 'signup' && role === 'doctor' && (
              <div className="input-group">
                <label className="input-label">Department / Specialization</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="department"
                    className="form-input"
                    placeholder="e.g. Cardiology"
                    required
                    value={formData.department}
                    onChange={handleInputChange}
                  />
                  <Stethoscope className="input-icon" />
                </div>
              </div>
            )}

            {mode === 'signup' && role === 'receptionist' && (
              <div className="input-group">
                <label className="input-label">Employee ID</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="employeeId"
                    className="form-input"
                    placeholder="REC-XXXX"
                    required
                    value={formData.employeeId}
                    onChange={handleInputChange}
                  />
                  <ClipboardList className="input-icon" />
                </div>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <Lock className="input-icon" />
              </div>
            </div>

            {mode === 'login' && (
              <a href="#" className="forgot-password">Forgot Password?</a>
            )}

            <button type="submit" className="submit-btn entrance-anim stagger-4">
              {mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={20} />
            </button>

            <div className="mode-toggle entrance-anim stagger-4">
              {mode === 'login' ? (
                <>Don't have an account? <span onClick={() => switchMode('signup')}>Sign up</span></>
              ) : (
                <>Already have an account? <span onClick={() => switchMode('login')}>Sign in</span></>
              )}
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
