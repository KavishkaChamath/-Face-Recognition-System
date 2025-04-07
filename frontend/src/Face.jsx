// App.js
import React, { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";
import './Face.css';

// Replace with your Flask server URL
const SERVER_URL = 'http://localhost:5000';

function Face() {
  const [mode, setMode] = useState('recognize'); // 'register' or 'recognize'
  const [userName, setUserName] = useState('');
  const [status, setStatus] = useState('Idle');
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [stream, setStream] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize Socket.io connection
  useEffect(() => {
    const newSocket = io(SERVER_URL);
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });
    
    newSocket.on('recognition_result', (data) => {
      setIsProcessing(false);
      if (data.success) {
        setStatus(`Face recognized: ${data.user.name} (Confidence: ${(data.user.confidence * 100).toFixed(2)}%)`);
        setRecognitionResult(data.user);
      } else {
        setStatus(`Recognition failed: ${data.message}`);
        setRecognitionResult(null);
      }
    });
    
    setSocket(newSocket);
    
    // Clean up on unmount
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  // Initialize webcam
  useEffect(() => {
    const startWebcam = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' }
        });
        
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        setStatus('Camera ready');
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setStatus(`Camera error: ${err.message}`);
      }
    };
    
    startWebcam();
    
    // Clean up on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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

  // Register face
  const registerFace = async () => {
    if (!userName.trim()) {
      setStatus('Please enter a name first');
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
    
    try {
      const response = await fetch(`${SERVER_URL}/register-face`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          name: userName
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus(`Registration successful: ${data.message}`);
      } else {
        setStatus(`Registration failed: ${data.message}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
    
    setIsProcessing(false);
  };

  // Recognize face
  const recognizeFace = () => {
    if (!socket || !isConnected) {
      setStatus('Not connected to server');
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

  // Start continuous recognition
  const [isAutomaticMode, setIsAutomaticMode] = useState(false);
  
  useEffect(() => {
    let interval;
    
    if (isAutomaticMode && mode === 'recognize') {
      interval = setInterval(() => {
        if (!isProcessing) {
          recognizeFace();
        }
      }, 3000); // Recognize every 3 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutomaticMode, mode, isProcessing]);

  return (
    <div className="app-container">
      <h1>Face Recognition System</h1>
      
      <div className="mode-selector">
        <button 
          className={mode === 'register' ? 'active' : ''}
          onClick={() => {
            setMode('register');
            setIsAutomaticMode(false);
            setRecognitionResult(null);
          }}
        >
          Register Face
        </button>
        <button 
          className={mode === 'recognize' ? 'active' : ''}
          onClick={() => {
            setMode('recognize');
            setRecognitionResult(null);
          }}
        >
          Recognize Face
        </button>
      </div>
      
      <div className="video-container">
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
      
      <div className="control-panel">
        {mode === 'register' && (
          <div className="register-controls">
            <input
              type="text"
              placeholder="Enter name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={isProcessing}
            />
            <button 
              onClick={registerFace}
              disabled={isProcessing || !userName.trim()}
            >
              Register Face
            </button>
          </div>
        )}
        
        {mode === 'recognize' && (
          <div className="recognize-controls">
            <button 
              onClick={recognizeFace}
              disabled={isProcessing || !isConnected}
            >
              Recognize Once
            </button>
            <label className="toggle-container">
              <input
                type="checkbox"
                checked={isAutomaticMode}
                onChange={() => setIsAutomaticMode(!isAutomaticMode)}
                disabled={isProcessing || !isConnected}
              />
              <span>Automatic Recognition</span>
            </label>
          </div>
        )}
      </div>
      
      <div className="status-panel">
        <p>Status: {status}</p>
        <p>Connection: {isConnected ? 'Connected' : 'Disconnected'}</p>
      </div>
      
      {recognitionResult && (
        <div className="result-panel">
          <h3>Recognition Result</h3>
          <p><strong>Name:</strong> {recognitionResult.name}</p>
          <p><strong>Confidence:</strong> {(recognitionResult.confidence * 100).toFixed(2)}%</p>
          <p><strong>ID:</strong> {recognitionResult.user_id}</p>
        </div>
      )}
    </div>
  );
}

export default Face;