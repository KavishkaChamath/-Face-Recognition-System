
// components/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="home-page">
      <h1>Welcome to Face Recognition System</h1>
      <div className="feature-cards">
        <div className="card">
          <h3>Register Your Face</h3>
          <p>Add your face to the system database for future recognition.</p>
          <Link to="/register" className="button">Register Now</Link>
        </div>
        <div className="card">
          <h3>Face Recognition</h3>
          <p>Identify registered faces from the camera.</p>
          <Link to="/recognize" className="button">Start Recognition</Link>
        </div>
        <div className="card">
          <h3>Attendance System</h3>
          <p>Check and mark attendance using face recognition.</p>
          <Link to="/attendance" className="button">Check Attendance</Link>
        </div>
      </div>
    </div>
  );
};
export default HomePage;