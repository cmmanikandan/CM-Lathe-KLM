import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { CustomerAddress } from '../../types';
import {
  User, Phone, MapPin, CheckCircle2, ChevronRight, ChevronLeft,
  Camera, Upload, Globe, Bell, Moon, Sun, Home, Briefcase,
  Tractor, Wrench, ArrowRight, Sparkles, Shield
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Personal Details', icon: User },
  { id: 2, label: 'Delivery Address', icon: MapPin },
  { id: 3, label: 'Preferences', icon: Bell },
  { id: 4, label: 'Final Review', icon: CheckCircle2 },
];

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry',
];

const DISTRICTS_BY_STATE: Record<string, string[]> = {
  'Tamil Nadu': [
    'Ariyalur','Chengalpattu','Chennai','Coimbatore','Cuddalore','Dharmapuri',
    'Dindigul','Erode','Kallakurichi','Kancheepuram','Kanyakumari','Karur',
    'Krishnagiri','Madurai','Mayiladuthurai','Nagapattinam','Namakkal','Nilgiris',
    'Perambalur','Pudukkottai','Ramanathapuram','Ranipet','Salem','Sivaganga',
    'Tenkasi','Thanjavur','Theni','Thoothukudi','Tiruchirappalli','Tirunelveli',
    'Tirupathur','Tiruppur','Tiruvallur','Tiruvannamalai','Tiruvarur','Vellore',
    'Villupuram','Virudhunagar',
  ],
  'Andhra Pradesh': [
    'Alluri Sitharama Raju','Anakapalli','Anantapur','Bapatla','Chittoor','East Godavari',
    'Eluru','Guntur','Kakinada','Krishna','Kurnool','Nandyal','NTR','Palnadu',
    'Parvathipuram Manyam','Prakasam','Sri Potti Sriramulu Nellore','Sri Sathya Sai',
    'Srikakulam','Tirupati','Visakhapatnam','Vizianagaram','West Godavari','YSR Kadapa',
  ],
  'Karnataka': [
    'Bagalkot','Ballari','Belagavi','Bengaluru Rural','Bengaluru Urban','Bidar',
    'Chamarajanagar','Chikballapur','Chikkamagaluru','Chitradurga','Dakshina Kannada',
    'Davanagere','Dharwad','Gadag','Hassan','Haveri','Kalaburagi','Kodagu','Kolar',
    'Koppal','Mandya','Mysuru','Raichur','Ramanagara','Shivamogga','Tumakuru',
    'Udupi','Uttara Kannada','Vijayapura','Yadgir',
  ],
  'Kerala': [
    'Alappuzha','Ernakulam','Idukki','Kannur','Kasaragod','Kollam','Kottayam',
    'Kozhikode','Malappuram','Palakkad','Pathanamthitta','Thiruvananthapuram',
    'Thrissur','Wayanad',
  ],
  'Maharashtra': [
    'Ahmednagar','Akola','Amravati','Aurangabad','Beed','Bhandara','Buldhana',
    'Chandrapur','Dhule','Gadchiroli','Gondia','Hingoli','Jalgaon','Jalna',
    'Kolhapur','Latur','Mumbai City','Mumbai Suburban','Nagpur','Nanded','Nandurbar',
    'Nashik','Osmanabad','Palghar','Parbhani','Pune','Raigad','Ratnagiri',
    'Sangli','Satara','Sindhudurg','Solapur','Thane','Wardha','Washim','Yavatmal',
  ],
  'Telangana': [
    'Adilabad','Bhadradri Kothagudem','Hanumakonda','Hyderabad','Jagtial','Jangaon',
    'Jayashankar Bhupalpally','Jogulamba Gadwal','Kamareddy','Karimnagar','Khammam',
    'Komaram Bheem','Mahabubabad','Mahabubnagar','Mancherial','Medak','Medchal-Malkajgiri',
    'Mulugu','Nagarkurnool','Nalgonda','Narayanpet','Nirmal','Nizamabad','Peddapalli',
    'Rajanna Sircilla','Rangareddy','Sangareddy','Siddipet','Suryapet','Vikarabad',
    'Wanaparthy','Warangal','Yadadri Bhuvanagiri',
  ],
  'Uttar Pradesh': [
    'Agra','Aligarh','Ambedkar Nagar','Amethi','Amroha','Auraiya','Ayodhya',
    'Azamgarh','Baghpat','Bahraich','Ballia','Balrampur','Banda','Barabanki',
    'Bareilly','Basti','Bhadohi','Bijnor','Budaun','Bulandshahr','Chandauli',
    'Chitrakoot','Deoria','Etah','Etawah','Farrukhabad','Fatehpur','Firozabad',
    'Gautam Buddha Nagar','Ghaziabad','Ghazipur','Gonda','Gorakhpur','Hamirpur',
    'Hapur','Hardoi','Hathras','Jalaun','Jaunpur','Jhansi','Kannauj','Kanpur Dehat',
    'Kanpur Nagar','Kasganj','Kaushambi','Kheri','Kushinagar','Lalitpur','Lucknow',
    'Maharajganj','Mahoba','Mainpuri','Mathura','Mau','Meerut','Mirzapur','Moradabad',
    'Muzaffarnagar','Pilibhit','Pratapgarh','Prayagraj','Rae Bareli','Rampur','Saharanpur',
    'Sambhal','Sant Kabir Nagar','Shahjahanpur','Shamli','Shrawasti','Siddharthnagar',
    'Sitapur','Sonbhadra','Sultanpur','Unnao','Varanasi',
  ],
  'Rajasthan': [
    'Ajmer','Alwar','Banswara','Baran','Barmer','Bharatpur','Bhilwara','Bikaner',
    'Bundi','Chittorgarh','Churu','Dausa','Dholpur','Dungarpur','Hanumangarh',
    'Jaipur','Jaisalmer','Jalore','Jhalawar','Jhunjhunu','Jodhpur','Karauli',
    'Kota','Nagaur','Pali','Pratapgarh','Rajsamand','Sawai Madhopur','Sikar',
    'Sirohi','Sri Ganganagar','Tonk','Udaipur',
  ],
  'Gujarat': [
    'Ahmedabad','Amreli','Anand','Aravalli','Banaskantha','Bharuch','Bhavnagar',
    'Botad','Chhota Udaipur','Dahod','Dang','Devbhumi Dwarka','Gandhinagar',
    'Gir Somnath','Jamnagar','Junagadh','Kheda','Kutch','Mahisagar','Mehsana',
    'Morbi','Narmada','Navsari','Panchmahal','Patan','Porbandar','Rajkot',
    'Sabarkantha','Surat','Surendranagar','Tapi','Vadodara','Valsad',
  ],
  'Delhi': [
    'Central Delhi','East Delhi','New Delhi','North Delhi','North East Delhi',
    'North West Delhi','Shahdara','South Delhi','South East Delhi','South West Delhi','West Delhi',
  ],
  'Punjab': [
    'Amritsar','Barnala','Bathinda','Faridkot','Fatehgarh Sahib','Fazilka','Ferozepur',
    'Gurdaspur','Hoshiarpur','Jalandhar','Kapurthala','Ludhiana','Mansa','Moga',
    'Mohali','Muktsar','Nawanshahr','Pathankot','Patiala','Rupnagar','Sangrur',
    'Tarn Taran',
  ],
  'Haryana': [
    'Ambala','Bhiwani','Charkhi Dadri','Faridabad','Fatehabad','Gurugram','Hisar',
    'Jhajjar','Jind','Kaithal','Karnal','Kurukshetra','Mahendragarh','Nuh',
    'Palwal','Panchkula','Panipat','Rewari','Rohtak','Sirsa','Sonipat','Yamunanagar',
  ],
};

const getDistricts = (stateName: string): string[] => {
  return DISTRICTS_BY_STATE[stateName] || [];
};

export const ProfileCompletionWizard: React.FC = () => {
  const { user, completeProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Step 1
  const [name, setName] = useState(user?.googleName || user?.name || '');
  const [phone, setPhone] = useState(user?.phone?.replace(/\D/g, '').slice(-10) || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.googlePhotoURL || user?.avatarUrl || '');
  const [useGooglePhoto, setUseGooglePhoto] = useState(true);

  // Step 2
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [village, setVillage] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('Dindigul');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressType, setAddressType] = useState<'Home' | 'Office' | 'Farm' | 'Workshop'>('Home');

  // Step 3
  const [language, setLanguage] = useState<'Tamil' | 'English'>('Tamil');
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifWhatsApp, setNotifWhatsApp] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Step 4
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100;
  const googlePhoto = user?.googlePhotoURL || '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setAvatarUrl(reader.result as string);
        setUseGooglePhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 4));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleComplete = () => {
    if (!confirmed) return;
    setSaving(true);
    const fullAddress = [houseNo, street, area, village, city, district, state, pincode].filter(Boolean).join(', ');
    const addressDetails: CustomerAddress = {
      houseNo, street, area, village, city, district, state, pincode, landmark, addressType, isDefault: true,
    };
    completeProfile({
      name,
      phone: '+91 ' + phone.replace(/\D/g, '').slice(-10),
      phoneVerified: true,
      avatarUrl: useGooglePhoto ? googlePhoto : avatarUrl,
      address: fullAddress,
      addressDetails,
      district,
      state,
      pincode,
      language,
      notificationPrefs: { push: notifPush, email: notifEmail, whatsapp: notifWhatsApp, sms: notifSms },
      darkMode,
    });
    setTimeout(() => {
      setSaving(false);
      navigate('/customer/home', { replace: true });
    }, 1000);
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 flex flex-col font-sans">

      {/* Hidden File Input */}
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />

      {/* GLASS PROGRESS HEADER */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-xs px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-[#F97316] uppercase tracking-widest block">
                Profile Setup
              </span>
              <h1 className="font-heading font-black text-base text-[#111111]">
                Step {step} of {STEPS.length} — {STEPS[step - 1].label}
              </h1>
            </div>
            <div className="flex items-center gap-1">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                    s.id < step
                      ? 'bg-[#22C55E] text-white'
                      : s.id === step
                      ? 'bg-[#111111] text-[#F97316]'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {s.id < step ? <CheckCircle2 size={14} /> : s.id}
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#F97316] to-[#111111] rounded-full"
              initial={false}
              animate={{ width: `${Math.max(progressPct, 5)}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>

      {/* WIZARD CARD */}
      <div className="flex-1 flex items-start justify-center p-4 sm:p-6 pt-6">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="bg-white rounded-[26px] border border-gray-200 shadow-xl p-6 sm:p-8 space-y-6"
            >

              {/* ─────────────── STEP 1: PERSONAL DETAILS ─────────────── */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="font-heading font-black text-xl text-[#111111]">Personal Details</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Review your Google info and verify your mobile number.</p>
                  </div>

                  {/* Avatar Section */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F97316] to-[#111111] p-[3px] shadow-lg">
                        {(useGooglePhoto ? googlePhoto : avatarUrl) ? (
                          <img
                            src={useGooglePhoto ? googlePhoto : avatarUrl}
                            alt="Profile"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover rounded-full block"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-[#111111] flex items-center justify-center text-3xl font-black text-[#F97316]">
                            {name.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {googlePhoto && (
                        <button
                          onClick={() => { setUseGooglePhoto(true); setAvatarUrl(googlePhoto); }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold flex items-center gap-1.5 border transition-all ${
                            useGooglePhoto ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-gray-700 border-gray-200'
                          }`}
                        >
                          <Globe size={12} /> Keep Google Photo
                        </button>
                      )}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold flex items-center gap-1.5 border transition-all ${
                          !useGooglePhoto ? 'bg-[#F97316] text-white border-[#F97316]' : 'bg-white text-gray-700 border-gray-200'
                        }`}
                      >
                        <Upload size={12} /> Upload New Photo
                      </button>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 outline-none focus:border-[#F97316] transition-colors"
                    />
                  </div>

                  {/* Email — readonly from Google */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Email Address <span className="text-[10px] text-green-600 font-mono ml-1">✓ Google Verified</span>
                    </label>
                    <div className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono text-gray-600 flex items-center gap-2">
                      <Shield size={14} className="text-green-600 shrink-0" />
                      {user?.googleEmail || user?.email}
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">Mobile Number *</label>
                    <div className="flex gap-2">
                      <div className="bg-gray-100 border border-gray-300 rounded-xl px-3 py-3 text-sm font-mono font-bold text-gray-700 shrink-0">
                        +91
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono font-medium text-gray-900 outline-none focus:border-[#F97316] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────── STEP 2: DELIVERY ADDRESS ─────────────── */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-heading font-black text-xl text-[#111111]">Delivery Address</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Your delivery and invoicing address.</p>
                  </div>

                  {/* Address Type Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 block">Address Type *</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['Home', 'Office', 'Farm', 'Workshop'] as const).map((type) => {
                        const icons = { Home: Home, Office: Briefcase, Farm: Tractor, Workshop: Wrench };
                        const Icon = icons[type];
                        return (
                          <button
                            key={type}
                            onClick={() => setAddressType(type)}
                            className={`py-2.5 rounded-xl text-xs font-heading font-bold flex flex-col items-center gap-1 border transition-all ${
                              addressType === type
                                ? 'bg-[#111111] text-white border-[#111111]'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-[#F97316]'
                            }`}
                          >
                            <Icon size={14} />
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {[
                      { label: 'House No / Door No *', value: houseNo, set: setHouseNo, required: true },
                      { label: 'Street / Lane', value: street, set: setStreet, required: true },
                      { label: 'Area / Colony', value: area, set: setArea },
                      { label: 'Village / Town *', value: village, set: setVillage, required: true },
                      { label: 'City', value: city, set: setCity },
                      { label: 'Pincode *', value: pincode, set: setPincode, required: true, type: 'tel', maxLen: 6 },
                      { label: 'Landmark (Optional)', value: landmark, set: setLandmark, span: 2 },
                    ].map((f, i) => (
                      <div key={i} className={f.span === 2 ? 'sm:col-span-2' : ''}>
                        <label className="font-bold text-gray-700 block mb-1">{f.label}</label>
                        <input
                          type={f.type || 'text'}
                          required={f.required}
                          value={f.value}
                          onChange={(e) => f.set(f.maxLen ? e.target.value.slice(0, f.maxLen) : e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#F97316]"
                        />
                      </div>
                    ))}

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">District *</label>
                      {getDistricts(state).length > 0 ? (
                        <select
                          required
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#F97316]"
                        >
                          <option value="">Select District</option>
                          {getDistricts(state).map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="Enter district name"
                          className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#F97316]"
                        />
                      )}
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">State *</label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#F97316]"
                      >
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────── STEP 3: PREFERENCES ─────────────── */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="font-heading font-black text-xl text-[#111111]">Account Preferences</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Customise language, notifications, and display settings.</p>
                  </div>

                  {/* Auto Customer ID */}
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#F97316] uppercase block">Your Unique Customer ID</span>
                      <span className="font-heading font-black text-xl text-[#111111]">{user?.customerId || 'MLC-000123'}</span>
                    </div>
                    <div className="w-11 h-11 bg-[#F97316]/20 rounded-full flex items-center justify-center">
                      <Sparkles size={20} className="text-[#F97316]" />
                    </div>
                  </div>

                  {/* Language */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 block">Preferred Language</label>
                    <div className="flex gap-2">
                      {(['Tamil', 'English'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setLanguage(lang)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-heading font-black border transition-all ${
                            language === lang
                              ? 'bg-[#111111] text-white border-[#111111]'
                              : 'bg-white text-gray-600 border-gray-200'
                          }`}
                        >
                          {lang === 'Tamil' ? '🇮🇳 தமிழ்' : '🌐 English'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 block">Notification Preferences</label>
                    <div className="bg-gray-50 rounded-2xl border border-gray-200 divide-y divide-gray-200 overflow-hidden">
                      {[
                        { key: 'push', label: 'Push Notifications', sub: 'App alerts for order updates', state: notifPush, set: setNotifPush },
                        { key: 'email', label: 'Email Notifications', sub: 'Invoice & status email updates', state: notifEmail, set: setNotifEmail },
                        { key: 'wa', label: 'WhatsApp Updates', sub: 'WhatsApp order alerts', state: notifWhatsApp, set: setNotifWhatsApp },
                        { key: 'sms', label: 'SMS Alerts', sub: 'Text message notifications', state: notifSms, set: setNotifSms },
                      ].map((n) => (
                        <div key={n.key} className="flex items-center justify-between px-4 py-3">
                          <div>
                            <p className="text-xs font-heading font-bold text-[#111111]">{n.label}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{n.sub}</p>
                          </div>
                          <button
                            onClick={() => n.set(!n.state)}
                            className={`w-11 h-6 rounded-full relative transition-colors ${n.state ? 'bg-[#F97316]' : 'bg-gray-300'}`}
                          >
                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${n.state ? 'left-5' : 'left-0.5'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dark Mode */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-2xl border border-gray-200 px-4 py-3">
                    <div className="flex items-center gap-3">
                      {darkMode ? <Moon size={18} className="text-[#111111]" /> : <Sun size={18} className="text-[#F97316]" />}
                      <div>
                        <p className="text-xs font-heading font-bold text-[#111111]">Dark Mode</p>
                        <p className="text-[10px] text-gray-400 font-mono">Dark theme for the app interface</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`w-11 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-[#111111]' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${darkMode ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              )}

              {/* ─────────────── STEP 4: FINAL REVIEW ─────────────── */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="font-heading font-black text-xl text-[#111111]">Final Review</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Confirm your details before completing setup.</p>
                  </div>

                  {/* Profile Summary Card */}
                  <div className="bg-gray-50 rounded-2xl border border-gray-200 divide-y divide-gray-200 overflow-hidden text-xs">
                    {/* Avatar Row */}
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F97316] to-[#111111] p-0.5 shrink-0">
                        {(useGooglePhoto ? googlePhoto : avatarUrl) ? (
                          <img src={useGooglePhoto ? googlePhoto : avatarUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xl font-black text-[#F97316]">
                            {name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="font-heading font-black text-base text-[#111111] block">{name}</span>
                        <span className="font-mono text-gray-500">{user?.customerId}</span>
                      </div>
                    </div>

                    {[
                      { label: 'Email', value: user?.googleEmail || user?.email, icon: '📧', verified: true },
                      { label: 'Mobile', value: phone ? `+91 ${phone}` : 'Not provided', icon: '📱', verified: Boolean(phone) },
                      { label: 'Address', value: [houseNo, street, area, village, district, state, pincode].filter(Boolean).join(', ') || 'Not provided', icon: '📍' },
                      { label: 'Language', value: language === 'Tamil' ? '🇮🇳 தமிழ்' : '🌐 English', icon: '🌐' },
                      { label: 'Notifications', value: [notifPush && 'Push', notifEmail && 'Email', notifWhatsApp && 'WhatsApp', notifSms && 'SMS'].filter(Boolean).join(' • ') || 'None', icon: '🔔' },
                    ].map((row, i) => (
                      <div key={i} className="flex items-start justify-between px-4 py-3 gap-3">
                        <span className="text-gray-500 font-mono shrink-0">{row.icon} {row.label}</span>
                        <span className="font-bold text-[#111111] text-right">
                          {row.value}
                          {row.verified && <span className="text-green-600 ml-1 text-[10px]">✓</span>}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Confirm Checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer bg-orange-50 border border-orange-200 p-4 rounded-2xl">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#F97316]"
                    />
                    <span className="text-xs text-gray-700 font-bold leading-snug">
                      I confirm that the above information is accurate. I agree to receive order updates and invoices from MANIKANDAN LATHE.
                    </span>
                  </label>

                  <button
                    onClick={handleComplete}
                    disabled={!confirmed || saving}
                    className={`w-full py-4 rounded-2xl text-sm font-heading font-black flex items-center justify-center gap-2 shadow-lg transition-all ${
                      confirmed && !saving
                        ? 'bg-[#F97316] hover:bg-[#EA580C] text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Setting Up Account...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} /> Complete Profile & Enter App
                      </>
                    )}
                  </button>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* NAV BUTTONS — Back always visible, Continue only for steps 1-3 */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={goBack}
              disabled={step === 1}
              className={`flex items-center gap-1.5 text-xs font-heading font-black px-4 py-2.5 rounded-xl border transition-all ${
                step === 1
                  ? 'text-gray-300 border-gray-100 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft size={16} /> Back
            </button>

            {step < 4 && (
              <button
                onClick={goNext}
                disabled={
                  (step === 1 && (!name.trim() || phone.replace(/\D/g, '').length !== 10)) ||
                  (step === 2 && (!houseNo || !village || !pincode || pincode.length !== 6))
                }
                className={`flex items-center gap-1.5 text-xs font-heading font-black px-5 py-2.5 rounded-xl transition-all shadow-xs ${
                  (step === 1 && (!name.trim() || phone.replace(/\D/g, '').length !== 10)) ||
                  (step === 2 && (!houseNo || !village || !pincode || pincode.length !== 6))
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#111111] hover:bg-[#F97316] text-white'
                }`}
              >
                Continue <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
