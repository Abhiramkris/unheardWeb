'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Award, Compass, Heart, Bookmark } from 'lucide-react';

interface TherapistProfileData {
  user_id: string;
  full_name: string;
  bio: string;
  qualification: string;
  display_hours: string;
  display_rating: string;
  specialties: string[];
  note: string;
  avatar_url: string;
  tagline?: string;
  microtag?: string;
  approach?: string;
  good_fit_for?: string[];
}

interface TherapistProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  therapist: TherapistProfileData | null;
}

export default function TherapistProfileModal({
  isOpen,
  onClose,
  therapist,
}: TherapistProfileModalProps) {
  if (!therapist) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-[980px] h-[85vh] md:h-auto md:max-h-[85vh] bg-white rounded-[24px] md:rounded-[36px] shadow-2xl overflow-hidden flex flex-col md:flex-row group/modal z-10 border border-gray-100"
          >
            {/* Global Close Button (Fixed overlay at top-right on mobile & desktop) */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-[60] bg-white/90 hover:bg-white text-gray-500 hover:text-black border border-gray-200/50 p-2 md:p-2.5 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
              aria-label="Close modal"
            >
              <X className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
            </button>

            {/* Left Column - Desktop (Image & Glassmorphic Text) */}
            <div className="hidden md:flex md:w-[40%] bg-[#111111] relative overflow-hidden flex-col justify-end shrink-0 min-h-[600px]">
              <Image
                src={therapist.avatar_url || '/assets/section_2_4.webp'}
                alt={therapist.full_name}
                fill
                sizes="(max-width: 1024px) 100vw, 400px"
                className="object-cover object-top transition-transform duration-1000 group-hover/modal:scale-105"
                priority
              />
              {/* Gradient Overlay for Image Depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35 pointer-events-none" />

              {/* Verified Badge */}
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md border border-gray-100 rounded-full px-4 py-2 flex items-center gap-2 shadow-md z-20">
                <div className="w-5 h-5 bg-[#0F9393] rounded-full flex items-center justify-center text-white font-bold text-[11px]">
                  ✓
                </div>
                <div>
                  <p className="text-[7.5px] font-black text-gray-400 uppercase tracking-widest leading-none">Verified</p>
                  <p className="text-[12px] font-bold text-black leading-none mt-0.5">Specialist</p>
                </div>
              </div>

              {/* Glassmorphic Overlay Banner at Bottom */}
              <div className="relative z-10 m-6 bg-black/65 backdrop-blur-lg border border-white/10 rounded-[20px] p-6 text-left shadow-2xl">
                <span className="bg-[#0F9393] text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {therapist.microtag || 'Mental Health Expert'}
                </span>
                <h3 className="font-georgia text-[24px] lg:text-[28px] font-bold text-white mt-2.5 leading-tight">
                  {therapist.full_name}
                </h3>
                <div className="w-8 h-[2px] bg-[#0F9393] my-3"></div>
                <p className="font-nunito text-white/90 text-[13.5px] font-semibold leading-relaxed">
                  {therapist.qualification}
                </p>
              </div>
            </div>

            {/* Right Column - detailed content with custom scrolling */}
            <div className="flex-1 p-6 md:p-10 lg:p-12 flex flex-col relative bg-white text-black overflow-y-auto min-h-0 md:max-h-[85vh]">
              <div className="flex flex-col gap-8 text-left max-w-[580px] mx-auto w-full pb-4">
                {/* Mobile Header Image - inside scrollable area (Hidden on Desktop) */}
                <div className="md:hidden w-[calc(100%+48px)] -mx-6 -mt-6 h-[260px] relative overflow-hidden shrink-0 mb-6 rounded-t-[24px]">
                  <Image
                    src={therapist.avatar_url || '/assets/section_2_4.webp'}
                    alt={therapist.full_name}
                    fill
                    sizes="100vw"
                    className="object-cover object-top"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Mobile Name & Credentials Section (Hidden on Desktop) */}
                <div className="md:hidden flex flex-col items-start gap-2 border-b border-gray-100 pb-5 mb-1">
                  <span className="bg-[#0F9393]/10 text-[#0F9393] px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {therapist.microtag || 'Mental Health Expert'}
                  </span>
                  <h2 className="font-georgia text-[28px] font-bold text-gray-900 leading-tight mt-1.5">
                    {therapist.full_name}
                  </h2>
                  <p className="font-nunito text-gray-500 text-[14.5px] font-semibold">
                    {therapist.qualification}
                  </p>
                </div>

                {/* Quote block/Tagline - Clean & Large Typography */}
                <div className="relative mt-2 md:mt-4">
                  <span className="absolute -left-4 -top-4 text-[60px] font-georgia text-[#0F9393]/20 leading-none pointer-events-none">&ldquo;</span>
                  <p className="text-[17px] md:text-[19px] font-medium text-gray-700 font-nunito italic pl-6 border-l-2 border-[#0F9393]/35 leading-relaxed">
                    {therapist.tagline || therapist.bio || "Helping you find the strength to navigate through life's most complex emotional landscapes."}
                  </p>
                </div>

                {/* Impact stats grid */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                  {[
                    { label: 'Avg Rating', val: therapist.display_rating || '5.0', extra: 'Out of 5' },
                    { label: 'Sessions', val: therapist.display_hours || '100+', extra: 'Completed' },
                    { label: 'Experience', val: '12+ Yrs', extra: 'Practice' }
                  ].map((stat, i) => (
                    <div 
                      key={i} 
                      className="bg-gray-50 border border-gray-100 rounded-[16px] md:rounded-[20px] px-1 py-3 sm:px-3 sm:py-4 md:px-4 md:py-5 flex flex-col items-center justify-between text-center shadow-sm hover:border-[#0F9393]/20 transition-all duration-300 min-h-[90px] sm:min-h-[110px] md:min-h-[120px]"
                    >
                      <p className="text-[8.5px] sm:text-[9.5px] md:text-[10px] font-black text-[#0F9393] uppercase tracking-[0.1em] sm:tracking-[0.15em] mb-1.5 leading-none">
                        {stat.label}
                      </p>
                      
                      <span className="font-georgia font-bold text-[15px] xs:text-[17px] sm:text-[20px] md:text-[23px] text-gray-900 flex items-center justify-center gap-0.5 sm:gap-1 leading-none my-auto whitespace-nowrap">
                        {i === 0 && (
                          <Star className="fill-[#0F9393] stroke-none w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 shrink-0" />
                        )}
                        {stat.val}
                      </span>
                      
                      <p className="text-[7.5px] sm:text-[8.5px] md:text-[9px] text-gray-400 font-bold font-nunito mt-1.5 uppercase tracking-wider leading-none">
                        {stat.extra}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Biography Section */}
                {therapist.bio && (
                  <div>
                    <h4 className="text-[12px] md:text-[13px] font-black text-[#0F9393] uppercase tracking-[0.2em] mb-3 flex items-center gap-2 border-b border-gray-100 pb-1.5">
                      <Award size={14} className="text-[#0F9393]" /> Biography
                    </h4>
                    <p className="text-gray-600 text-[15px] md:text-[16px] leading-relaxed font-nunito font-medium">
                      {therapist.bio}
                    </p>
                  </div>
                )}

                {/* Therapeutic Approach */}
                {therapist.approach && (
                  <div>
                    <h4 className="text-[12px] md:text-[13px] font-black text-[#0F9393] uppercase tracking-[0.2em] mb-3 flex items-center gap-2 border-b border-gray-100 pb-1.5">
                      <Compass size={14} className="text-[#0F9393]" /> Therapeutic Approach
                    </h4>
                    <p className="text-gray-600 text-[15px] md:text-[16px] leading-relaxed font-nunito font-medium">
                      {therapist.approach}
                    </p>
                  </div>
                )}

                {/* Specialties */}
                {therapist.specialties && therapist.specialties.length > 0 && (
                  <div>
                    <h4 className="text-[12px] md:text-[13px] font-black text-[#0F9393] uppercase tracking-[0.2em] mb-3 flex items-center gap-2 border-b border-gray-100 pb-1.5">
                      <Heart size={14} className="text-[#0F9393]" /> Specialties
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {therapist.specialties.map((spec, i) => (
                        <span
                          key={i}
                          className="bg-gray-50 border border-gray-100 hover:border-gray-200 text-gray-700 text-[12.5px] px-4 py-2 rounded-xl font-bold font-nunito transition-colors shadow-sm"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ideal For */}
                {therapist.good_fit_for && therapist.good_fit_for.length > 0 && (
                  <div>
                    <h4 className="text-[12px] md:text-[13px] font-black text-[#0F9393] uppercase tracking-[0.2em] mb-3 flex items-center gap-2 border-b border-gray-100 pb-1.5">
                      <Bookmark size={14} className="text-[#0F9393]" /> Ideal For
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-gray-600 text-[13.5px] md:text-[14.5px] font-bold font-nunito">
                      {therapist.good_fit_for.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50 hover:border-[#0F9393]/15 transition-all">
                          <span className="text-[#0F9393] font-bold mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Therapist's Note */}
                {therapist.note && (
                  <div className="p-5 bg-gray-50 rounded-[22px] border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#0F9393]" />
                    <h4 className="text-[10px] md:text-[11px] font-black text-[#0F9393] uppercase tracking-[0.2em] mb-2 pl-2">
                      Therapist&apos;s Note
                    </h4>
                    <p className="text-[13.5px] md:text-[14.5px] font-medium text-gray-500 font-nunito italic leading-relaxed pl-2">
                      &quot;{therapist.note}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
