import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfUse: React.FC = () => {
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
              <h1 className="text-xl font-bold text-gray-800">Terms of Use</h1>
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
            <h2 className="text-2xl font-bold text-gray-800">LonQ Terms of Use</h2>
            <p className="text-gray-500 mt-2">Last updated: December 8, 2025</p>
          </div>

          {/* Acceptance */}
          <section>
            <h3 className="text-lg font-semibold text-[#dd6e53] mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">1️⃣</span>
              Acceptance of Terms
            </h3>
            <p className="text-gray-600 leading-relaxed">
              By accessing and using LonQ ("the App"), you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the App. These terms apply to all users of the App.
            </p>
          </section>

          {/* Service Description */}
          <section>
            <h3 className="text-lg font-semibold text-[#dd6e53] mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">2️⃣</span>
              Service Description
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              LonQ is a travel discovery LINE Mini App that allows users to:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">🗺️</span>
                <span className="text-gray-700 text-sm">Explore travel destinations in Chiang Mai</span>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">💾</span>
                <span className="text-gray-700 text-sm">Save favorite places to a personal gallery</span>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">🪙</span>
                <span className="text-gray-700 text-sm">Earn coins through various activities</span>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">🎁</span>
                <span className="text-gray-700 text-sm">Redeem coins for rewards and discounts</span>
              </div>
            </div>
          </section>

          {/* User Account */}
          <section>
            <h3 className="text-lg font-semibold text-[#dd6e53] mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">3️⃣</span>
              User Account
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              To use the App, you must log in through your LINE account. By using the App, you agree to:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="text-[#dd6e53] mt-1">•</span>
                <span>Provide accurate and complete information</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#dd6e53] mt-1">•</span>
                <span>Maintain the security of your LINE account</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#dd6e53] mt-1">•</span>
                <span>Notify us of any unauthorized use of your account</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#dd6e53] mt-1">•</span>
                <span>Be responsible for all activities under your account</span>
              </li>
            </ul>
          </section>

          {/* Coin System */}
          <section>
            <h3 className="text-lg font-semibold text-[#dd6e53] mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">4️⃣</span>
              Coin System & Rewards
            </h3>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-4">
              <p className="text-gray-700 text-sm">
                <strong>Important:</strong> Coins have no monetary value and cannot be exchanged for cash. They are virtual points for use within the App only.
              </p>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="text-[#dd6e53] mt-1">•</span>
                <span>Coins are earned by completing activities within the App</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#dd6e53] mt-1">•</span>
                <span>Coins can be redeemed for discounts and rewards from partner businesses</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#dd6e53] mt-1">•</span>
                <span>We reserve the right to modify coin values and rewards at any time</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#dd6e53] mt-1">•</span>
                <span>Unused coins may expire after 12 months of inactivity</span>
              </li>
            </ul>
          </section>

          {/* User Conduct */}
          <section>
            <h3 className="text-lg font-semibold text-[#dd6e53] mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">5️⃣</span>
              User Conduct
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              You agree NOT to:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 bg-red-50 rounded-lg p-3">
                <span className="text-red-500">🚫</span>
                <span className="text-gray-700 text-sm">Use the App for any illegal purpose</span>
              </div>
              <div className="flex items-center gap-3 bg-red-50 rounded-lg p-3">
                <span className="text-red-500">🚫</span>
                <span className="text-gray-700 text-sm">Attempt to hack, exploit, or manipulate the coin system</span>
              </div>
              <div className="flex items-center gap-3 bg-red-50 rounded-lg p-3">
                <span className="text-red-500">🚫</span>
                <span className="text-gray-700 text-sm">Create multiple accounts to earn extra coins</span>
              </div>
              <div className="flex items-center gap-3 bg-red-50 rounded-lg p-3">
                <span className="text-red-500">🚫</span>
                <span className="text-gray-700 text-sm">Share false or misleading information</span>
              </div>
              <div className="flex items-center gap-3 bg-red-50 rounded-lg p-3">
                <span className="text-red-500">🚫</span>
                <span className="text-gray-700 text-sm">Interfere with the proper functioning of the App</span>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h3 className="text-lg font-semibold text-[#dd6e53] mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">6️⃣</span>
              Intellectual Property
            </h3>
            <p className="text-gray-600 leading-relaxed">
              All content, features, and functionality of the App (including but not limited to text, graphics, logos, icons, images, and software) are owned by LonQ and are protected by copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          {/* Disclaimer */}
          <section>
            <h3 className="text-lg font-semibold text-[#dd6e53] mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">7️⃣</span>
              Disclaimer
            </h3>
            <div className="bg-orange-50 rounded-xl p-4 text-gray-600 text-sm space-y-3">
              <p>
                <strong>THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.</strong>
              </p>
              <p>
                We do not guarantee the accuracy of travel information, business hours, or availability of rewards. Users should verify information directly with the relevant establishments.
              </p>
              <p>
                We are not responsible for any losses or damages arising from the use of the App or redemption of rewards.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h3 className="text-lg font-semibold text-[#dd6e53] mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">8️⃣</span>
              Limitation of Liability
            </h3>
            <p className="text-gray-600 leading-relaxed">
              To the maximum extent permitted by law, LonQ shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h3 className="text-lg font-semibold text-[#dd6e53] mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">9️⃣</span>
              Changes to Terms
            </h3>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting. Your continued use of the App after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h3 className="text-lg font-semibold text-[#dd6e53] mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">🔟</span>
              Contact Information
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              For questions about these Terms of Use, please contact us:
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
              By using LonQ, you agree to these Terms of Use.
            </p>
            <Link 
              to="/privacy" 
              className="text-[#dd6e53] hover:text-[#dd6e53] text-sm font-medium mt-2 inline-block"
            >
              View Privacy Policy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
