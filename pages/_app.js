import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../supabaseClient.js'
import Footer from '../components/Footer.js'
import NotificationPanel from '../components/NotificationPanel.js'
import { getGuestUser } from '../auth.js'

export default function MyApp({ Component, pageProps }) {
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isGuest, setIsGuest] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        const guest = getGuestUser()
        if (guest) {
          setAvatarUrl(guest.avatar_url)
          setIsGuest(true)
        }
        return
      }
      const { data } = await supabase
        .from('users')
        .select('avatar_url, is_admin, is_guest')
        .eq('id', user.id)
        .single()
      setAvatarUrl(data?.avatar_url || null)
      setIsAdmin(data?.is_admin || false)
      setIsGuest(data?.is_guest || false)
    }
    load()
  }, [])

  useEffect(() => {
    const protectedPaths = [
      '/avatar',
      '/map',
      '/profile',
      '/quiz',
      '/region',
      '/modules',
      '/my-stamps',
      '/quiz-results',
    ]
    const checkAuth = async (url) => {
      const path = typeof url === 'string' ? url : router.pathname
      if (!protectedPaths.some((p) => path.startsWith(p))) return
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user && !getGuestUser()) router.replace('/login')
    }
    checkAuth(router.pathname)
    router.events.on('routeChangeComplete', checkAuth)
    return () => {
      router.events.off('routeChangeComplete', checkAuth)
    }
  }, [router])

  return (
    <>
        <nav
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '0.5rem 1rem',
            borderBottom: '1px solid #ccc',
          }}
        >
          <a href="/leaderboard" style={{ marginRight: '1rem' }}>
            Leaderboard
          </a>
          {isAdmin && (
            <a href="/admin/dashboard" style={{ marginRight: '1rem' }}>
              Admin
            </a>
          )}
          <NotificationPanel />
          <a
            href="/profile"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#eee',
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: '1.5rem' }}>👤</span>
            )}
          </a>
        </nav>
      {isGuest && (
        <div
          style={{
            background: '#fff3cd',
            padding: '0.5rem',
            textAlign: 'center',
            fontSize: '0.875rem',
          }}
        >
          Your progress may be lost unless you
          <a href="/login" style={{ marginLeft: 4 }}>create an account</a>.
        </div>
      )}
      <Component {...pageProps} />
      <Footer />
    </>
  )
}

