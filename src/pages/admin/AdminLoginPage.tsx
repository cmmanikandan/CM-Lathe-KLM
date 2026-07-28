import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { ShieldCheck, Lock, Mail, ArrowLeft, Key } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { loginAsAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@manikandanlathe.com');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!pin) {
      setErrorMsg('Please enter your Admin Portal PIN / Password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      loginAsAdmin();
      setLoading(false);
      navigate('/admin');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col justify-between p-4 sm:p-6 antialiased relative">
      
      {/* Top Left ONLY: Back to Website */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-start">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-gray-800 text-white text-xs font-heading font-black px-4 py-2 rounded-xl border border-gray-800 shadow-xs transition-all active:scale-95"
        >
          <ArrowLeft size={16} className="text-[#F97316]" /> Back to Website
        </button>
      </div>

      {/* Centered Admin Card */}
      <div className="flex-1 flex items-center justify-center py-6">
        <div className="bg-[#1A1A1A] rounded-3xl max-w-[520px] w-full p-6 sm:p-8 shadow-2xl border border-gray-800 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-3 flex flex-col items-center">
            <BrandLogo size="login" variant="light" className="justify-center" />
            
            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 bg-[#F97316]/20 border border-[#F97316]/40 text-[#F97316] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                <ShieldCheck size={12} /> Restricted Access
              </div>
              <h1 className="font-heading font-black text-2xl text-white">ADMIN PORTAL LOGIN</h1>
              <p className="text-gray-400 text-xs mt-1">Authorized workshop owner sign in for order control & ledger management.</p>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-950/80 border border-red-800 text-red-300 p-3 rounded-xl text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Admin Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs font-sans">
            <div>
              <label className="font-bold text-gray-300 block mb-1">Admin Email / Username</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@manikandanlathe.com"
                  className="w-full bg-[#111111] text-white p-3 pl-10 rounded-xl border border-gray-800 focus:border-[#F97316] outline-none font-bold text-sm"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-300 block mb-1">Security Passcode / PIN *</label>
              <div className="relative">
                <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter admin passcode (e.g. 1234)"
                  className="w-full bg-[#111111] text-white p-3 pl-10 rounded-xl border border-gray-800 focus:border-[#F97316] outline-none font-bold text-sm font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 mt-2 cursor-pointer"
            >
              <ShieldCheck size={16} /> {loading ? 'Verifying Admin Access...' : 'Sign In to Admin Portal'}
            </button>
          </form>

        </div>
      </div>

      <div className="text-center font-mono text-[10px] text-gray-500">
        © {new Date().getFullYear()} MANIKANDAN LATHE ERP Admin Portal.
      </div>

    </div>
  );
};
