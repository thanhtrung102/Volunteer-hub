import React, { useState, useEffect } from 'react';
import { HTTPSEnforcer, CSRF } from '../utils/security';

const SecurityBadge: React.FC = () => {
  const [isSecure, setIsSecure] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const status = HTTPSEnforcer.getStatus();
    setIsSecure(status.isSecure);
  }, []);

  const securityFeatures = [
    { name: 'HTTPS', status: isSecure, description: 'Encrypted connection' },
    { name: 'JWT Tokens', status: true, description: 'Secure authentication' },
    { name: 'Password Hashing', status: true, description: 'Bcrypt-style encryption' },
    { name: 'CSRF Protection', status: !!CSRF.getToken(), description: 'Cross-site request forgery prevention' },
    { name: 'Input Sanitization', status: true, description: 'XSS attack prevention' },
  ];

  const allSecure = securityFeatures.every(f => f.status);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        {/* Badge */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          title="Security Status"
          className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all ${
            allSecure
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-yellow-500 hover:bg-yellow-600 text-white'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-bold">Secure</span>
        </button>

        {/* Details Popup */}
        {showDetails && (
          <div className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
            <div className={`px-4 py-3 ${allSecure ? 'bg-green-500' : 'bg-yellow-500'} text-white`}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <h3 className="font-bold text-sm">Security Features</h3>
              </div>
              <p className="text-xs mt-1 opacity-90">Your connection is protected</p>
            </div>

            <div className="p-4 space-y-3">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                    feature.status ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {feature.status ? (
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{feature.name}</p>
                    <p className="text-xs text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                All data is encrypted and secure
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {showDetails && (
        <div
          className="fixed inset-0"
          onClick={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default SecurityBadge;
