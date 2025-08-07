
import React, { useEffect, useRef, useState } from 'react';
import { Camera, Download, RotateCcw, Sparkles } from 'lucide-react';

const ARCam = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [overlay, setOverlay] = useState("ears");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const animationRef = useRef();

  const filters = [
    { id: "none", name: "No Filter", emoji: "😊", color: "bg-gray-500" },
    { id: "ears", name: "Bunny Ears", emoji: "🐰", color: "bg-pink-500" },
    { id: "crown", name: "Royal Crown", emoji: "👑", color: "bg-yellow-500" },
    { id: "turian", name: "Turian Shell", emoji: "🐢", color: "bg-green-500" },
    { id: "wings", name: "Fairy Wings", emoji: "🧚", color: "bg-purple-500" },
    { id: "mask", name: "Nature Mask", emoji: "🍃", color: "bg-emerald-500" }
  ];

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [isFrontCamera]);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: isFrontCamera ? 'user' : 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsStreaming(true);
          startDrawing();
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsStreaming(false);
  };

  const startDrawing = () => {
    const draw = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (canvas && video && video.readyState === 4) {
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw video frame
        ctx.save();
        if (isFrontCamera) {
          ctx.scale(-1, 1);
          ctx.translate(-canvas.width, 0);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        // Apply filter overlay
        if (overlay !== "none") {
          applyFilter(ctx, canvas.width, canvas.height);
        }
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
  };

  const applyFilter = (ctx, width, height) => {
    // Create filter effects based on selected filter
    switch (overlay) {
      case "ears":
        drawBunnyEars(ctx, width, height);
        break;
      case "crown":
        drawCrown(ctx, width, height);
        break;
      case "turian":
        drawTurianShell(ctx, width, height);
        break;
      case "wings":
        drawFairyWings(ctx, width, height);
        break;
      case "mask":
        drawNatureMask(ctx, width, height);
        break;
    }
  };

  const drawBunnyEars = (ctx, width, height) => {
    ctx.fillStyle = '#FFB6C1';
    ctx.strokeStyle = '#FF69B4';
    ctx.lineWidth = 3;

    // Left ear
    ctx.beginPath();
    ctx.ellipse(width * 0.3, height * 0.15, 30, 60, -0.3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Right ear
    ctx.beginPath();
    ctx.ellipse(width * 0.7, height * 0.15, 30, 60, 0.3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Inner ears
    ctx.fillStyle = '#FF1493';
    ctx.beginPath();
    ctx.ellipse(width * 0.3, height * 0.15, 15, 30, -0.3, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(width * 0.7, height * 0.15, 15, 30, 0.3, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawCrown = (ctx, width, height) => {
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(width * 0.2, height * 0.25);
    ctx.lineTo(width * 0.3, height * 0.1);
    ctx.lineTo(width * 0.4, height * 0.2);
    ctx.lineTo(width * 0.5, height * 0.05);
    ctx.lineTo(width * 0.6, height * 0.2);
    ctx.lineTo(width * 0.7, height * 0.1);
    ctx.lineTo(width * 0.8, height * 0.25);
    ctx.lineTo(width * 0.2, height * 0.25);
    ctx.fill();
    ctx.stroke();

    // Add gems
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.15, 8, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawTurianShell = (ctx, width, height) => {
    ctx.fillStyle = '#228B22';
    ctx.strokeStyle = '#006400';
    ctx.lineWidth = 4;

    // Shell outline
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.4, width * 0.3, 0, Math.PI, true);
    ctx.fill();
    ctx.stroke();

    // Shell pattern
    ctx.strokeStyle = '#32CD32';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const y = height * 0.3 + (i * 20);
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.4, width * 0.25 - (i * 15), 0, Math.PI, true);
      ctx.stroke();
    }
  };

  const drawFairyWings = (ctx, width, height) => {
    ctx.fillStyle = 'rgba(147, 112, 219, 0.7)';
    ctx.strokeStyle = '#9370DB';
    ctx.lineWidth = 2;

    // Left wing
    ctx.beginPath();
    ctx.ellipse(width * 0.25, height * 0.5, 60, 100, -0.3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Right wing
    ctx.beginPath();
    ctx.ellipse(width * 0.75, height * 0.5, 60, 100, 0.3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Sparkles
    ctx.fillStyle = '#FFD700';
    for (let i = 0; i < 10; i++) {
      const x = width * 0.2 + Math.random() * width * 0.6;
      const y = height * 0.3 + Math.random() * height * 0.4;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  const drawNatureMask = (ctx, width, height) => {
    ctx.fillStyle = '#90EE90';
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 3;

    // Mask base
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.4, width * 0.25, height * 0.15, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Leaf pattern
    ctx.fillStyle = '#32CD32';
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = width * 0.5 + Math.cos(angle) * 40;
      const y = height * 0.4 + Math.sin(angle) * 20;
      
      ctx.beginPath();
      ctx.ellipse(x, y, 10, 20, angle, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL('image/png');
      setCapturedImage(imageData);
    }
  };

  const downloadPhoto = () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.download = `naturverse-ar-${Date.now()}.png`;
      link.href = capturedImage;
      link.click();
    }
  };

  const switchCamera = () => {
    setIsFrontCamera(!isFrontCamera);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800 mb-2 flex items-center justify-center">
            <Camera className="mr-3" />
            🎭 AR Camera + Filters
          </h1>
          <p className="text-xl text-purple-600 mb-4">Transform into Your Naturverse Avatar!</p>
          <p className="text-gray-600">Choose a magical filter and capture your Naturverse look!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Camera Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="hidden"
                />
                <canvas
                  ref={canvasRef}
                  className="w-full max-w-lg mx-auto rounded-lg border-4 border-purple-300 shadow-lg"
                  style={{ maxHeight: '400px' }}
                />
                
                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <Camera size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Initializing camera...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={capturePhoto}
                  disabled={!isStreaming}
                  className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
                >
                  <Camera className="mr-2" size={20} />
                  📸 Capture
                </button>
                
                <button
                  onClick={switchCamera}
                  disabled={!isStreaming}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
                >
                  <RotateCcw className="mr-2" size={20} />
                  🔄 Flip
                </button>
              </div>
            </div>
          </div>

          {/* Filter Selection */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Sparkles className="mr-2" />
                🎨 Choose Filter
              </h2>
              
              <div className="space-y-3">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setOverlay(filter.id)}
                    className={`w-full p-3 rounded-lg font-semibold transition-colors text-white flex items-center ${
                      overlay === filter.id 
                        ? `${filter.color} shadow-lg scale-105` 
                        : `${filter.color} opacity-70 hover:opacity-100`
                    }`}
                  >
                    <span className="text-2xl mr-3">{filter.emoji}</span>
                    <span>{filter.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Captured Photo */}
            {capturedImage && (
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📷 Captured Photo</h3>
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full rounded-lg border-2 border-purple-300"
                />
                <button
                  onClick={downloadPhoto}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  <Download className="mr-2" size={16} />
                  💾 Download
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6">
          <h3 className="text-lg font-bold text-purple-800 mb-2">✨ AR Tips</h3>
          <div className="text-sm text-purple-700 space-y-1">
            <p>🎯 <strong>Position yourself:</strong> Center your face in the camera view</p>
            <p>💡 <strong>Good lighting:</strong> Face a window or bright light source</p>
            <p>🎭 <strong>Try all filters:</strong> Each one has unique magical effects</p>
            <p>📸 <strong>Capture memories:</strong> Save your favorite Naturverse looks</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6">
          <div className="text-2xl mb-2">🐢✨</div>
          <p className="text-purple-800 font-semibold italic">
            "Every filter shows a different side of your magical nature!"
          </p>
          <p className="text-purple-600 text-sm mt-2">- Turian the Wise, AR Guide</p>
        </div>
      </div>
    </div>
  );
};

export default ARCam;
