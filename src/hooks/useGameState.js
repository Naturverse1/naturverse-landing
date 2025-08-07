
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { saveGameState, loadGameState } from '../utils/saveGame'

export function useGameState() {
  const { user } = useAuth()
  const [gameState, setGameState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && !user.isGuest) {
      loadGameState(user.id).then((state) => {
        setGameState(state)
        setLoading(false)
      }).catch(() => {
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [user])

  const updateGameState = async (updates) => {
    if (!user || user.isGuest) return

    const newState = { ...gameState, ...updates }
    setGameState(newState)
    
    try {
      await saveGameState(user.id, updates)
    } catch (error) {
      console.error('Failed to save game state:', error)
      // Revert on error
      setGameState(gameState)
    }
  }

  const saveRegion = async (region) => {
    await updateGameState({ region })
  }

  const saveNavatar = async (navatarData) => {
    await updateGameState({ navatar_data: navatarData })
  }

  const saveQuest = async (questData) => {
    await updateGameState({ current_quest: questData })
  }

  const saveTurianMemory = async (memory) => {
    await updateGameState({ turian_memory: memory })
  }

  const addCompletedStamp = async (stamp) => {
    const currentStamps = gameState?.completed_stamps || []
    const updatedStamps = [...currentStamps, stamp]
    await updateGameState({ completed_stamps: updatedStamps })
  }

  return {
    gameState,
    loading,
    updateGameState,
    saveRegion,
    saveNavatar,
    saveQuest,
    saveTurianMemory,
    addCompletedStamp
  }
}
