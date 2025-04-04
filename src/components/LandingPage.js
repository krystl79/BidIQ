import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChatBot from './ChatBot';

const LandingPage = () => {
  const { currentUser } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSupportedBrowser, setIsSupportedBrowser] = useState(false);
  const [isInstallable, setIsInstallable] = useState(true);
  const [showChatBot, setShowChatBot] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isIOS = /iphone|ipad|ipod/i.test(userAgent.toLowerCase());
      const isChrome = /chrome/i.test(userAgent);
      const isSafari = /safari/i.test(userAgent) && !isChrome;
      const isFirefox = /firefox/i.test(userAgent);
      
      setIsMobile(isMobileDevice);
      setIsIOS(isIOS);
      setIsSupportedBrowser(isChrome || isSafari || isFirefox);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    });
    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Installation error:', error);
    }
  };

  const shouldShowInstallButton = isMobile && isSupportedBrowser && isInstallable && !isIOS;

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img src="/logo.png" alt="BidIQ Logo" className="h-8 w-auto" />
                <h1 className="ml-2 text-2xl font-bold text-purple-600">BidIQ</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/login?mode=signup"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    Get Started
                  </Link>
                </>
              )}
              {shouldShowInstallButton && (
                <button
                  onClick={handleInstallClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-700 hover:bg-purple-800"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download App
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-purple-600 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Equipment Rental Bids in Minutes
              </h1>
              <p className="text-xl text-purple-100 mb-8">
                Save time, win more bids, and get competitive pricing for every project.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/login?mode=signup"
                  className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50"
                >
                  START ESTIMATE
                </Link>
                <Link
                  to="/features"
                  className="inline-flex justify-center items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-purple-700"
                >
                  EXPLORE FEATURES
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Here Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Not sure where to start? We can help!
            </h2>
            <button
              onClick={() => setShowChatBot(true)}
              className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-purple-700 hover:bg-purple-800 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Start Here
            </button>
          </div>
        </div>
      </div>

      {/* Rental Partners Box */}
      <div className="bg-purple-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">For Rental Partners</h3>
            <p className="text-purple-100 mb-4">
              Get real-time leads from active projects and connect with contractors in your area.
            </p>
            <Link
              to="/partners/signup"
              className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-700 hover:bg-purple-800 w-full"
            >
              JOIN AS EQUIPMENT PARTNER
            </Link>
          </div>
        </div>
      </div>

      {/* Why Choose Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Why Choose BidIQ?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered Estimates</h3>
              <p className="text-gray-600">Get accurate equipment recommendations based on project type and requirements.</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Save Time</h3>
              <p className="text-gray-600">Create professional bids in minutes instead of hours.</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Competitive Pricing</h3>
              <p className="text-gray-600">Access real-time rental rates from local equipment providers.</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Win More Bids</h3>
              <p className="text-gray-600">Stand out with professional, detailed equipment quotes.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-purple-200 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
              Everything you need to manage bids
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {/* Feature 1 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Bid Management</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Create, track, and manage construction bids all in one place.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Analytics</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Get insights into your bid performance with detailed analytics.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Deadline Tracking</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Never miss a bid deadline with our smart notification system.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Document Management</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Store and manage all your bid-related documents securely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Better Equipment Rental Bids?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Start your first estimate in minutes and see the difference AI can make.
          </p>
          <Link
            to="/login?mode=signup"
            className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50"
          >
            START YOUR FIRST ESTIMATE
          </Link>
        </div>
      </div>

      {/* ChatBot Modal */}
      {showChatBot && (
        <ChatBot onClose={() => setShowChatBot(false)} />
      )}
    </div>
  );
};

export default LandingPage; 