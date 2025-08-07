
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    return { data, error }
  }

  const signInAsGuest = () => {
    const guestUser = {
      id: crypto.randomUUID(),
      email: null,
      isGuest: true,
      user_metadata: {
        username: `Guest-${Math.floor(Math.random() * 9000) + 1000}`,
        avatar_url: 'https://placehold.co/100x100'
      }
    }
    setUser(guestUser)
    localStorage.setItem('guest_user', JSON.stringify(guestUser))
  }

  const signOut = async () => {
    localStorage.removeItem('guest_user')
    const { error } = await supabase.auth.signOut()
    setUser(null)
    return { error }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInAsGuest,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
