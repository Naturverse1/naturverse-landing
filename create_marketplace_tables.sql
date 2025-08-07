
-- Create market_items table
CREATE TABLE IF NOT EXISTS market_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url TEXT,
  price_natur INTEGER NOT NULL DEFAULT 0,
  is_nft BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  stock INTEGER DEFAULT 1,
  rarity VARCHAR(50) DEFAULT 'common',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_purchases table to track purchases
CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID REFERENCES market_items(id),
  quantity INTEGER DEFAULT 1,
  total_cost INTEGER NOT NULL,
  transaction_hash TEXT,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_inventory table to track owned items
CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID REFERENCES market_items(id),
  quantity INTEGER DEFAULT 1,
  acquired_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample marketplace items
INSERT INTO market_items (name, category, image_url, price_natur, is_nft, metadata, stock, rarity, description) VALUES
('Golden Durian Shell', 'Avatars', 'https://placehold.co/300x300/FFD700/000000?text=Golden+Shell', 150, true, '{"power": "+20 wisdom", "special": "Glowing effect"}', 10, 'legendary', 'A magnificent golden shell that glows with ancient wisdom'),
('Forest Guardian Wings', 'Accessories', 'https://placehold.co/300x300/228B22/FFFFFF?text=Wings', 75, false, '{"power": "+10 speed", "element": "nature"}', 25, 'rare', 'Mystical wings that grant the power of flight'),
('Wisdom Boost Potion', 'Power-Ups', 'https://placehold.co/300x300/9370DB/FFFFFF?text=Potion', 25, false, '{"effect": "2x learning speed", "duration": "1 hour"}', 100, 'common', 'Doubles learning speed for one hour'),
('Ocean Explorer Badge', 'Stamps', 'https://placehold.co/300x300/1E90FF/FFFFFF?text=Badge', 50, true, '{"region": "Ocean Depths", "achievement": "First Dive"}', 50, 'uncommon', 'Commemorates your first deep ocean adventure'),
('Crystal Energy Core', 'NFT Collectibles', 'https://placehold.co/300x300/FF6347/FFFFFF?text=Crystal', 200, true, '{"energy": 1000, "type": "renewable", "rarity": "cosmic"}', 5, 'cosmic', 'A rare cosmic crystal with infinite renewable energy'),
('Leaf Crown', 'Accessories', 'https://placehold.co/300x300/32CD32/000000?text=Crown', 40, false, '{"power": "+5 nature affinity", "seasonal": true}', 30, 'common', 'A beautiful crown made from enchanted leaves'),
('Speed Dash Boots', 'Accessories', 'https://placehold.co/300x300/FF4500/FFFFFF?text=Boots', 80, false, '{"power": "+15 speed", "special": "Dash ability"}', 20, 'rare', 'Magical boots that allow lightning-fast movement'),
('Knowledge Scroll', 'Power-Ups', 'https://placehold.co/300x300/8B4513/FFFFFF?text=Scroll', 35, false, '{"effect": "Unlock secret quest", "uses": 1}', 15, 'uncommon', 'Ancient scroll containing hidden quest knowledge');
