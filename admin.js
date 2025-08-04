import { getUserProfile } from './auth.js'
import { supabase } from './supabaseClient.js'
import {
  updateLearningModule,
  deleteLearningModule,
  updateQuiz,
  deleteQuiz,
} from './userFeatures.js'

document.addEventListener('DOMContentLoaded', async () => {
  const profile = await getUserProfile()
  if (!profile || !profile.is_admin) {
    window.location.href = '/'
    return
  }
  loadModules()
  loadQuizzes()
  loadFeedback()
})

async function loadModules() {
  const { data } = await supabase.from('learning_modules').select('*')
  const container = document.getElementById('modules')
  container.innerHTML = '<h2>Learning Modules</h2>'
  ;(data || []).forEach((m) => {
    const div = document.createElement('div')
    div.textContent = m.title
    const edit = document.createElement('button')
    edit.textContent = 'Edit'
    edit.onclick = async () => {
      const title = prompt('New title', m.title)
      if (title !== null) {
        await updateLearningModule(m.id, { title })
        loadModules()
      }
    }
    const del = document.createElement('button')
    del.textContent = 'Delete'
    del.onclick = async () => {
      if (confirm('Delete module?')) {
        await deleteLearningModule(m.id)
        loadModules()
      }
    }
    div.appendChild(edit)
    div.appendChild(del)
    container.appendChild(div)
  })
}

async function loadQuizzes() {
  const { data } = await supabase.from('quizzes').select('*')
  const container = document.getElementById('quizzes')
  container.innerHTML = '<h2>Quizzes</h2>'
  ;(data || []).forEach((q) => {
    const div = document.createElement('div')
    div.textContent = q.title
    const edit = document.createElement('button')
    edit.textContent = 'Edit'
    edit.onclick = async () => {
      const title = prompt('New title', q.title)
      if (title !== null) {
        await updateQuiz(q.id, { title })
        loadQuizzes()
      }
    }
    const del = document.createElement('button')
    del.textContent = 'Delete'
    del.onclick = async () => {
      if (confirm('Delete quiz?')) {
        await deleteQuiz(q.id)
        loadQuizzes()
      }
    }
    div.appendChild(edit)
    div.appendChild(del)
    container.appendChild(div)
  })
}

async function loadFeedback() {
  const { data } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })
  const container = document.getElementById('feedback')
  container.innerHTML = '<h2>Feedback Reports</h2>'
  ;(data || []).forEach((f) => {
    const div = document.createElement('div')
    div.textContent = `${f.message} (rating: ${f.rating})`
    container.appendChild(div)
  })
}
