import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/"
              className="flex items-center space-x-2 text-[#dd6e53] hover:text-[#dd6e53] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </Link>
            
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">Privacy Policy</h1>
            </div>
            
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-10 space-y-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#dd6e53] to-[#dd6e53] rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">LonQ Privacy Policy</h2>
            <p className="text-gray-500 mt-2">Last updated: December 8, 2025</p>
          </div>

          {/* Introduction */}
          <section>
            <h3 className="text-lg font-semibold text-[#dd6e53] mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">📋</span>
              Introduction
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Welcome to LonQ ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our LINE Mini App service.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h3 className="text-lg font-semibold text-[#dd6e53] mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">📊</span>
              Information We Collect
            </h3>
            <div className="space-y-4 text-gray-600">
              <div className="bg-orange-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-800 mb-2">Personal Information</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>LINE User ID</li>
                  <li>Display Name</li>
                  <li>Profile Picture URL</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-800 mb-2">Usage Information</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Travel destinations you like or save</li>
                  <li>Coin balance and rewards redemption history</li>
                  <li>App interaction patterns</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-800 mb-2">Device Information</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Device type and operating system</li>
                  <li>Browser type and version</li>
                  <li>General location data (city/region level)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h3 className="text-lg font-semibold text-[#dd6e53] mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">⚙️</span>
              How We Use Your Information
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="text-[#dd6e53] mt-1">•</span>
                <span>To provide and maintain our travel recommendation service</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#dd6e53] mt-1">•</span>
                <span>To personalize your experience based on your preferences</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#dd6e53] mt-1">•</span>
                <span>To manage your coin rewards and redemptions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#dd6e53] mt-1">•</span>
                <span>To communicate with you about updates and promotions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#dd6e53] mt-1">•</span>
                <span>To improve and optimize our services</span>
              </li>
            </ul>
          </section>

          {/* Data Storage and Security */}
          <section>
            <h3 className="text-lg font-semibold text-[#dd6e53] mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">🔒</span>
              Data Storage and Security
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your personal information. Your data is stored securely using encryption and access controls. We use local storage on your device for preferences and some data may be stored on secure cloud servers.
            </p>
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl p-4">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> While we strive to protect your data, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* Third-Party Services */}
          <section>
            <h3 className="text-lg font-semibold text-[#dd6e53] mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">🔗</span>
              Third-Party Services
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Our app integrates with the following third-party services:
            </p>
            <ul className="mt-3 space-y-2 text-gray-600">
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs">✓</span>
                <span><strong>LINE Platform:</strong> For authentication and user profile</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs">✓</span>
                <span><strong>Google Maps:</strong> For location and mapping services</span>
              </li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h3 className="text-lg font-semibold text-[#dd6e53] mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">✨</span>
              Your Rights
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              You have the right to:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white border border-orange-200 rounded-xl p-3 text-center">
                <span className="text-2xl">📥</span>
                <p className="text-sm text-gray-600 mt-1">Access your data</p>
              </div>
              <div className="bg-white border border-orange-200 rounded-xl p-3 text-center">
                <span className="text-2xl">✏️</span>
                <p className="text-sm text-gray-600 mt-1">Correct your data</p>
              </div>
              <div className="bg-white border border-orange-200 rounded-xl p-3 text-center">
                <span className="text-2xl">🗑️</span>
                <p className="text-sm text-gray-600 mt-1">Delete your data</p>
              </div>
              <div className="bg-white border border-orange-200 rounded-xl p-3 text-center">
                <span className="text-2xl">🚫</span>
                <p className="text-sm text-gray-600 mt-1">Opt-out of marketing</p>
              </div>
            </div>
          </section>

          {/* Contact Us */}
          <section>
            <h3 className="text-lg font-semibold text-[#dd6e53] mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">📧</span>
              Contact Us
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="bg-gradient-to-r from-[#dd6e53] to-[#dd6e53] rounded-xl p-4 text-white">
              <p className="font-medium">LonQ Support Team</p>
              <p className="text-orange-100 text-sm mt-1">Email: support@lonq.app</p>
              <p className="text-orange-100 text-sm">LINE: @lonq-support</p>
            </div>
          </section>

          {/* Footer */}
          <div className="pt-6 border-t border-orange-100 text-center">
            <p className="text-gray-500 text-sm">
              By using LonQ, you agree to this Privacy Policy.
            </p>
            <Link 
              to="/terms" 
              className="text-[#dd6e53] hover:text-[#dd6e53] text-sm font-medium mt-2 inline-block"
            >
              View Terms of Use →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
