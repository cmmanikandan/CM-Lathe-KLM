import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Mail, RefreshCw, ArrowLeft, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const { loginAsCustomer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Temporary registration state passed from Register page
  const tempState = (location.state as any) || {};
  const {
    name = 'Customer',
    mobile = '+91 96592 86268',
    email = 'customer@example.com',
    password = '',
    address = ''
  } = tempState;

  // Initial OTP generated during registration or resend
  const [currentOtp, setCurrentOtp] = useState<string>(
    tempState.otp || Math.floor(100000 + Math.random() * 900000).toString()
  );

  // 6 separate input values
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timers & Security Limits
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes (600 seconds)
  const [resendCooldown, setResendCooldown] = useState<number>(30); // 30 seconds cooldown
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 10-Minute Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0 || isSuccess) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, isSuccess]);

  // 30-Second Resend Cooldown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Auto Focus First Box on Mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle Typing in 6 OTP Boxes
  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned && value !== '') return;

    const newOtp = [...otpDigits];
    newOtp[index] = cleaned.slice(-1);
    setOtpDigits(newOtp);
    setErrorMsg('');

    // Auto Advance to Next Input Box
    if (cleaned && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace Support
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Paste Full 6-Digit OTP at once
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = ['', '', '', '', '', ''];
      pastedData.split('').forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtpDigits(newOtp);
      setErrorMsg('');
      if (inputRefs.current[Math.min(pastedData.length, 5)]) {
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
      }
    }
  };

  // Resend OTP Handler
  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    const newGeneratedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setCurrentOtp(newGeneratedOtp);
    setOtpDigits(['', '', '', '', '', '']);
    setTimeLeft(600); // Reset to 10 min
    setResendCooldown(30); // Reset 30s cooldown
    setFailedAttempts(0);
    setErrorMsg('');
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  };

  // Verify OTP & Create Account
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const enteredOtp = otpDigits.join('');

    if (enteredOtp.length < 6) {
      setErrorMsg('Please enter all 6 digits of the OTP.');
      return;
    }

    if (timeLeft <= 0) {
      setErrorMsg('OTP has expired (10 min limit). Please click Resend OTP.');
      return;
    }

    if (enteredOtp !== currentOtp && enteredOtp !== '123456') {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      if (nextAttempts >= 5) {
        // Generate new OTP after 5 attempts
        const newGeneratedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setCurrentOtp(newGeneratedOtp);
        setOtpDigits(['', '', '', '', '', '']);
        setFailedAttempts(0);
        setErrorMsg('Too many failed attempts. A new OTP has been dispatched to your email.');
      } else {
        setErrorMsg(`❌ Invalid OTP code. Attempts left: ${5 - nextAttempts}`);
      }
      return;
    }

    // OTP IS VALID! CREATE ACCOUNT NOW!
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);
      loginAsCustomer(name, mobile, email, address);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] flex flex-col justify-between p-4 sm:p-6 antialiased selection:bg-[#F97316] selection:text-white relative">
      
      {/* Top Left ONLY: Back to Website */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-start">
        <button
          onClick={() => navigate('/register')}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 text-[#111111] text-xs font-heading font-black px-4 py-2 rounded-xl border border-gray-200 shadow-xs transition-all active:scale-95"
        >
          <ArrowLeft size={16} className="text-[#F97316]" /> Back to Register
        </button>
      </div>

      {/* Centered Auth Card */}
      <div className="flex-1 flex items-center justify-center py-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-[520px] w-full bg-white rounded-[22px] p-6 sm:p-8 shadow-xl border border-gray-200/90 text-center space-y-6"
        >
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="font-heading font-black text-2xl text-[#111111]">EMAIL VERIFIED SUCCESSFULLY!</h2>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                Your customer account for <strong className="text-[#F97316]">{name}</strong> ({email}) has been created successfully.
              </p>
              
              <div className="pt-4 space-y-2">
                <button
                  onClick={() => navigate('/customer/home')}
                  className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs py-3.5 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  Go to Customer App Dashboard →
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-[#111111] hover:bg-black text-white font-heading font-black text-xs py-3 rounded-xl shadow-md transition-all"
                >
                  Sign In to Account
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Single Branding Logo Inside Card */}
              <div className="text-center space-y-3 flex flex-col items-center">
                <BrandLogo size="login" className="justify-center" />
                
                <div className="pt-2">
                  <span className="text-[#F97316] font-mono text-xs font-bold uppercase tracking-widest block">
                    Step 2 of 2: OTP Verification
                  </span>
                  <h1 className="font-heading font-black text-2xl text-[#111111]">
                    ENTER 6-DIGIT VERIFICATION CODE
                  </h1>
                </div>
              </div>

              <p className="text-gray-600 text-xs leading-relaxed max-w-sm mx-auto">
                We have dispatched a 6-digit OTP code to:
              </p>
              
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono font-bold text-sm text-[#F97316] bg-orange-50 py-1.5 px-3 rounded-lg border border-orange-200">
                  {email}
                </span>
                <button
                  onClick={() => navigate('/register')}
                  className="text-[11px] font-bold text-gray-500 hover:text-black underline"
                >
                  Change
                </button>
              </div>

              {/* Demo Hint Box */}
              <div className="bg-orange-50/80 p-2.5 rounded-xl text-[11px] text-[#F97316] font-mono font-bold border border-orange-200">
                🔑 Demo Verification Code: <u className="tracking-widest">{currentOtp}</u> (or 123456)
              </div>

              {/* Inline Error Message */}
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* 6 SEPARATE OTP INPUT BOXES */}
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex justify-center items-center gap-2 sm:gap-3" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`w-11 h-14 sm:w-12 sm:h-14 text-center font-mono font-black text-xl bg-gray-100 rounded-xl border outline-none transition-all shadow-xs ${
                        digit
                          ? 'border-[#F97316] bg-orange-50/40 text-[#F97316]'
                          : 'border-gray-300 focus:border-[#F97316] focus:bg-white'
                      }`}
                    />
                  ))}
                </div>

                {/* 10-Minute Countdown & Resend Control */}
                <div className="flex items-center justify-between text-xs font-mono text-gray-500 pt-1">
                  <span>
                    OTP Expires in: <strong className="text-[#111111]">{formatTime(timeLeft)}</strong>
                  </span>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0}
                    className={`font-bold flex items-center gap-1 ${
                      resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#F97316] hover:underline cursor-pointer'
                    }`}
                  >
                    <RefreshCw size={12} className={resendCooldown > 0 ? '' : 'animate-spin'} />
                    {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}
                  </button>
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={otpDigits.join('').length < 6 || loading}
                  className={`w-full font-heading font-black text-xs py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 ${
                    otpDigits.join('').length === 6 && !loading
                      ? 'bg-[#F97316] hover:bg-[#EA580C] text-white cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck size={16} /> {loading ? 'Creating Customer Account...' : 'Verify OTP & Create Account'}
                </button>
              </form>

            </>
          )}
        </motion.div>
      </div>

      <div className="text-center font-mono text-[10px] text-gray-400">
        © {new Date().getFullYear()} MANIKANDAN LATHE. Kallimandhayam.
      </div>

    </div>
  );
};
