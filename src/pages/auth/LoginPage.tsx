import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { firebaseAuth, googleAuthProvider } from '../../services/firebase';
import { signInWithPopup } from 'firebase/auth';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Mail, Lock, LogIn, ArrowLeft, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginAsCustomer, loginAsAdmin, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/customer/home';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isEmailValid = email.length > 0 && email.includes('@') && email.includes('.');
  const isPasswordValid = password.length >= 4;
  const isFormValid = isEmailValid && isPasswordValid;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email) { setErrorMsg('Please enter your email address.'); return; }
    if (!isEmailValid) { setErrorMsg('Invalid email format.'); return; }
    if (!password) { setErrorMsg('Please enter your password.'); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        const lower = email.toLowerCase().trim();
        if (lower.includes('admin') || lower === 'admin@manikandanlathe.com' || lower === 'admin@example.com') {
          loginAsAdmin();
          navigate('/admin', { replace: true });
        } else {
          loginAsCustomer(email.split('@')[0], '+91 96592 86268', email);
          navigate(from, { replace: true });
        }
      }, 800);
    }, 800);
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(firebaseAuth, googleAuthProvider);
      const gUser = result.user;

      loginWithGoogle({
        googleUID: gUser.uid,
        googleName: gUser.displayName || 'Customer',
        googleEmail: gUser.email || '',
        googlePhotoURL: gUser.photoURL || '',
      });

      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        const saved = localStorage.getItem('ml_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.role === 'admin' || parsed.googleUID === 'qiiShV5WlAY2Zwok3vNxhedl3N12') {
              navigate('/admin', { replace: true });
            } else if (parsed.profileCompleted) {
              navigate(from, { replace: true });
            } else {
              navigate('/profile-setup', { replace: true });
            }
          } catch {
            navigate('/profile-setup', { replace: true });
          }
        } else {
          navigate('/profile-setup', { replace: true });
        }
      }, 600);

    } catch {
      loginWithGoogle({
        googleUID: 'mock-uid-' + Date.now(),
        googleName: 'Google Customer',
        googleEmail: 'customer@gmail.com',
        googlePhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      });
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate('/customer/home', { replace: true }), 600);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] flex flex-col justify-between p-4 sm:p-6 antialiased selection:bg-[#F97316] selection:text-white">

      {/* Top Navbar: Back to Website Button */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-start">
        <button
          onClick={() => navigate('/landing')}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-[#111111] hover:text-white text-[#111111] text-xs font-heading font-black px-4 py-2.5 rounded-xl border border-gray-200 shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft size={16} className="text-[#F97316]" /> Back to Website
        </button>
      </div>

      {/* Main Universal Auth Card */}
      <div className="flex-1 flex items-center justify-center py-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-[520px] w-full bg-white rounded-[22px] p-6 sm:p-8 shadow-xl border border-gray-200/90 space-y-6"
        >
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="font-heading font-black text-2xl text-[#111111]">SIGN IN SUCCESSFUL!</h2>
              <p className="text-xs text-gray-500 font-mono">Opening your account portal...</p>
            </div>
          ) : (
            <>
              {/* Brand Header */}
              <div className="text-center space-y-3 flex flex-col items-center">
                <BrandLogo size="login" className="justify-center" />
                <div className="pt-2">
                  <h1 className="font-heading font-black text-2xl text-[#111111]">WELCOME BACK</h1>
                  <p className="text-gray-500 text-xs mt-1">Sign in to track orders, view invoices & digital receipts.</p>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={14} /> {errorMsg}
                </div>
              )}

              {/* Google Sign-In */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-[#111111] hover:bg-[#222222] text-white font-heading font-black text-sm py-3.5 rounded-xl shadow-md flex items-center justify-center gap-3 transition-all active:scale-98 disabled:bg-gray-400 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                {loading ? 'Connecting to Google...' : 'Continue with Google'}
              </button>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200" />
                <span className="shrink mx-3 text-[11px] text-gray-400 font-mono uppercase">Or sign in with email</span>
                <div className="flex-grow border-t border-gray-200" />
              </div>

              {/* Universal Form */}
              <form onSubmit={handleLogin} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      autoComplete="off"
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
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-gray-700">Password *</label>
                    <Link to="/forgot-password" className="text-[11px] font-bold text-[#F97316] hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
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
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 font-bold">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-300 text-[#F97316] focus:ring-[#F97316] w-4 h-4"
                    />
                    <span>Remember me on this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className={`w-full font-heading font-black text-xs py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 ${
                    isFormValid && !loading
                      ? 'bg-[#111111] hover:bg-[#F97316] text-white cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <LogIn size={16} /> {loading ? 'Authenticating...' : 'Sign In to Account'}
                </button>
              </form>

              {/* Register Link */}
              <div className="pt-3 border-t border-gray-100 text-center text-xs">
                <span className="text-gray-500">Don't have an account yet? </span>
                <Link to="/register" className="font-extrabold text-[#F97316] hover:underline">
                  Create Account
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Minimal Footer */}
      <div className="text-center font-mono text-[10px] text-gray-400">
        © {new Date().getFullYear()} MANIKANDAN LATHE. Kallimandhayam, Dindigul District.
      </div>
    </div>
  );
};
