// // import React, { useState, useRef, useEffect } from "react";

// // const FaceRecognition = () => {
// //     const [isCameraOn, setIsCameraOn] = useState(false);
// //     const videoRef = useRef(null);
// //     const canvasRef = useRef(null);
// //     let socket = useRef(null);

// //     useEffect(() => {
// //         if (isCameraOn) {
// //             startCamera();
// //             startWebSocket();
// //         } else {
// //             stopCamera();
// //             if (socket.current) {
// //                 socket.current.close();
// //             }
// //         }
// //     }, [isCameraOn]);

// //     const startCamera = () => {
// //         navigator.mediaDevices.getUserMedia({ video: true })
// //             .then((stream) => {
// //                 if (videoRef.current) {
// //                     videoRef.current.srcObject = stream;
// //                 }
// //             })
// //             .catch((err) => console.error("Error accessing camera:", err));
// //     };

// //     const stopCamera = () => {
// //         if (videoRef.current && videoRef.current.srcObject) {
// //             videoRef.current.srcObject.getTracks().forEach(track => track.stop());
// //         }
// //     };

// //     const startWebSocket = () => {
// //         socket.current = new WebSocket("ws://127.0.0.1:5000/ws");

// //         socket.current.onmessage = (event) => {
// //             const data = JSON.parse(event.data);
// //             alert(`Detected: ${data.identity}`);
// //         };

// //         sendFrames();
// //     };

// //     const sendFrames = () => {
// //         const canvas = canvasRef.current;
// //         const ctx = canvas.getContext("2d");

// //         const captureFrame = () => {
// //             if (!isCameraOn || !socket.current || socket.current.readyState !== WebSocket.OPEN) return;

// //             ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
// //             canvas.toBlob(blob => {
// //                 if (blob) {
// //                     socket.current.send(blob);
// //                 }
// //             }, "image/jpeg");

// //             setTimeout(captureFrame, 100); // Capture every 100ms
// //         };

// //         captureFrame();
// //     };

// //     return (
// //         <div style={{ textAlign: "center", marginTop: "20px" }}>
// //             <h2>Real-time Face Recognition</h2>
// //             <button onClick={() => setIsCameraOn(!isCameraOn)}>
// //                 {isCameraOn ? "Stop Camera" : "Start Camera"}
// //             </button>
// //             <div>
// //                 <video ref={videoRef} autoPlay playsInline style={{ width: "400px", marginTop: "20px" }}></video>
// //                 <canvas ref={canvasRef} width="400" height="300" style={{ display: "none" }}></canvas>
// //             </div>
// //         </div>
// //     );
// // };

// // export default FaceRecognition;

// import React, { useState, useRef, useEffect } from "react";
// import { io } from "socket.io-client";

// const FaceRecognition = () => {
//     const [isCameraOn, setIsCameraOn] = useState(false);
//     const [processedImage, setProcessedImage] = useState(null);
//     const videoRef = useRef(null);
//     const canvasRef = useRef(null);
//     const socket = useRef(null);

//     useEffect(() => {
//         if (isCameraOn) {
//             startCamera();
//             startWebSocket();
//         } else {
//             stopCamera();
//             if (socket.current) socket.current.disconnect();
//         }
//     }, [isCameraOn]);

//     const startCamera = () => {
//         navigator.mediaDevices.getUserMedia({ video: true })
//             .then((stream) => {
//                 if (videoRef.current) {
//                     videoRef.current.srcObject = stream;
//                 }
//             })
//             .catch((err) => console.error("Error accessing camera:", err));
//     };

//     const stopCamera = () => {
//         if (videoRef.current && videoRef.current.srcObject) {
//             videoRef.current.srcObject.getTracks().forEach(track => track.stop());
//         }
//     };

//     // const startWebSocket = () => {
//     //     socket.current = io("http://127.0.0.1:5000");  // Connect to backend

//     //     socket.current.on("processed_frame", (data) => {
//     //         setProcessedImage(data.image);  // Receive and display processed image
//     //     });

//     //     sendFrames();
//     // };
//     const startWebSocket = () => {
//         socket.current = io("http://127.0.0.1:5000", {
//             transports: ["websocket"],  // Ensure WebSocket connection
//         });
    
//         socket.current.on("connect", () => {
//             console.log("Connected to Flask-SocketIO");
//         });
    
//         socket.current.on("server_message", (data) => {
//             console.log("Server:", data.message);
//         });
    
//         socket.current.on("processed_frame", (data) => {
//             setProcessedImage(data.image);  // Receive and display processed image
//         });
    
//         sendFrames();
//     };
    

//     const sendFrames = () => {
//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext("2d");

//         const captureFrame = () => {
//             if (!isCameraOn || !socket.current || socket.current.disconnected) return;

//             ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
//             const imageData = canvas.toDataURL("image/jpeg");  // Convert frame to base64

//             socket.current.emit("video_frame", imageData);  // Send to backend

//             setTimeout(captureFrame, 100);  // Capture every 100ms
//         };

//         captureFrame();
//     };

//     return (
//         <div style={{ textAlign: "center", marginTop: "20px" }}>
//             <h2>Real-time Face Recognition</h2>
//             <button onClick={() => setIsCameraOn(!isCameraOn)}>
//                 {isCameraOn ? "Stop Camera" : "Start Camera"}
//             </button>
//             <div>
//                 <video ref={videoRef} autoPlay playsInline style={{ width: "400px", marginTop: "20px" }}></video>
//                 <canvas ref={canvasRef} width="400" height="300" style={{ display: "none" }}></canvas>
//             </div>
//             {processedImage && (
//                 <div>
//                     <h3>Processed Frame:</h3>
//                     <img src={processedImage} alt="Processed Frame" style={{ width: "400px", border: "2px solid black" }} />
//                 </div>
//             )}
//         </div>
//     );
// };

// export default FaceRecognition;
import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const FaceRecognition = () => {
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [processedImage, setProcessedImage] = useState(null);
    const videoRef = useRef(null);
    let socket = useRef(null);

    useEffect(() => {
        if (isCameraOn) {
            startWebSocket();
            startCamera();
        } else {
            stopCamera();
            if (socket.current) {
                socket.current.disconnect();
            }
            setProcessedImage(null);
        }

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [isCameraOn]);

    const startCamera = () => {
        // Request backend to start camera
        if (socket.current) {
            socket.current.emit("start_camera");
        }
    };

    const stopCamera = () => {
        // Request backend to stop camera
        if (socket.current) {
            socket.current.emit("stop_camera");
        }
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
    };

    const startWebSocket = () => {
        socket.current = io("http://127.0.0.1:5000", { transports: ["websocket"] });

        socket.current.on("connect", () => {
            console.log("Connected to Flask WebSocket");
        });

        socket.current.on("processed_frame", (data) => {
            setProcessedImage(data.image);  // Display processed frame
        });
    };

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <h2>Real-time Face Recognition</h2>
            <button onClick={() => setIsCameraOn(!isCameraOn)}>
                {isCameraOn ? "Stop Camera" : "Start Camera"}
            </button>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                <div>
                    <h3>Live Camera Feed</h3>
                    <video ref={videoRef} autoPlay playsInline style={{ width: "320px", border: "2px solid black" }}></video>
                </div>
                <div>
                    <h3>Processed Face Detection</h3>
                    {processedImage ? (
                        <img src={processedImage} alt="Processed Video" style={{ width: "320px", border: "2px solid red" }} />
                    ) : (
                        <h3>No processed frame yet...</h3>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FaceRecognition;

