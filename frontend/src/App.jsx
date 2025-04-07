import { useState } from 'react'
import FaceRecognition from './FaceRecognition '
import './App.css'
import Test from './Test'
import Face from './Face'
import RegisterFace from './components/RegisterFace';
import RecognizeFace from './components/RecognizeFace';
import Attendance from './components/Attendance';
import { io } from "socket.io-client";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';


// Replace with your Flask server URL
const SERVER_URL = 'http://localhost:5000';

// Initialize socket connection for the app
const socket = io(SERVER_URL, {
  autoConnect: false // Don't connect automatically, we'll connect when needed
});

function App() {
  //const [count, setCount] = useState(0)

  return (
    <>
      {/* <div>
            <h1>Face Recognition App</h1>
            <Face/>
        </div> */}

    
<Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="navbar-brand">Face Recognition System</div>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/" className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/register" className="nav-link">Register Face</Link>
            </li>
            <li className="nav-item">
              <Link to="/recognize" className="nav-link">Recognize Face</Link>
            </li>
            <li className="nav-item">
              <Link to="/attendance" className="nav-link">Attendance</Link>
            </li>
          </ul>
        </nav>

        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegisterFace />} />
            <Route path="/recognize" element={<RecognizeFace />} />
            <Route path="/attendance" element={<Attendance />} />
          </Routes>
        </div>
      </div>
    </Router>
    </>
  )
}
function Home() {
  return (
    <div className="home">
      <h1>Welcome to Face Recognition System</h1>
      <p>Simply record your attendance using your face</p>
      <div className="home-buttons">
        <Link to="/register" className="button primary">Register New Face</Link>
        <Link to="/recognize" className="button secondary">Recognize Face</Link>
      </div>
    </div>
  );
}

export default App



// import { useState } from 'react'
// import FaceRecognition from './FaceRecognition '
// import './App.css'
// import Test from './Test'
// import Face from './Face'

// import { io } from "socket.io-client";


// function App() {
//   //const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//             <h1>Face Recognition App</h1>
//             <Face/>
//         </div>

    

//     </>
//   )
// }


// export default App
