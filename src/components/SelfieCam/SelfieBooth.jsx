
import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import html2canvas from 'html2canvas';
import { v4 as uuidv4 } from 'uuid';

const magicalFilters = [
  { id: 'none', name: 'No Filter', emoji: '📸', style: {} },
  { id: 'sepia', name: 'Vintage Magic', emoji: '✨', style: { filter: 'sepia(100%) hue-rotate(20deg)' } },
  { id: 'forest', name: 'Forest Spirit', emoji: '🌲', style: { filter: 'hue-rotate(90deg) saturate(150%)' } },
  { id: 'ocean', name: 'Ocean Dreams', emoji: '🌊', style: { filter: 'hue-rotate(180deg) saturate(120%)' } },
  { id: 'golden', name: 'Golden Hour', emoji: '🌅', style: { filter: 'hue-rotate(30deg) brightness(110%) contrast(120%)' } },
  { id: 'mystical', name: 'Mystical Glow', emoji: '🔮', style: { filter: 'contrast(130%) brightness(110%) saturate(150%)' } }
];

const magicalFrames = [
  { id: 'none', name: 'No Frame', component: null },
  { id: 'nature', name: 'Nature Frame', component: NatureFrame },
  { id: 'magic', name: 'Magic Frame', component: MagicFrame },
  { id: 'adventure', name: 'Adventure Frame', component: AdventureFrame }
];

function NatureFrame({ children }) {
  return (
    <div className='relative'>
      {children}
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute top-2 left-2 text-2xl'>🌿</div>
        <div className='absolute top-2 right-2 text-2xl'>🦋</div>
        <div className='absolute bottom-2 left-2 text-2xl'>🌸</div>
        <div className='absolute bottom-2 right-2 text-2xl'>🐝</div>
      </div>
    </div>
  );
}

function MagicFrame({ children }) {
  return (
    <div className='relative'>
      {children}
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute top-2 left-2 text-2xl animate-pulse'>✨</div>
        <div className='absolute top-2 right-2 text-2xl animate-pulse'>🌟</div>
        <div className='absolute bottom-2 left-2 text-2xl animate-pulse'>💫</div>
        <div className='absolute bottom-2 right-2 text-2xl animate-pulse'>⭐</div>
      </div>
    </div>
  );
}

function AdventureFrame({ children }) {
  return (
    <div className='relative'>
      {children}
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute top-2 left-2 text-2xl'>🗺️</div>
        <div className='absolute top-2 right-2 text-2xl'>🧭</div>
        <div className='absolute bottom-2 left-2 text-2xl'>⚔️</div>
        <div className='absolute bottom-2 right-2 text-2xl'>🛡️</div>
      </div>
    </div>
  );
}

export default function SelfieBooth() {
  const webcamRef = useRef(null);
  const [selectedFilter, setSelectedFilter] = useState(magicalFilters[0]);
  const [selectedFrame, setSelectedFrame] = useState(magicalFrames[0]);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoConstraints = {
    width: 480,
    height: 360,
    facingMode: "user"
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const downloadImage = async () => {
    if (!capturedImage) return;
    
    setIsCapturing(true);
    try {
      const link = document.createElement('a');
      link.download = `naturverse-selfie-${uuidv4()}.png`;
      link.href = capturedImage;
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const FrameComponent = selectedFrame.component;

  return (
    <div className='max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg'>
      <div className='text-center mb-6'>
        <h2 className='text-3xl font-bold text-nature-green mb-2'>
          📸 Magical Selfie Booth
        </h2>
        <p className='text-gray-600'>Take magical selfies with filters and frames!</p>
      </div>

      {/* Camera/Preview Section */}
      <div className='mb-6 flex justify-center'>
        <div className='relative bg-gray-100 rounded-lg overflow-hidden'>
          {capturedImage ? (
            <div className='relative'>
              {FrameComponent ? (
                <FrameComponent>
                  <img 
                    src={capturedImage} 
                    alt="Captured selfie" 
                    className='w-full h-auto'
                    style={selectedFilter.style}
                  />
                </FrameComponent>
              ) : (
                <img 
                  src={capturedImage} 
                  alt="Captured selfie" 
                  className='w-full h-auto'
                  style={selectedFilter.style}
                />
              )}
            </div>
          ) : (
            <div className='relative'>
              {FrameComponent ? (
                <FrameComponent>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/png"
                    videoConstraints={videoConstraints}
                    style={selectedFilter.style}
                    className='w-full h-auto'
                  />
                </FrameComponent>
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/png"
                  videoConstraints={videoConstraints}
                  style={selectedFilter.style}
                  className='w-full h-auto'
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter Selection */}
      <div className='mb-4'>
        <h3 className='font-semibold text-gray-800 mb-2'>🎨 Magical Filters</h3>
        <div className='flex flex-wrap gap-2'>
          {magicalFilters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter.id === filter.id
                  ? 'bg-nature-green text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {filter.emoji} {filter.name}
            </button>
          ))}
        </div>
      </div>

      {/* Frame Selection */}
      <div className='mb-6'>
        <h3 className='font-semibold text-gray-800 mb-2'>🖼️ Magical Frames</h3>
        <div className='flex flex-wrap gap-2'>
          {magicalFrames.map(frame => (
            <button
              key={frame.id}
              onClick={() => setSelectedFrame(frame)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFrame.id === frame.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {frame.name}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex justify-center space-x-4'>
        {capturedImage ? (
          <>
            <button
              onClick={retakePhoto}
              className='bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600'
            >
              🔄 Retake
            </button>
            <button
              onClick={downloadImage}
              disabled={isCapturing}
              className='bg-nature-green text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50'
            >
              {isCapturing ? '💾 Saving...' : '💾 Download'}
            </button>
          </>
        ) : (
          <button
            onClick={capture}
            className='bg-purple-500 text-white px-8 py-3 rounded-lg hover:bg-purple-600 text-lg font-semibold'
          >
            📸 Capture Magic!
          </button>
        )}
      </div>

      <div className='mt-4 text-center text-sm text-gray-500'>
        <p>Dee mak! Share your magical selfies with friends! ✨</p>
      </div>
    </div>
  );
}
