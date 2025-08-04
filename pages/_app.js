import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient.js'

export default function MyApp({ Component, pageProps }) {
  const [avatarUrl, setAvatarUrl] = useState(null)

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', user.id)
        .single()
      setAvatarUrl(data?.avatar_url || null)
    }
    load()
  }, [])

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
    </>
  )
}

