import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import AssignmentCreator from '../../components/Classroom/AssignmentCreator'
import { BookOpen, Users, Calendar, Trophy, Plus, Eye } from 'lucide-react'
import AILessonBuilder from '../../components/Lessons/AILessonBuilder';

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [showCreateClass, setShowCreateClass] = useState(false)
  const [newClassName, setNewClassName] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview');


  useEffect(() => {
    if (user) {
      fetchTeacherData()
    }
  }, [user])

  const fetchTeacherData = async () => {
    setLoading(true)
    try {
      // Fetch classes taught by this teacher
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id)

      if (classError) throw classError
      setClasses(classData || [])

      // Fetch assignments for all teacher's classes
      if (classData && classData.length > 0) {
        const classIds = classData.map(c => c.id)
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('assignments')
          .select('*, classes(name)')
          .in('class_id', classIds)

        if (assignmentError) throw assignmentError
        setAssignments(assignmentData || [])
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error)
    } finally {
      setLoading(false)
    }
  }

  const createClass = async () => {
    if (!newClassName.trim()) return

    try {
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name: newClassName,
          teacher_id: user.id
        })
        .select()

      if (error) throw error

      setClasses(prev => [...prev, ...data])
      setNewClassName('')
      setShowCreateClass(false)
    } catch (error) {
      console.error('Error creating class:', error)
      alert('Failed to create class. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-nature-green"></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6'>
      <div className='max-w-7xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-800 mb-8'>
          👨‍🏫 Teacher Dashboard
        </h1>

        {/* Navigation Tabs */}
        <div className='bg-white rounded-lg shadow-sm p-1 mb-6'>
          <nav className='flex space-x-1'>
            {[
              { id: 'overview', label: '📊 Overview', icon: '📊' },
              { id: 'lessons', label: '🧠 AI Lesson Builder', icon: '🧠' },
              { id: 'assignments', label: '📝 Assignments', icon: '📝' },
              { id: 'students', label: '👥 Students', icon: '👥' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-nature-green text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg mb-6 hidden">
              <h1 className="text-3xl font-bold flex items-center">
                <BookOpen className="mr-3" size={32} />
                Teacher Dashboard
              </h1>
              <p className="text-blue-100 mt-2">Welcome back, {user?.email}! Manage your classes and assignments.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Classes Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <Users className="mr-2" size={20} />
                      My Classes ({classes.length})
                    </h2>
                    <button
                      onClick={() => setShowCreateClass(!showCreateClass)}
                      className="bg-nature-green hover:bg-nature-green/90 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                      <Plus size={16} className="mr-2" />
                      New Class
                    </button>
                  </div>

                  {/* Create Class Form */}
                  {showCreateClass && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newClassName}
                          onChange={(e) => setNewClassName(e.target.value)}
                          placeholder="Enter class name..."
                          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-nature-green"
                          onKeyPress={(e) => e.key === 'Enter' && createClass()}
                        />
                        <button
                          onClick={createClass}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        >
                          Create
                        </button>
                        <button
                          onClick={() => setShowCreateClass(false)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Classes List */}
                  {classes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No classes yet. Create your first class to get started!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {classes.map((classItem) => (
                        <div
                          key={classItem.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedClass?.id === classItem.id
                              ? 'border-nature-green bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedClass(classItem)}
                        >
                          <h3 className="font-bold text-lg">{classItem.name}</h3>
                          <p className="text-sm text-gray-500">
                            Created: {new Date(classItem.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Class ID: {classItem.id.slice(0, 8)}
                            </span>
                            <button className="text-blue-600 hover:text-blue-800">
                              <Eye size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Assignment Creator */}
                {selectedClass && (
                  <div className="mt-6">
                    <AssignmentCreator classId={selectedClass.id} onAssignmentCreated={fetchTeacherData} />
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-gray-600">
                        <Users size={16} className="mr-2" />
                        Classes
                      </span>
                      <span className="font-bold">{classes.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        Assignments
                      </span>
                      <span className="font-bold">{assignments.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-gray-600">
                        <Trophy size={16} className="mr-2" />
                        Active Students
                      </span>
                      <span className="font-bold">0</span>
                    </div>
                  </div>
                </div>

                {/* Recent Assignments */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Recent Assignments</h3>
                  {assignments.length === 0 ? (
                    <p className="text-gray-500 text-sm">No assignments yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {assignments.slice(0, 5).map((assignment) => (
                        <div key={assignment.id} className="border-l-4 border-blue-500 pl-3">
                          <h4 className="font-medium text-sm">{assignment.title}</h4>
                          <p className="text-xs text-gray-500">{assignment.classes.name}</p>
                          <p className="text-xs text-gray-400">
                            Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tips */}
                <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-orange-800 mb-3">💡 Teaching Tips</h3>
                  <ul className="text-sm text-orange-700 space-y-2">
                    <li>• Use Turian AI to create engaging quests</li>
                    <li>• Assign nature-themed activities</li>
                    <li>• Track student progress regularly</li>
                    <li>• Encourage peer collaboration</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lessons' && (
          <AILessonBuilder />
        )}

        {activeTab === 'assignments' && (
          <div className='bg-white rounded-lg shadow-lg p-6'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4'>📝 Manage Assignments</h3>
            <p className='text-gray-600'>Assignment management features coming soon...</p>
          </div>
        )}

        {activeTab === 'students' && (
          <div className='bg-white rounded-lg shadow-lg p-6'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4'>👥 Student Management</h3>
            <p className='text-gray-600'>Student management features coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}