import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const DownloadPage = () => {
  const { id } = useParams<{ id: string }>();
  const [photoData, setPhotoData] = useState("");

  // Fetch image and store in localStorage
  const fetchPhoto = async () => {
    try {
      const response = await axios.get(`https://selfiekiosk-1.onrender.com/image/my-image.png`, {
          responseType: "text", // Get the raw Base64 string as text
      });
  
      const base64Data = response.data; // Raw Base64 string from the backend
      
      const parsedData = JSON.parse(base64Data); // Convert JSON to object
      const imageDataURL = parsedData.imageDataURL;
      localStorage.setItem("image", imageDataURL); // Store as-is
      setPhotoData(imageDataURL);
      console.log("Stored Base64:", imageDataURL  );
  } catch (error) {
      console.error("Error fetching image:", error);
  }
  };

  useEffect(() => {
    fetchPhoto();
  }, [photoData]); // Dependency ensures re-fetch if photoData is missing

  if (!photoData) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center"
           style={{ backgroundImage: `url('/images/background.jpg')` }}>
        <div className="relative z-10 text-amber-300">
          <h1 className="text-3xl font-bold mb-4">Photo Not Found</h1>
          <p className="text-lg">The photo has either already been downloaded or the link is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center"
         style={{ backgroundImage: `url('/images/background.jpg')` }}>
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-amber-300">Download Your Photo</h1>
        <img src={photoData} alt="Downloaded Selfie"
             className="max-w-full max-h-80vh rounded-lg shadow-xl" />
        <a href={photoData}
           download="selfie.jpg"
           className="mt-8 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg text-black text-xl font-semibold hover:from-amber-500 hover:to-amber-300 transition-all duration-300">
          Download
        </a>
      </div>
    </div>
  );
};

export default DownloadPage;
