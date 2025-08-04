import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient.js'

export default function LeaderboardPage() {
  const [mostAttempts, setMostAttempts] = useState([])
  const [highestAverage, setHighestAverage] = useState([])
  const [mostStamps, setMostStamps] = useState([])

  useEffect(() => {
    async function load() {
      const { data: attemptsData } = await supabase
        .from('user_quiz_attempts')
        .select('user_id, score, users(username, avatar_url)')
      const attemptsMap = {}
      attemptsData?.forEach((a) => {
        if (!attemptsMap[a.user_id]) {
          attemptsMap[a.user_id] = {
            id: a.user_id,
            username: a.users?.username,
            avatar_url: a.users?.avatar_url,
            attempts: 0,
            totalScore: 0,
          }
        }
        attemptsMap[a.user_id].attempts += 1
        attemptsMap[a.user_id].totalScore += a.score || 0
      })
      const attemptArr = Object.values(attemptsMap).map((item) => ({
        ...item,
        avgScore: item.attempts ? item.totalScore / item.attempts : 0,
      }))
      setMostAttempts(
        [...attemptArr].sort((a, b) => b.attempts - a.attempts).slice(0, 10)
      )
      setHighestAverage(
        [...attemptArr].sort((a, b) => b.avgScore - a.avgScore).slice(0, 10)
      )

      const { data: stampsData } = await supabase
        .from('stamps')
        .select('user_id, users(username, avatar_url)')
      const stampMap = {}
      stampsData?.forEach((s) => {
        if (!stampMap[s.user_id]) {
          stampMap[s.user_id] = {
            id: s.user_id,
            username: s.users?.username,
            avatar_url: s.users?.avatar_url,
            count: 0,
          }
        }
        stampMap[s.user_id].count += 1
      })
      const stampArr = Object.values(stampMap)
      setMostStamps(
        stampArr.sort((a, b) => b.count - a.count).slice(0, 10)
      )
    }
    load()
  }, [])

  const renderList = (items, valueKey) => (
    <ol>
      {items.map((item) => (
        <li
          key={item.id}
          style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}
        >
          <img
            src={item.avatar_url || '/logo.png'}
            alt="avatar"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              marginRight: '0.5rem',
              objectFit: 'cover',
            }}
          />
          <span style={{ marginRight: '0.5rem' }}>{item.username}</span>
          <span>{item[valueKey]}</span>
        </li>
      ))}
    </ol>
  )

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Leaderboard</h1>
      <section>
        <h2>Most Quiz Attempts</h2>
        {renderList(mostAttempts, 'attempts')}
      </section>
      <section>
        <h2>Highest Average Quiz Score</h2>
        {renderList(
          highestAverage.map((i) => ({ ...i, avg: i.avgScore.toFixed(2) })),
          'avg'
        )}
      </section>
      <section>
        <h2>Most Stamps Earned</h2>
        {renderList(mostStamps, 'count')}
      </section>
    </div>
  )
}

