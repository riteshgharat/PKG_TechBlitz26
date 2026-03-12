import { useState, useEffect } from 'react'
import SplashScreen from './components/SplashScreen'
import AuthPage from './components/AuthPage'
import PatientDashboard from './components/PatientDashboard'
import './App.css'

function App() {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Simulate initial loading sequence for Clinico splash screen
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3500)
    
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <SplashScreen />
  }

  // If user is authenticated, route them to the new dashboard
  if (isAuthenticated) {
    return <PatientDashboard onLogout={() => setIsAuthenticated(false)} />
  }

  // Render the unified, premium auth system after splash page
  return <AuthPage onLogin={() => setIsAuthenticated(true)} />
}

export default App

