import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <img
                src={process.env.PUBLIC_URL + '/logo.png'}
                alt="BidIQ Logo"
                className="h-8 w-auto"
                onError={(e) => {
                  console.error('Logo failed to load');
                  e.target.style.display = 'none';
                }}
              />
              <span className="ml-2 text-2xl font-bold text-[#4B7BF5]">BidIQ</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-[#4B7BF5] text-sm font-medium rounded-md text-[#4B7BF5] hover:bg-[#4B7BF5] hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#4B7BF5] hover:bg-[#3A6AE4] transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-[#4B7BF5] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-light mb-4">
                Bids in Minutes
              </h1>
              <p className="text-xl mb-8">
                Save time, win more bids, and get competitive pricing for every project.
              </p>
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="inline-block px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  START ESTIMATE
                </Link>
                <Link
                  to="/login"
                  className="inline-block px-6 py-3 border border-white text-white rounded-md hover:bg-white/10 transition-colors"
                >
                  EXPLORE FEATURES
                </Link>
              </div>
            </div>
            <div className="bg-[#6B93F7] p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">For Rental Partners</h3>
              <p className="mb-4">Get real-time leads from active projects and connect with contractors in your area.</p>
              <Link
                to="/login"
                className="inline-block px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                JOIN AS EQUIPMENT PARTNER
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-medium text-center text-gray-900 mb-12">
            Why Choose Build IQ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-[#4B7BF5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">AI-Powered Estimates</h3>
              <p className="text-gray-600">Get accurate equipment recommendations based on project type and requirements.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Save Time</h3>
              <p className="text-gray-600">Create professional bids in minutes instead of hours.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Competitive Pricing</h3>
              <p className="text-gray-600">Access real-time rental rates from local equipment providers.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Win More Bids</h3>
              <p className="text-gray-600">Stand out with professional, detailed equipment quotes.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted By Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-medium text-center text-gray-900 mb-4">
            Trusted by Construction Professionals
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Join over 5000 contractors who use Build IQ to create professional equipment rental bids.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-gray-900 mb-4">For General Contractors</h3>
              <p className="text-gray-600">
                Create accurate equipment rental estimates for your construction projects in minutes. Get competitive pricing from local rental companies and win more bids.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-gray-900 mb-4">For Subcontractors</h3>
              <p className="text-gray-600">
                Streamline your equipment rental process with AI-powered recommendations and professional bid templates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#4B7BF5] text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-medium mb-4">
            Ready to Create Better Equipment Rental Bids?
          </h2>
          <p className="text-xl mb-8">
            Start your first estimate in minutes and see the difference AI can make.
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-lg font-medium"
          >
            START YOUR FIRST ESTIMATE
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 