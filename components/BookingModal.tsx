'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { requestSession } from '@/lib/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Calendar, Clock, Heart } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import AnimatedModal from './ui/AnimatedModal';
import { reportClientError } from '@/lib/actions';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig?: {
    therapist_id?: string;
    type?: string;
    age?: string;
    service?: string;
  };
}

interface Therapist {
  user_id: string;
  full_name: string;
  qualification: string;
  avatar_url: string;
  bio?: string;
  specialties?: string[];
  pricing?: Record<string, number>;
}

const caringMessages = [
  'Securing your confidential space...',
  'Matching you with your clinical expert...',
  'Finalizing clinical assessments...',
  'Preparing your safe healing zone...'
];

export default function BookingModal({ isOpen, onClose, initialConfig }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(1);
  const [supabase] = useState(() => createClient());
  const [therapists, setTherapists] = useState<Therapist[]>([]);

  const [isCaringInProgress, setIsCaringInProgress] = useState(false);
  const [caringMessageIndex, setCaringMessageIndex] = useState(0);

  useEffect(() => {
    if (!isCaringInProgress) return;
    const interval = setInterval(() => {
      setCaringMessageIndex((prev) => (prev + 1) % caringMessages.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isCaringInProgress]);

  const [user, setUser] = useState<any>(null); 
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    occupation: '',
    relationshipStatus: '',
    preferredFormat: 'Video call',
    additionalInfo: '',
    therapyBefore: '',
    diagnoses: '',
    medication: '',
    underCare: '',
    wellbeing: 0,
    stressLevel: 0,
    harmingThoughts: '',
    trustedPerson: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    acceptTerms: false,
    digitalSignature: '',
    email: '',
    phone: '',
    otp: '',
    language: '',
    type: '',
    age: '',
    service: '',
    therapist_id: '',
    is_trial: true,
    plan_type: 'Trial Session',
    scheduled_date: '',
    scheduled_time: ''
  });

  const [couponCode, setCouponCode] = useState('');
  const [isTrialAvailable, setIsTrialAvailable] = useState(true);

  const [timeLeft, setTimeLeft] = useState(420); // 7 minutes
  const [previewTherapist, setPreviewTherapist] = useState<Therapist | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');

  const [modalState, setModalState] = useState<{isOpen: boolean, type: 'success' | 'error', title: string, message: string}>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const closeAndReset = useCallback(() => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setDirection(1);
      setTimeLeft(420);
    }, 300);
  }, [onClose]);

  useEffect(() => {
    const setFp = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setDeviceId(result.visitorId);
    };
    setFp();
  }, []);

  useEffect(() => {
    async function fetchTherapists() {
      const { data } = await supabase.from('therapist_profiles').select('*');
      if (data) setTherapists(data);
    }
    fetchTherapists();
  }, [supabase]);

  useEffect(() => {
    if (!isOpen || user) return;
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const fullName = user.user_metadata?.full_name || '';
        const parts = fullName.trim().split(/\s+/);
        const firstName = parts[0] || '';
        const lastName = parts.slice(1).join(' ') || '';
        setFormData(prev => ({
          ...prev,
          firstName: user.user_metadata?.first_name || firstName,
          lastName: user.user_metadata?.last_name || lastName,
          email: user.email || '',
          phone: user.user_metadata?.phone || prev.phone
        }));
      }
    }
    checkUser();
  }, [supabase, isOpen, user]);

  useEffect(() => {
    if (isOpen && initialConfig) {
      setFormData(prev => ({
        ...prev,
        therapist_id: initialConfig.therapist_id || prev.therapist_id,
        type: initialConfig.type || prev.type,
        age: initialConfig.age || prev.age,
        service: initialConfig.service || prev.service,
      }));
    }
  }, [isOpen, initialConfig]);

  // Session Timeout Timer Logic
  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(420);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && timeLeft === 0) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Session Expired',
        message: 'Your booking session has expired. Please start over to secure your slot.'
      });
      closeAndReset();
    }
  }, [timeLeft, isOpen, closeAndReset]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost')) {
      setFormData(prev => ({
        ...prev,
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: '12:00'
      }));
    }
  }, []);

  const dispatchOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, type: 'booking' })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      setDirection(1);
      setStep(2);
    } catch (err: any) {
      reportClientError(err.message, 'BookingModal.tsx - dispatchOTP');
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Verification Failed',
        message: 'An error occurred while dispatching the security code. Please check your number or contact support.'
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, otp: formData.otp })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      // Sync with Supabase SDK using the session returned from server
      if (data.session) {
        await supabase.auth.setSession(data.session);
      }
      
      // Check Trial Availability
      const trialCheck = await fetch('/api/booking/check-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, deviceId, userId: data.session?.user?.id })
      });
      const trialData = await trialCheck.json();
      setIsTrialAvailable(trialData.available);
      if (!trialData.available) {
        setFormData(prev => ({ ...prev, is_trial: false }));
      }

      setDirection(1);
      setStep(3); // Go to Care Type
    } catch (err: any) {
      reportClientError(err.message, 'BookingModal.tsx - verifyOTP');
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Authentication Error',
        message: 'An error occurred while verifying your OTP. Please try again or contact support.'
      });
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = 
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.phone.trim().replace(/\D/g, '').length >= 10;

  const isStep3Valid = formData.dob !== '';

  const isStep5Valid = formData.wellbeing >= 1 && formData.wellbeing <= 10;

  const isStep6Valid = 
    formData.harmingThoughts !== '' &&
    (formData.harmingThoughts === 'No' || (
      formData.trustedPerson !== '' &&
      formData.emergencyContactName.trim() !== '' &&
      formData.emergencyContactPhone.trim() !== '' &&
      formData.emergencyContactRelation !== ''
    )) &&
    formData.acceptTerms &&
    formData.digitalSignature.trim() !== '';

  const handleNext = async () => {
    if (step === 1 && isStep1Valid) {
      return dispatchOTP();
    }
    if (step === 2) {
      return verifyOTP();
    }
    
    setDirection(1);
    setStep((s) => Math.min(s + 1, 8)); // Now 8 steps total internally
  };

  const handlePrev = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleBookNow = async () => {
    setLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      localStorage.setItem('unheard_booking_basic', JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: fullName,
        email: formData.email,
        phone: formData.phone
      }));

      // Merge Date and Time into ISO string
      let rawDateStr = new Date().toISOString();
      if (formData.scheduled_date && formData.scheduled_time) {
         // Create local datetime
         const combined = `${formData.scheduled_date}T${formData.scheduled_time}:00`;
         rawDateStr = new Date(combined).toISOString();
      }

      // QA TEST OVERRIDE: Automatically schedule for +5 minutes in development mode
      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost')) {
         rawDateStr = new Date(Date.now() + 5 * 60 * 1000).toISOString();
         console.warn("🚧 DEV MODE: Overriding booking time to exactly 5 minutes from now! Payload Start Time:", rawDateStr);
      }

      // Construct payload to avoid "$undefined" bugs with Next.js Server Actions
      const payload: any = {
        start_time: rawDateStr,
        is_trial: formData.is_trial,
        phone: formData.phone,
        deviceId, // For anti-exploit
        questionnaire: {
          name: fullName, // Save name inside answers for redundancy
          firstName: formData.firstName,
          lastName: formData.lastName,
          dob: formData.dob,
          gender: formData.gender,
          occupation: formData.occupation,
          relationshipStatus: formData.relationshipStatus,
          age: formData.age,
          language: formData.language,
          type: formData.type,
          service: formData.service,
          plan_type: formData.plan_type,
          preferredFormat: formData.preferredFormat,
          additionalInfo: formData.additionalInfo,
          therapyBefore: formData.therapyBefore,
          diagnoses: formData.diagnoses,
          medication: formData.medication,
          underCare: formData.underCare,
          wellbeing: formData.wellbeing,
          stressLevel: formData.stressLevel,
          harmingThoughts: formData.harmingThoughts,
          trustedPerson: formData.trustedPerson,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          emergencyContactRelation: formData.emergencyContactRelation,
          acceptTerms: formData.acceptTerms,
          digitalSignature: formData.digitalSignature
        },
        patient_details: {
          name: fullName,
          email: formData.email
        }
      };

      if (formData.therapist_id) {
        payload.therapist_id = formData.therapist_id;
      }

      const result = await requestSession(payload);

      if (!result.success) {
        throw new Error(result.error);
      }

      // ----------------------------------------------------------------------
      // PHONEPE PAYMENT INTEGRATION (IFrame Flow)
      // ----------------------------------------------------------------------
      if (result.requiresPayment) {
        setLoading(true);
        try {
          const payInitRes = await fetch('/api/payment/phonepe/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questionnaireId: result.questionnaireId,
              amount: result.amount,
              phone: formData.phone,
              name: fullName
            })
          });

          const payData = await payInitRes.json();
          if (payData.success && payData.redirectUrl) {
            // Using the new IFrame Transaction helper
            const { initiatePhonePeTransaction } = await import('@/components/PhonePeProvider');
            
            initiatePhonePeTransaction(payData.redirectUrl, async (status) => {
              console.log("PAYMENT CALLBACK STATUS:", status);
              if (status === 'CONCLUDED') {
                setIsCaringInProgress(true);
                // Manually trigger verification for instant feedback/local testing
                try {
                  await fetch('/api/payment/phonepe/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transactionId: result.transactionId })
                  });
                } catch (vErr) {
                  console.error("Verification Trigger Error:", vErr);
                }

                setTimeout(() => {
                  setIsCaringInProgress(false);
                  setModalState({
                    isOpen: true,
                    type: 'success',
                    title: 'Booking Confirmed!',
                    message: 'Your payment was successful. We are now preparing your session.'
                  });
                  closeAndReset();
                }, 3500);
              } else if (status === 'USER_CANCEL') {
                setLoading(false); // Let them try again
                setModalState({
                  isOpen: true,
                  type: 'error',
                  title: 'Payment Cancelled',
                  message: 'The payment process was interrupted. You can try again to secure your slot.'
                });
              }
            });
            return; // Don't close modal yet
          } else {
            throw new Error(payData.error || 'Failed to initialize payment gateway.');
          }
        } catch (payErr: any) {
          console.error("PAYMENT INIT ERROR:", payErr);
          throw new Error("Payment Gateway Initialization Failed. Please try again or contact support.");
        }
      }

      setIsCaringInProgress(true);
      setTimeout(() => {
        setIsCaringInProgress(false);
        setModalState({
          isOpen: true,
          type: 'success',
          title: 'Request Received!',
          message: 'A clinical expert is reviewing your questionnaire and will assign the best therapist for your success.'
        });
        closeAndReset();
      }, 3500);
    } catch (err: any) {
      reportClientError(err.message, 'BookingModal.tsx - handleBookNow');
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Booking Error',
        message: 'An error occurred while submitting your session request. Please try again or contact support.'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedTherapistData = therapists.find(t => t.user_id === formData.therapist_id);

  const getPricing = () => {
    const defaultPricing = { trial: 399, single: 999, standard: 2999, premium: 1999 };
    if (!selectedTherapistData?.pricing) return defaultPricing;
    return { ...defaultPricing, ...selectedTherapistData.pricing };
  };

  const currentPricing = getPricing();

  const stepVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 })
  };

  const renderStepIndicator = () => {
    if (step === 2) {
      return null;
    }
    const displayStep = step === 1 ? 1 : step - 1;
    return (
      <div className="flex items-center justify-between mb-4 md:mb-8">
        {/* Hide dots indicator on mobile */}
        <div className="hidden md:flex items-center gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${displayStep === s ? 'w-8 bg-[#0F9393]' : 'w-4 bg-gray-200'}`} />
          ))}
          <span className="ml-2 font-nunito font-bold text-[12px] text-gray-400 uppercase tracking-wider">
            Step {displayStep}/7
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div key="booking-modal-container" className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeAndReset}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[1000px] h-full md:h-auto md:min-h-[600px] bg-white md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row group/modal"
          >
            {/* Desktop Branding Column */}
            <div className="hidden md:flex md:w-[40%] bg-[#111111] relative p-12 flex-col justify-between overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#0F9393]/20 blur-[100px] rounded-full" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#0F9393]/10 blur-[100px] rounded-full" />
              <div className="relative z-10">
                <Image src="/assets/logo unherd white.svg" alt="unHeard" width={120} height={40} className="h-[40px] w-auto mb-12" priority />
                <h2 className="font-georgia text-[36px] font-bold text-white leading-tight mb-6">
                  Begin Your <br /><span className="text-[#0F9393]">Journey to</span> <br />Better Mental Health
                </h2>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors mb-6 ${timeLeft < 60 ? 'bg-red-500/20 border-red-500/30 text-red-400 animate-pulse' : 'bg-white/10 border-white/20 text-white/80'}`}>
                  <Clock size={14} className={timeLeft < 60 ? 'animate-pulse' : ''} />
                  <span className="font-nunito font-bold text-[12px] tracking-tight">Slot held: {formatTime(timeLeft)}</span>
                </div>
                <p className="font-nunito text-white/70 text-[18px] leading-relaxed max-w-[280px]">
                  Take the first step towards a clearer mind and a more fulfilled life.
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#111111] bg-gray-600 overflow-hidden relative">
                       <Image src={`/assets/section_2_${i}.webp`} alt="User" fill className="object-cover" />
                    </div>
                  ))}
                <p className="font-nunito text-white/60 text-[14px]">Join 1,500+ happy <br /> members</p>
              </div>
              <div className="absolute bottom-[-50px] right-[-50px] opacity-20 rotate-12">
                 <Image src="/assets/landingimage.webp" alt="" width={400} height={400} className="grayscale" />
              </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden w-full h-[200px] bg-[#111111] relative p-8 flex flex-col justify-end overflow-hidden">
               <div className="absolute inset-0 opacity-40"><Image src="/assets/landingimage.webp" alt="" fill className="object-cover grayscale" /></div>
               <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent" />
               <button onClick={closeAndReset} className="absolute top-6 right-6 z-20 text-white/70 hover:text-white"><X size={24} /></button>
               <div className="relative z-10">
                 <Image src="/assets/logo unherd white.svg" alt="unHeard" width={100} height={24} className="h-[24px] w-auto mb-4" />
                 <h2 className="font-georgia text-[24px] font-bold text-white mb-2">Book Your Session</h2>
                 <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors ${timeLeft < 60 ? 'bg-red-500/20 border-red-500/30 text-red-400 animate-pulse' : 'bg-white/10 border-white/20 text-white/80'}`}>
                   <Clock size={12} className={timeLeft < 60 ? 'animate-pulse' : ''} />
                   <span className="font-nunito font-bold text-[12px] tracking-tight">{formatTime(timeLeft)}</span>
                 </div>
               </div>
            </div>

            {/* Forms Section */}
            <div className="flex-grow p-5 md:p-12 flex flex-col relative bg-white text-black overflow-hidden">
              <button onClick={closeAndReset} className="hidden md:flex absolute top-8 right-8 text-gray-400 hover:text-black transition-colors"><X size={28} /></button>

              {/* CARING IN PROGRESS LOADING OVERLAY */}
              <AnimatePresence>
                {isCaringInProgress && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="flex flex-col items-center gap-6 max-w-sm">
                      {/* Glowing pulsating heart icon container */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#0F9393]/20 rounded-full blur-xl animate-pulse scale-150" />
                        <div className="w-24 h-24 rounded-[32px] bg-[#0F9393]/10 flex items-center justify-center text-[#0F9393] relative shadow-inner">
                          <Heart size={44} className="animate-pulse duration-1000 fill-current animate-bounce" />
                        </div>
                        {/* Sub spinner */}
                        <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full border-2 border-[#0F9393]/20 border-t-[#0F9393] animate-spin" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2.5 mt-2">
                        <h3 className="font-georgia font-black text-[24px] text-gray-900 tracking-tight">Caring in progress...</h3>
                        <div className="h-10 flex items-center justify-center">
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={caringMessageIndex}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              className="font-nunito font-semibold text-[14px] text-gray-500 italic"
                            >
                              {caringMessages[caringMessageIndex]}
                            </motion.p>
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {renderStepIndicator()}

              <div className="flex-grow relative overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step} custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit"
                    transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                    className="w-full h-full flex flex-col pt-2"
                  >
                    {step === 1 && (
                      <div className="flex flex-col gap-5 text-black">
                        <div className="mb-1">
                          <h3 className="font-georgia font-bold text-[20px] md:text-[28px] text-black mb-1">Personal Information</h3>
                          <p className="font-nunito text-gray-500 text-[13px] md:text-[14px]">Please fill in your details to customize your care journey. We verify via WhatsApp.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[42vh] md:max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                          {/* First Name & Last Name */}
                          <div className="flex flex-col gap-1.5">
                            <label className="font-nunito font-bold text-[13px] text-gray-700">First Name *</label>
                            <input 
                              type="text" 
                              value={formData.firstName} 
                              onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                              placeholder="Priya" 
                              className="border border-gray-200 rounded-2xl px-5 py-3 font-nunito text-black placeholder:text-gray-400 focus:outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] transition-all bg-gray-50/50" 
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="font-nunito font-bold text-[13px] text-gray-700">Last Name *</label>
                            <input 
                              type="text" 
                              value={formData.lastName} 
                              onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                              placeholder="Sharma" 
                              className="border border-gray-200 rounded-2xl px-5 py-3 font-nunito text-black placeholder:text-gray-400 focus:outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] transition-all bg-gray-50/50" 
                            />
                          </div>

                          {/* Email Address & WhatsApp Phone Number */}
                          <div className="flex flex-col gap-1.5">
                            <label className="font-nunito font-bold text-[13px] text-gray-700">Email Address *</label>
                            <input 
                              type="email" 
                              value={formData.email} 
                              onChange={(e) => setFormData({...formData, email: e.target.value})} 
                              placeholder="priya@example.com" 
                              className="border border-gray-200 rounded-2xl px-5 py-3 font-nunito text-black placeholder:text-gray-400 focus:outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] transition-all bg-gray-50/50" 
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="font-nunito font-bold text-[13px] text-gray-700">Phone Number *</label>
                            <input 
                              type="tel" 
                              value={formData.phone} 
                              onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                              placeholder="e.g. +91 98765 43210" 
                              className="border border-gray-200 rounded-2xl px-5 py-3 font-nunito text-black placeholder:text-gray-400 focus:outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] transition-all bg-gray-50/50" 
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="flex flex-col gap-6">
                        <div className="mb-4 text-center mt-8">
                          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                          </div>
                          <h3 className="font-georgia font-bold text-[20px] md:text-[28px] text-black mb-2">Check WhatsApp</h3>
                          <p className="font-nunito text-gray-500">We securely pinged a 6-digit code to <strong>{formData.phone}</strong>.</p>
                        </div>
                        <div className="flex flex-col gap-2 max-w-[300px] mx-auto w-full">
                          <input type="text" value={formData.otp} onChange={(e) => setFormData({...formData, otp: e.target.value})} placeholder="0 0 0 0 0 0" className="border-b-2 border-gray-300 px-5 py-4 font-bold text-center text-[28px] tracking-[1rem] text-black placeholder:text-gray-300 focus:outline-none focus:border-[#0F9393] bg-transparent" maxLength={6} />
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="flex flex-col gap-5 text-black">
                        <div className="mb-1">
                          <h3 className="font-georgia font-bold text-[20px] md:text-[28px] text-black mb-1">Additional Details</h3>
                          <p className="font-nunito text-gray-500 text-[13px] md:text-[14px]">Help us customize your clinical assignment.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[42vh] md:max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                          {/* Date of Birth & Gender Identity */}
                          <div className="flex flex-col gap-1.5">
                            <label className="font-nunito font-bold text-[13px] text-gray-700">Date of Birth *</label>
                            <input 
                              type="date" 
                              max={new Date().toISOString().split('T')[0]}
                              value={formData.dob} 
                              onChange={(e) => setFormData({...formData, dob: e.target.value})} 
                              className="border border-gray-200 rounded-2xl px-5 py-3 font-nunito text-black placeholder:text-gray-400 focus:outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] transition-all bg-gray-50/50" 
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="font-nunito font-bold text-[13px] text-gray-700">Gender Identity</label>
                            <select 
                              value={formData.gender} 
                              onChange={(e) => setFormData({...formData, gender: e.target.value})} 
                              className="border border-gray-200 rounded-2xl px-5 py-3 font-nunito text-black focus:outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] transition-all bg-gray-50/50 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%25236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1.25rem_center] bg-no-repeat pr-10"
                            >
                              <option value="">Select...</option>
                              <option value="Female">Female</option>
                              <option value="Male">Male</option>
                              <option value="Non-binary">Non-binary</option>
                              <option value="Prefer not to say">Prefer not to say</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          {/* Occupation & Relationship Status */}
                          <div className="flex flex-col gap-1.5">
                            <label className="font-nunito font-bold text-[13px] text-gray-700">Occupation</label>
                            <input 
                              type="text" 
                              value={formData.occupation} 
                              onChange={(e) => setFormData({...formData, occupation: e.target.value})} 
                              placeholder="e.g. Software engineer" 
                              className="border border-gray-200 rounded-2xl px-5 py-3 font-nunito text-black placeholder:text-gray-400 focus:outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] transition-all bg-gray-50/50" 
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="font-nunito font-bold text-[13px] text-gray-700">Relationship Status</label>
                            <select 
                              value={formData.relationshipStatus} 
                              onChange={(e) => setFormData({...formData, relationshipStatus: e.target.value})} 
                              className="border border-gray-200 rounded-2xl px-5 py-3 font-nunito text-black focus:outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] transition-all bg-gray-50/50 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%25236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1.25rem_center] bg-no-repeat pr-10"
                            >
                              <option value="">Select...</option>
                              <option value="Single">Single</option>
                              <option value="In a relationship">In a relationship</option>
                              <option value="Married">Married</option>
                              <option value="Separated">Separated</option>
                              <option value="Divorced">Divorced</option>
                              <option value="Widowed">Widowed</option>
                              <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 4 && (
                      <div className="flex flex-col gap-6 text-black">
                        <div className="mb-2">
                          <h3 className="font-georgia font-bold text-[20px] md:text-[28px] text-black mb-2">How can we help?</h3>
                          <p className="font-nunito text-gray-500 text-[13px] md:text-[14px]">Select the type of care you&apos;re looking for.</p>
                        </div>
                        <div className="flex flex-col gap-5 max-h-[50vh] md:max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Therapy Type</label>
                            <div className="flex flex-wrap gap-3">
                              {['Individual', 'Couple', 'Teenager', 'Family'].map((t) => (
                                <button key={t} type="button" onClick={() => setFormData({...formData, type: t})} className={`px-6 py-2.5 rounded-full text-[14px] font-bold border-2 ${formData.type === t ? 'bg-[#0F9393] border-[#0F9393] text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'}`}>{t}</button>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Preferred Session Format</label>
                            <div className="flex flex-wrap gap-3">
                              {['Video call', 'Phone call', 'In person'].map((format) => (
                                <button
                                  key={format}
                                  type="button"
                                  onClick={() => setFormData({...formData, preferredFormat: format})}
                                  className={`px-6 py-2.5 rounded-full text-[14px] font-bold border-2 ${
                                    formData.preferredFormat === format
                                      ? 'bg-[#0F9393] border-[#0F9393] text-white'
                                      : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
                                  }`}
                                >
                                  {format}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Age Group</label>
                            <div className="flex flex-wrap gap-3">
                              {['18-25', '26-35', '36-50', '50+'].map((a) => (
                                <button key={a} type="button" onClick={() => setFormData({...formData, age: a})} className={`px-6 py-2.5 rounded-full text-[14px] font-bold border-2 ${formData.age === a ? 'bg-[#0F9393] border-[#0F9393] text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'}`}>{a}</button>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Preferred Language</label>
                            <select 
                              value={formData.language} 
                              onChange={(e) => setFormData({...formData, language: e.target.value})} 
                              className="border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-[#0F9393] bg-white text-black font-bold"
                            >
                              <option value="" disabled>Select language</option>
                              <option value="English">English</option>
                              <option value="Hindi">Hindi</option>
                              <option value="Malayalam">Malayalam</option>
                              <option value="Tamil">Tamil</option>
                              <option value="Telugu">Telugu</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Primary Concern</label>
                            <input type="text" value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} placeholder="e.g. Anxiety, Stress, Relationships" className="border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-[#0F9393] bg-gray-50/50 text-black placeholder:text-gray-400" />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Is there anything else you&apos;d like your counsellor to know before your first session?</label>
                            <textarea
                              value={formData.additionalInfo}
                              onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})}
                              placeholder="Share any details, history, or specific requirements here..."
                              className="border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-[#0F9393] bg-gray-50/50 text-black placeholder:text-gray-400 min-h-[90px] resize-none font-nunito"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 5 && (
                      <div className="flex flex-col gap-6 h-full">
                        <div className="mb-1">
                          <h3 className="font-georgia font-bold text-[20px] md:text-[28px] text-black mb-2">Schedule Time</h3>
                          <p className="font-nunito text-gray-500">Secure your appointment block with unHeard.</p>
                        </div>
                        <div className="flex flex-col gap-4">
                           <div className="flex flex-col gap-2">
                             <label className="font-nunito font-bold text-[14px] text-gray-900 flex items-center gap-2"><Calendar size={16}/> Select Date</label>
                             <input 
                               type="date" 
                               min={new Date().toISOString().split('T')[0]} // restrict past dates
                               value={formData.scheduled_date} 
                               onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                               className="border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#0F9393] bg-gray-50/50 font-bold text-black" 
                             />
                           </div>
                           
                           <div className="flex flex-col gap-2 mt-2">
                             <label className="font-nunito font-bold text-[14px] text-gray-900 flex items-center gap-2"><Clock size={16}/> Popular Slots</label>
                             <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                               {['09:00', '10:00', '11:00', '13:00', '15:00', '16:00', '18:00', '19:00'].map((time) => {
                                 const isToday = formData.scheduled_date === new Date().toISOString().split('T')[0];
                                 const [hours, minutes] = time.split(':').map(Number);
                                 const slotDate = new Date();
                                 slotDate.setHours(hours, minutes, 0, 0);
                                 
                                 // Disable if in the past or within 30 mins from now
                                 const isDisabled = isToday && (slotDate.getTime() < Date.now() + 30 * 60 * 1000);

                                 return (
                                   <button 
                                     key={time} 
                                     disabled={isDisabled}
                                     onClick={() => setFormData({...formData, scheduled_time: time})} 
                                     className={`py-3 rounded-xl text-[14px] font-bold border-2 transition-all ${isDisabled ? 'bg-gray-50 border-gray-50 text-gray-200 cursor-not-allowed opacity-50' : (formData.scheduled_time === time ? 'bg-[#0F9393] border-[#0F9393] text-white shadow-md' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300')}`}
                                   >
                                     {time}
                                   </button>
                                 );
                               })}
                             </div>
                           </div>
                        </div>
                      </div>
                    )}

                    {step === 6 && (
                      <div className="flex flex-col gap-6 text-black">
                        <div className="mb-1">
                          <h3 className="font-georgia font-bold text-[20px] md:text-[28px] text-black mb-2">Mental Health History</h3>
                          <p className="font-nunito text-gray-500 text-[13px] md:text-[14px]">This helps us match you with a therapist aligned with your profile.</p>
                        </div>
                        <div className="flex flex-col gap-6 max-h-[42vh] md:max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                          {/* Counselling before */}
                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Have you received counselling or therapy before?</label>
                            <div className="flex gap-3">
                              {['Yes', 'No'].map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => setFormData({...formData, therapyBefore: option})}
                                  className={`px-6 py-2.5 rounded-full text-[14px] font-bold border-2 ${
                                    formData.therapyBefore === option
                                      ? 'bg-[#0F9393] border-[#0F9393] text-white'
                                      : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Diagnoses */}
                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Do you have any current or previous mental health diagnoses?</label>
                            <input
                              type="text"
                              value={formData.diagnoses}
                              onChange={(e) => setFormData({...formData, diagnoses: e.target.value})}
                              placeholder="e.g. anxiety, depression, ADHD — or leave blank if none"
                              className="border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-[#0F9393] bg-gray-50/50 text-black placeholder:text-gray-400"
                            />
                          </div>

                          {/* Medication */}
                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Are you currently taking any medication for mental health?</label>
                            <div className="flex flex-wrap gap-3">
                              {['Yes', 'No', 'Prefer not to say'].map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => setFormData({...formData, medication: option})}
                                  className={`px-6 py-2.5 rounded-full text-[14px] font-bold border-2 ${
                                    formData.medication === option
                                      ? 'bg-[#0F9393] border-[#0F9393] text-white'
                                      : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Under care of doctor/psychiatrist */}
                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Are you currently under the care of a psychiatrist or doctor for mental health?</label>
                            <div className="flex gap-3">
                              {['Yes', 'No'].map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => setFormData({...formData, underCare: option})}
                                  className={`px-6 py-2.5 rounded-full text-[14px] font-bold border-2 ${
                                    formData.underCare === option
                                      ? 'bg-[#0F9393] border-[#0F9393] text-white'
                                      : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Wellbeing rating */}
                          <div className="flex flex-col gap-2.5">
                            <label className="font-nunito font-bold text-[14px] text-gray-900 flex items-center justify-between">
                              <span>How would you rate your overall wellbeing right now? *</span>
                              {formData.wellbeing > 0 && <span className="text-[#0F9393] font-black">{formData.wellbeing}/10</span>}
                            </label>
                            <div className="flex justify-between gap-1.5 md:gap-2">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => setFormData({...formData, wellbeing: num})}
                                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full font-bold flex items-center justify-center text-[12px] md:text-[14px] border ${
                                    formData.wellbeing === num
                                      ? 'bg-[#0F9393] border-[#0F9393] text-white shadow-md'
                                      : 'bg-white border-gray-200 text-gray-700 hover:border-[#0F9393]/30'
                                  }`}
                                >
                                  {num}
                                </button>
                              ))}
                            </div>
                            <div className="flex justify-between px-1 text-[11px] font-bold text-gray-400">
                              <span>Very poor</span>
                              <span>Excellent</span>
                            </div>
                          </div>

                          {/* Stress Level rating */}
                          <div className="flex flex-col gap-2.5">
                            <label className="font-nunito font-bold text-[14px] text-gray-900 flex items-center justify-between">
                              <span>How would you rate your current stress level?</span>
                              {formData.stressLevel > 0 && <span className="text-[#0F9393] font-black">{formData.stressLevel}/10</span>}
                            </label>
                            <div className="flex justify-between gap-1.5 md:gap-2">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => setFormData({...formData, stressLevel: num})}
                                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full font-bold flex items-center justify-center text-[12px] md:text-[14px] border ${
                                    formData.stressLevel === num
                                      ? 'bg-[#0F9393] border-[#0F9393] text-white shadow-md'
                                      : 'bg-white border-gray-200 text-gray-700 hover:border-[#0F9393]/30'
                                  }`}
                                >
                                  {num}
                                </button>
                              ))}
                            </div>
                            <div className="flex justify-between px-1 text-[11px] font-bold text-gray-400">
                              <span>Very low</span>
                              <span>Very high</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 7 && (
                      <div className="flex flex-col gap-6 text-black">
                        <div className="mb-1">
                          <h3 className="font-georgia font-bold text-[20px] md:text-[28px] text-black mb-1">Safety & Consent</h3>
                          <p className="font-nunito text-gray-500 text-[13px] md:text-[14px]">These questions help us ensure your safety and provide the right support.</p>
                        </div>
                        <div className="flex flex-col gap-6 max-h-[42vh] md:max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                          {/* Harming yourself */}
                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Are you currently having any thoughts of harming yourself or ending your life? *</label>
                            <div className="flex flex-wrap gap-2.5">
                              {['No', 'Yes — sometimes', 'Yes — frequently', 'Prefer not to say'].map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => setFormData({
                                    ...formData, 
                                    harmingThoughts: option,
                                    ...(option === 'No' ? {
                                      trustedPerson: '',
                                      emergencyContactName: '',
                                      emergencyContactPhone: '',
                                      emergencyContactRelation: ''
                                    } : {})
                                  })}
                                  className={`px-4 py-2 rounded-full text-[13px] font-bold border-2 transition-all ${
                                    formData.harmingThoughts === option
                                      ? 'bg-[#0F9393] border-[#0F9393] text-white shadow-sm'
                                      : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Conditional elements if harmingThoughts is NOT 'No' and is selected */}
                          {formData.harmingThoughts !== '' && formData.harmingThoughts !== 'No' && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }} 
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-col gap-5 border-l-2 border-[#0F9393]/20 pl-4 py-1"
                            >
                              {/* Trusted person */}
                              <div className="flex flex-col gap-2">
                                <label className="font-nunito font-bold text-[14px] text-gray-900">Do you have a trusted person you can contact in a crisis? *</label>
                                <div className="flex gap-3">
                                  {['Yes', 'No', 'Not sure'].map((option) => (
                                    <button
                                      key={option}
                                      type="button"
                                      onClick={() => setFormData({...formData, trustedPerson: option})}
                                      className={`px-6 py-2 rounded-full text-[13px] font-bold border-2 transition-all ${
                                        formData.trustedPerson === option
                                          ? 'bg-[#0F9393] border-[#0F9393] text-white shadow-sm'
                                          : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                                      }`}
                                    >
                                      {option}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Emergency contact name, number, relation */}
                              <div className="flex flex-col gap-3">
                                <label className="font-nunito font-bold text-[14px] text-gray-900">Emergency Contact Details *</label>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Contact Name</span>
                                    <input
                                      type="text"
                                      value={formData.emergencyContactName}
                                      onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                                      placeholder="Name"
                                      className="border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#0F9393] bg-gray-50/50 text-black placeholder:text-gray-400"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</span>
                                    <input
                                      type="text"
                                      value={formData.emergencyContactPhone}
                                      onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                                      placeholder="Phone number"
                                      className="border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#0F9393] bg-gray-50/50 text-black placeholder:text-gray-400"
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Relationship</span>
                                  <select
                                    value={formData.emergencyContactRelation}
                                    onChange={(e) => setFormData({...formData, emergencyContactRelation: e.target.value})}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#0F9393] bg-gray-50/50 text-black font-semibold"
                                  >
                                    <option value="" disabled>Select relationship...</option>
                                    {['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Guardian', 'Other'].map((rel) => (
                                      <option key={rel} value={rel}>{rel}</option>
                                    ))}
                                  </select>
                                </div>
                                <span className="text-[11px] text-gray-400 italic mt-0.5 ml-1">Only contacted in an emergency, with your consent.</span>
                              </div>
                            </motion.div>
                          )}

                          {/* Consent & confidentiality */}
                          <div className="flex flex-col gap-4 border-t border-gray-100 pt-4">
                            <h4 className="font-georgia font-bold text-[18px] text-gray-900">Consent & Confidentiality</h4>
                            
                            <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-2xl text-[12px] md:text-[13px] text-gray-600 leading-relaxed border border-gray-100">
                              <div>
                                <span className="font-bold text-gray-900 block mb-0.5">Confidentiality</span>
                                Everything you share is kept strictly confidential. The only exceptions are where there is a serious risk of harm to yourself or others, or where disclosure is required by law.
                              </div>
                              <div className="border-t border-gray-200/50 pt-2.5">
                                <span className="font-bold text-gray-900 block mb-0.5">Data & Privacy</span>
                                Your information is stored securely and never shared with third parties without your consent. You may request access to or deletion of your data at any time.
                              </div>
                              <div className="border-t border-gray-200/50 pt-2.5">
                                <span className="font-bold text-gray-900 block mb-0.5">Cancellations</span>
                                Please give at least 24 hours notice if you need to reschedule or cancel a session.
                              </div>
                            </div>

                            {/* Terms Single Checkbox */}
                            <label className="flex items-start gap-3 cursor-pointer group mt-1">
                              <input
                                type="checkbox"
                                checked={formData.acceptTerms}
                                onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
                                className="mt-1 w-4 h-4 rounded text-[#0F9393] focus:ring-[#0F9393] border-gray-300"
                              />
                              <span className="text-[13px] font-semibold text-gray-700 leading-snug group-hover:text-black transition-colors select-none">
                                I have read and understand the confidentiality policy, consent to my information being stored securely, and confirm all information provided is accurate.
                              </span>
                            </label>

                            {/* Digital Signature */}
                            <div className="flex flex-col gap-2 mt-2">
                              <label className="font-nunito font-bold text-[14px] text-gray-900">Digital signature (full name) *</label>
                              <input
                                type="text"
                                value={formData.digitalSignature}
                                onChange={(e) => setFormData({...formData, digitalSignature: e.target.value})}
                                placeholder="Type your full name"
                                className="border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-[#0F9393] bg-gray-50/50 text-black placeholder:text-gray-400 font-semibold"
                              />
                              <span className="text-[11px] text-gray-400 ml-1">Typing your name serves as your digital signature.</span>
                            </div>

                            {/* Today's Date */}
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Today&apos;s Date</span>
                              <div className="bg-gray-100 rounded-xl px-5 py-3 text-[14px] text-gray-600 font-bold w-full select-none cursor-not-allowed">
                                {new Date().toLocaleDateString('en-GB')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 8 && (
                      <div className="flex flex-col gap-6">
                        <div className="mb-1">
                          <h3 className="font-georgia font-bold text-[20px] md:text-[28px] text-black mb-2">Select Plan</h3>
                          <p className="font-nunito text-gray-500">Choose a session type. Your first intro call is on us!</p>
                        </div>

                        {/* Plan Cards */}
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: 'Trial Session', price: currentPricing.trial, isTrial: true, available: isTrialAvailable },
                            { label: 'Single Session', price: currentPricing.single, isTrial: false, available: true },
                            { label: 'Standard Pack', price: currentPricing.standard, isTrial: false, available: true },
                            { label: 'Premium Pack', price: currentPricing.premium, isTrial: false, available: true }
                          ].map((plan, i) => {
                            const isSelected = formData.plan_type === plan.label;
                            const isDisabled = !plan.available;

                            return (
                              <div 
                                key={i} 
                                onClick={() => !isDisabled && setFormData({...formData, is_trial: plan.isTrial, plan_type: plan.label})}
                                className={`group relative border-2 ${isSelected ? 'border-[#0F9393] bg-[#0F9393]/5 transform scale-[1.02]' : 'border-gray-100'} ${isDisabled ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:border-gray-200 cursor-pointer'} rounded-3xl p-6 transition-all flex flex-col items-center justify-center text-center overflow-hidden`}
                              >
                                {plan.isTrial && plan.available && (
                                  <>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    <div className="absolute top-3 right-3 text-[#0F9393] animate-bounce">
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z"/></svg>
                                    </div>
                                  </>
                                )}
                                
                                <span className="font-nunito font-bold text-[11px] text-[#0F9393] uppercase tracking-widest mb-1">
                                  {isDisabled ? 'Intro Call (Availed)' : plan.label}
                                </span>

                                <div className="flex flex-col items-center">
                                  {isDisabled ? (
                                    <span className="font-georgia font-bold text-[24px] text-gray-400 line-through">₹75/-</span>
                                  ) : (
                                    <h4 className="font-georgia font-bold text-[32px] text-black">
                                      {plan.isTrial ? 'FREE' : `₹${plan.price}/-`}
                                    </h4>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Coupon Input */}
                        <div className="mt-4 p-5 bg-gray-50 rounded-[24px] border border-gray-100">
                          <div className="flex flex-col gap-2">
                             <label className="font-nunito font-bold text-[12px] text-gray-400 uppercase tracking-widest ml-1">Have a Coupon?</label>
                             <div className="flex gap-2">
                               <input 
                                 type="text" 
                                 value={couponCode}
                                 onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                 placeholder="ENTER CODE"
                                 className="flex-grow bg-white border border-gray-200 rounded-xl px-4 py-2.5 font-bold text-gray-900 outline-none focus:border-[#0F9393]"
                                />
                               <button className="bg-black text-white px-6 py-2.5 rounded-xl font-bold text-[13px] hover:bg-gray-800 transition-all">Apply</button>
                             </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Footer */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="min-w-[60px]">
                  {step > 1 && (
                    <button onClick={handlePrev} className="group flex items-center gap-1.5 font-nunito font-bold text-gray-400 hover:text-black transition-colors text-[13px] md:text-[14px]">
                      <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" /> Back
                    </button>
                  )}
                </div>
                
                {/* Steps text on mobile between buttons */}
                {step !== 2 && (
                  <div className="md:hidden font-nunito font-bold text-[12px] text-gray-400 uppercase tracking-wider">
                    Step {step === 1 ? 1 : step - 1}/7
                  </div>
                )}
                
                <div>
                  {step < 8 ? (
                    <button 
                      onClick={handleNext} 
                      disabled={loading || (step === 1 && !isStep1Valid) || (step === 2 && formData.otp.length !== 6) || (step === 3 && !isStep3Valid) || (step === 5 && !process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost') && (!formData.scheduled_date || !formData.scheduled_time)) || (step === 6 && !isStep5Valid) || (step === 7 && !isStep6Valid)}
                      className="bg-black text-white px-5 py-2.5 md:px-8 md:py-3.5 rounded-xl md:rounded-2xl font-nunito font-bold flex items-center gap-2 md:gap-3 shadow-lg shadow-black/10 hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-[13px] md:text-[14px]"
                    >
                      {loading ? 'Processing...' : 'Continue'}
                      <ChevronRight size={18} />
                    </button>
                  ) : (
                    <button 
                      onClick={handleBookNow} 
                      disabled={loading} 
                      className="bg-[#0F9393] text-white px-6 py-2.5 md:px-10 md:py-3.5 rounded-xl md:rounded-2xl font-nunito font-bold flex items-center gap-2 md:gap-3 shadow-lg shadow-[#0F9393]/20 hover:bg-[#0D7F7F] transition-all active:scale-95 disabled:opacity-50 text-[13px] md:text-[14px]"
                    >
                      {loading ? 'Processing...' : 'Complete'}
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* MINI VIEWER POPOVER FOR LONG PRESS */}
            <AnimatePresence>
              {previewTherapist && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col p-12 overflow-y-auto">
                  <button onClick={() => setPreviewTherapist(null)} className="absolute top-8 right-8 text-black/50 hover:text-black bg-gray-100 p-2 rounded-full"><X size={24} /></button>
                  <div className="flex items-center gap-6 mb-8">
                     <Image src={previewTherapist.avatar_url || `/assets/section_2_3.webp`} width={100} height={100} className="rounded-[24px] object-cover shadow-2xl" alt="" />
                     <div>
                       <h3 className="font-georgia text-[32px] font-bold text-black">{previewTherapist.full_name}</h3>
                       <p className="text-[#0F9393] font-bold tracking-widest uppercase text-[12px]">{previewTherapist.qualification}</p>
                     </div>
                  </div>
                  <div className="flex flex-col gap-6">
                    <p className="font-nunito text-[16px] text-gray-700 leading-relaxed italic border-l-4 border-[#0F9393]/20 pl-4">{previewTherapist.bio || 'Navigating mental clarity with evidence-based support.'}</p>
                    <div>
                       <h4 className="font-bold text-black mb-3">Specialties</h4>
                       <div className="flex flex-wrap gap-2">
                        {(previewTherapist.specialties || ['Growth', 'Anxiety']).map((s: string) => (
                           <span key={s} className="bg-gray-100 px-4 py-1.5 rounded-full text-[12px] font-bold text-gray-600">{s}</span>
                        ))}
                       </div>
                    </div>
                  </div>
                  <div className="mt-auto pt-8">
                     <button
                       onClick={() => {
                         setFormData({...formData, therapist_id: previewTherapist.user_id});
                         setPreviewTherapist(null);
                         handleNext();
                       }}
                       className="w-full bg-black text-white rounded-2xl py-4 font-bold active:scale-95 transition-all text-[16px]"
                     >
                       Select 
                     </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
      
      <AnimatedModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
      />
    </>
  );
}
