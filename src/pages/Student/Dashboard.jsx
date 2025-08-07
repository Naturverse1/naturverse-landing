
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import ClassSelector from '../../components/Classroom/ClassSelector'
import { Backpack, BookOpen, Trophy, Calendar, Star, CheckCircle, Clock } from 'lucide-react'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [classes, setClasses] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    avgScore: 0,
    totalPoints: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchStudentData()
    }
  }, [user])

  const fetchStudentData = async () => {
    setLoading(true)
    try {
      // Fetch student's classes
      const { data: classData, error: classError } = await supabase
        .from('class_students')
        .select('class_id, classes(id, name, teacher_id)')
        .eq('student_id', user.id)

      if (classError) throw classError
      const studentClasses = classData?.map(cs => cs.classes) || []
      setClasses(studentClasses)

      if (studentClasses.length > 0) {
        const classIds = studentClasses.map(c => c.id)

        // Fetch assignments for student's classes
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('assignments')
          .select('*, classes(name)')
          .in('class_id', classIds)

        if (assignmentError) throw assignmentError
        setAssignments(assignmentData || [])

        // Fetch student's submissions
        const assignmentIds = assignmentData?.map(a => a.id) || []
        if (assignmentIds.length > 0) {
          const { data: submissionData, error: submissionError } = await supabase
            .from('assignment_submissions')
            .select('*, assignments(title, classes(name))')
            .eq('student_id', user.id)
            .in('assignment_id', assignmentIds)

          if (submissionError) throw submissionError
          setSubmissions(submissionData || [])

          // Calculate stats
          const completed = submissionData?.filter(s => s.status === 'completed').length || 0
          const pending = (assignmentData?.length || 0) - completed
          const scores = submissionData?.filter(s => s.score !== null).map(s => s.score) || []
          const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
          const totalPoints = scores.reduce((a, b) => a + b, 0)

          setStats({ completed, pending, avgScore, totalPoints })
        }
      }
    } catch (error) {
      console.error('Error fetching student data:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitAssignment = async (assignmentId) => {
    try {
      const { error } = await supabase
        .from('assignment_submissions')
        .upsert({
          assignment_id: assignmentId,
          student_id: user.id,
          submitted_at: new Date().toISOString(),
          status: 'submitted'
        })

      if (error) throw error

      // Refresh data
      fetchStudentData()
      alert('Assignment submitted successfully!')
    } catch (error) {
      console.error('Error submitting assignment:', error)
      alert('Failed to submit assignment. Please try again.')
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 rounded-lg mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <Backpack className="mr-3" size={32} />
          Student Dashboard
        </h1>
        <p className="text-green-100 mt-2">Welcome back! Continue your learning journey with The Naturverse™</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-lg text-center">
              <CheckCircle size={24} className="mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-lg text-center">
              <Clock size={24} className="mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-lg text-center">
              <Trophy size={24} className="mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{stats.avgScore}%</div>
              <div className="text-sm text-gray-600">Avg Score</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-lg text-center">
              <Star size={24} className="mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">{stats.totalPoints}</div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
          </div>

          {/* Assignments */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <BookOpen className="mr-2" size={20} />
              Your Assignments ({assignments.length})
            </h2>

            {assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p>No assignments yet. Check back later!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => {
                  const submission = submissions.find(s => s.assignment_id === assignment.id)
                  const isSubmitted = submission && submission.status === 'submitted'
                  const isCompleted = submission && submission.status === 'completed'
                  const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date()

                  return (
                    <div
                      key={assignment.id}
                      className={`border rounded-lg p-4 ${
                        isCompleted
                          ? 'border-green-200 bg-green-50'
                          : isSubmitted
                          ? 'border-blue-200 bg-blue-50'
                          : isOverdue
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{assignment.title}</h3>
                          <p className="text-gray-600 mb-2">{assignment.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Class: {assignment.classes.name}</span>
                            {assignment.due_date && (
                              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                Due: {new Date(assignment.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {submission?.score !== null && (
                            <div className="mt-2">
                              <span className="text-sm font-medium">Score: {submission.score}%</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {isCompleted ? (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              ✅ Completed
                            </span>
                          ) : isSubmitted ? (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              📝 Submitted
                            </span>
                          ) : (
                            <button
                              onClick={() => submitAssignment(assignment.id)}
                              className="bg-nature-green hover:bg-nature-green/90 text-white px-4 py-2 rounded-lg"
                            >
                              Submit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Class Selector */}
          <ClassSelector userId={user?.id} />

          {/* Recent Achievements */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Trophy className="mr-2" size={20} />
              Recent Achievements
            </h3>
            {submissions.filter(s => s.status === 'completed').slice(0, 3).map((submission) => (
              <div key={submission.id} className="border-l-4 border-yellow-500 pl-3 mb-3">
                <h4 className="font-medium text-sm">{submission.assignments.title}</h4>
                <p className="text-xs text-gray-500">{submission.assignments.classes.name}</p>
                <p className="text-xs text-yellow-600 font-medium">Score: {submission.score}%</p>
              </div>
            ))}
            {submissions.filter(s => s.status === 'completed').length === 0 && (
              <p className="text-gray-500 text-sm">Complete assignments to earn achievements!</p>
            )}
          </div>

          {/* Learning Tips */}
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-6">
            <h3 className="text-lg font-bold text-purple-800 mb-3">🌟 Learning Tips</h3>
            <ul className="text-sm text-purple-700 space-y-2">
              <li>• Complete assignments on time</li>
              <li>• Ask Turian AI for help</li>
              <li>• Explore different regions</li>
              <li>• Earn stamps and rewards</li>
            </ul>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Learning Progress</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Assignments Completed</span>
                  <span>{stats.completed}/{assignments.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-nature-green h-2 rounded-full transition-all duration-300"
                    style={{
                      width: assignments.length > 0 ? `${(stats.completed / assignments.length) * 100}%` : '0%'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
