// Attendance.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../new.css';

const API_URL = 'http://localhost:5000';

function Attendance() {
  const [attendanceList, setAttendanceList] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`${API_URL}/api/get-attendance?date=${date}`);
      setAttendanceList(response.data.attendance);
      
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch attendance data');
      setLoading(false);
    }
  };

  return (
    <div className="attendance-container">
      <h2>Attendance Record</h2>
      
      <div className="date-picker">
        <label>Select Date:</label>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
        />
      </div>
      
      {error && <div className="message error">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading...</div>
      ) : attendanceList.length > 0 ? (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {attendanceList.map((record, index) => (
              <tr key={index}>
                <td>{record.userId}</td>
                <td>{record.name}</td>
                <td>{new Date(record.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-data">No attendance records for this date</div>
      )}
    </div>
  );
}

export default Attendance;