'use client';
import AlatarParticles from "../alatar-particles";
import React, { useState, useEffect } from 'react';
import GlitchText from '../components/ui/GlitchText';

export default function Page() {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = ''; // Or 'auto' if you prefer
    };
  }, []);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    // Simulate API call
    try {
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Basic email validation (can be more complex)
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Please enter a valid email address.');
      }

      // Simulate success
      console.log("Form submitted with email:", email);
      setSuccessMessage('Successfully joined the waitlist!');
      setEmail(''); // Clear email input on success
      // setShowForm(false); // Optionally hide form after submission
      setTimeout(() => {
        setSuccessMessage('');
        setShowForm(false); // Hide form after message display
      }, 3000); // Hide message and form after 3 seconds

    } catch (error: any) {
      // Simulate error
      console.error("Form submission error:", error.message);
      setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
      setTimeout(() => {
        setErrorMessage('');
        setShowForm(false); // Hide form after message display
      }, 3000); // Hide message and form after 3 seconds
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <AlatarParticles />
      <div className="absolute bottom-[55px] text-center z-10 w-full max-w-xs px-4">
        {!showForm ? (
          <button
            onClick={() => {
              setShowForm(true);
              setSuccessMessage('');
              setErrorMessage('');
            }}
            className="text-gray-500 text-xs hover:text-gray-300 transition-colors duration-150 ease-in-out bg-transparent border-none p-0 m-0 cursor-pointer"
          >
            <GlitchText>[Join Waitlist]</GlitchText>
          </button>
        ) : (
          <div className="flex flex-col items-center w-full">
            {successMessage ? (
              <p className="text-xs text-green-500 mt-1">{successMessage}</p>
            ) : errorMessage ? (
              <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
            ) : (
              <form onSubmit={handleFormSubmit} className="flex items-center space-x-2 mb-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs bg-transparent text-gray-500 placeholder-gray-600 border-0 border-b border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-300 py-1 px-0 w-40 sm:w-48"
                  aria-label="Email for waitlist"
                  required
                />
                <button
                  type="submit"
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors duration-150 ease-in-out bg-transparent border-0 border-b border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-300 py-1 px-2"
                >
                  Submit
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
