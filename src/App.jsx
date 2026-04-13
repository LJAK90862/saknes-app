import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from './lib/supabase'
import { t as translate } from './lib/i18n'
import MapApp from './pages/MapApp'
import Toast from './components/Toast'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export const ToastContext = createContext(null)
export const useToast = () => useContext(ToastContext)

export const LangContext = createContext(null)
export const useLang = () => useContext(LangContext)

export default function App() {
  const [user, setUser] = useState(null)
  const [toast, setToast] = useState({ msg: '', type: '', visible: false })
  const [lang, setLang] = useState(() => localStorage.getItem('saknes_lang') || 'lv')

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
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000)
  }

  function toggleLang() {
    const next = lang === 'lv' ? 'en' : 'lv'
    setLang(next)
    localStorage.setItem('saknes_lang', next)
  }

  function t(key) {
    return translate(key, lang)
  }

  return (
    <AuthContext.Provider value={{ user }}>
      <ToastContext.Provider value={showToast}>
        <LangContext.Provider value={{ lang, toggleLang, t }}>
          <MapApp />
          <Toast {...toast} />
        </LangContext.Provider>
      </ToastContext.Provider>
    </AuthContext.Provider>
  )
}
