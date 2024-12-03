import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState(null);
  const [cameraSettings, setCameraSettings] = useState({
    resolution: { width: 1920, height: 1080 },
    filter: "none",
  });
  // Enhanced camera access with error handling
  const getVideo = useCallback(async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: cameraSettings.resolution.width },
          height: { ideal: cameraSettings.resolution.height },
          facingMode: "user", // Prefer front camera
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.play();
      }
      setError(null);
    } catch (err) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError") {
        setError("Camera access was denied. Please grant camera permissions.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError("An error occurred while accessing the camera.");
      }
    }
  }, [cameraSettings.resolution]);

  // Photo taking with filter support
  const takePhoto = () => {
    const width = 720;
    const height = width / (16 / 9);
    const video = videoRef.current;
    const photo = photoRef.current;

    if (!photo || !video) {
      console.error("Photo canvas or video element is null!");
      return;
    }

    photo.width = width;
    photo.height = height;
    const ctx = photo.getContext("2d");

    // Apply filter
    ctx.filter = getFilterStyle();
    ctx.drawImage(video, 0, 0, width, height);
    ctx.filter = "none"; // Reset filter

    const dataUrl = photo.toDataURL("image/png");
    setCapturedPhoto(dataUrl);
  };

  // Simulated backend photo saving

  const savePhoto = async () => {
    if (!capturedPhoto) return;
   
    try {
      // Create a FormData object to send both image and other data
      const formData = new FormData();
      
      // Convert base64 to blob
      const response = await fetch(capturedPhoto);
      console.log('response', response);
      const blob = await response.blob();
      
      // Append image file and other data
      formData.append('image', blob, 'photo.png');
      formData.append('comment', comment);
      formData.append('filter', cameraSettings.filter);
      formData.append('timestamp', new Date().toISOString());
      
      // Send to upload endpoint
      const uploadResponse = await fetch('http://localhost:5000/api/photos/upload', {
        method: 'POST',
        body: formData
      });
      console.log('hello', uploadResponse);
      // Check if response is not OK
      if (!uploadResponse.ok) {
        throw new Error("Photo saving failed");
      }
  
      // Parse the response
      const result = await uploadResponse.json();
      console.log('Result', result);
      // Success alert
      alert("Photo saved successfully!");
  
      // Reset state
      setCapturedPhoto(null);
      setComment("");
      getVideo();
    } catch (error) {
      console.error("Save error:", error);
      
      // Error alert with more specific message
      alert(error.message || "Failed to save photo. Please try again.");
    }
  };
  // Filter application logic
  const getFilterStyle = () => {
    switch (cameraSettings.filter) {
      case "grayscale":
        return "grayscale(100%)";
      case "sepia":
        return "sepia(100%)";
      case "invert":
        return "invert(100%)";
      case "brightness":
        return "brightness(150%)";
      default:
        return "none";
    }
  };

  // Retake photo and reset
  const retakePhoto = () => {
    setCapturedPhoto(null);
    setComment("");
    getVideo();
  };

  // Camera resolution options
  const resolutionOptions = [
    { label: "Low (640x480)", width: 640, height: 480 },
    { label: "Standard (1280x720)", width: 1280, height: 720 },
    { label: "HD (1920x1080)", width: 1920, height: 1080 },
    { label: "4K (3840x2160)", width: 3840, height: 2160 },
  ];

  useEffect(() => {
    const videoElement = videoRef.current; // Capture the ref value in a variable
    getVideo();

    return () => {
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        videoElement.srcObject = null;
      }
    };
  }, [getVideo]);

  return (
    <div className="App">
      <div className="camera">
        {error && <div className="error-message">{error}</div>}

        {capturedPhoto ? (
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img
              src={capturedPhoto}
              alt="Captured"
              style={{
                width: "80%",
                maxHeight: "80vh",
                borderRadius: "10px",
                objectFit: "contain",
                filter: getFilterStyle(),
              }}
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              style={{
                width: "80%",
                margin: "20px 0",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                fontSize: "16px",
              }}
            />
            <div className="controls">
              <button onClick={retakePhoto}>Take New Photo</button>
              <button onClick={savePhoto}>Save and Close</button>
              <button onClick={() => setCapturedPhoto(null)}>Close</button>
            </div>
          </div>
        ) : (
          <div>
            <video ref={videoRef} style={{ width: "100%", maxHeight: "80vh" }}></video>
            <div className="camera-controls">
              <button onClick={takePhoto}>Take Photo</button>

              {/* Resolution Selector */}
              <select
                value={`${cameraSettings.resolution.width}x${cameraSettings.resolution.height}`}
                onChange={(e) => {
                  const [width, height] = e.target.value.split("x").map(Number);
                  setCameraSettings((prev) => ({ ...prev, resolution: { width, height } }));
                }}
              >
                {resolutionOptions.map((res) => (
                  <option key={`${res.width}x${res.height}`} value={`${res.width}x${res.height}`}>
                    {res.label}
                  </option>
                ))}
              </select>

              {/* Filter Selector */}
              <select
                value={cameraSettings.filter}
                onChange={(e) => setCameraSettings((prev) => ({ ...prev, filter: e.target.value }))}
              >
                <option value="none">No Filter</option>
                <option value="grayscale">Grayscale</option>
                <option value="sepia">Sepia</option>
                <option value="invert">Invert</option>
                <option value="brightness">Brightness</option>
              </select>
            </div>
          </div>
        )}
        <canvas ref={photoRef} style={{ display: "none" }}></canvas>
      </div>
    </div>
  );
}

export default App;
