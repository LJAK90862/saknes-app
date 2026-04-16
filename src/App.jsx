import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from './lib/supabase'
import MapApp from './pages/MapApp'
import Toast from './components/Toast'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export const ToastContext = createContext(null)
export const useToast = () => useContext(ToastContext)

export default function App() {
  const [user, setUser] = useState(null)
  const [toast, setToast] = useState({ msg: '', type: '', visible: false })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  function showToast(msg, type = '') {
    setToast({ msg, type, visible: true })
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000)
  }

  return (
    <AuthContext.Provider value={{ user }}>
      <ToastContext.Provider value={showToast}>
        <MapApp />
        <Toast {...toast} />
      </ToastContext.Provider>
    </AuthContext.Provider>
  )
}
