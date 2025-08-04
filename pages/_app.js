import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../supabaseClient.js'
import Footer from '../components/Footer.js'

export default function MyApp({ Component, pageProps }) {
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('users')
        .select('avatar_url, is_admin')
        .eq('id', user.id)
        .single()
      setAvatarUrl(data?.avatar_url || null)
      setIsAdmin(data?.is_admin || false)
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
      if (!user) router.replace('/login')
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
          padding: '0.5rem 1rem',
          borderBottom: '1px solid #ccc',
        }}
      >
        {isAdmin && (
          <a href="/admin/dashboard" style={{ marginRight: '1rem' }}>
            Admin
          </a>
        )}
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
      <Component {...pageProps} />
      <Footer />
    </>
  )
}

