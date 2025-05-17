'use client';
import AlatarParticles from "../alatar-particles";
import React, { useState, useEffect } from 'react';
import GlitchText from '../components/ui/GlitchText';

export default function Page() {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);

    try {
      // Basic email validation
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Please enter a valid email address.');
      }

      // Call the API endpoint
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An unexpected error occurred');
      }
      
      setSuccessMessage(data.message);
      setEmail(''); // Clear email input on success
      
      setTimeout(() => {
        setSuccessMessage('');
        setShowForm(false); // Hide form after message display
      }, 3000);

    } catch (error: any) {
      console.error("Form submission error:", error.message);
      setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
      setTimeout(() => {
        setErrorMessage('');
        setShowForm(false); // Hide form after message display
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 overflow-hidden">
      <AlatarParticles />
      <div className="absolute bottom-[5vh] sm:bottom-[10vh] text-center z-10 w-full max-w-[90vw] sm:max-w-md px-4">
        {!showForm ? (
          <button
            onClick={() => {
              setShowForm(true);
              setSuccessMessage('');
              setErrorMessage('');
            }}
            className="text-gray-500 text-sm sm:text-base hover:text-gray-300 transition-colors duration-150 ease-in-out bg-transparent border-none p-0 m-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 rounded"
            aria-label="Join waitlist"
          >
            <GlitchText>[Join Waitlist]</GlitchText>
          </button>
        ) : (
          <div className="flex flex-col items-center w-full space-y-2">
            {successMessage ? (
              <p className="text-sm sm:text-base text-green-500 mt-1 animate-fade-in">{successMessage}</p>
            ) : errorMessage ? (
              <p className="text-sm sm:text-base text-red-500 mt-1 animate-fade-in">{errorMessage}</p>
            ) : (
              <form 
                onSubmit={handleFormSubmit} 
                className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs sm:max-w-md"
              >
                <div className="w-full">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm sm:text-base bg-transparent text-gray-500 placeholder-gray-600 border-0 border-b border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-300 py-2 px-0 transition-colors duration-150"
                    aria-label="Email for waitlist"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto text-sm sm:text-base text-gray-500 hover:text-gray-300 transition-colors duration-150 ease-in-out bg-transparent border-0 border-b border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-300 py-2 px-4 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
