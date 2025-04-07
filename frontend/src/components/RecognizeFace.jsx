// RecognizeFace.js
import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import io from 'socket.io-client';
import '../new.css';

const API_URL = 'http://localhost:5000';

function RecognizeFace() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [recognizedUser, setRecognizedUser] = useState(null);
  const webcamRef = useRef(null);
  const socketRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Setup socket connection
    socketRef.current = io(API_URL);
    
    socketRef.current.on('recognition_result', (data) => {
      if (data.success) {
        setMessage(data.message);
        setStatus('success');
        setRecognizedUser(data.user);
        stopCamera();
      } else {
        setMessage(data.message);
        setStatus('error');
      }
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startCamera = () => {
    setIsCameraActive(true);
    setMessage('Looking for your face...');
    setStatus('info');
    setRecognizedUser(null);
    
    // Start sending frames after a short delay to ensure camera is initialized
    setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc && socketRef.current) {
            socketRef.current.emit('recognize_face', { image: imageSrc });
          }
        }
      }, 1000); // Send a frame every second
    }, 1000);
  };

  const stopCamera = () => {
    setIsCameraActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <div className="recognize-container">
      <h2>Recognize Face</h2>
      
      {message && <div className={`message ${status}`}>{message}</div>}
      
      {recognizedUser && (
        <div className="recognized-user">
          <h3>Welcome, {recognizedUser.name}!</h3>
          <p>User ID: {recognizedUser.userId}</p>
          <p>Your attendance has been recorded.</p>
        </div>
      )}
      
      {!isCameraActive ? (
        <button className="button primary" onClick={startCamera}>
          Start Recognition
        </button>
      ) : (
        <div className="camera-container">
          <Webcam 
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="webcam"
          />
          <div className="camera-controls">
            <button className="button secondary" onClick={stopCamera}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecognizeFace;