import React, { useState, useEffect, useRef } from "react";
    import { Link, useNavigate } from "react-router-dom";
    import { useForm } from "react-hook-form";
    import Logo from "../components/Logo";
    import toast from 'react-hot-toast';
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
      const [keyboardPosition, setKeyboardPosition] = useState<{ top: number; left: number; width?: number }>({ top: 0, left: 0 });
      const [keyboardVisible, setKeyboardVisible] = useState(false);
      const formRef = useRef<HTMLFormElement>(null);
      const keyboardRef = useRef<HTMLDivElement>(null);
      const containerRef = useRef<HTMLDivElement>(null); // Ref for the container

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
          setValue(focusedInput as keyof FormData, (getValues(focusedInput) || '') + key, { shouldDirty: true, shouldValidate: true });
        }
      };

      const handleBackspace = () => {
        if (focusedInput) {
          setValue(focusedInput as keyof FormData, (getValues(focusedInput) || '').slice(0, -1), { shouldDirty: true, shouldValidate: true });
        }
      };

      const handleFocus = (inputName: string) => {
        setFocusedInput(inputName);
        setKeyboardVisible(true);
        const inputElement = document.querySelector(`input[name="${inputName}"]`) as HTMLInputElement;

        if (inputElement && containerRef.current) {
          const inputRect = inputElement.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();

          // Calculate the position relative to the container.
          const topPosition = inputRect.bottom - containerRect.top + 10; // 10px gap below the input
          const leftPosition = inputRect.left - containerRect.left;
          const inputWidth = inputRect.width;

          setKeyboardPosition({
            top: topPosition,
            left: leftPosition,
            width: inputWidth,
          });
        }
      };

      const handleBlur = () => {
        // Delay hiding the keyboard to allow button clicks to register.
        setTimeout(() => {
          setKeyboardVisible(false);
          setFocusedInput(null);
        }, 100);
      };

      const preventBlur = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent input blur when clicking on the keyboard.
      };

      return (
        <div
          className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center"
          style={{ backgroundImage: `url('/images/background.jpg')` }}
        >
          <div ref={containerRef} className="relative z-10 w-full max-w-2xl p-6  bg-opacity-70 backdrop-blur-lg rounded-xl shadow-xl">
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
                ref={keyboardRef}
                onMouseDown={preventBlur}
                style={{
                  position: 'absolute',
                  top: `${keyboardPosition.top}px`,
                  left: `${keyboardPosition.left}px`,
                  width:  `${keyboardPosition.width}px`,
                  zIndex: 1000,
                }}
              >
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
