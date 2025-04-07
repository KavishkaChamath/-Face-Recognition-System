// import { useState, useEffect } from "react";
// import { io } from "socket.io-client";

// const FaceRecognition = () => {
//     const [socket, setSocket] = useState(null);
//     const [message, setMessage] = useState("");
//     const [newPersonName, setNewPersonName] = useState("");

//     useEffect(() => {
//         const newSocket = io("http://127.0.0.1:5000");
//         setSocket(newSocket);

//         newSocket.on("connect", () => {
//             console.log("Connected to Flask WebSocket");
//         });

//         newSocket.on("server_message", (data) => {
//             alert(data.message);  // Show server response
//             setMessage(data.message);
//         });

//         return () => newSocket.disconnect();
//     }, []);

//     const registerFace = () => {
//         if (!newPersonName.trim()) {
//             alert("Please enter a name");
//             return;
//         }

//         if (socket) {
//             socket.emit("register_face", { name: newPersonName });
//             alert(`Registering face for ${newPersonName}`);
//             setNewPersonName('');
//         } else {
//             alert("WebSocket is not connected");
//         }
//     };

//     return (
//         <div>
//             <h2>Real-time Face Recognition</h2>
//             <input 
//                 type="text" 
//                 placeholder="Enter name" 
//                 value={newPersonName} 
//                 onChange={(e) => setNewPersonName(e.target.value)} 
//             />
//             <button className="btn-register" onClick={registerFace}>Save Face</button>
//             <p>{message}</p>
//         </div>
//     );
// };

// export default FaceRecognition;


import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const FaceRecognition = () => {
    const [message, setMessage] = useState("");
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io("http://127.0.0.1:5000"); // Connect to Flask WebSocket
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Connected to Flask WebSocket");
        });

        newSocket.on("server_message", (data) => {
            console.log("Received message from server:", data.message);
            setMessage(data.message);  // Update UI
            alert(data.message);       // Show alert with the message
        });

        return () => newSocket.disconnect();
    }, []);

    return (
        <div>
            <h2>Real-Time Face Recognition</h2>
            <p>Server Message: {message}</p> {/* Display received message */}
        </div>
    );
};

export default FaceRecognition;
