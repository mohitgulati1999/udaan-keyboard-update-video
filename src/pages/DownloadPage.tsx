import React, { useEffect } from 'react';
    import { useParams, Link } from 'react-router-dom';
    import { getPhoto, deletePhoto } from './PhotoPage';

    const DownloadPage = () => {
      const { id } = useParams<{ id: string }>();

      // Retrieve the photo data *once* and keep it.
      const photoData = localStorage.getItem("image");

      useEffect(() => {
        // No longer deleting here in useEffect
        if (id && !photoData) {
          console.log("Photo not found or already downloaded.");
        }
      }, [id, photoData]);

      if (!photoData) {
        return (
          <div
            className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center"
            style={{ backgroundImage: `url('/images/background.jpg')` }}
          >
            {/* Removed Overlay */}

            <div className="relative z-10 text-amber-300">
              <h1 className="text-3xl font-bold mb-4">Photo Not Found</h1>
              <p className="text-lg">The photo has either already been downloaded or the link is invalid.</p>
            </div>
            {/* Removed Home button */}
          </div>
        );
      }

      return (
        <div
          className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center"
          style={{ backgroundImage: `url('/images/background.jpg')` }}
        >
          {/* Removed Overlay */}
          
          <div className="relative z-10 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-8 text-amber-300">Download Your Photo</h1>
            <img src={photoData} alt="Downloaded Selfie" className="max-w-full max-h-80vh rounded-lg shadow-xl" />
            <a
              href={photoData}
              download="selfie.jpg"
              className="mt-8 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg text-black text-xl font-semibold hover:from-amber-500 hover:to-amber-300 transition-all duration-300"
              onClick={() => {
                // Delete the photo *after* the download link is clicked.
                if (id) {
                  deletePhoto(id);
                }
              }}
            >
              Download
            </a>
          </div>
          {/* Removed Home button */}
        </div>
      );
    };

    export default DownloadPage;
