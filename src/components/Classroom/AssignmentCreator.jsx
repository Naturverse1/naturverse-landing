
import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Calendar, BookOpen, Send } from 'lucide-react'

export default function AssignmentCreator({ classId, onAssignmentCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [moduleId, setModuleId] = useState('')
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('id, title')
        .order('title')

      if (error) throw error
      setModules(data || [])
    } catch (error) {
      console.error('Error fetching modules:', error)
    }
  }

  const createAssignment = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Please fill in title and description')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('assignments')
        .insert({
          class_id: classId,
          title: title.trim(),
          description: description.trim(),
          due_date: dueDate || null,
          module_id: moduleId || null
        })

      if (error) throw error

      // Reset form
      setTitle('')
      setDescription('')
      setDueDate('')
      setModuleId('')
      setShowForm(false)

      // Notify parent component
      onAssignmentCreated && onAssignmentCreated()
      
      alert('Assignment created successfully!')
    } catch (error) {
      console.error('Error creating assignment:', error)
      alert('Failed to create assignment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center">
          <BookOpen className="mr-2" size={20} />
          Create Assignment
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={16} className="mr-2" />
          New Assignment
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter assignment title..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the assignment tasks and expectations..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              {/* Module Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Module (Optional)
                </label>
                <select
                  value={moduleId}
                  onChange={(e) => setModuleId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  disabled={loading}
                >
                  <option value="">Select a module...</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={createAssignment}
                disabled={loading || !title.trim() || !description.trim()}
                className="bg-nature-green hover:bg-nature-green/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send size={16} className="mr-2" />
                )}
                {loading ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="text-center py-8 text-gray-500">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>Click "New Assignment" to create your first assignment</p>
          <p className="text-sm mt-2">Students will see assignments here once created</p>
        </div>
      )}
    </div>
  )
}
