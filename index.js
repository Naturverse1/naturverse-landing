import { testSupabase } from './testSupabase.js'
import { signUp, signIn, signOut, signInWithGoogle } from './auth.js'
import { searchContent } from './userFeatures.js'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Handle Turian AI POST requests
if (typeof window === 'undefined') {
  const express = require('express')
  const app = express()
  
  app.use(express.json())
  app.use(express.static('.'))
  
  app.post('/api/turian', async (req, res) => {
    try {
      const { message, userId, chatHistory, language = 'en' } = req.body
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ message: 'OpenAI API key not configured. Turian needs his magical powers!' })
      }
      
      // Build conversation context with history
      const systemPrompt = language === 'th' 
        ? `คุณคือทูเรียน เต่าทุเรียนเวทมนตร์จาก The Naturverse™ เป็นพี่ชายที่เป็นมิตรและคอยแนะนำเด็กๆ ผ่านการผจญภัยทางการศึกษาด้วยการให้กำลังใจ ภูมิปัญญาธรรมชาติ และความสนุกสนาน ใช้คำขวัญ "ดีมาก!" เมื่อมีสิ่งที่ถูกต้องหรือน่าตื่นเต้น ตอบเป็นภาษาไทย`
        : `You are Turian, a magical durian turtle from The Naturverse™, a friendly big brother who guides kids through educational adventures with encouragement, nature wisdom, and fun. Use the catchphrase "Dee mak!" when something is correct or exciting. Respond in English.`
      
      const messages = [
        {
          role: "system",
          content: systemPrompt
        }
      ]
      
      // Add chat history for context
      if (chatHistory && chatHistory.length > 0) {
        chatHistory.forEach(chat => {
          messages.push({ role: "user", content: chat.message })
          messages.push({ role: "assistant", content: chat.reply })
        })
      }
      
      messages.push({ role: "user", content: message })
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages,
        max_tokens: 200
      })
      
      const reply = completion.choices[0].message.content
      
      // Save to Supabase if user is authenticated
      if (userId) {
        try {
          const { createClient } = require('@supabase/supabase-js')
          const supabase = createClient(
            process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
            process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
          )
          
          await supabase.from('turian_chats').insert({
            user_id: userId,
            message,
            reply
          })
        } catch (dbError) {
          console.error('Database error:', dbError)
        }
      }
      
      res.json({ message: reply })
    } catch (error) {
      console.error('OpenAI API error:', error)
      res.status(500).json({ message: 'Something went wrong talking to Turian.' })
    }
  })
  
  app.get('/api/turian/history/:userId', async (req, res) => {
    try {
      const { userId } = req.params
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
      )
      
      const { data, error } = await supabase
        .from('turian_chats')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(5)
      
      if (error) throw error
      
      res.json({ history: data.reverse() })
    } catch (error) {
      console.error('History fetch error:', error)
      res.status(500).json({ message: 'Failed to fetch chat history' })
    }
  })
  
  app.post('/api/navatar', async (req, res) => {
    try {
      const { userId, responses } = req.body
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
      )
      
      const { data, error } = await supabase
        .from('navatar_data')
        .upsert({
          user_id: userId,
          responses,
          updated_at: new Date().toISOString()
        })
        .select()
      
      if (error) throw error
      
      res.json({ success: true, data })
    } catch (error) {
      console.error('Navatar save error:', error)
      res.status(500).json({ message: 'Failed to save navatar data' })
    }
  })
  
  app.post('/api/mint', async (req, res) => {
    try {
      const { walletAddress, questType, metadata } = req.body
      const { ethers } = require('ethers')
      
      if (!process.env.POLYGON_RPC_URL || !process.env.CONTRACT_ADDRESS || !process.env.PRIVATE_KEY) {
        return res.status(500).json({ message: 'Smart contract configuration missing' })
      }
      
      // Connect to Polygon network
      const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL)
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
      
      // Contract ABI for ERC-721 minting
      const contractABI = [
        "function mint(address to, string memory tokenURI) public returns (uint256)",
        "function totalSupply() public view returns (uint256)"
      ]
      
      const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet)
      
      // Prepare metadata URI (should be IPFS or hosted JSON)
      const tokenURI = metadata || `https://api.naturverse.com/metadata/${questType.toLowerCase()}`
      
      // Estimate gas and mint
      const gasEstimate = await contract.mint.estimateGas(walletAddress, tokenURI)
      const gasPrice = await provider.getFeeData()
      
      const tx = await contract.mint(walletAddress, tokenURI, {
        gasLimit: gasEstimate,
        maxFeePerGas: gasPrice.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas
      })
      
      const receipt = await tx.wait()
      const tokenId = await contract.totalSupply()
      
      res.json({ 
        success: true, 
        nftId: tokenId.toString(),
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        message: `Dee mak! Your ${questType} stamp NFT has been minted!`
      })
    } catch (error) {
      console.error('NFT minting error:', error)
      res.status(500).json({ 
        message: 'Failed to mint NFT stamp. Please check your wallet and try again.' 
      })
    }
  })

  // Daily Quest Route
  app.get('/api/daily-quest/:userId', async (req, res) => {
    try {
      const { userId } = req.params
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
      )
      
      const today = new Date().toISOString().split('T')[0]
      
      // Check if user already has a quest for today
      let { data: existingQuest, error } = await supabase
        .from('daily_quests')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single()
      
      if (existingQuest) {
        return res.json({ quest: existingQuest })
      }
      
      // Generate new quest with OpenAI
      const regions = ['Enchanted Forest', 'Ocean Depths', 'Sky Mountains', 'Golden Desert']
      const selectedRegion = regions[Math.floor(Math.random() * regions.length)]
      
      const questPrompt = `Generate a fun, educational daily quest for kids in The Naturverse™ ${selectedRegion} region. Make it interactive, nature-focused, and achievable in 10-15 minutes. Include specific tasks and learning objectives.`
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: questPrompt }],
        max_tokens: 200
      })
      
      const questText = completion.choices[0].message.content
      
      // Save new quest
      const { data: newQuest, error: insertError } = await supabase
        .from('daily_quests')
        .insert({
          user_id: userId,
          date: today,
          region: selectedRegion,
          quest_text: questText,
          completed: false
        })
        .select()
        .single()
      
      if (insertError) throw insertError
      
      res.json({ quest: newQuest })
    } catch (error) {
      console.error('Daily quest error:', error)
      res.status(500).json({ message: 'Failed to generate daily quest' })
    }
  })

  // Complete Daily Quest Route
  app.post('/api/daily-quest/complete', async (req, res) => {
    try {
      const { userId, questId } = req.body
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
      )
      
      // Mark quest as completed
      const { error: updateError } = await supabase
        .from('daily_quests')
        .update({ completed: true })
        .eq('id', questId)
        .eq('user_id', userId)
      
      if (updateError) throw updateError
      
      // Award $NATUR tokens
      const rewardAmount = Math.floor(Math.random() * 50) + 25 // 25-75 tokens
      const { error: rewardError } = await supabase
        .from('natur_rewards')
        .insert({
          user_id: userId,
          type: 'daily_quest',
          amount: rewardAmount,
          description: 'Daily quest completion reward'
        })
      
      if (rewardError) throw rewardError
      
      res.json({ 
        success: true, 
        message: `Dee mak! Quest completed! You earned ${rewardAmount} $NATUR tokens!`,
        reward: rewardAmount 
      })
    } catch (error) {
      console.error('Complete quest error:', error)
      res.status(500).json({ message: 'Failed to complete quest' })
    }
  })

  // Generate Quiz Route
  app.post('/api/generate-quiz', async (req, res) => {
    try {
      const { topic, difficulty = 'medium', userId, language = 'en' } = req.body
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ message: 'OpenAI API key not configured' })
      }
      
      const quizPrompt = language === 'th' 
        ? `สร้างแบบทดสอบ 5 ข้อเกี่ยวกับ "${topic}" สำหรับเด็ก ระดับความยาก: ${difficulty}. ตอบกลับเป็น JSON format: {"questions": [{"question": "คำถาม", "options": ["ตัวเลือก A", "ตัวเลือก B", "ตัวเลือก C", "ตัวเลือก D"], "correct": 0}]}`
        : `Create a 5-question multiple choice quiz about "${topic}" for kids, difficulty: ${difficulty}. Respond in JSON format: {"questions": [{"question": "Question text", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 0}]}`
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: quizPrompt }],
        max_tokens: 800
      })
      
      const quizData = JSON.parse(completion.choices[0].message.content)
      
      res.json({ quiz: quizData })
    } catch (error) {
      console.error('Quiz generation error:', error)
      res.status(500).json({ message: 'Failed to generate quiz' })
    }
  })

  // Submit Quiz Route
  app.post('/api/submit-quiz', async (req, res) => {
    try {
      const { userId, quizData, userAnswers, topic } = req.body
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
      )
      
      // Calculate score
      let correctAnswers = 0
      quizData.questions.forEach((question, index) => {
        if (userAnswers[index] === question.correct) {
          correctAnswers++
        }
      })
      
      const score = Math.round((correctAnswers / quizData.questions.length) * 100)
      
      // Save quiz result
      const { data: quizResult, error: saveError } = await supabase
        .from('quiz_results')
        .insert({
          user_id: userId,
          quiz_data: quizData,
          user_answers: userAnswers,
          score,
          total_questions: quizData.questions.length,
          topic
        })
        .select()
        .single()
      
      if (saveError) throw saveError
      
      // Award $NATUR tokens based on score
      const rewardAmount = Math.floor(score / 10) * 5 // 5 tokens per 10% score
      if (rewardAmount > 0) {
        await supabase
          .from('natur_rewards')
          .insert({
            user_id: userId,
            type: 'quiz',
            amount: rewardAmount,
            description: `Quiz completion: ${score}% on ${topic}`
          })
      }
      
      // Generate Navatar suggestion if score > 70%
      if (score > 70) {
        const suggestionPrompt = `Based on a ${score}% quiz score about ${topic}, suggest a fun upgrade or change to the user's magical Navatar character. Be creative and nature-themed!`
        
        try {
          const suggestion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: suggestionPrompt }],
            max_tokens: 100
          })
          
          await supabase
            .from('navatar_suggestions')
            .insert({
              user_id: userId,
              suggestion_text: suggestion.choices[0].message.content,
              based_on: 'quiz',
              activity_id: quizResult.id
            })
        } catch (suggestionError) {
          console.error('Suggestion error:', suggestionError)
        }
      }
      
      res.json({ 
        success: true, 
        score, 
        correctAnswers,
        totalQuestions: quizData.questions.length,
        reward: rewardAmount,
        message: score > 70 ? 'Dee mak! Excellent work!' : 'Good effort! Keep learning!'
      })
    } catch (error) {
      console.error('Submit quiz error:', error)
      res.status(500).json({ message: 'Failed to submit quiz' })
    }
  })

  // Get User Stats Route
  app.get('/api/user-stats/:userId', async (req, res) => {
    try {
      const { userId } = req.params
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
      )
      
      // Get total NATUR rewards
      const { data: rewards } = await supabase
        .from('natur_rewards')
        .select('amount')
        .eq('user_id', userId)
      
      const totalNatur = rewards?.reduce((sum, reward) => sum + reward.amount, 0) || 0
      
      // Get completed quests count
      const { data: quests } = await supabase
        .from('daily_quests')
        .select('id')
        .eq('user_id', userId)
        .eq('completed', true)
      
      // Get quiz stats
      const { data: quizStats } = await supabase
        .from('quiz_results')
        .select('score')
        .eq('user_id', userId)
      
      const avgScore = quizStats?.length > 0 
        ? Math.round(quizStats.reduce((sum, quiz) => sum + quiz.score, 0) / quizStats.length)
        : 0
      
      res.json({
        totalNatur,
        completedQuests: quests?.length || 0,
        totalQuizzes: quizStats?.length || 0,
        averageScore: avgScore
      })
    } catch (error) {
      console.error('User stats error:', error)
      res.status(500).json({ message: 'Failed to fetch user stats' })
    }
  })

  // AI Lesson Generation Route
  app.post('/api/ai-lesson', async (req, res) => {
    try {
      const { topic, region = 'Thailandia', ageGroup = '6-10', language = 'en' } = req.body
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ message: 'OpenAI API key not configured' })
      }
      
      const lessonPrompt = language === 'th' 
        ? `สร้างบทเรียนเด็กสำหรับหัวข้อ "${topic}" ในภูมิภาค ${region} สำหรับเด็กอายุ ${ageGroup} ปี ตอบกลับเป็น JSON format: {"title": "ชื่อบทเรียน", "summary": "สรุปบทเรียน", "content": "เนื้อหาบทเรียนแบบเต็ม", "activities": ["กิจกรรมที่ 1", "กิจกรรมที่ 2"], "difficulty": "ง่าย/ปานกลาง/ยาก", "duration": นาที}`
        : `Create an educational lesson for kids about "${topic}" set in the ${region} region for ages ${ageGroup}. Make it engaging, interactive, and culturally relevant. Respond in JSON format: {"title": "Lesson Title", "summary": "Brief lesson summary", "content": "Full lesson content with story elements", "activities": ["Activity 1", "Activity 2", "Activity 3"], "difficulty": "easy/medium/hard", "duration": minutes_number, "assets": ["image1.jpg", "sound1.mp3"]}`
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: lessonPrompt }],
        max_tokens: 1200
      })
      
      const lessonData = JSON.parse(completion.choices[0].message.content)
      
      res.json(lessonData)
    } catch (error) {
      console.error('AI lesson generation error:', error)
      res.status(500).json({ message: 'Failed to generate lesson' })
    }
  })

  // Get User Inventory Route
  app.get('/api/inventory/:userId', async (req, res) => {
    try {
      const { userId } = req.params
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
      )
      
      const { data, error } = await supabase
        .from('user_inventory')
        .select(`
          *,
          market_items (
            name,
            category,
            image_url,
            rarity,
            description,
            metadata
          )
        `)
        .eq('user_id', userId)
        .order('acquired_date', { ascending: false })
      
      if (error) throw error
      
      res.json({ inventory: data })
    } catch (error) {
      console.error('Inventory fetch error:', error)
      res.status(500).json({ message: 'Failed to fetch inventory' })
    }
  })

  // Get Purchase History Route
  app.get('/api/purchases/:userId', async (req, res) => {
    try {
      const { userId } = req.params
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
      )
      
      const { data, error } = await supabase
        .from('user_purchases')
        .select(`
          *,
          market_items (
            name,
            category,
            image_url,
            rarity
          )
        `)
        .eq('user_id', userId)
        .order('purchase_date', { ascending: false })
        .limit(50)
      
      if (error) throw error
      
      res.json({ purchases: data })
    } catch (error) {
      console.error('Purchase history error:', error)
      res.status(500).json({ message: 'Failed to fetch purchase history' })
    }
  })

  // Admin Stats Route
  app.get('/api/admin/stats', async (req, res) => {
    try {
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
      )
      
      // Get admin stats
      const { data: stats, error } = await supabase
        .from('admin_stats')
        .select('*')
        .single()
      
      if (error) throw error
      
      // Get top scorers
      const { data: topScorers } = await supabase
        .from('quiz_results')
        .select('user_id, score, created_at')
        .order('score', { ascending: false })
        .limit(10)
      
      res.json({ ...stats, topScorers })
    } catch (error) {
      console.error('Admin stats error:', error)
      res.status(500).json({ message: 'Failed to fetch admin stats' })
    }
  })
  
  const PORT = process.env.PORT || 3001
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Turian API server running on port ${PORT}`)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('testButton')
  if (button) {
    button.addEventListener('click', testSupabase)
  }

  const emailInput = document.getElementById('auth-email')
  const passwordInput = document.getElementById('password')
  const resultText = document.getElementById('authResult')

  const signupButton = document.getElementById('signupButton')
  const loginButton = document.getElementById('loginButton')
  const googleButton = document.getElementById('googleLoginButton')
  const logoutButton = document.getElementById('logoutButton')

  signupButton.onclick = async () => {
    signupButton.disabled = true
    signupButton.textContent = 'Submitting...'
    const { error } = await signUp(emailInput.value, passwordInput.value)
    if (error) {
      resultText.textContent = error.message
      signupButton.disabled = false
      signupButton.textContent = 'Sign Up'
      return
    }
    window.location.href = '/'
  }

  loginButton.onclick = async () => {
    loginButton.disabled = true
    loginButton.textContent = 'Submitting...'
    const { error } = await signIn(emailInput.value, passwordInput.value)
    if (error) {
      resultText.textContent = error.message
      loginButton.disabled = false
      loginButton.textContent = 'Log In'
      return
    }
    window.location.href = '/'
  }

  googleButton.onclick = async () => {
    googleButton.disabled = true
    googleButton.textContent = 'Redirecting...'
    await signInWithGoogle()
  }

  logoutButton.onclick = async () => {
    logoutButton.disabled = true
    await signOut()
    resultText.textContent = 'Logged out'
    logoutButton.disabled = false
  }

  const searchInput = document.getElementById('globalSearch')
  const searchButton = document.getElementById('searchButton')
  const searchResults = document.getElementById('searchResults')
  if (searchButton && searchInput && searchResults) {
    searchButton.addEventListener('click', async () => {
      const term = searchInput.value
      const { modules, quizzes, errors } = await searchContent(term)
      if (errors.length) {
        searchResults.textContent = errors[0].message
        return
      }
      const modList = modules.map((m) => `Module: ${m.title}`).join('<br>')
      const quizList = quizzes.map((q) => `Quiz: ${q.title}`).join('<br>')
      searchResults.innerHTML = [modList, quizList].filter(Boolean).join('<br>')
    })
  }
})

