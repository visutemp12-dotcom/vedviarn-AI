
import React, { useState } from 'react';
import { geminiService } from '../geminiService';

interface AuthProps {
  onSignUp: (name: string, email: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onSignUp }) => {
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [verificationInput, setVerificationInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [error, setError] = useState('');

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !isAgreed) {
      setError('Please fill all fields and agree to the terms.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Generate a 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);

      // We simulate "sending" by having the AI prepare the handshake
      // In a real app, this would trigger a backend email service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`[Vedviarn AI Security] Verification code for ${email}: ${code}`);
      setStep('verify');
    } catch (err) {
      setError('Failed to initialize security handshake. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationInput === generatedCode) {
      // Pass 'free' as the default plan during registration
      const userData = { name, email, plan: 'free' };
      localStorage.setItem('vedviarn_user', JSON.stringify(userData));
      onSignUp(name, email);
    } else {
      setError('Invalid verification key. Please check your email.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030712] overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]"></div>

      <div className="w-full max-w-md px-6 relative z-10">
        <div className="glass border border-white/10 p-8 rounded-[2.5rem] shadow-2xl transition-all duration-500">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30 transform transition-transform hover:scale-110">
              <i className="fa-solid fa-v text-white text-4xl"></i>
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-purple-400">
              Vedviarn AI
            </h1>
            <p className="text-gray-400 mt-2 text-sm tracking-wide">
              {step === 'details' ? 'Initialize your neural identity' : 'Security Handshake Protocol'}
            </p>
          </div>

          {step === 'details' ? (
            <form onSubmit={handleRequestCode} className="space-y-6">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Identity Signature</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-950/50 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-gray-700"
                  placeholder="Full Name"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Communication Channel</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-950/50 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-gray-700"
                  placeholder="Gmail Address"
                />
              </div>

              <div className="flex items-start gap-3 py-2">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    id="agree"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <label htmlFor="agree" className="text-[11px] text-gray-500 leading-relaxed cursor-pointer select-none">
                  I accept that my account is <span className="text-red-400 font-bold uppercase tracking-tighter">permanent</span>. 
                  Vedviarn AI enforces an immutable identity protocol; accounts cannot be deleted.
                </label>
              </div>

              {error && <p className="text-red-400 text-xs text-center animate-shake font-medium">{error}</p>}

              <button 
                type="submit"
                disabled={isLoading || !isAgreed}
                className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-blue-500/20 disabled:opacity-30 disabled:grayscale mt-2 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <span>Request Verification Key</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6 animate-fade-in">
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 text-center">
                <p className="text-xs text-blue-400 mb-1">A verification key has been sent to</p>
                <p className="text-sm font-bold text-white truncate">{email}</p>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] text-center">Enter Handshake Password</label>
                <input 
                  type="text" 
                  maxLength={6}
                  required
                  value={verificationInput}
                  onChange={(e) => setVerificationInput(e.target.value)}
                  className="w-full bg-gray-950/50 border border-white/10 rounded-2xl px-5 py-6 text-center text-3xl font-black tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-gray-800"
                  placeholder="000000"
                />
              </div>

              {error && <p className="text-red-400 text-xs text-center font-medium">{error}</p>}

              <button 
                type="submit"
                className="w-full bg-white text-black hover:bg-gray-200 font-black py-5 rounded-2xl transition-all shadow-xl shadow-white/10 uppercase tracking-widest text-xs"
              >
                Complete Identity Sync
              </button>

              <button 
                type="button"
                onClick={() => setStep('details')}
                className="w-full text-[10px] text-gray-500 hover:text-gray-300 transition-colors uppercase font-bold tracking-widest"
              >
                Cancel & Re-enter Details
              </button>
            </form>
          )}

          <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-gray-600 tracking-widest uppercase">
            <span>Identity V.02</span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              SECURE
            </span>
          </div>
        </div>
      </div>
      
      {/* Toast message for the demo simulation */}
      {step === 'verify' && (
        <div className="fixed bottom-10 right-10 bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-bounce z-[200] border border-blue-400/30">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-envelope-circle-check text-xl"></i>
            <div>
              <p className="text-xs font-bold uppercase tracking-tighter">Debug Mode: Email Captured</p>
              <p className="text-lg font-black">{generatedCode}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
