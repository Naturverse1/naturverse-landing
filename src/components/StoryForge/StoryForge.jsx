
import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Wand2, Volume2, VolumeX, Download, Save, Sparkles, Users, MapPin, Heart } from 'lucide-react';

const StoryForge = () => {
  const [title, setTitle] = useState("");
  const [characters, setCharacters] = useState("");
  const [setting, setSetting] = useState("");
  const [theme, setTheme] = useState("");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [savedStories, setSavedStories] = useState([]);
  const { user } = useAuth();
  
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  // Predefined options for quick selection
  const storyPresets = {
    characters: [
      "Turian the Wise Turtle, Mango the Monkey",
      "Princess Lotus, Bamboo the Panda", 
      "Captain Coconut, Starfish Sam",
      "Ruby the Red Dragon, Emerald the Elf"
    ],
    settings: [
      "The Magical Lotus Lake",
      "Enchanted Bamboo Forest", 
      "Crystal Caves of Wonder",
      "Golden Temple in the Clouds",
      "Floating Gardens of Thailandia"
    ],
    themes: [
      "friendship and teamwork",
      "courage and bravery", 
      "kindness and helping others",
      "protecting nature",
      "discovering inner magic"
    ]
  };

  const generateStory = async () => {
    if (!title.trim() || !characters.trim() || !setting.trim() || !theme.trim()) {
      alert('Please fill in all fields to create your story!');
      return;
    }

    setLoading(true);
    setStory("");

    try {
      // Since OpenAI integration requires API keys, we'll create a mock story generator
      // In production, this would connect to OpenAI API
      const storyPrompt = `Write a magical children's story called "${title}" featuring: ${characters}, set in ${setting}, with a theme of ${theme}. Make it fun, kind, and easy to read aloud. End with Turian's catchphrase: "Dee mak!"`;
      
      // Mock AI-generated story (replace with actual OpenAI call in production)
      const mockStory = generateMockStory(title, characters, setting, theme);
      
      setStory(mockStory);
      
      // Save story metadata to Supabase
      if (user && !user.isGuest) {
        await supabase.from('learning_modules').insert({
          title: title.trim(),
          description: `AI-generated story about ${theme}`,
          content_type: 'storybook',
          region: 'Thailandia',
          age_group: '6-10',
          created_by: user.id,
          module_data: {
            story_text: mockStory,
            characters: characters.trim(),
            setting: setting.trim(),
            theme: theme.trim(),
            created_in_storyforge: true
          }
        });
      }
      
    } catch (error) {
      console.error('Error generating story:', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateMockStory = (title, characters, setting, theme) => {
    return `# ${title}

Once upon a time, in the magical realm of ${setting}, there lived ${characters}.

The adventure began when our heroes discovered that ${theme} was the key to solving a great mystery in their enchanted world. Through their journey, they learned that working together and believing in themselves could overcome any challenge.

As the characters faced obstacles, they remembered the wisdom of the ancient Naturverse: "Every creature has a special gift, and when we share our gifts with kindness, magic happens!"

The friends discovered that ${setting} held secrets that could only be unlocked through ${theme}. With courage in their hearts and friendship as their guide, they embarked on an incredible quest.

Along the way, they met talking flowers, wise old trees, and friendly forest spirits who taught them valuable lessons about caring for nature and each other.

In the end, ${characters} saved the day and learned that the greatest magic of all comes from within - through love, friendship, and believing in yourself.

And as the sun set over ${setting}, Turian the Wise appeared with a gentle smile and said, "Remember, young adventurers, every ending is just a new beginning waiting to unfold. Dee mak!"

*The End*

---
*A magical tale created in The Naturverse Story Forge™*`;
  };

  const readStory = () => {
    if (!story) return;

    if (isReading) {
      synthRef.current.cancel();
      setIsReading(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(story);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsReading(true);
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);
    
    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const downloadStory = () => {
    if (!story) return;
    
    const blob = new Blob([story], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'My Story'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fillPreset = (field, value) => {
    switch(field) {
      case 'characters':
        setCharacters(value);
        break;
      case 'setting':
        setSetting(value);
        break;
      case 'theme':
        setTheme(value);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-800 mb-2 flex items-center justify-center">
            <BookOpen className="mr-3" />
            📖 Story Forge™
          </h1>
          <p className="text-xl text-amber-600 mb-4">AI-Powered Story Creation Studio</p>
          <p className="text-gray-600">Let Turian help you write and narrate your own magical tales!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Story Creation */}
          <div className="space-y-6">
            {/* Story Details Form */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Wand2 className="mr-2" />
                Create Your Story
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Story Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., The Magical Durian Quest"
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Users className="inline mr-1" size={16} />
                    Characters
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Turian the Turtle, Luna the Lotus Fairy"
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={characters}
                    onChange={(e) => setCharacters(e.target.value)}
                    maxLength={200}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {storyPresets.characters.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => fillPreset('characters', preset)}
                        className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 px-2 py-1 rounded transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="inline mr-1" size={16} />
                    Setting
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., The Enchanted Bamboo Forest"
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={setting}
                    onChange={(e) => setSetting(e.target.value)}
                    maxLength={150}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {storyPresets.settings.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => fillPreset('setting', preset)}
                        className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 px-2 py-1 rounded transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Heart className="inline mr-1" size={16} />
                    Theme/Lesson
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., friendship, courage, protecting nature"
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    maxLength={100}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {storyPresets.themes.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => fillPreset('theme', preset)}
                        className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 px-2 py-1 rounded transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateStory}
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Sparkles className="mr-2 animate-spin" size={20} />
                      ✨ Crafting Your Tale...
                    </>
                  ) : (
                    <>
                      <BookOpen className="mr-2" size={20} />
                      📚 Create My Story
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Story Tips */}
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-6">
              <h3 className="text-lg font-bold text-amber-800 mb-2">✨ Story Writing Tips</h3>
              <div className="text-sm text-amber-700 space-y-1">
                <p>🌟 <strong>Be specific:</strong> "Wise Turtle Turian" is better than just "turtle"</p>
                <p>🏞️ <strong>Paint the scene:</strong> Describe your magical setting in detail</p>
                <p>💫 <strong>Choose meaningful themes:</strong> What lesson should readers learn?</p>
                <p>🎭 <strong>Mix characters:</strong> Different personalities create interesting stories</p>
              </div>
            </div>
          </div>

          {/* Right Column - Generated Story */}
          <div className="space-y-6">
            {story && (
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">📜 Your Story</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={readStory}
                      className={`p-2 rounded-lg transition-colors ${
                        isReading 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                      title={isReading ? "Stop Reading" : "Read Aloud"}
                    >
                      {isReading ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    
                    <button
                      onClick={downloadStory}
                      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                      title="Download Story"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto bg-amber-50 p-4 rounded-lg border-2 border-amber-200">
                  <div className="prose prose-amber max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-800 font-serif leading-relaxed">
                      {story}
                    </pre>
                  </div>
                </div>

                {isReading && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center text-blue-600 animate-pulse">
                      <Volume2 className="mr-2" size={16} />
                      <span className="text-sm font-semibold">Turian is reading your story...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Welcome Message when no story */}
            {!story && !loading && (
              <div className="bg-white rounded-lg p-8 shadow-lg text-center">
                <div className="text-6xl mb-4">🐢</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Create Magic?</h3>
                <p className="text-gray-600 mb-4">
                  Fill in the story details on the left, and I'll help you craft an amazing tale!
                </p>
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <strong>Turian's Tip:</strong> The best stories come from the heart. 
                  Think about what message you want to share with the world! 🌟
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Quote */}
        <div className="mt-8 text-center bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-6">
          <div className="text-2xl mb-2">🐢✨</div>
          <p className="text-amber-800 font-semibold italic">
            "Every story is a seed of wisdom waiting to grow. Plant yours in the hearts of others!"
          </p>
          <p className="text-amber-600 text-sm mt-2">- Turian the Wise, Master Storyteller</p>
        </div>
      </div>
    </div>
  );
};

export default StoryForge;
