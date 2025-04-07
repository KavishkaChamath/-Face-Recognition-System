
// components/RegisterPage.jsx
import React, { useState, useRef, useEffect } from 'react';

const RegisterPage = ({ serverUrl }) => {
  const [userName, setUserName] = useState('');
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [stream, setStream] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Start webcam
  const startCamera = async () => {
    try {
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
  
  // Stop webcam
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraOn(false);
      setStatus('');
    }
  };
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);
  
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
    
    try {
      const response = await fetch(`${serverUrl}/register-face`, {
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
        // Stop camera after successful registration
        setTimeout(() => {
          stopCamera();
          setStatus('Registration complete. Camera turned off.');
        }, 2000);
      } else {
        setStatus(`Registration failed: ${data.message}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
    
    setIsProcessing(false);
  };
  
  return (
    <div className="register-page">
      <h1>Register Your Face</h1>
      
      <div className="form-container">
        <div className="input-group">
          <label>Full Name:</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            disabled={isProcessing}
          />
        </div>
        
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
          <button 
            onClick={registerFace}
            disabled={isProcessing || !userName.trim()}
            className="primary-button"
          >
            {isProcessing ? 'Processing...' : 'Register Face'}
          </button>
        )}
        
        {status && (
          <div className="status-panel">
            <p>{status}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;