import { useState, useEffect } from 'react'
import SplashScreen from './components/SplashScreen'
import AuthPage, { type LoginMeta } from './components/AuthPage'
import PatientDashboard from './components/PatientDashboard'
import DoctorDashboard from './components/DoctorDashboard'
import ReceptionDashboard from './components/ReceptionDashboard'
import PatientRegistration from './components/PatientRegistration'
import DoctorRegistration from './components/DoctorRegistration'
import ReceptionRegistration from './components/ReceptionRegistration'
import { getToken, removeToken } from './api/client'
import { getUserProfile } from './api/users'
import './App.css'

type UserMeta = { role: 'patient' | 'doctor' | 'receptionist'; isNewUser: boolean }

function App() {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userMeta, setUserMeta] = useState<UserMeta | null>(null)

  useEffect(() => {
    const timer = setTimeout(async () => {
      const token = getToken()

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const profile = await getUserProfile()
        const role = (profile.role || 'patient') as UserMeta['role']
        setUserMeta({ role, isNewUser: false })
        setIsAuthenticated(true)
      } catch {
        removeToken()
        setUserMeta(null)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }, 3500)

    return () => clearTimeout(timer)
  }, [])

  const handleLogin = (meta: LoginMeta) => {
    setUserMeta(meta)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    removeToken()
    setUserMeta(null)
    setIsAuthenticated(false)
  }

  const handleRegistrationComplete = (role?: UserMeta['role']) => {
    if (userMeta) {
      setUserMeta({
        role: role || userMeta.role,
        isNewUser: false,
      })
    }
  }

  if (loading) return <SplashScreen />

  if (!isAuthenticated || !userMeta) {
    return <AuthPage onLogin={handleLogin} />
  }

  // New user → show role-specific registration
  if (userMeta.isNewUser) {
    if (userMeta.role === 'doctor') {
      return <DoctorRegistration onComplete={() => handleRegistrationComplete('doctor')} onLogout={handleLogout} />
    }
    if (userMeta.role === 'receptionist') {
      return <ReceptionRegistration onComplete={() => handleRegistrationComplete('receptionist')} onLogout={handleLogout} />
    }
    return <PatientRegistration onComplete={() => handleRegistrationComplete('patient')} onLogout={handleLogout} />
  }

  // Existing / registered user → role-based dashboard
  if (userMeta.role === 'doctor') return <DoctorDashboard onLogout={handleLogout} />
  if (userMeta.role === 'receptionist') return <ReceptionDashboard onLogout={handleLogout} />
  return <PatientDashboard onLogout={handleLogout} />
}

export default App
