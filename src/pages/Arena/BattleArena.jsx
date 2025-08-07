
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function BattleArena() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [arenaChannel, setArenaChannel] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('battle-arena');
    setArenaChannel(channel);

    // Listen for new questions
    channel.on('broadcast', { event: 'new-question' }, payload => {
      setQuestion(payload.payload);
      setMessage('');
      setAnswer('');
      setTimeLeft(30);
      setGameStarted(true);
    });

    // Listen for score updates
    channel.on('broadcast', { event: 'score-update' }, payload => {
      setPlayers(payload.payload.players);
    });

    // Listen for player join/leave
    channel.on('broadcast', { event: 'player-count' }, payload => {
      setPlayerCount(payload.payload.count);
    });

    // Listen for game end
    channel.on('broadcast', { event: 'game-end' }, payload => {
      setGameStarted(false);
      setMessage(`🏆 Game Over! Winner: ${payload.payload.winner}`);
    });

    channel.subscribe();

    // Announce player joined
    channel.send({
      type: 'broadcast',
      event: 'player-joined',
      payload: { userId: user.id, name: user.email }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  // Timer countdown
  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [gameStarted, timeLeft]);

  async function submitAnswer() {
    if (!question || !answer || !user) return;

    const correct = answer.toLowerCase().trim() === question.answer.toLowerCase().trim();
    
    if (correct) {
      const newScore = score + 10;
      setScore(newScore);
      
      // Broadcast score update
      arenaChannel.send({
        type: 'broadcast',
        event: 'score-update',
        payload: {
          players: [...players.filter(p => p.userId !== user.id), {
            userId: user.id,
            name: user.email,
            score: newScore
          }]
        }
      });
      
      setMessage('✅ Correct! +10 points');
      setAnswer('');
    } else {
      setMessage('❌ Oops, try again!');
    }
  }

  async function startNewGame() {
    const questions = [
      { text: "What is the largest mammal in the ocean?", answer: "whale" },
      { text: "Which tree produces durian fruit?", answer: "durian tree" },
      { text: "What gas do plants absorb from the atmosphere?", answer: "carbon dioxide" },
      { text: "Which region in Naturverse has golden sands?", answer: "golden desert" },
      { text: "What does Turian the turtle say when excited?", answer: "dee mak" }
    ];
    
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    arenaChannel.send({
      type: 'broadcast',
      event: 'new-question',
      payload: randomQuestion
    });
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      submitAnswer();
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6'>
      <div className='max-w-2xl mx-auto'>
        <div className='bg-white rounded-lg shadow-xl p-6'>
          <h1 className='text-3xl font-bold mb-4 text-center text-purple-800'>
            ⚔️ Naturverse Quiz Battle Arena
          </h1>
          
          {/* Player Stats */}
          <div className='bg-gray-100 rounded-lg p-4 mb-6'>
            <div className='flex justify-between items-center mb-2'>
              <span className='font-semibold'>Players Online: {playerCount}</span>
              <span className='font-semibold'>Your Score: {score}</span>
            </div>
            {gameStarted && (
              <div className='text-center'>
                <span className='text-lg font-bold text-red-600'>Time Left: {timeLeft}s</span>
              </div>
            )}
          </div>

          {/* Game Area */}
          {!gameStarted ? (
            <div className='text-center py-8'>
              <p className='text-gray-600 mb-4'>
                Welcome to the Battle Arena! Test your nature knowledge against other players.
              </p>
              <button
                onClick={startNewGame}
                className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors'
              >
                🚀 Start New Game
              </button>
            </div>
          ) : (
            <div className='space-y-4'>
              {question && (
                <div className='bg-blue-50 rounded-lg p-4'>
                  <h3 className='text-lg font-bold mb-3 text-blue-800'>
                    📝 Question:
                  </h3>
                  <p className='text-gray-800 mb-4'>{question.text}</p>
                  
                  <div className='flex gap-2'>
                    <input
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className='flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500'
                      placeholder='Type your answer here...'
                      disabled={timeLeft === 0}
                    />
                    <button
                      onClick={submitAnswer}
                      disabled={!answer || timeLeft === 0}
                      className='bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors'
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
              
              {message && (
                <div className='text-center p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400'>
                  <p className='font-semibold text-yellow-800'>{message}</p>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard */}
          <div className='mt-8'>
            <h2 className='text-xl font-bold mb-4 text-center text-purple-800'>
              🏆 Leaderboard
            </h2>
            <div className='bg-gray-50 rounded-lg p-4'>
              {players.length > 0 ? (
                <ul className='space-y-2'>
                  {players
                    .sort((a, b) => b.score - a.score)
                    .map((player, index) => (
                      <li
                        key={player.userId}
                        className={`flex justify-between items-center p-2 rounded ${
                          index === 0 ? 'bg-yellow-100 border-yellow-300' : 'bg-white'
                        }`}
                      >
                        <span className='font-medium'>
                          {index === 0 ? '👑 ' : `${index + 1}. `}
                          {player.name}
                        </span>
                        <span className='font-bold text-purple-600'>
                          {player.score} pts
                        </span>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className='text-center text-gray-500'>
                  No players yet. Be the first to join!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
