import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient.js'

const regions = ['Thailandia', 'Chinadia', 'Bharatia', 'Australis', 'Americana']

export default function AdminBadges() {
  const [allowed, setAllowed] = useState(false)
  const [users, setUsers] = useState([])
  const [userId, setUserId] = useState('')
  const [region, setRegion] = useState(regions[0])
  const [status, setStatus] = useState('')
  const [granting, setGranting] = useState(false)

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user || user.email !== 'turianmediacompany@gmail.com') {
        setStatus('Access denied')
        return
      }
      setAllowed(true)
      const { data } = await supabase
        .from('users')
        .select('id, username, email')
        .order('email')
      setUsers(data || [])
    }
    load()
  }, [])

  const grant = async () => {
    if (!userId) return
    setGranting(true)
    const { error } = await supabase.from('stamps').insert({
      user_id: userId,
      region,
      stamp_name: `${region} Badge`,
    })
    setStatus(error ? 'Error granting stamp' : 'Stamp granted!')
    setGranting(false)
  }

  if (!allowed) return <div>{status}</div>

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Grant Badge</h1>
      <div style={{ marginBottom: '1rem' }}>
        <select value={userId} onChange={(e) => setUserId(e.target.value)}>
          <option value="">Select user</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.email || u.username}
            </option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <button onClick={grant} disabled={granting}>
        {granting ? 'Granting...' : 'Grant Stamp'}
      </button>
      {status && <p>{status}</p>}
    </div>
  )
}

