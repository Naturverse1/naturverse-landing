import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient.js'
import { uploadAvatar } from '../userFeatures.js'
import ProgressBar from '../components/ProgressBar.js'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ quizzes: 0, stamps: 0, modules: 0 })
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const [
        { data: userData },
        { data: quizData },
        { data: stampData },
        { data: moduleData },
      ] = await Promise.all([
        supabase
          .from('users')
          .select('username, email, avatar_url')
          .eq('id', user.id)
          .single(),
        supabase.from('user_quiz_attempts').select('id').eq('user_id', user.id),
        supabase.from('stamps').select('id').eq('user_id', user.id),
        supabase.from('learning_modules').select('id'),
      ])
      setProfile(userData)
      setAvatarUrl(userData?.avatar_url || null)
      setUsername(userData?.username || '')
      setEmail(userData?.email || '')
      setStats({
        quizzes: quizData?.length || 0,
        stamps: stampData?.length || 0,
        modules: moduleData?.length || 0,
      })
    }
    load()
  }, [])

  const handleAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const { publicUrl, error } = await uploadAvatar(file)
    if (!error) setAvatarUrl(publicUrl)
    setUploading(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return
    }
    const { error } = await supabase
      .from('users')
      .update({ username, email, avatar_url: avatarUrl })
      .eq('id', user.id)
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Profile updated')
      setProfile({ username, email, avatar_url: avatarUrl })
    }
    setSaving(false)
  }

  if (!profile) return <div>Loading...</div>

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Profile</h1>
      <ProgressBar
        totalModules={stats.modules}
        completedModules={stats.stamps}
      />
      <form onSubmit={handleSave} style={{ maxWidth: '300px' }}>
        <div style={{ marginBottom: '1rem' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              width={100}
              height={100}
              style={{ borderRadius: '50%' }}
            />
          ) : (
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: '#eee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
              }}
            >
              👤
            </div>
          )}
        </div>
        <div style={{ margin: '1rem 0' }}>
          <input type="file" onChange={handleAvatar} disabled={uploading} />
          {uploading && <p>Uploading...</p>}
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Username</label>
          <br />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Email</label>
          <br />
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {message && <p>{message}</p>}
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
      <p>Total quizzes completed: {stats.quizzes}</p>
      <p>Total stamps earned: {stats.stamps}</p>
    </div>
  )
}

