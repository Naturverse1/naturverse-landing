import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient.js'
import { uploadAvatar } from '../userFeatures.js'
import ProgressBar from '../components/ProgressBar.js'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ quizzes: 0, stamps: 0, modules: 0 })
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [uploading, setUploading] = useState(false)

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

  if (!profile) return <div>Loading...</div>

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Profile</h1>
      <ProgressBar
        totalModules={stats.modules}
        completedModules={stats.stamps}
      />
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
      <p>Username: {profile.username}</p>
      <p>Email: {profile.email}</p>
      <p>Total quizzes completed: {stats.quizzes}</p>
      <p>Total stamps earned: {stats.stamps}</p>
      <div style={{ margin: '1rem 0' }}>
        <input type="file" onChange={handleAvatar} disabled={uploading} />
      </div>
      <button disabled>Edit Profile</button>
    </div>
  )
}

