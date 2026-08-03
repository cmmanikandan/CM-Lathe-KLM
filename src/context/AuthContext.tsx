import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerUser, CustomerAddress } from '../types';

// Auto-generate a unique customer ID like MLC-000123
const generateCustomerId = (): string => {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `MLC-${num}`;
};

interface GoogleUserData {
  googleUID: string;
  googleName: string;
  googleEmail: string;
  googlePhotoURL: string;
}

interface ProfileCompletionData {
  name: string;
  phone: string;
  phoneVerified: boolean;
  avatarUrl?: string;
  addressDetails: CustomerAddress;
  address: string;
  district: string;
  state: string;
  pincode: string;
  language: 'Tamil' | 'English';
  notificationPrefs: {
    push: boolean;
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
  };
  darkMode: boolean;
}

interface AuthContextType {
  user: CustomerUser | null;
  role: 'customer' | 'admin';
  isLoggedIn: boolean;
  isProfileComplete: boolean;
  loginAsCustomer: (name: string, phone: string, email?: string, address?: string, avatarUrl?: string) => void;
  loginAsAdmin: () => void;
  loginWithGoogle: (googleData: GoogleUserData) => void;
  completeProfile: (profileData: ProfileCompletionData) => void;
  registerUser: (name: string, email: string, phone?: string, address?: string, avatarUrl?: string) => void;
  updateProfileDetails: (phone: string, address: string, avatarUrl?: string) => void;
  updateUserProfile: (data: Partial<CustomerUser>) => void;
  updateAvatar: (avatarUrl: string) => void;
  toggleRole: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ADMIN_UID = 'qiiShV5WlAY2Zwok3vNxhedl3N12';

  const [role, setRole] = useState<'customer' | 'admin'>(() => {
    return (localStorage.getItem('ml_role') as 'customer' | 'admin') || 'customer';
  });

  const [user, setUser] = useState<CustomerUser | null>(() => {
    const saved = localStorage.getItem('ml_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.googleUID === ADMIN_UID || parsed.id === ADMIN_UID) {
          return { ...parsed, role: 'admin' };
        }
        return parsed;
      } catch (e) { console.error(e); }
    }
    return null; // No demo user — must log in
  });

  useEffect(() => {
    localStorage.setItem('ml_role', role);
  }, [role]);

  const saveUser = (newUser: CustomerUser) => {
    setUser(newUser);
    localStorage.setItem('ml_user', JSON.stringify(newUser));
  };

  // Standard email/password login
  const loginAsCustomer = (name: string, phone: string, email?: string, address?: string, avatarUrl?: string) => {
    const newUser: CustomerUser = {
      id: user?.id || 'cust-' + Date.now(),
      name: name || 'Customer',
      phone: phone || '+91 96592 86268',
      email: email || 'customer@example.com',
      address: address || 'Kallimandhayam, Dindigul',
      avatarUrl: avatarUrl || user?.avatarUrl,
      role: 'customer',
      profileCompleted: true,
      phoneVerified: false,
      customerId: user?.customerId || generateCustomerId(),
      memberSince: new Date().getFullYear().toString(),
      language: 'Tamil',
      notificationPrefs: { push: true, email: true, whatsapp: true, sms: false },
    };
    setRole('customer');
    saveUser(newUser);
  };

  // Google Sign-In: creates incomplete profile, caller redirects to wizard (or admin dashboard if admin UID)
  const loginWithGoogle = (googleData: GoogleUserData) => {
    // Check if this user is designated ADMIN UID
    if (googleData.googleUID === ADMIN_UID) {
      const adminUser: CustomerUser = {
        id: ADMIN_UID,
        googleUID: ADMIN_UID,
        name: googleData.googleName || 'Chellamuthu K (Admin)',
        email: googleData.googleEmail || 'manikandanlatheklm@gmail.com',
        phone: '+91 96592 86268',
        address: 'K. Keeranur Road, Kallimandhayam - 624616',
        googleName: googleData.googleName,
        googleEmail: googleData.googleEmail,
        googlePhotoURL: googleData.googlePhotoURL,
        avatarUrl: googleData.googlePhotoURL,
        role: 'admin',
        profileCompleted: true,
        phoneVerified: true,
        customerId: 'MLC-ADMIN',
        memberSince: '2000',
        language: 'Tamil',
        notificationPrefs: { push: true, email: true, whatsapp: true, sms: false },
      };
      setRole('admin');
      saveUser(adminUser);
      return;
    }

    const existingUser = (() => {
      const saved = localStorage.getItem('ml_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as CustomerUser;
          if (parsed.googleUID === googleData.googleUID) return parsed;
        } catch {}
      }
      return null;
    })();

    if (existingUser?.profileCompleted) {
      // Returning user — just refresh and log in
      saveUser({ ...existingUser, googlePhotoURL: googleData.googlePhotoURL });
      setRole('customer');
      return;
    }

    // New Google user — create shell, mark incomplete
    const newUser: CustomerUser = {
      id: existingUser?.id || 'cust-' + Date.now(),
      name: googleData.googleName,
      phone: '',
      email: googleData.googleEmail,
      address: '',
      googleUID: googleData.googleUID,
      googleName: googleData.googleName,
      googleEmail: googleData.googleEmail,
      googlePhotoURL: googleData.googlePhotoURL,
      avatarUrl: googleData.googlePhotoURL,
      role: 'customer',
      profileCompleted: false,
      phoneVerified: false,
      customerId: existingUser?.customerId || generateCustomerId(),
      memberSince: new Date().getFullYear().toString(),
      language: 'Tamil',
      notificationPrefs: { push: true, email: true, whatsapp: true, sms: false },
      darkMode: false,
    };
    setRole('customer');
    saveUser(newUser);
  };

  // Called when wizard completes all 4 steps
  const completeProfile = (profileData: ProfileCompletionData) => {
    if (!user) return;
    const completed: CustomerUser = {
      ...user,
      name: profileData.name,
      phone: profileData.phone,
      phoneVerified: profileData.phoneVerified,
      avatarUrl: profileData.avatarUrl || user.googlePhotoURL || user.avatarUrl,
      address: profileData.address,
      addressDetails: profileData.addressDetails,
      district: profileData.district,
      state: profileData.state,
      pincode: profileData.pincode,
      language: profileData.language,
      notificationPrefs: profileData.notificationPrefs,
      darkMode: profileData.darkMode,
      profileCompleted: true,
    };
    saveUser(completed);
  };

  const registerUser = (name: string, email: string, phone?: string, address?: string, avatarUrl?: string) => {
    const newUser: CustomerUser = {
      id: 'cust-' + Date.now(),
      name,
      phone: phone || '',
      email,
      address: address || '',
      avatarUrl,
      role: 'customer',
      profileCompleted: true,
      phoneVerified: false,
      customerId: generateCustomerId(),
      memberSince: new Date().getFullYear().toString(),
      language: 'Tamil',
      notificationPrefs: { push: true, email: true, whatsapp: true, sms: false },
    };
    setRole('customer');
    saveUser(newUser);
  };

  const updateProfileDetails = (phone: string, address: string, avatarUrl?: string) => {
    if (!user) return;
    saveUser({ ...user, phone, address, avatarUrl: avatarUrl || user.avatarUrl });
  };

  const updateUserProfile = (data: Partial<CustomerUser>) => {
    if (!user) return;
    saveUser({ ...user, ...data });
  };

  const updateAvatar = (avatarUrl: string) => {
    if (!user) return;
    saveUser({ ...user, avatarUrl });
  };

  const loginAsAdmin = () => {
    const adminUser: CustomerUser = {
      id: 'admin-001',
      name: 'Chellamuthu K (Owner)',
      phone: '+91 96592 86268',
      email: 'manikandanlatheklm@gmail.com',
      address: 'K. Keeranur Road, Kallimandhayam, 624616',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      role: 'admin',
      profileCompleted: true,
      phoneVerified: true,
      customerId: 'MLC-ADMIN',
      memberSince: '2000',
    };
    setRole('admin');
    saveUser(adminUser);
  };

  const toggleRole = () => {
    setRole((prev) => (prev === 'customer' ? 'admin' : 'customer'));
  };

  const logout = () => {
    setUser(null);
    setRole('customer');
    localStorage.removeItem('ml_user');
  };

  const isProfileComplete = !!(user?.profileCompleted);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoggedIn: !!user,
        isProfileComplete,
        loginAsCustomer,
        loginAsAdmin,
        loginWithGoogle,
        completeProfile,
        registerUser,
        updateProfileDetails,
        updateUserProfile,
        updateAvatar,
        toggleRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
