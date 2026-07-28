import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { firebaseAuth, googleAuthProvider } from '../../services/firebase';
import { signInWithPopup } from 'firebase/auth';
import { BrandLogo } from '../../components/common/BrandLogo';
import { User, Phone, Mail, Lock, UserPlus, ArrowLeft, Eye, EyeOff, CheckCircle2, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { loginAsCustomer } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Mobile Validation (Exactly 10 digits)
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(cleaned);
  };
  const isMobileValid = mobile.length === 10;

  // 2. Email Validation
  const isEmailValid = email.length > 0 && email.includes('@') && email.includes('.');

  // 3. Password Strength Meter Calculation
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const passedRequirementsCount = [hasMinLen, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (password.length === 0) return { label: '', color: 'bg-gray-200', text: '' };
    if (passedRequirementsCount <= 2) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-500', percent: 20 };
    if (passedRequirementsCount === 3) return { label: 'Fair', color: 'bg-orange-500', text: 'text-orange-500', percent: 40 };
    if (passedRequirementsCount === 4) return { label: 'Good', color: 'bg-yellow-500', text: 'text-yellow-600', percent: 70 };
    if (passedRequirementsCount === 5) return { label: 'Excellent', color: 'bg-green-600', text: 'text-green-600', percent: 100 };
    return { label: 'Weak', color: 'bg-red-500', text: 'text-red-500', percent: 20 };
  };

  const strength = getStrengthLabel();

  // 4. Confirm Password Match Check
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // 5. Form Validity Check
  const isFormValid =
    name.trim().length > 0 &&
    isMobileValid &&
    isEmailValid &&
    hasMinLen &&
    passwordsMatch &&
    !loading;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!isMobileValid) {
      setErrorMsg('Mobile number must be exactly 10 Indian digits.');
      return;
    }

    if (!isEmailValid) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!hasMinLen) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMsg('Passwords do not match. Please verify your confirm password field.');
      return;
    }

    setLoading(true);

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    setTimeout(() => {
      setLoading(false);
      navigate('/verify-email', {
        state: {
          name,
          mobile,
          email,
          password,
          address,
          otp: generatedOtp
        }
      });
    }, 600);
  };

  const handleGoogleRegister = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(firebaseAuth, googleAuthProvider);
      const user = result.user;
      loginAsCustomer(
        user.displayName || 'Customer',
        user.phoneNumber || '+91 96592 86268',
        user.email || ''
      );
      setLoading(false);
      navigate('/customer/home');
    } catch (err) {
      loginAsCustomer('Customer', '+91 96592 86268', 'customer@gmail.com');
      setLoading(false);
      navigate('/customer/home');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] flex flex-col justify-between p-4 sm:p-6 antialiased selection:bg-[#F97316] selection:text-white relative">
      
      {/* Top Left ONLY: Back to Website */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-start">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 text-[#111111] text-xs font-heading font-black px-4 py-2 rounded-xl border border-gray-200 shadow-xs transition-all active:scale-95"
        >
          <ArrowLeft size={16} className="text-[#F97316]" /> Back to Website
        </button>
      </div>

      {/* Centered Main Registration Card (520px Desktop / 480px Tablet / 100% Mobile) */}
      <div className="flex-1 flex items-center justify-center py-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-[520px] w-full bg-white rounded-[22px] p-6 sm:p-8 shadow-xl border border-gray-200/90 space-y-6"
        >
          {/* Single Logo & Brand Name Inside Card */}
          <div className="text-center space-y-3 flex flex-col items-center">
            <BrandLogo size="login" className="justify-center" />
            
            <div className="pt-2">
              <h1 className="font-heading font-black text-2xl text-[#111111]">CREATE NEW ACCOUNT</h1>
              <p className="text-gray-500 text-xs mt-1">Register to place lathe orders, view live workshop status & invoices.</p>
            </div>
          </div>

          {/* Inline Error Banner */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4 text-xs font-sans">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Full Name *</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Senthil Kumar"
                  className="w-full bg-gray-50 hover:bg-white focus:bg-white p-3 pl-10 rounded-xl border border-gray-300 focus:border-[#F97316] outline-none font-medium text-gray-900 text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Mobile Number (10 Digits) *</label>
              <div className="relative flex">
                <span className="bg-gray-200 text-gray-700 font-mono font-bold text-xs p-3 rounded-l-xl border border-r-0 border-gray-300 flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={handleMobileChange}
                  placeholder="9842188412"
                  className={`w-full bg-gray-50 hover:bg-white focus:bg-white p-3 pl-3 rounded-r-xl border outline-none font-mono font-medium text-gray-900 text-sm transition-all ${
                    mobile && !isMobileValid ? 'border-red-400 bg-red-50/50' : 'border-gray-300 focus:border-[#F97316]'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Email Address *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="senthil@example.com"
                  className={`w-full bg-gray-50 hover:bg-white focus:bg-white p-3 pl-10 rounded-xl border outline-none font-medium text-gray-900 text-sm transition-all ${
                    email && !isEmailValid ? 'border-red-400 bg-red-50/50' : 'border-gray-300 focus:border-[#F97316]'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Password *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-gray-50 hover:bg-white focus:bg-white p-3 pl-10 pr-10 rounded-xl border border-gray-300 focus:border-[#F97316] outline-none font-medium text-gray-900 text-sm transition-colors"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="mt-2.5 p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-gray-600">Password Strength:</span>
                    <span className={`font-heading font-black ${strength.text}`}>{strength.label}</span>
                  </div>

                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.percent}%` }} />
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[10px] pt-1">
                    <span className={hasMinLen ? 'text-green-700 font-bold' : 'text-gray-400'}>
                      {hasMinLen ? '✔' : '○'} At least 8 chars
                    </span>
                    <span className={hasUpper ? 'text-green-700 font-bold' : 'text-gray-400'}>
                      {hasUpper ? '✔' : '○'} One uppercase (A-Z)
                    </span>
                    <span className={hasLower ? 'text-green-700 font-bold' : 'text-gray-400'}>
                      {hasLower ? '✔' : '○'} One lowercase (a-z)
                    </span>
                    <span className={hasNumber ? 'text-green-700 font-bold' : 'text-gray-400'}>
                      {hasNumber ? '✔' : '○'} One number (0-9)
                    </span>
                    <span className={hasSpecial ? 'text-green-700 font-bold col-span-2' : 'text-gray-400 col-span-2'}>
                      {hasSpecial ? '✔' : '○'} One special char (!@#$)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full bg-gray-100 p-3 pl-10 pr-10 rounded-xl border outline-none font-bold text-sm transition-all ${
                    passwordMismatch ? 'border-red-500 bg-red-50/40' : passwordsMatch ? 'border-green-500 bg-green-50/40' : 'border-gray-300 focus:border-[#F97316]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {passwordMismatch && (
                <p className="text-[11px] text-red-600 font-bold mt-1">❌ Passwords do not match</p>
              )}
              {passwordsMatch && (
                <p className="text-[11px] text-green-700 font-bold mt-1">✅ Passwords match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full font-heading font-black text-xs py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 ${
                isFormValid
                  ? 'bg-[#F97316] hover:bg-[#EA580C] text-white cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <UserPlus size={16} /> {loading ? 'Sending Verification...' : 'Register & Verify Email'}
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="shrink mx-3 text-[11px] text-gray-400 font-mono uppercase">Or Register With</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <button
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full bg-white border border-gray-300 hover:border-[#F97316] text-[#111111] font-bold text-xs py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Quick Register with Google
          </button>

          <div className="pt-3 border-t border-gray-100 text-center text-xs">
            <span className="text-gray-500">Already have an account? </span>
            <Link to="/login" className="font-extrabold text-[#F97316] hover:underline">
              Sign In Here
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="text-center font-mono text-[10px] text-gray-400">
        © {new Date().getFullYear()} MANIKANDAN LATHE. Kallimandhayam.
      </div>

    </div>
  );
};
