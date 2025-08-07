
import React, { useRef, useState } from "react";
import { Download, Save, Grid, Palette, RotateCcw, Share2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

const TILE_OPTIONS = [
  { name: "Grass", emoji: "🌿", color: "bg-green-200" },
  { name: "Water", emoji: "🌊", color: "bg-blue-200" },
  { name: "Tree", emoji: "🌴", color: "bg-green-300" },
  { name: "House", emoji: "🏠", color: "bg-yellow-200" },
  { name: "Animal", emoji: "🦜", color: "bg-purple-200" },
  { name: "Mountain", emoji: "🏔️", color: "bg-gray-300" },
  { name: "Beach", emoji: "🏖️", color: "bg-yellow-100" },
  { name: "Flower", emoji: "🌺", color: "bg-pink-200" },
  { name: "Rock", emoji: "🪨", color: "bg-gray-400" },
  { name: "Bridge", emoji: "🌉", color: "bg-amber-200" },
];

const IslandBuilder = () => {
  const { user } = useAuth();
  const gridRef = useRef(null);
  const [selectedTile, setSelectedTile] = useState("🌿");
  const [islandName, setIslandName] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [gridSize, setGridSize] = useState(12);
  const [grid, setGrid] = useState(() => 
    Array(12).fill().map(() => Array(12).fill("🌊"))
  );
  const [savedIslands, setSavedIslands] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleTilePlace = (rowIdx, colIdx) => {
    if (!isPlacing) return;
    
    const newGrid = grid.map((row, r) =>
      row.map((cell, c) => (r === rowIdx && c === colIdx ? selectedTile : cell))
    );
    setGrid(newGrid);
  };

  const handleMouseDown = () => setIsPlacing(true);
  const handleMouseUp = () => setIsPlacing(false);

  const clearGrid = () => {
    setGrid(Array(gridSize).fill().map(() => Array(gridSize).fill("🌊")));
  };

  const resizeGrid = (newSize) => {
    setGridSize(newSize);
    const newGrid = Array(newSize).fill().map((_, r) =>
      Array(newSize).fill().map((_, c) => 
        grid[r] && grid[r][c] ? grid[r][c] : "🌊"
      )
    );
    setGrid(newGrid);
  };

  const saveIsland = async () => {
    if (!user || !islandName.trim()) {
      alert("Please enter an island name and make sure you're logged in!");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_islands')
        .insert({
          user_id: user.id,
          name: islandName,
          grid_data: grid,
          grid_size: gridSize,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      alert("🏝️ Island saved successfully!");
      setIslandName("");
      loadSavedIslands();
    } catch (error) {
      console.error('Error saving island:', error);
      alert("Failed to save island. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedIslands = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_islands')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedIslands(data || []);
    } catch (error) {
      console.error('Error loading islands:', error);
    }
  };

  const loadIsland = (island) => {
    setGrid(island.grid_data);
    setGridSize(island.grid_size);
    setIslandName(island.name);
  };

  const exportAsImage = async () => {
    if (!gridRef.current) return;

    try {
      // Create a temporary canvas to render the grid
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const tileSize = 40;
      
      canvas.width = gridSize * tileSize;
      canvas.height = gridSize * tileSize;
      
      // Fill background
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      grid.forEach((row, r) => {
        row.forEach((cell, c) => {
          const x = c * tileSize;
          const y = r * tileSize;
          
          // Draw cell background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y, tileSize, tileSize);
          
          // Draw emoji
          ctx.font = `${tileSize * 0.7}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cell, x + tileSize/2, y + tileSize/2);
          
          // Draw border
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, tileSize, tileSize);
        });
      });

      // Download the image
      const link = document.createElement('a');
      link.download = `${islandName || 'my-island'}-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export image. Please try again.');
    }
  };

  React.useEffect(() => {
    if (user) {
      loadSavedIslands();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2 flex items-center justify-center">
            <Grid className="mr-3" />
            🏝️ Island Builder
          </h1>
          <p className="text-xl text-blue-600 mb-4">Create Your Perfect Naturverse Island!</p>
          <p className="text-gray-600">Design, build, and share your dream island paradise!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tools Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Island Settings */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Save className="mr-2" />
                🏝️ Island Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Island Name
                  </label>
                  <input
                    type="text"
                    placeholder="My Amazing Island"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={islandName}
                    onChange={(e) => setIslandName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Grid Size: {gridSize}x{gridSize}
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="16"
                    value={gridSize}
                    onChange={(e) => resizeGrid(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={saveIsland}
                    disabled={loading || !user}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center"
                  >
                    <Save size={16} className="mr-1" />
                    💾 Save
                  </button>
                  
                  <button
                    onClick={clearGrid}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center"
                  >
                    <RotateCcw size={16} className="mr-1" />
                    🔄 Clear
                  </button>
                </div>

                <button
                  onClick={exportAsImage}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  <Download size={16} className="mr-1" />
                  📸 Export Image
                </button>
              </div>
            </div>

            {/* Tile Palette */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Palette className="mr-2" />
                🎨 Tile Palette
              </h2>
              
              <div className="grid grid-cols-2 gap-2">
                {TILE_OPTIONS.map((tile) => (
                  <button
                    key={tile.name}
                    onClick={() => setSelectedTile(tile.emoji)}
                    className={`p-3 rounded-lg font-semibold transition-all text-center ${
                      selectedTile === tile.emoji 
                        ? `${tile.color} border-2 border-blue-500 shadow-lg scale-105` 
                        : `${tile.color} border border-gray-300 hover:scale-105`
                    }`}
                  >
                    <div className="text-2xl mb-1">{tile.emoji}</div>
                    <div className="text-xs">{tile.name}</div>
                  </button>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Selected:</strong> {selectedTile} 
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Click and drag to paint tiles!
                </p>
              </div>
            </div>

            {/* Saved Islands */}
            {savedIslands.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Share2 className="mr-2" />
                  🗃️ My Islands
                </h2>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {savedIslands.map((island) => (
                    <button
                      key={island.id}
                      onClick={() => loadIsland(island)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="font-semibold text-gray-800">{island.name}</div>
                      <div className="text-xs text-gray-600">
                        {island.grid_size}x{island.grid_size} • {new Date(island.created_at).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">🎯 Build Your Island</h2>
                <p className="text-gray-600">Click and drag to place tiles • Selected: {selectedTile}</p>
              </div>

              <div className="flex justify-center">
                <div
                  ref={gridRef}
                  className="inline-block border-4 border-blue-500 rounded-lg p-2 bg-gradient-to-br from-blue-100 to-green-100"
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {grid.map((row, rIdx) => (
                    <div key={rIdx} className="flex">
                      {row.map((cell, cIdx) => (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          onMouseDown={() => handleTilePlace(rIdx, cIdx)}
                          onMouseEnter={() => isPlacing && handleTilePlace(rIdx, cIdx)}
                          className="w-8 h-8 md:w-10 md:h-10 border border-gray-300 text-lg md:text-xl flex items-center justify-center cursor-pointer hover:bg-yellow-100 transition-colors bg-white"
                        >
                          {cell}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-2">🎮 How to Build</h3>
          <div className="text-sm text-blue-700 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p>🎨 <strong>Select Tiles:</strong> Choose from the palette on the left</p>
              <p>🖱️ <strong>Place Tiles:</strong> Click and drag on the grid to paint</p>
              <p>💾 <strong>Save Work:</strong> Give your island a name and save it</p>
            </div>
            <div>
              <p>📸 <strong>Export:</strong> Download your island as an image</p>
              <p>🔄 <strong>Load Islands:</strong> Click on saved islands to edit them</p>
              <p>⚖️ <strong>Resize:</strong> Adjust grid size with the slider</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-6">
          <div className="text-2xl mb-2">🌴🏝️</div>
          <p className="text-blue-800 font-semibold italic">
            "Every island tells a story. What will yours say?"
          </p>
          <p className="text-blue-600 text-sm mt-2">- Turian the Wise, Island Architect</p>
        </div>
      </div>
    </div>
  );
};

export default IslandBuilder;
