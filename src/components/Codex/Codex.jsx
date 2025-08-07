
import React, { useState, useEffect } from 'react';
import { Book, Search, Filter, Star, MapPin, User } from 'lucide-react';
import { codexData, codexCategories, rarityColors } from '../../data/codexData';
import { useAuth } from '../../contexts/AuthContext';

const Codex = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [discoveredEntries, setDiscoveredEntries] = useState([]);

  useEffect(() => {
    // Simulate discovered entries (in real app, this would come from user progress)
    setDiscoveredEntries(codexData.slice(0, 4).map(entry => entry.id));
  }, []);

  const filteredData = codexData.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || entry.type === selectedCategory;
    const isDiscovered = discoveredEntries.includes(entry.id);
    return matchesSearch && matchesCategory && isDiscovered;
  });

  const undiscoveredCount = codexData.length - discoveredEntries.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-800 mb-2 flex items-center justify-center">
            <Book className="mr-3" />
            📚 Turian's Codex
          </h1>
          <p className="text-xl text-amber-600 mb-4">AI Encyclopedia of The Naturverse</p>
          <p className="text-gray-600">
            Discovered: {discoveredEntries.length}/{codexData.length} entries • 
            {undiscoveredCount > 0 && ` ${undiscoveredCount} mysteries remain!`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search and Filter Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Search className="mr-2" />
                🔍 Search Codex
              </h2>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search entries..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Category Filter */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Filter className="mr-2" />
                📂 Categories
              </h2>
              
              <div className="space-y-2">
                {codexCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-colors ${
                      selectedCategory === category
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Discovery Stats</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Characters:</span>
                  <span className="font-semibold text-blue-600">
                    {discoveredEntries.filter(id => codexData.find(e => e.id === id)?.type === 'character').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Regions:</span>
                  <span className="font-semibold text-green-600">
                    {discoveredEntries.filter(id => codexData.find(e => e.id === id)?.type === 'region').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completion:</span>
                  <span className="font-semibold text-purple-600">
                    {Math.round((discoveredEntries.length / codexData.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Entries Grid */}
          <div className="lg:col-span-2">
            {selectedEntry ? (
              /* Detailed Entry View */
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="mb-4 text-amber-600 hover:text-amber-800 font-semibold"
                >
                  ← Back to Codex
                </button>
                
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{selectedEntry.image}</div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedEntry.name}</h1>
                  <div className="flex justify-center items-center space-x-4 mb-4">
                    <span className={`px-3 py-1 rounded-full border-2 font-semibold ${rarityColors[selectedEntry.rarity]}`}>
                      {selectedEntry.rarity}
                    </span>
                    <span className="text-gray-600 flex items-center">
                      {selectedEntry.type === 'character' ? <User size={16} className="mr-1" /> : <MapPin size={16} className="mr-1" />}
                      {selectedEntry.type}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">📖 Description</h3>
                    <p className="text-gray-700 leading-relaxed text-lg">{selectedEntry.description}</p>
                  </div>

                  {selectedEntry.region && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3">🗺️ Region</h3>
                      <p className="text-gray-700">{selectedEntry.region}</p>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-4">
                    <p className="text-amber-800 font-semibold italic text-center">
                      "Knowledge is the greatest treasure in The Naturverse!" - Turian the Wise
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Entries Grid */
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedCategory === 'all' ? 'All Entries' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) + 's'}
                  </h2>
                  <div className="text-gray-600">
                    Showing {filteredData.length} entries
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredData.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-amber-300"
                    >
                      <div className="text-center mb-4">
                        <div className="text-4xl mb-2">{entry.image}</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{entry.name}</h3>
                        <div className="flex justify-center items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full border font-semibold text-sm ${rarityColors[entry.rarity]}`}>
                            {entry.rarity}
                          </span>
                          <span className="text-gray-500 text-sm">{entry.type}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm line-clamp-3 mb-3">{entry.description}</p>
                      
                      {entry.region && (
                        <div className="flex items-center text-gray-500 text-sm">
                          <MapPin size={14} className="mr-1" />
                          {entry.region}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredData.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📜</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No entries found</h3>
                    <p className="text-gray-600">Try adjusting your search or category filter</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Codex;
