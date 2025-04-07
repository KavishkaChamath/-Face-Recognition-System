import React, { useState, useEffect, useRef } from 'react';
import './FaceRecognition.css';
import { io } from "socket.io-client";

const FaceRecognitionComponent = () => {
  const videoRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [recognizedFaces, setRecognizedFaces] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentView, setCurrentView] = useState('attendance'); // Options: 'attendance', 'register', 'report'
  const [newPersonName, setNewPersonName] = useState('');
  
  // Connect to WebSocket on component mount
  useEffect(() => {
    // Create WebSocket connection
    //const newSocket = new WebSocket('ws://localhost:5000/ws');
    const newSocket = io("http://127.0.0.1:5000");
    
    newSocket.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
    };
    
    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'face_recognition_result') {
        setRecognizedFaces(data.faces);
      }
    };
    
    newSocket.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsConnected(false);
    };
    
    setSocket(newSocket);
    
    // Start webcam
    startWebcam();
    
    // Clean up on unmount
    return () => {
      if (socket) {
        socket.close();
      }
      
      // Stop the webcam
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);
  
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Set up canvas for frame capture
      const captureInterval = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN && videoRef.current) {
          captureAndSendFrame();
        }
      }, 100); // Send 10 frames per second
      
      return () => clearInterval(captureInterval);
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };
  
  const captureAndSendFrame = () => {
    if (!videoRef.current || !socket) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Convert to JPEG data URL with reduced quality for faster transmission
    const imageData = canvas.toDataURL('image/jpeg', 0.7);
    
    // Send frame to server
    socket.send(JSON.stringify({
      type: 'video_frame',
      image: imageData,
      view: currentView
    }));
  };
  
  const registerFace = () => {
    if (!newPersonName.trim()) {
      alert("Please enter a name");
      return;
    }
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'register_face',
        name: newPersonName
      }));
      
      alert(`Registering face for ${newPersonName}`);
      setNewPersonName('');
    }
  };
  
  const getAttendanceReport = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'get_attendance_report'
      }));
    }
  };
  
  const renderFaceOverlays = () => {
    return recognizedFaces.map((face, index) => {
      const { x, y, w, h, identity } = face;
      return (
        <div 
          key={index} 
          className="face-box"
          style={{
            left: `${x}px`,
            top: `${y}px`,
            width: `${w}px`,
            height: `${h}px`
          }}
        >
          <div className="face-label">{identity}</div>
        </div>
      );
    });
  };
  
  const renderCurrentView = () => {
    switch(currentView) {
      case 'register':
        return (
          <div className="register-container">
            <h2>Register New Face</h2>
            <div className="form-group">
              <label>Person Name:</label>
              <input 
                type="text" 
                value={newPersonName}
                onChange={e => setNewPersonName(e.target.value)}
                placeholder="Enter name"
              />
            </div>
            <button className="btn-register" onClick={registerFace}>Save Face</button>
            <button className="btn-back" onClick={() => setCurrentView('attendance')}>Back</button>
          </div>
        );
      case 'report':
        return (
          <div className="report-container">
            <h2>Attendance Report</h2>
            <button className="btn-generate" onClick={getAttendanceReport}>Generate Report</button>
            <button className="btn-back" onClick={() => setCurrentView('attendance')}>Back</button>
          </div>
        );
      default:
        return (
          <div className="attendance-container">
            <div className="status-indicator">
              {isConnected ? 
                <span className="connected">Connected</span> : 
                <span className="disconnected">Disconnected</span>
              }
            </div>
            <div className="controls">
              <button className="btn-register" onClick={() => setCurrentView('register')}>Register Face</button>
              <button className="btn-report" onClick={() => setCurrentView('report')}>Get Attendance Report</button>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="face-recognition-container">
      <h1>Attendance System</h1>
      
      <div className="video-container">
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          className="webcam-video"
        />
        <div className="overlay-container">
          {renderFaceOverlays()}
        </div>
      </div>
      
      {renderCurrentView()}
    </div>
  );
};

export default FaceRecognitionComponent;