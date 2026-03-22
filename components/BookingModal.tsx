'use client';
import React, { useState } from 'react';
import Button from './ui/Button';
import { requestSession } from '@/lib/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Search } from 'lucide-react';
import Image from 'next/image';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    language: '',
    type: '',
    age: '',
    service: '',
    therapist_id: '1', // Default mock ID
    is_trial: true
  });

  const handleNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 4));
  };
  const handlePrev = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };
  
  const closeAndReset = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setDirection(1);
    }, 300);
  };

  const handleBookNow = async () => {
    setLoading(true);
    try {
      await requestSession({
        therapist_id: formData.therapist_id,
        start_time: new Date().toISOString(),
        is_trial: formData.is_trial,
        questionnaire: {
          age: formData.age,
          language: formData.language,
          type: formData.type,
          service: formData.service
        }
      });
      alert('Booking Request Sent Successfully!');
      closeAndReset();
    } catch (err: any) {
      alert(err.message || 'Failed to book');
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div 
            key={s} 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === s ? 'w-8 bg-[#0F9393]' : 'w-4 bg-gray-200'
            }`}
          />
        ))}
        <span className="ml-2 font-nunito font-bold text-[12px] text-gray-400 uppercase tracking-wider">
          Step {step < 4 ? step : 4}/4
        </span>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAndReset}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[1000px] h-full md:h-auto md:min-h-[600px] bg-white md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Left Column: Branding & Visuals (Desktop Only) */}
            <div className="hidden md:flex md:w-[40%] bg-[#111111] relative p-12 flex-col justify-between overflow-hidden">
              {/* Background Glow */}
              <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#0F9393]/20 blur-[100px] rounded-full" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#0F9393]/10 blur-[100px] rounded-full" />
              
              <div className="relative z-10">
                <img src="/assets/logo unherd white.svg" alt="unHeard" className="h-[40px] mb-12" />
                <h2 className="font-georgia text-[36px] font-bold text-white leading-tight mb-6">
                  Begin Your <br />
                  <span className="text-[#0F9393]">Journey to</span> <br />
                  Better Mental Health
                </h2>
                <p className="font-nunito text-white/70 text-[18px] leading-relaxed max-w-[280px]">
                  Take the first step towards a clearer mind and a more fulfilled life.
                </p>
              </div>

              <div className="relative z-10 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#111111] bg-gray-600 overflow-hidden">
                       <img src={`/assets/section_2_${i}.png`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <p className="font-nunito text-white/60 text-[14px]">
                  Join 1,500+ happy <br /> members at unHeard
                </p>
              </div>

              {/* Decorative elements */}
              <div className="absolute bottom-[-50px] right-[-50px] opacity-20 rotate-12">
                 <img src="/assets/landingimage.png" alt="" className="w-[400px] grayscale" />
              </div>
            </div>

            {/* Mobile Header (Mobile Only) */}
            <div className="md:hidden w-full h-[200px] bg-[#111111] relative p-8 flex flex-col justify-end overflow-hidden">
               <div className="absolute inset-0 opacity-40">
                  <img src="/assets/landingimage.png" alt="" className="w-full h-full object-cover grayscale" />
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent" />
               <button onClick={closeAndReset} className="absolute top-6 right-6 z-20 text-white/70 hover:text-white">
                 <X size={24} />
               </button>
               <div className="relative z-10">
                 <img src="/assets/logo unherd white.svg" alt="unHeard" className="h-[24px] mb-4" />
                 <h2 className="font-georgia text-[24px] font-bold text-white">Book Your Session</h2>
               </div>
            </div>

            {/* Right Column: Multi-step Form */}
            <div className="flex-grow p-8 md:p-12 flex flex-col relative bg-white">
              {/* Desktop Close Button */}
              <button onClick={closeAndReset} className="hidden md:flex absolute top-8 right-8 text-gray-400 hover:text-black transition-colors">
                <X size={28} />
              </button>

              {renderStepIndicator()}

              <div className="flex-grow relative overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step}
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    className="w-full h-full flex flex-col"
                  >
                    {/* Step 1: Basic Details */}
                    {step === 1 && (
                      <div className="flex flex-col gap-6">
                        <div className="mb-2">
                          <h3 className="font-georgia font-bold text-[28px] text-black mb-2">Basic Details</h3>
                          <p className="font-nunito text-gray-500">Tell us a bit about yourself to get started.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Good Name</label>
                            <input 
                              type="text" 
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              placeholder="e.g. John Doe" 
                              className="border border-gray-200 rounded-2xl px-5 py-3.5 font-nunito text-black focus:outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] transition-all bg-gray-50/50 placeholder:text-gray-400" 
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Email Address</label>
                            <input 
                              type="email" 
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              placeholder="e.g. john@example.com" 
                              className="border border-gray-200 rounded-2xl px-5 py-3.5 font-nunito text-black focus:outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] transition-all bg-gray-50/50 placeholder:text-gray-400" 
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Phone Number</label>
                            <input 
                              type="tel" 
                              value={formData.phone}
                              onChange={(e) => setFormData({...formData, phone: e.target.value})}
                              placeholder="e.g. +91 98765 43210" 
                              className="border border-gray-200 rounded-2xl px-5 py-3.5 font-nunito text-black focus:outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] transition-all bg-gray-50/50 placeholder:text-gray-400" 
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Preferred Language</label>
                            <input 
                              type="text" 
                              value={formData.language}
                              onChange={(e) => setFormData({...formData, language: e.target.value})}
                              placeholder="e.g. English, Hindi" 
                              className="border border-gray-200 rounded-2xl px-5 py-3.5 font-nunito text-black focus:outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] transition-all bg-gray-50/50 placeholder:text-gray-400" 
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Select Service */}
                    {step === 2 && (
                      <div className="flex flex-col gap-6">
                        <div className="mb-2">
                          <h3 className="font-georgia font-bold text-[28px] text-black mb-2">How can we help?</h3>
                          <p className="font-nunito text-gray-500">Select the type of care you're looking for.</p>
                        </div>
                        <div className="flex flex-col gap-5">
                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Therapy Type</label>
                            <div className="flex flex-wrap gap-3">
                              {['Individual', 'Couple', 'Teenager', 'Family'].map((t) => (
                                <button
                                  key={t}
                                  onClick={() => setFormData({...formData, type: t})}
                                  className={`px-6 py-2.5 rounded-full font-nunito text-[14px] font-bold border-2 transition-all ${
                                    formData.type === t 
                                      ? 'bg-[#0F9393] border-[#0F9393] text-white' 
                                      : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Age Group</label>
                            <div className="flex flex-wrap gap-3">
                              {['18-25', '26-35', '36-50', '50+'].map((a) => (
                                <button
                                  key={a}
                                  onClick={() => setFormData({...formData, age: a})}
                                  className={`px-6 py-2.5 rounded-full font-nunito text-[14px] font-bold border-2 transition-all ${
                                    formData.age === a 
                                      ? 'bg-[#0F9393] border-[#0F9393] text-white' 
                                      : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
                                  }`}
                                >
                                  {a}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Primary Concern</label>
                            <input 
                              type="text" 
                              value={formData.service}
                              onChange={(e) => setFormData({...formData, service: e.target.value})}
                              placeholder="e.g. Anxiety, Stress, Relationships" 
                              className="border border-gray-200 rounded-2xl px-5 py-3.5 font-nunito text-black focus:outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] transition-all bg-gray-50/50 placeholder:text-gray-400" 
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Select Therapist */}
                    {step === 3 && (
                      <div className="flex flex-col gap-6 h-full">
                        <div className="mb-2">
                          <h3 className="font-georgia font-bold text-[28px] text-black mb-2">Select Therapist</h3>
                          <p className="font-nunito text-gray-500">Choose a counselor you feel comfortable with.</p>
                        </div>
                        
                        <div className="relative mb-2">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input type="text" placeholder="Search by name or specialty" className="w-full border border-gray-100 bg-gray-50 rounded-2xl pl-12 pr-4 py-3 font-nunito text-black text-[14px] focus:outline-none focus:border-[#0F9393] placeholder:text-gray-400" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                          {[1,2,3,4].map((i) => (
                            <div 
                              key={i} 
                              onClick={() => setFormData({...formData, therapist_id: String(i)})}
                              className={`group border-2 ${formData.therapist_id === String(i) ? 'border-[#0F9393] bg-[#0F9393]/5' : 'border-gray-100 hover:border-gray-200'} rounded-2xl p-4 cursor-pointer transition-all duration-300`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden shrink-0">
                                   <img src={`/assets/section_2_${((i-1)%4)+1}.png`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Therapist" />
                                </div>
                                <div>
                                  <h4 className="font-georgia font-bold text-[16px] text-black leading-tight">Ashaya Rathor</h4>
                                  <span className="font-nunito text-[12px] text-gray-500">M.Sc Psychologist</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 4: Pricing Options */}
                    {step === 4 && (
                      <div className="flex flex-col gap-6">
                        <div className="mb-2">
                          <h3 className="font-georgia font-bold text-[28px] text-black mb-2">Select Plan</h3>
                          <p className="font-nunito text-gray-500">Select a payment option to confirm your booking.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: 'Trial Session', price: '399/-', isTrial: true },
                            { label: 'Single Session', price: '999/-', isTrial: false },
                            { label: 'Standard Pack', price: '2999/-', isTrial: false },
                            { label: 'Premium Pack', price: '1999/-', isTrial: false }
                          ].map((plan, i) => (
                            <div 
                              key={i} 
                              onClick={() => setFormData({...formData, is_trial: plan.isTrial})}
                              className={`border-2 ${((plan.isTrial && formData.is_trial) || (!plan.isTrial && !formData.is_trial && i === 1)) ? 'border-[#0F9393] bg-[#0F9393]/5' : 'border-gray-100 hover:border-gray-200'} rounded-2xl p-6 cursor-pointer transition-all flex flex-col items-center justify-center text-center`}
                            >
                              <span className="font-nunito font-bold text-[12px] text-[#0F9393] uppercase tracking-widest mb-1">{plan.label}</span>
                              <h4 className="font-georgia font-bold text-[32px] text-black">{plan.price}</h4>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Footer */}
              <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
                <div>
                  {step > 1 && (
                    <button 
                      onClick={handlePrev} 
                      className="group flex items-center gap-2 font-nunito font-bold text-gray-400 hover:text-black transition-colors"
                    >
                      <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                      Back
                    </button>
                  )}
                </div>
                
                <div className="flex gap-4">
                  {step < 4 ? (
                    <button 
                      onClick={handleNext} 
                      className="bg-black text-white px-8 py-3.5 rounded-2xl font-nunito font-bold flex items-center gap-3 shadow-lg shadow-black/10 hover:bg-gray-800 transition-all hover:translate-y-[-2px] active:translate-y-[0px]"
                    >
                      Continue
                      <ChevronRight size={20} />
                    </button>
                  ) : (
                    <button 
                      onClick={handleBookNow} 
                      disabled={loading} 
                      className="bg-[#0F9393] text-white px-10 py-3.5 rounded-2xl font-nunito font-bold flex items-center gap-3 shadow-lg shadow-[#0F9393]/20 hover:bg-[#0D7F7F] transition-all hover:translate-y-[-2px] active:translate-y-[0px] disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Complete Booking'}
                      <ChevronRight size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
