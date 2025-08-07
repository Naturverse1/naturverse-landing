
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

export default function Generator({ selectedRegion = 'forest', onNPCGenerated }) {
  const [npcs, setNpcs] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNpc, setSelectedNpc] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [npcTypes, setNpcTypes] = useState([]);
  const { user } = useAuth();

  const regionNpcTemplates = {
    forest: {
      types: [
        { id: 'guardian', name: 'Forest Guardian', emoji: '🧙‍♂️', traits: ['wise', 'protective', 'nature-loving'] },
        { id: 'sprite', name: 'Forest Sprite', emoji: '🧚‍♀️', traits: ['playful', 'mischievous', 'magical'] },
        { id: 'ranger', name: 'Forest Ranger', emoji: '🏹', traits: ['practical', 'knowledgeable', 'helpful'] },
        { id: 'druid', name: 'Ancient Druid', emoji: '🌿', traits: ['mystical', 'ancient', 'plant-whisperer'] }
      ],
      personality_base: 'connected to nature, speaks with wisdom about plants and animals',
      knowledge_areas: ['botany', 'wildlife', 'forest ecology', 'natural remedies']
    },
    ocean: {
      types: [
        { id: 'mermaid', name: 'Ocean Mermaid', emoji: '🧜‍♀️', traits: ['graceful', 'mysterious', 'water-loving'] },
        { id: 'sailor', name: 'Old Sailor', emoji: '⚓', traits: ['experienced', 'storyteller', 'weather-wise'] },
        { id: 'dolphin', name: 'Wise Dolphin', emoji: '🐬', traits: ['intelligent', 'playful', 'communicative'] },
        { id: 'pearl', name: 'Pearl Diver', emoji: '🤿', traits: ['brave', 'treasure-hunter', 'deep-sea-expert'] }
      ],
      personality_base: 'connected to the sea, speaks of tides and ocean mysteries',
      knowledge_areas: ['marine biology', 'ocean currents', 'sea creatures', 'navigation']
    },
    mountain: {
      types: [
        { id: 'shaman', name: 'Mountain Shaman', emoji: '🗿', traits: ['spiritual', 'ancient', 'stone-speaker'] },
        { id: 'climber', name: 'Peak Climber', emoji: '🧗‍♂️', traits: ['adventurous', 'determined', 'height-lover'] },
        { id: 'phoenix', name: 'Sky Phoenix', emoji: '🔥', traits: ['majestic', 'rebirth-symbol', 'fire-elemental'] },
        { id: 'monk', name: 'Mountain Monk', emoji: '🧘‍♂️', traits: ['peaceful', 'meditative', 'wisdom-seeker'] }
      ],
      personality_base: 'grounded and elevated, speaks of peaks and valleys',
      knowledge_areas: ['geology', 'weather patterns', 'meditation', 'mountain ecology']
    },
    desert: {
      types: [
        { id: 'nomad', name: 'Desert Nomad', emoji: '🏜️', traits: ['wise', 'wanderer', 'survival-expert'] },
        { id: 'sphinx', name: 'Desert Sphinx', emoji: '🦁', traits: ['riddle-master', 'ancient', 'guardian'] },
        { id: 'cactus', name: 'Talking Cactus', emoji: '🌵', traits: ['prickly-but-kind', 'patient', 'water-wise'] },
        { id: 'falcon', name: 'Desert Falcon', emoji: '🦅', traits: ['sharp-eyed', 'swift', 'sky-navigator'] }
      ],
      personality_base: 'adapted to harsh conditions, speaks of endurance and hidden oases',
      knowledge_areas: ['desert survival', 'astronomy', 'ancient wisdom', 'conservation']
    }
  };

  useEffect(() => {
    const regionData = regionNpcTemplates[selectedRegion];
    if (regionData) {
      setNpcTypes(regionData.types);
    }
  }, [selectedRegion]);

  const generateNPC = async (npcType) => {
    setIsGenerating(true);
    try {
      const regionData = regionNpcTemplates[selectedRegion];
      const template = regionData.types.find(t => t.id === npcType);
      
      if (!template) return;

      // Generate AI personality
      const personalityPrompt = `Create a unique personality for ${template.name} in The Naturverse ${selectedRegion} region. Traits: ${template.traits.join(', ')}. Base personality: ${regionData.personality_base}. Knowledge areas: ${regionData.knowledge_areas.join(', ')}. Make them educational but fun for kids. Give them a unique speaking style and favorite phrases.`;

      const response = await fetch('/api/turian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: personalityPrompt,
          userId: user?.id,
          language: 'en'
        })
      });

      const data = await response.json();
      
      const newNpc = {
        id: uuidv4(),
        name: template.name + ` ${Math.floor(Math.random() * 100)}`,
        type: template.id,
        emoji: template.emoji,
        traits: template.traits,
        region: selectedRegion,
        personality: data.message || 'A friendly guide ready to help!',
        knowledge_areas: regionData.knowledge_areas,
        generated_at: new Date(),
        conversation_count: 0,
        mood: 'friendly',
        energy_level: Math.floor(Math.random() * 5) + 3, // 3-7 energy level
        special_abilities: generateSpecialAbilities(template.traits),
        backstory: await generateBackstory(template.name, selectedRegion)
      };

      setNpcs(prev => [...prev, newNpc]);
      
      if (onNPCGenerated) {
        onNPCGenerated(newNpc);
      }

    } catch (error) {
      console.error('Failed to generate NPC:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSpecialAbilities = (traits) => {
    const abilityMap = {
      'wise': ['Ancient Knowledge', 'Sage Advice'],
      'magical': ['Nature Magic', 'Illusion Casting'],
      'protective': ['Guardian Shield', 'Danger Sense'],
      'playful': ['Joy Boost', 'Fun Games'],
      'mystical': ['Future Sight', 'Spirit Communication'],
      'practical': ['Problem Solving', 'Tool Crafting'],
      'ancient': ['Historical Memory', 'Time Wisdom']
    };

    const abilities = [];
    traits.forEach(trait => {
      if (abilityMap[trait]) {
        abilities.push(abilityMap[trait][Math.floor(Math.random() * abilityMap[trait].length)]);
      }
    });

    return abilities.length > 0 ? abilities : ['Friendly Guidance'];
  };

  const generateBackstory = async (name, region) => {
    try {
      const backstoryPrompt = `Create a short, kid-friendly backstory for ${name} living in the ${region} region of The Naturverse. Make it magical and educational. 2-3 sentences max.`;
      
      const response = await fetch('/api/turian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: backstoryPrompt,
          userId: user?.id,
          language: 'en'
        })
      });

      const data = await response.json();
      return data.message || `${name} has lived in the ${region} for many years, helping young adventurers learn about nature.`;
    } catch {
      return `${name} is a friendly guide who loves sharing knowledge about the ${region}.`;
    }
  };

  const chatWithNPC = async (npc, message) => {
    if (!message.trim()) return;

    setConversationHistory(prev => [...prev, { type: 'user', message, timestamp: new Date() }]);

    try {
      const chatPrompt = `You are ${npc.name}, a ${npc.type} in The Naturverse ${npc.region} region. Your personality: ${npc.personality}. Your traits: ${npc.traits.join(', ')}. Your knowledge areas: ${npc.knowledge_areas.join(', ')}. Your mood is ${npc.mood} and energy level is ${npc.energy_level}/10. Respond to this message from a child: "${message}". Stay in character and be educational but fun.`;

      const response = await fetch('/api/turian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatPrompt,
          userId: user?.id,
          language: 'en'
        })
      });

      const data = await response.json();
      const npcResponse = data.message || `${npc.emoji} Hello there! I'm not sure how to respond to that, but I'm happy to help you learn about nature!`;

      setConversationHistory(prev => [...prev, { type: 'npc', message: npcResponse, timestamp: new Date(), npcName: npc.name, npcEmoji: npc.emoji }]);

      // Update NPC stats
      setNpcs(prev => prev.map(n => 
        n.id === npc.id 
          ? { ...n, conversation_count: n.conversation_count + 1 }
          : n
      ));

    } catch (error) {
      console.error('NPC chat error:', error);
      setConversationHistory(prev => [...prev, { type: 'npc', message: `${npc.emoji} Sorry, I'm having trouble speaking right now. Try again later!`, timestamp: new Date(), npcName: npc.name, npcEmoji: npc.emoji }]);
    }
  };

  const deleteNPC = (npcId) => {
    setNpcs(prev => prev.filter(n => n.id !== npcId));
    if (selectedNpc && selectedNpc.id === npcId) {
      setSelectedNpc(null);
      setConversationHistory([]);
    }
  };

  return (
    <div className='max-w-6xl mx-auto p-6'>
      <div className='text-center mb-6'>
        <h1 className='text-3xl font-bold text-green-800 mb-2'>🤖 NPC Generator</h1>
        <p className='text-gray-600'>Create AI-powered companions for your {regionNpcTemplates[selectedRegion]?.types[0]?.name.split(' ')[0]} adventures!</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Generation Panel */}
        <div className='lg:col-span-1'>
          <div className='bg-white rounded-lg p-4 shadow'>
            <h2 className='text-xl font-bold mb-4 text-gray-800'>✨ Create New NPC</h2>
            <div className='space-y-3'>
              {npcTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => generateNPC(type.id)}
                  disabled={isGenerating}
                  className='w-full p-3 bg-green-100 hover:bg-green-200 border border-green-300 rounded-lg transition-colors disabled:opacity-50 text-left'
                >
                  <div className='flex items-center space-x-3'>
                    <span className='text-2xl'>{type.emoji}</span>
                    <div>
                      <div className='font-bold text-gray-800'>{type.name}</div>
                      <div className='text-xs text-gray-600'>{type.traits.join(', ')}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {isGenerating && (
              <div className='mt-4 text-center'>
                <div className='animate-spin text-2xl mb-2'>🔮</div>
                <p className='text-sm text-blue-600'>Generating magical personality...</p>
              </div>
            )}
          </div>

          {/* NPC List */}
          <div className='bg-white rounded-lg p-4 shadow mt-4'>
            <h2 className='text-xl font-bold mb-4 text-gray-800'>👥 Your NPCs ({npcs.length})</h2>
            <div className='space-y-2 max-h-64 overflow-y-auto'>
              {npcs.map(npc => (
                <div
                  key={npc.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedNpc?.id === npc.id 
                      ? 'bg-blue-100 border-blue-300' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedNpc(npc)}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-xl'>{npc.emoji}</span>
                      <div>
                        <div className='font-bold text-sm text-gray-800'>{npc.name}</div>
                        <div className='text-xs text-gray-600'>💬 {npc.conversation_count} chats</div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNPC(npc.id);
                      }}
                      className='text-red-500 hover:text-red-700 text-xs'
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
              {npcs.length === 0 && (
                <div className='text-center text-gray-500 py-4'>
                  <div className='text-2xl mb-2'>🌟</div>
                  <p className='text-sm'>Generate your first NPC companion!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NPC Details & Chat */}
        <div className='lg:col-span-2'>
          {selectedNpc ? (
            <div className='bg-white rounded-lg p-6 shadow'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center space-x-3'>
                  <span className='text-4xl'>{selectedNpc.emoji}</span>
                  <div>
                    <h2 className='text-2xl font-bold text-gray-800'>{selectedNpc.name}</h2>
                    <div className='flex items-center space-x-4 text-sm text-gray-600'>
                      <span>📍 {selectedNpc.region}</span>
                      <span>😊 {selectedNpc.mood}</span>
                      <span>⚡ {selectedNpc.energy_level}/10</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedNpc(null);
                    setConversationHistory([]);
                  }}
                  className='text-gray-400 hover:text-gray-600'
                >
                  ❌
                </button>
              </div>

              {/* NPC Info */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                <div className='bg-gray-50 p-3 rounded-lg'>
                  <h3 className='font-bold text-gray-800 mb-2'>🎭 Personality</h3>
                  <p className='text-sm text-gray-700'>{selectedNpc.personality}</p>
                </div>
                <div className='bg-gray-50 p-3 rounded-lg'>
                  <h3 className='font-bold text-gray-800 mb-2'>✨ Special Abilities</h3>
                  <div className='flex flex-wrap gap-1'>
                    {selectedNpc.special_abilities.map((ability, idx) => (
                      <span key={idx} className='bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full'>
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat Interface */}
              <div className='border rounded-lg'>
                <div className='bg-gray-100 p-3 border-b'>
                  <h3 className='font-bold text-gray-800'>💬 Chat with {selectedNpc.name}</h3>
                </div>
                <div className='h-64 overflow-y-auto p-3 bg-gray-50'>
                  {conversationHistory.length === 0 && (
                    <div className='text-center text-gray-500 mt-8'>
                      <p className='text-sm'>Start a conversation with {selectedNpc.name}!</p>
                      <p className='text-xs mt-1'>Ask about nature, their region, or anything you're curious about!</p>
                    </div>
                  )}
                  {conversationHistory.map((entry, idx) => (
                    <div key={idx} className={`mb-3 ${entry.type === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block max-w-xs p-2 rounded-lg text-sm ${
                        entry.type === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white border border-gray-200'
                      }`}>
                        {entry.type === 'npc' && <span className='mr-1'>{entry.npcEmoji}</span>}
                        {entry.message}
                      </div>
                      <div className='text-xs text-gray-500 mt-1'>
                        {entry.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className='p-3 border-t bg-white'>
                  <div className='flex space-x-2'>
                    <input
                      type="text"
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && chatWithNPC(selectedNpc, userMessage) && setUserMessage('')}
                      placeholder={`Ask ${selectedNpc.name} something...`}
                      className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500'
                    />
                    <button
                      onClick={() => {
                        chatWithNPC(selectedNpc, userMessage);
                        setUserMessage('');
                      }}
                      disabled={!userMessage.trim()}
                      className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50'
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='bg-white rounded-lg p-8 shadow text-center'>
              <div className='text-6xl mb-4'>🎭</div>
              <h2 className='text-2xl font-bold text-gray-800 mb-2'>Select an NPC to Chat</h2>
              <p className='text-gray-600'>Create or select an NPC from the left panel to start chatting and learning!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
