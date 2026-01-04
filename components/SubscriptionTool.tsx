
import React, { useState } from 'react';
import { geminiService } from '../geminiService';
import { blobToBase64 } from '../utils/audio';

const SubscriptionTool: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [screenshot, setScreenshot] = useState<{data: string, type: string, name: string} | null>(null);

  const billingEmail = "babies.kids.channel@gmail.com";

  const getStoredUser = () => {
    const stored = localStorage.getItem('vedviarn_user');
    return stored ? JSON.parse(stored) : null;
  };

  const currentUser = getStoredUser();
  const currentPlan = currentUser?.plan || 'free';

  const plans = [
    {
      name: 'Free',
      id: 'free',
      price: '$0',
      description: 'Perfect for exploring the basics of Vedviarn AI.',
      features: [
        '50 Chat messages per day',
        'Standard Image generation (1K)',
        'Basic Analysis tool access',
        'Standard support'
      ],
      buttonText: currentPlan === 'free' ? 'Current Plan' : 'Downgrade',
      buttonClass: currentPlan === 'free' ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
      popular: false
    },
    {
      name: 'Pro',
      id: 'pro',
      price: isAnnual ? '$190' : '$19',
      period: isAnnual ? '/year' : '/month',
      description: 'The ultimate toolset for creators and power users.',
      features: [
        'Unlimited Chat messages',
        'High-quality 2K/4K Images',
        'Full Veo Video generation access',
        'Real-time Voice conversations',
        'Advanced Multimodal Analysis',
        'Priority support'
      ],
      buttonText: currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      buttonClass: currentPlan === 'pro' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25',
      popular: true,
      savings: isAnnual ? 'Save $38/year' : null
    },
    {
      name: 'Enterprise',
      id: 'enterprise',
      price: isAnnual ? '$990' : '$99',
      period: isAnnual ? '/year' : '/month',
      description: 'Tailored solutions for large teams and organizations.',
      features: [
        'Everything in Pro',
        'Dedicated API quotas',
        'Custom model fine-tuning',
        'SLA & dedicated account manager',
        'Advanced security controls'
      ],
      buttonText: currentPlan === 'enterprise' ? 'Current Plan' : 'Get Started',
      buttonClass: currentPlan === 'enterprise' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25',
      popular: false,
      savings: isAnnual ? 'Save $198/year' : null
    }
  ];

  const handleUpgrade = (plan: any) => {
    if (plan.id === currentPlan) return;
    setSelectedPlan(plan);
    setScreenshot(null);
    setShowPaymentModal(true);
  };

  const onScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const b64 = await blobToBase64(file);
      setScreenshot({ data: b64, type: file.type, name: file.name });
    }
  };

  const confirmPayment = async () => {
    if (!screenshot) {
      alert("Verification Failed: Payment screenshot is mandatory for account synthesis.");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate AI checking the payment using the multimodal analyzer
      // In a real scenario, this would check the content of the receipt
      await geminiService.analyze({
        prompt: "Analyze this payment receipt for a subscription. Verify if it contains valid transaction details. Return a very short confirmation that the payment is valid.",
        fileData: screenshot.data,
        mimeType: screenshot.type
      });

      // Simulation of final backend confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const user = getStoredUser();
      if (user && selectedPlan) {
        const updatedUser = { ...user, plan: selectedPlan.id };
        localStorage.setItem('vedviarn_user', JSON.stringify(updatedUser));
        
        window.dispatchEvent(new Event('usageUpdated'));
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'vedviarn_user',
          newValue: JSON.stringify(updatedUser)
        }));

        setIsProcessing(false);
        setShowPaymentModal(false);
        alert(`Authentication Confirmed! The neural network has verified your receipt. Your account is now ${selectedPlan.name.toUpperCase()}.`);
        
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      alert("Neural Check Failed: We couldn't verify the payment details in your screenshot. Please ensure it is clear and shows the transaction ID.");
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(billingEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 relative">
      <div className="text-center mb-10">
        <h2 className="text-5xl font-black text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Upgrade Neural Identity</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg">
          Currently Authorized Plan: <span className={`font-bold uppercase tracking-widest px-4 py-1.5 rounded-xl border ml-2 ${
            currentPlan === 'enterprise' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
            currentPlan === 'pro' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
            'bg-white/5 text-white border-white/10'
          }`}>{currentPlan}</span>
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-bold ${!isAnnual ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-14 h-7 bg-gray-800 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <div className={`w-5 h-5 bg-blue-500 rounded-full transition-transform duration-300 shadow-md ${isAnnual ? 'translate-x-7' : 'translate-x-0'}`}></div>
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${isAnnual ? 'text-white' : 'text-gray-500'}`}>Yearly</span>
            <span className="bg-green-500/20 text-green-400 text-[10px] font-black px-2 py-1 rounded-full border border-green-500/20 uppercase">
              Save 20%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-500 ${
              plan.id === 'enterprise'
                ? 'bg-gradient-to-b from-gray-900 to-purple-950/20 border-purple-500/30 hover:border-purple-500/60' :
              plan.popular 
                ? 'bg-gray-900 border-blue-500/50 shadow-[0_0_50px_rgba(37,99,235,0.1)] scale-105 z-10' 
                : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
            } ${plan.id === currentPlan ? 'ring-2 ring-blue-500/50' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                Most Popular
              </div>
            )}
            
            {plan.id === 'enterprise' && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                Corporate Grade
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-black text-white tracking-tighter">{plan.price}</span>
                {plan.period && <span className="text-gray-500 font-bold">{plan.period}</span>}
              </div>
              {plan.savings && (
                <p className="text-[11px] font-black text-green-400 mb-3 uppercase tracking-wider">{plan.savings}</p>
              )}
              <p className="text-sm text-gray-500 leading-relaxed mt-4 font-medium h-12">
                {plan.description}
              </p>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300 font-medium">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    plan.id === 'enterprise' ? 'bg-purple-500/10' : 'bg-blue-500/10'
                  }`}>
                    <i className={`fa-solid fa-check text-[10px] ${
                      plan.id === 'enterprise' ? 'text-purple-500' : 'text-blue-500'
                    }`}></i>
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleUpgrade(plan)}
              disabled={plan.id === currentPlan}
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${plan.buttonClass}`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="p-12 bg-gray-900/30 border border-white/5 rounded-[3rem] text-center backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/20">
          <i className="fa-solid fa-shield-check text-3xl text-white"></i>
        </div>
        <h3 className="text-3xl font-black text-white mb-4">Manual Activation Protocol</h3>
        <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed mb-10 font-medium">
          Vedviarn AI uses direct manual verification. Send your payment to <span className="text-blue-400 font-bold underline decoration-blue-500/30">{billingEmail}</span>, upload your receipt, and initiate account synthesis.
        </p>
        <div className="flex justify-center items-center gap-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          <i className="fa-brands fa-cc-visa text-4xl"></i>
          <i className="fa-brands fa-cc-mastercard text-4xl"></i>
          <i className="fa-brands fa-cc-stripe text-4xl"></i>
          <i className="fa-brands fa-google-pay text-5xl"></i>
          <i className="fa-brands fa-apple-pay text-5xl"></i>
        </div>
      </div>

      {/* Payment Instruction Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !isProcessing && setShowPaymentModal(false)}></div>
          <div className="bg-gray-900 border border-white/10 w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 p-10 overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full ${
              selectedPlan?.id === 'enterprise' ? 'bg-purple-600/20' : 'bg-blue-600/20'
            }`}></div>
            
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                selectedPlan?.id === 'enterprise' ? 'bg-purple-500/10' : 'bg-blue-500/10'
              }`}>
                <i className={`fa-solid fa-wallet text-2xl ${
                  selectedPlan?.id === 'enterprise' ? 'text-purple-500' : 'text-blue-500'
                }`}></i>
              </div>
              <h2 className="text-3xl font-black text-white mb-2">
                {isProcessing ? 'Analyzing Receipt...' : `${selectedPlan?.name} Activation`}
              </h2>
              <p className="text-gray-400 text-sm font-medium">
                {isProcessing ? 'Stitching billing nodes to blockchain identity...' : `Authorization required for ${selectedPlan?.name} level access.`}
              </p>
            </div>

            {!isProcessing ? (
              <>
                <div className="bg-black/40 border border-white/5 rounded-3xl p-6 mb-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Authorization Destination</p>
                    <div className="flex items-center gap-2 p-4 bg-gray-900 rounded-2xl border border-white/5">
                      <input 
                        type="text" 
                        readOnly 
                        value={billingEmail} 
                        className={`flex-1 bg-transparent text-sm font-bold focus:outline-none ${
                          selectedPlan?.id === 'enterprise' ? 'text-purple-400' : 'text-blue-400'
                        }`}
                      />
                      <button 
                        onClick={copyEmail}
                        className="text-xs bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl transition-all"
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Payment Proof (Screenshot)</p>
                    <input type="file" onChange={onScreenshotChange} id="payment-screenshot" className="hidden" accept="image/*" />
                    <label 
                      htmlFor="payment-screenshot"
                      className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition-all overflow-hidden"
                    >
                      {screenshot ? (
                        <div className="relative w-full h-full">
                          <img src={`data:${screenshot.type};base64,${screenshot.data}`} className="w-full h-full object-cover" alt="Receipt" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-black text-white uppercase">Change File</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <i className="fa-solid fa-cloud-arrow-up text-xl text-gray-600 mb-2"></i>
                          <p className="text-[10px] text-gray-500 font-black uppercase">Upload Confirmation</p>
                        </>
                      )}
                    </label>
                  </div>

                  <div className="flex justify-between items-center py-2 border-t border-white/5">
                    <span className="text-gray-400 text-xs font-medium">Total Amount</span>
                    <span className="text-xl font-black text-white">{selectedPlan?.price}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={confirmPayment}
                    disabled={!screenshot}
                    className={`w-full font-black py-4 rounded-2xl transition-all shadow-xl uppercase tracking-widest text-xs flex items-center justify-center gap-3 disabled:opacity-30 ${
                      selectedPlan?.id === 'enterprise' 
                      ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-purple-500/20' 
                      : 'bg-white text-black hover:bg-gray-200 shadow-white/5'
                    }`}
                  >
                    <i className="fa-solid fa-fingerprint"></i>
                    Verify & Activate Identity
                  </button>
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="w-full text-xs text-gray-500 hover:text-gray-300 font-bold uppercase tracking-widest transition-colors"
                  >
                    Return to Selection
                  </button>
                </div>
              </>
            ) : (
              <div className="py-12 flex flex-col items-center">
                <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-6 ${
                  selectedPlan?.id === 'enterprise' ? 'border-purple-500' : 'border-blue-500'
                }`}></div>
                <div className={`text-[10px] font-black uppercase tracking-[0.4em] animate-pulse ${
                  selectedPlan?.id === 'enterprise' ? 'text-purple-400' : 'text-blue-400'
                }`}>
                  Scanning Transaction Proof
                </div>
              </div>
            )}

            <p className="mt-8 text-center text-[9px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">
              Account elevation is strictly final. Authorization receipts are logged and analyzed by Vedviarn AI.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionTool;
