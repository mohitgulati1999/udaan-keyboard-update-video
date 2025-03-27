import React, { useState, useEffect, useRef, useCallback } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { Camera, Home, RefreshCcw } from 'lucide-react';
    import toast from 'react-hot-toast';
    import { QRCodeCanvas } from 'qrcode.react';
    import { v4 as uuidv4 } from 'uuid';

    // In-memory storage for temporary photo data (FRONTEND ONLY)
    const photoStorage = new Map<string, string>();

    // Exported functions to interact with photoStorage (FRONTEND ONLY)
    export function getPhoto(id: string): string | undefined {
      return photoStorage.get(id);
    }

    export function setPhoto(id: string, data: string) {
      photoStorage.set(id, data);
    }

    export function deletePhoto(id: string) {
      photoStorage.delete(id);
    }

    const PhotoPage = () => {
      const videoRef = useRef<HTMLVideoElement | null>(null);
      const canvasRef = useRef<HTMLCanvasElement | null>(null);
      const [photoId, setPhotoId] = useState<string | null>(null); // Store the ID, not the photo data URL
      const [countdown, setCountdown] = useState<number | null>(null);
      const navigate = useNavigate();

      // Request access to the webcam
      useEffect(() => {
        const startVideoStream = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { ideal: 1080 },
                height: { ideal: 1920 },
                facingMode: "user",
                aspectRatio: 9 / 16
              }
            });

            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (err) {
            console.error('Error accessing webcam:', err);
            toast.error('Failed to access webcam');
          }
        };

        startVideoStream();
      }, []);

      const startCountdown = () => {
        setCountdown(5);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev === 1) {
              clearInterval(timer);
              capture();
              return null;
            }
            return prev ? prev - 1 : null;
          });
        }, 1000);
      };

      const capture = useCallback(() => {
        if (canvasRef.current && videoRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');

          if (context) {
            const isPortrait = window.innerHeight > window.innerWidth;

            if (isPortrait) {
              canvas.width = video.videoHeight;
              canvas.height = video.videoWidth;
              context.translate(canvas.width, 0);
              context.rotate(-90 * Math.PI / 180);
            } else {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
            }

            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const imageSrc = canvas.toDataURL('image/jpeg');

            // Generate unique ID and store in memory
            const id = uuidv4();
            setPhoto(id, imageSrc); // Use the setPhoto function
            setPhotoId(id);
          }
        }
      }, []);


      return (
        <div
          className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center"
          style={{ backgroundImage: `url('/images/background.jpg')` }}
        >
          {/* Removed Overlay */}

          <div className="relative z-10 container mx-auto px-4 w-full h-full flex flex-col justify-center items-center">
            <Link to="/" className="flex items-center justify-center gap-2 py-8">
              <img src="/images/logo.png" className='w-auto h-auto' alt="Logo" />
            </Link>

            <div className="bg-black bg-opacity-70 backdrop-blur-lg rounded-xl p-8 shadow-xl max-w-3xl w-full">
              {!photoId ? (
                <div className="space-y-6 flex flex-col items-center justify-center ">
                  <div className="relative w-full h-[70vh] flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full rounded-lg absolute"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '70vh',
                        objectFit: 'cover',
                        transform: 'scaleX(1) rotate(90deg)',
                        transformOrigin: 'center',
                      }}
                    />
                    {countdown && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-32 h-32 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
                          <div className="text-6xl text-amber-300 font-bold animate-pulse">
                            {countdown}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center w-full">
                    {!countdown && (
                      <button
                        onClick={startCountdown}
                        className="flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg text-black text-2xl font-semibold hover:from-amber-500 hover:to-amber-300 transition-all duration-300"
                      >
                        <Camera className="w-auto h-auto" />
                        Take Photo
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 flex flex-col items-center justify-center">
                  <div className="overflow-hidden rounded-lg shadow-xl border-4 border-amber-400 border-dashed">
                    {/* Photo Frame */}
                    <img
                      src={getPhoto(photoId)}
                      alt="Captured Thumbnail"
                      className="w-full  rounded-lg"
                      style={{
                        maxHeight: '40vh', // Adjust as needed
                        objectFit: 'contain',
                        transform: ' rotate(180deg)',
                        width: 'auto',
                        height: '100%',
                      }}
                    />
                  </div>

                  <div className="flex flex-col items-center justify-center gap-4">
                    {/* Themed QR Code */}
                    <QRCodeCanvas
                      value={photoId ? `${window.location.origin}/download/${photoId}` : ''}
                      size={256}
                      level="H"
                      bgColor="#000000"  // Black background
                      fgColor="#f59e0b"  // Amber foreground
                      className="rounded-lg border-4 border-amber-400 p-2"
                    />
                  </div>

                  <div className="flex justify-center gap-8 mt-4">
                    <button
                      onClick={() => navigate('/')}
                      className="flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg text-black text-xl font-semibold hover:from-amber-500 hover:to-amber-300 transition-all duration-300"
                    >
                      <Home className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => {
                        if (photoId) {
                          deletePhoto(photoId); // Use the deletePhoto function
                        }
                        setPhotoId(null);
                        window.location.reload();
                      }}
                      className="flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg text-black text-xl font-semibold hover:from-amber-500 hover:to-amber-300 transition-all duration-300"
                    >
                      <RefreshCcw className="w-6 h-6" />
                      Retake
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      );
    };

    export default PhotoPage;
