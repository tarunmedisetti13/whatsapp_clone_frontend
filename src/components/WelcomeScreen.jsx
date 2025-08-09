import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function WelcomeScreen() {
    const [text, setText] = useState('');
    const [isTypingComplete, setIsTypingComplete] = useState(false);
    const navigate = useNavigate(); // Initialize navigate

    const fullText = 'Welcome to Chat Application';
    const typingSpeed = 100; // milliseconds per character

    useEffect(() => {
        let index = 0;
        let isMounted = true;
        setText(''); // Reset text on component mount

        const typeInterval = setInterval(() => {
            if (!isMounted) {
                clearInterval(typeInterval);
                return;
            }

            if (index < fullText.length) {
                const currentChar = fullText.charAt(index); // Use charAt instead of array access
                setText((prev) => prev + currentChar);
                index++;
            } else {
                clearInterval(typeInterval);
                if (isMounted) {
                    setIsTypingComplete(true);
                    // Simulate redirect after 1.5 seconds
                    setTimeout(() => {
                        if (isMounted) {
                            // In actual implementation: navigate('/home')
                            navigate('/home');
                        }
                    }, 1500);
                }
            }
        }, typingSpeed);

        // Cleanup function to clear interval on unmount
        return () => {
            isMounted = false;
            clearInterval(typeInterval);
        };
    }, [fullText, typingSpeed, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-center p-4 sm:p-6 lg:p-8">
            {/* Logo/Icon */}
            <div className="mb-6 sm:mb-8">
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                    alt="Chat Application Logo"
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 opacity-70 transition-opacity duration-300 hover:opacity-90"
                />
            </div>

            {/* Main Heading with Typewriter Effect */}
            <div className="mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 tracking-wide leading-tight px-4">
                    {text}
                    {!isTypingComplete && (
                        <span className="animate-pulse text-blue-500 ml-1">|</span>
                    )}
                </h1>
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-8 max-w-md mx-auto px-4">
                {isTypingComplete ? 'Redirecting to your Application...' : 'Setting up your experience...'}
            </p>

            {/* Loading Indicator */}
            {isTypingComplete && (
                <div className="flex items-center justify-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            )}

            {/* Progress Bar */}
            <div className="mt-8 w-full max-w-xs mx-auto">
                <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                        className="bg-blue-500 h-1 rounded-full transition-all duration-100 ease-out"
                        style={{ width: `${(text.length / fullText.length) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}

export default WelcomeScreen;
