
import React, { useState } from 'react'
import { Trophy, Clock, Star, Award, Play } from 'lucide-react'

const Quizzes = () => {
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const quizzes = [
    {
      id: 1,
      title: 'Forest Animals Quiz',
      difficulty: 'Easy',
      questions: 5,
      timeLimit: 10,
      region: 'forest',
      emoji: '🦊',
      description: 'Test your knowledge about forest animals!'
    },
    {
      id: 2,
      title: 'Ocean Life Quiz',
      difficulty: 'Medium',
      questions: 8,
      timeLimit: 15,
      region: 'ocean',
      emoji: '🐠',
      description: 'Dive into marine biology questions!'
    },
    {
      id: 3,
      title: 'Mountain Explorer Quiz',
      difficulty: 'Hard',
      questions: 10,
      timeLimit: 20,
      region: 'mountain',
      emoji: '🏔️',
      description: 'Challenge yourself with mountain facts!'
    }
  ]

  const sampleQuestions = [
    {
      question: "Which animal is known as the 'King of the Forest'?",
      options: ['Wolf', 'Bear', 'Lion', 'Eagle'],
      correct: 2
    },
    {
      question: "What do trees produce that we breathe?",
      options: ['Carbon Dioxide', 'Oxygen', 'Nitrogen', 'Helium'],
      correct: 1
    },
    {
      question: "Which season do most trees lose their leaves?",
      options: ['Spring', 'Summer', 'Autumn', 'Winter'],
      correct: 2
    }
  ]

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz)
    setCurrentQuestion(0)
    setScore(0)
    setShowResults(false)
    setSelectedAnswer('')
  }

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex)
  }

  const nextQuestion = () => {
    if (selectedAnswer === sampleQuestions[currentQuestion].correct) {
      setScore(score + 1)
    }

    if (currentQuestion + 1 < sampleQuestions.length) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer('')
    } else {
      setShowResults(true)
    }
  }

  const resetQuiz = () => {
    setSelectedQuiz(null)
    setCurrentQuestion(0)
    setScore(0)
    setShowResults(false)
    setSelectedAnswer('')
  }

  const getScoreMessage = () => {
    const percentage = (score / sampleQuestions.length) * 100
    if (percentage >= 90) return { message: "Amazing! You're a nature expert! 🌟", stamp: "🏆" }
    if (percentage >= 70) return { message: "Great job! You know your nature facts! 🎉", stamp: "⭐" }
    if (percentage >= 50) return { message: "Good effort! Keep learning! 💪", stamp: "🌱" }
    return { message: "Keep exploring and try again! 🌿", stamp: "🌸" }
  }

  if (selectedQuiz && !showResults) {
    const question = sampleQuestions[currentQuestion]
    
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-nature-green">
              {selectedQuiz.title}
            </h1>
            <div className="flex items-center text-gray-600">
              <Clock className="mr-1" size={20} />
              <span>{selectedQuiz.timeLimit}:00</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion + 1} of {sampleQuestions.length}</span>
              <span>Score: {score}/{currentQuestion}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-nature-green h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / sampleQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-6">{question.question}</h2>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedAnswer === index
                      ? 'border-nature-green bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={resetQuiz}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Exit Quiz
            </button>
            <button
              onClick={nextQuestion}
              disabled={selectedAnswer === ''}
              className="px-6 py-2 btn-primary disabled:opacity-50"
            >
              {currentQuestion + 1 === sampleQuestions.length ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showResults) {
    const { message, stamp } = getScoreMessage()
    const percentage = (score / sampleQuestions.length) * 100

    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card">
          <div className="text-6xl mb-4">{stamp}</div>
          <h1 className="text-3xl font-bold text-nature-green mb-2">Quiz Complete!</h1>
          <p className="text-xl text-gray-600 mb-6">{message}</p>
          
          <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-lg p-6 mb-6">
            <div className="text-4xl font-bold text-nature-green mb-2">
              {score}/{sampleQuestions.length}
            </div>
            <div className="text-lg text-gray-700">
              {percentage.toFixed(0)}% Correct
            </div>
          </div>

          {percentage >= 70 && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
              <Award className="mx-auto mb-2 text-yellow-600" size={32} />
              <p className="text-yellow-800 font-medium">
                Congratulations! You earned a new stamp! 🎉
              </p>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => startQuiz(selectedQuiz)}
              className="btn-secondary"
            >
              Try Again
            </button>
            <button
              onClick={resetQuiz}
              className="btn-primary"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-nature-green font-kid-friendly mb-2">
          🏆 Nature Quizzes
        </h1>
        <p className="text-gray-600">Test your knowledge and earn amazing stamps!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="card hover:shadow-xl transition-all">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{quiz.emoji}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{quiz.title}</h3>
              <p className="text-gray-600 text-sm">{quiz.description}</p>
            </div>

            <div className="space-y-2 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Difficulty:</span>
                <span className={`badge ${
                  quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                  quiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {quiz.difficulty}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Questions:</span>
                <span>{quiz.questions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time Limit:</span>
                <span>{quiz.timeLimit} minutes</span>
              </div>
            </div>

            <button
              onClick={() => startQuiz(quiz)}
              className="w-full btn-primary flex items-center justify-center"
            >
              <Play className="mr-2" size={20} />
              Start Quiz
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Quizzes
