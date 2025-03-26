import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import VirtualKeyboard from "../components/VirtualKeyboard";

interface FormData {
  name: string;
  phone: string;
  email: string;
}

const FormPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>();
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [keyboardPosition, setKeyboardPosition] = useState<{ x: number; y: number }>({ 
    x: window.innerWidth / 2 - 200, 
    y: window.innerHeight - 300 
  });
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const formRef = useRef<HTMLFormElement>(null);
  const keyboardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        navigate("/");
      }, 60000);
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    resetTimer();
    events.forEach((event) => document.addEventListener(event, resetTimer));

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach((event) => document.removeEventListener(event, resetTimer));
    };
  }, [navigate]);

  const onSubmit = (data: FormData) => {
    localStorage.setItem("userInfo", JSON.stringify(data));
    navigate("/photo");
  };

  const handleKeyPress = (key: string) => {
    if (focusedInput) {
      setValue(focusedInput as keyof FormData, (getValues(focusedInput) || '') + key, { 
        shouldDirty: true, 
        shouldValidate: true 
      });
    }
  };

  const handleBackspace = () => {
    if (focusedInput) {
      setValue(focusedInput as keyof FormData, (getValues(focusedInput) || '').slice(0, -1), { 
        shouldDirty: true, 
        shouldValidate: true 
      });
    }
  };

  const handleFocus = (inputName: string) => {
    setFocusedInput(inputName);
    setKeyboardVisible(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as Node;
    // Don't hide keyboard if clicking on keyboard or moving to another input
    if (
      relatedTarget instanceof HTMLElement && 
      (keyboardContainerRef.current?.contains(relatedTarget) ||
       relatedTarget.tagName === 'INPUT')
    ) {
      return;
    }
    setKeyboardVisible(false);
    // Only clear focusedInput if not clicking on keyboard
    if (!keyboardContainerRef.current?.contains(relatedTarget)) {
      setFocusedInput(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent losing focus
    if (keyboardContainerRef.current) {
      const rect = keyboardContainerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - keyboardPosition.x,
        y: e.clientY - keyboardPosition.y
      });
      setIsDragging(true);
      // Ensure keyboard stays visible when starting drag
      setKeyboardVisible(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && keyboardContainerRef.current) {
      const rect = keyboardContainerRef.current.getBoundingClientRect();
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const keyboardWidth = rect.width;
      const keyboardHeight = rect.height;

      const constrainedX = Math.max(0, Math.min(newX, screenWidth - keyboardWidth));
      const constrainedY = Math.max(0, Math.min(newY, screenHeight - keyboardHeight));

      setKeyboardPosition({
        x: constrainedX,
        y: constrainedY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center"
      style={{ backgroundImage: `url('/images/background.jpg')` }}
    >
      <div className="relative z-10 w-full max-w-2xl p-6 bg-opacity-70 backdrop-blur-lg rounded-xl shadow-xl">
        <Link to="/" className="flex items-center justify-center gap-2 py-8">
          <img src="/images/logo.png" alt="Logo" className="w-auto h-auto" />
        </Link>
        <h2 className="text-4xl font-serif text-amber-300 text-center mb-8">
          Your Information
        </h2>

        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <input
              {...register("name", { required: "Name is required" })}
              placeholder="Full Name"
              className="w-full px-6 py-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-2xl"
              onFocus={() => handleFocus('name')}
              onBlur={handleBlur}
              autoComplete="off"
              inputMode="none"
            />
            {errors.name && (
              <p className="mt-1 text-red-400 text-lg">{errors.name.message}</p>
            )}
          </div>

          <div>
            <input
              {...register("phone", {
                required: "Phone number is required",
                validate: {
                  validLength: (value) => {
                    const digitsOnly = value.replace(/\D/g, "");
                    return (
                      digitsOnly.length === 10 ||
                      "Phone number must be 10 digits"
                    );
                  },
                  validFormat: (value) => {
                    const cleaned = value.replace(/\D/g, "");
                    return (
                      /^\d{10}$/.test(cleaned) || "Invalid phone number format"
                    );
                  },
                },
              })}
              placeholder="Phone Number"
              className="w-full px-6 py-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-2xl"
              onFocus={() => handleFocus('phone')}
              onBlur={handleBlur}
              autoComplete="off"
              inputMode="numeric"
            />
            {errors.phone && (
              <p className="mt-1 text-red-400 text-lg">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              placeholder="Email Address"
              className="w-full px-6 py-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-2xl"
              onFocus={() => handleFocus('email')}
              onBlur={handleBlur}
              autoComplete="off"
              inputMode="email"
            />
            {errors.email && (
              <p className="mt-1 text-red-400 text-lg">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-12 py-6 bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg text-black text-3xl font-semibold hover:from-amber-500 hover:to-amber-300 transition-all duration-300"
          >
            Take Photo
          </button>
        </form>

        {keyboardVisible && (
          <div
            ref={keyboardContainerRef}
            style={{
              position: 'fixed',
              left: `${keyboardPosition.x}px`,
              top: `${keyboardPosition.y}px`,
              zIndex: 1000,
            }}
          >
            <div 
              className="bg-gray-800 p-2 rounded-t-lg text-white text-center cursor-move"
              onMouseDown={handleMouseDown}
              style={{ 
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
            >
              Drag Keyboard
            </div>
            <VirtualKeyboard
              onKeyPress={handleKeyPress}
              onBackspace={handleBackspace}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FormPage;
