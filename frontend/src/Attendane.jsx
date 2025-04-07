// components/AttendancePage.jsx
import React, { useState, useEffect } from 'react';

const AttendancePage = ({ serverUrl }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('today'); // 'today', 'week', 'month', 'all'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Fetch attendance records (This would need an endpoint in your Flask backend)
  const fetchAttendanceRecords = async () => {
    setIsLoading(true);
    
    try {
      // This assumes you have an attendance endpoint in your backend
      // You'll need to create this endpoint
      const queryParams = new URLSearchParams();
      queryParams.append('filter', filter);
      
      if (filter === 'custom' && startDate) {
        queryParams.append('startDate', startDate);
      }
      
      if (filter === 'custom' && endDate) {
        queryParams.append('endDate', endDate);
      }
      
      const response = await fetch(`${serverUrl}/attendance?${queryParams.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data.records);
      } else {
        console.error('Failed to fetch attendance records');
        
        // For demo purposes, create some sample data
        // You should replace this with actual data from the backend
        const sampleData = [
          { id: 1, name: 'John Doe', time: '08:30:25', date: '2025-04-03', confidence: 95.2 },
          { id: 2, name: 'Jane Smith', time: '08:45:12', date: '2025-04-03', confidence: 97.8 },
          { id: 3, name: 'Michael Johnson', time: '09:02:45', date: '2025-04-03', confidence: 94.5 },
          { id: 4, name: 'Sarah Williams', time: '09:15:33', date: '2025-04-02', confidence: 96.1 },
          { id: 5, name: 'Robert Brown', time: '08:50:19', date: '2025-04-02', confidence: 93.7 }
        ];
        
        setAttendanceRecords(sampleData);
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch records when filter changes
  useEffect(() => {
    fetchAttendanceRecords();
  }, [filter, startDate, endDate, serverUrl]);
  
  // Export attendance data
  const exportData = (format) => {
    if (format === 'csv') {
      // Create CSV data
      const headers = ['ID', 'Name', 'Date', 'Time', 'Confidence'];
      const csvContent = [
        headers.join(','),
        ...attendanceRecords.map(record => 
          [record.id, record.name, record.date, record.time, record.confidence].join(',')
        )
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
  
  return (
    <div className="attendance-page">
      <h1>Attendance Records</h1>
      
      <div className="filter-controls">
        <div className="filter-group">
          <label>Filter By:</label>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
            <option value="all">All Records</option>
          </select>
        </div>
        
        {filter === 'custom' && (
          <div className="date-range">
            <div className="date-input">
              <label>Start Date:</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="date-input">
              <label>End Date:</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}
        
        <div className="export-controls">
          <button 
            onClick={() => exportData('csv')}
            className="secondary-button"
          >
            Export CSV
          </button>
          <button 
            onClick={fetchAttendanceRecords}
            className="primary-button"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading">Loading attendance records...</div>
      ) : (
        <div className="attendance-table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.length > 0 ? (
                attendanceRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td>{record.name}</td>
                    <td>{record.date}</td>
                    <td>{record.time}</td>
                    <td>{record.confidence}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-records">No attendance records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;