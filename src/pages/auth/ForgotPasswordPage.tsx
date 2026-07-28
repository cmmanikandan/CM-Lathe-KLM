import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEmailValid = email.length > 0 && email.includes('@') && email.includes('.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] flex flex-col justify-between p-4 sm:p-6 antialiased selection:bg-[#F97316] selection:text-white relative">
      
      {/* Top Left ONLY: Back to Login */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-start">
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 text-[#111111] text-xs font-heading font-black px-4 py-2 rounded-xl border border-gray-200 shadow-xs transition-all active:scale-95"
        >
          <ArrowLeft size={16} className="text-[#F97316]" /> Back to Login
        </button>
      </div>

      {/* Centered Auth Card */}
      <div className="flex-1 flex items-center justify-center py-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-[520px] w-full bg-white rounded-[22px] p-6 sm:p-8 shadow-xl border border-gray-200/90 space-y-6"
        >
          {sent ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="font-heading font-black text-2xl text-[#111111]">RESET LINK SENT!</h2>
              <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
                We have dispatched password reset instructions to <strong className="text-[#F97316]">{email}</strong>. Please check your inbox.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-[#111111] hover:bg-[#F97316] text-white font-heading font-black text-xs py-3.5 rounded-xl shadow-md transition-all active:scale-95"
                >
                  Return to Account Sign In
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Single Logo & Brand Name Inside Card */}
              <div className="text-center space-y-3 flex flex-col items-center">
                <BrandLogo size="login" className="justify-center" />
                
                <div className="pt-2">
                  <h1 className="font-heading font-black text-2xl text-[#111111]">FORGOT PASSWORD</h1>
                  <p className="text-gray-500 text-xs mt-1">Enter your registered email address to receive password reset link.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Registered Email Address *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="senthil@example.com"
                      className="w-full bg-gray-100 p-3 pl-10 rounded-xl border border-gray-300 focus:border-[#F97316] outline-none font-bold text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isEmailValid}
                  className={`w-full font-heading font-black text-xs py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 ${
                    isEmailValid && !loading
                      ? 'bg-[#F97316] hover:bg-[#EA580C] text-white cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Sending Reset Link...' : 'Send Password Reset Link'}
                </button>
              </form>

              <div className="pt-3 border-t border-gray-100 text-center text-xs">
                <Link to="/login" className="font-extrabold text-gray-600 hover:text-black">
                  ← Back to Login
                </Link>
              </div>
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
