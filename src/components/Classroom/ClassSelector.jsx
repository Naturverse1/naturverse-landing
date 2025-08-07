
import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, Plus, UserCheck } from 'lucide-react'

export default function ClassSelector({ userId }) {
  const [classes, setClasses] = useState([])
  const [joinCode, setJoinCode] = useState('')
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchClasses()
    }
  }, [userId])

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('class_students')
        .select(`
          class_id,
          joined_at,
          classes (
            id,
            name,
            created_at
          )
        `)
        .eq('student_id', userId)

      if (error) throw error

      setClasses(data?.map(cs => ({
        ...cs.classes,
        joined_at: cs.joined_at
      })) || [])
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const joinClass = async () => {
    if (!joinCode.trim()) {
      alert('Please enter a class code')
      return
    }

    try {
      // First, find the class by ID (using the join code as class ID for simplicity)
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', joinCode.trim())
        .single()

      if (classError || !classData) {
        alert('Invalid class code. Please check and try again.')
        return
      }

      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('class_students')
        .select('*')
        .eq('student_id', userId)
        .eq('class_id', joinCode.trim())
        .single()

      if (existingEnrollment) {
        alert('You are already enrolled in this class!')
        return
      }

      // Join the class
      const { error: joinError } = await supabase
        .from('class_students')
        .insert({
          class_id: joinCode.trim(),
          student_id: userId
        })

      if (joinError) throw joinError

      // Refresh classes
      fetchClasses()
      setJoinCode('')
      setShowJoinForm(false)
      alert(`Successfully joined "${classData.name}"!`)
    } catch (error) {
      console.error('Error joining class:', error)
      alert('Failed to join class. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center">
          <Users className="mr-2" size={20} />
          Your Classes ({classes.length})
        </h3>
        <button
          onClick={() => setShowJoinForm(!showJoinForm)}
          className="bg-nature-green hover:bg-nature-green/90 text-white px-3 py-1 rounded-lg text-sm flex items-center"
        >
          <Plus size={14} className="mr-1" />
          Join
        </button>
      </div>

      {/* Join Class Form */}
      {showJoinForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium mb-2">Join a Class</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter class code..."
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-nature-green"
              onKeyPress={(e) => e.key === 'Enter' && joinClass()}
            />
            <button
              onClick={joinClass}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
            >
              Join
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ask your teacher for the class code
          </p>
        </div>
      )}

      {/* Classes List */}
      {classes.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Users size={32} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">No classes yet</p>
          <p className="text-xs">Join a class to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{classItem.name}</h4>
                  <p className="text-xs text-gray-500">
                    Joined: {new Date(classItem.joined_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Code: {classItem.id.slice(0, 8)}
                  </p>
                </div>
                <UserCheck size={16} className="text-green-600 mt-1" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
