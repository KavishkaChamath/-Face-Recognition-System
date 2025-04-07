// RegisterFace.js
import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import '../new.css';

const API_URL = 'http://localhost:5000';

function RegisterFace() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const webcamRef = useRef(null);

  const startCamera = () => {
    if (userId && name) {
      setIsCameraActive(true);
      setMessage('Camera activated. Position your face and click "Capture"');
      setStatus('info');
    } else {
      setMessage('Please enter both ID and Name before activating the camera');
      setStatus('error');
    }
  };

  const stopCamera = () => {
    setIsCameraActive(false);
  };

  const captureImage = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      
      try {
        setMessage('Registering face...');
        setStatus('info');
        
        const response = await axios.post(`${API_URL}/api/register`, {
          userId,
          name,
          image: imageSrc
        });
        
        if (response.data.success) {
          setMessage(`Success: ${response.data.message}`);
          setStatus('success');
          stopCamera();
          setUserId('');
          setName('');
        } else {
          setMessage(`Error: ${response.data.message}`);
          setStatus('error');
        }
      } catch (error) {
        setMessage(`Error: ${error.response?.data?.message || error.message}`);
        setStatus('error');
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Register New Face</h2>
      
      <div className="form-group">
        <label>User ID:</label>
        <input 
          type="text" 
          value={userId} 
          onChange={(e) => setUserId(e.target.value)} 
          disabled={isCameraActive}
        />
      </div>
      
      <div className="form-group">
        <label>Full Name:</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          disabled={isCameraActive}
        />
      </div>
      
      {message && <div className={`message ${status}`}>{message}</div>}
      
      {!isCameraActive ? (
        <button 
          className="button primary" 
          onClick={startCamera} 
          disabled={!userId || !name}
        >
          Start Camera
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
            <button className="button primary" onClick={captureImage}>
              Capture
            </button>
            <button className="button secondary" onClick={stopCamera}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterFace;