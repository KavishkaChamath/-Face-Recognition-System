
// components/RecognizePage.jsx
import React, { useState, useRef, useEffect } from 'react';

const RecognizePage = ({ socket }) => {
  const [status, setStatus] = useState('');
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [stream, setStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isAutomaticMode, setIsAutomaticMode] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Initialize Socket.io connection when component mounts
  useEffect(() => {
    // Setup socket event listeners
    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });
    
    socket.on('recognition_result', (data) => {
      setIsProcessing(false);
      if (data.success) {
        setStatus(`Face recognized: ${data.user.name} (Confidence: ${(data.user.confidence * 100).toFixed(2)}%)`);
        setRecognitionResult(data.user);
        
        // Stop camera after successful recognition if not in automatic mode
        if (!isAutomaticMode) {
          setTimeout(() => {
            stopCamera();
            setStatus(`Recognition complete. Found: ${data.user.name}. Camera turned off.`);
          }, 2000);
        }
      } else {
        setStatus(`Recognition failed: ${data.message}`);
        setRecognitionResult(null);
      }
    });
    
    return () => {
      // Cleanup event listeners when component unmounts
      socket.off('connect');
      socket.off('disconnect');
      socket.off('recognition_result');
    };
  }, [socket, isAutomaticMode]);
  
  // Start webcam
  const startCamera = async () => {
    try {
      if (!socket.connected) {
        socket.connect();
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setIsCameraOn(true);
      setStatus('Camera ready');
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setStatus(`Camera error: ${err.message}`);
    }
  };
  
  // Stop webcam and disconnect socket
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraOn(false);
      setIsAutomaticMode(false);
    }
    
    if (socket.connected && !isAutomaticMode) {
      socket.disconnect();
    }
  };
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [socket, stream]);
  
  // Capture current frame from video
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to base64 image
    return canvas.toDataURL('image/jpeg');
  };
  
  // Recognize face
  const recognizeFace = () => {
    if (!socket || !isConnected) {
      setStatus('Not connected to server');
      return;
    }
    
    if (!isCameraOn) {
      setStatus('Please start the camera first');
      return;
    }
    
    setIsProcessing(true);
    setStatus('Processing...');
    
    const imageData = captureFrame();
    if (!imageData) {
      setStatus('Failed to capture image');
      setIsProcessing(false);
      return;
    }
    
    socket.emit('recognize_face', { image: imageData });
  };
  
  // Toggle automatic recognition mode
  const toggleAutomaticMode = () => {
    setIsAutomaticMode(!isAutomaticMode);
    setRecognitionResult(null);
  };
  
  // Start continuous recognition
  useEffect(() => {
    let interval;
    
    if (isAutomaticMode && isCameraOn) {
      interval = setInterval(() => {
        if (!isProcessing) {
          recognizeFace();
        }
      }, 3000); // Recognize every 3 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutomaticMode, isCameraOn, isProcessing]);
  
  return (
    <div className="recognize-page">
      <h1>Face Recognition</h1>
      
      <div className="recognition-container">
        <div className="camera-controls">
          {!isCameraOn ? (
            <button 
              onClick={startCamera}
              className="primary-button"
            >
              Start Camera
            </button>
          ) : (
            <button 
              onClick={stopCamera}
              className="secondary-button"
            >
              Stop Camera
            </button>
          )}
        </div>
        
        <div className="video-container" style={{ display: isCameraOn ? 'block' : 'none' }}>
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            muted
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
        
        {isCameraOn && (
          <div className="recognition-controls">
            <button 
              onClick={recognizeFace}
              disabled={isProcessing || !isConnected}
              className="primary-button"
            >
              Recognize Once
            </button>
            
            <label className="toggle-container">
              <input
                type="checkbox"
                checked={isAutomaticMode}
                onChange={toggleAutomaticMode}
                disabled={isProcessing || !isConnected}
              />
              <span>Automatic Recognition</span>
            </label>
          </div>
        )}
        
        <div className="status-panel">
          <p><strong>Status:</strong> {status || 'Idle'}</p>
          <p><strong>Connection:</strong> {isConnected ? 'Connected' : 'Disconnected'}</p>
        </div>
        
        {recognitionResult && (
          <div className="result-panel">
            <h3>Recognition Result</h3>
            <div className="result-details">
              <p><strong>Name:</strong> {recognitionResult.name}</p>
              <p><strong>Confidence:</strong> {(recognitionResult.confidence * 100).toFixed(2)}%</p>
              <p><strong>User ID:</strong> {recognitionResult.user_id}</p>
              <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default RecognizePage;