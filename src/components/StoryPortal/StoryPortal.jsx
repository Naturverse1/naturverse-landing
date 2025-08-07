
import React, { useState, useEffect } from 'react';
import { Play, Star, Clock, Award, Zap } from 'lucide-react';
import storyPaths from '../../data/storyPaths';
import { useAuth } from '../../contexts/AuthContext';

const StoryPortal = () => {
  const { user } = useAuth();
  const [selectedStory, setSelectedStory] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState(null);

  const difficultyColors = {
    'Easy': 'bg-green-100 text-green-800 border-green-300',
    'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Hard': 'bg-red-100 text-red-800 border-red-300'
  };

  const generateStoryContent = async (storyPath) => {
    setIsGenerating(true);
    
    // Simulate AI story generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const storyContent = {
      'a': {
        chapter1: "As you step into the Forest of Echoes, the ancient trees whisper secrets of old...",
        choices: [
          "Follow the glowing path deeper into the forest",
          "Listen carefully to the whispers and try to understand them",
          "Call out to see if anyone responds to the echoes"
        ]
      },
      'b': {
        chapter1: "The Cave of Time opens before you, its walls shimmering with temporal energy...",
        choices: [
          "Touch the glowing clock on the wall",
          "Examine the strange symbols etched in stone",
          "Step through the shimmering portal"
        ]
      },
      'c': {
        chapter1: "You find yourself on a floating island high above the clouds, the wind carrying magical whispers...",
        choices: [
          "Explore the crystal formations at the island's edge",
          "Investigate the ancient ruins in the center",
          "Try to communicate with the floating spirits"
        ]
      },
      'd': {
        chapter1: "Descending into the depths, you discover a magnificent underwater palace filled with bioluminescent creatures...",
        choices: [
          "Swim towards the pearl-lit throne room",
          "Follow the school of glowing fish",
          "Examine the coral libraries on the palace walls"
        ]
      }
    };

    setGeneratedStory(storyContent[storyPath.id] || storyContent['a']);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-2 flex items-center justify-center">
            <Zap className="mr-3" />
            🛸 Story Portal Generator
          </h1>
          <p className="text-xl text-purple-600 mb-4">AI-Powered Adventures Await!</p>
          <p className="text-gray-600">Choose your path and let the magic unfold...</p>
        </div>

        {generatedStory ? (
          /* Generated Story View */
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{selectedStory.title}</h2>
              <button
                onClick={() => {
                  setGeneratedStory(null);
                  setSelectedStory(null);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                ← Back to Portal
              </button>
            </div>

            <div className="space-y-6">
              {/* Story Content */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <p className="text-lg text-gray-800 leading-relaxed mb-4">{generatedStory.chapter1}</p>
              </div>

              {/* Choices */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">What do you choose to do?</h3>
                <div className="space-y-3">
                  {generatedStory.choices.map((choice, index) => (
                    <button
                      key={index}
                      className="w-full text-left p-4 bg-white border-2 border-purple-200 hover:border-purple-400 rounded-lg transition-colors hover:bg-purple-50"
                    >
                      <span className="font-semibold text-purple-600">{index + 1}.</span> {choice}
                    </button>
                  ))}
                </div>
              </div>

              {/* Continue Button */}
              <div className="text-center">
                <button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors">
                  Continue Adventure →
                </button>
              </div>
            </div>
          </div>
        ) : selectedStory ? (
          /* Story Details View */
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <button
              onClick={() => setSelectedStory(null)}
              className="mb-4 text-purple-600 hover:text-purple-800 font-semibold"
            >
              ← Back to Story Selection
            </button>

            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{selectedStory.image}</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{selectedStory.title}</h2>
              <p className="text-xl text-gray-600 italic mb-6">"{selectedStory.intro}"</p>

              <div className="flex justify-center items-center space-x-6 mb-8">
                <div className="flex items-center">
                  <Star className="mr-2 text-yellow-500" />
                  <span className={`px-3 py-1 rounded-full border font-semibold ${difficultyColors[selectedStory.difficulty]}`}>
                    {selectedStory.difficulty}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="mr-2" />
                  {selectedStory.duration}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">🎁 Rewards</h3>
                <div className="space-y-2">
                  {selectedStory.rewards.map((reward, index) => (
                    <div key={index} className="flex items-center bg-yellow-50 p-3 rounded-lg">
                      <Award className="mr-2 text-yellow-600" size={16} />
                      <span className="text-gray-800">{reward}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">⚡ Story Features</h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-center">
                    <span className="mr-2">🤖</span>
                    AI-Generated Dynamic Content
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">🎯</span>
                    Multiple Choice Adventures
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">🎨</span>
                    Personalized Story Paths
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => generateStoryContent(selectedStory)}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors flex items-center justify-center mx-auto"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Story...
                  </>
                ) : (
                  <>
                    <Play className="mr-2" />
                    Begin Adventure
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Story Selection Grid */
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Choose Your Adventure</h2>
              <p className="text-gray-600">Each story adapts to your choices using AI magic!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {storyPaths.map((story) => (
                <div
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-300 transform hover:scale-105"
                >
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-3">{story.image}</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{story.title}</h3>
                    <p className="text-gray-600 italic mb-4">"{story.intro}"</p>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <span className={`px-3 py-1 rounded-full border font-semibold ${difficultyColors[story.difficulty]}`}>
                      {story.difficulty}
                    </span>
                    <div className="flex items-center text-gray-500">
                      <Clock size={16} className="mr-1" />
                      {story.duration}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Rewards:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {story.rewards.map((reward, index) => (
                        <div key={index} className="flex items-center">
                          <Award size={14} className="mr-2 text-yellow-500" />
                          {reward}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6">
          <div className="text-2xl mb-2">🌟✨</div>
          <p className="text-purple-800 font-semibold italic">
            "Every story is a doorway to infinite possibilities!"
          </p>
          <p className="text-purple-600 text-sm mt-2">- Turian the Storyteller</p>
        </div>
      </div>
    </div>
  );
};

export default StoryPortal;
