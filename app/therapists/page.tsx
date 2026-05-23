'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useBooking } from '@/components/BookingContext';

// ----------------------------------------------------------------------
// THERAPIST CARD COMPONENT (INDUSTRIAL PREMIUM DESIGN)
// ----------------------------------------------------------------------
const TherapistCard = ({ t, openBooking }: { t: any, openBooking: (id: string) => void }) => {
  return (
    <div className="group relative bg-[#171612] rounded-[40px] overflow-hidden border border-white/5 hover:border-[#0F9393]/30 transition-all duration-700 hover:shadow-[0_40px_100px_rgba(0,0,0,0.6)] flex flex-col h-full w-[90vw] sm:w-full mx-auto">
      
      {/* Visual Anchor: Image with Organic Shape or Mask */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image 
          src={t.avatar_url || '/assets/section_2_3.webp'} 
          alt={t.full_name} 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 600px"
          className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
        />
        
        {/* Architectural Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#171612] via-transparent to-transparent" />
        <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
           <div className="bg-[#0F9393] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
              Verified Expert
           </div>
        </div>

        {/* Name & Title Overlay */}
        <div className="absolute bottom-4 left-6 right-6 md:bottom-5 md:left-8 md:right-8 z-10 transition-transform duration-500">
          <h3 className="font-georgia font-bold text-[28px] md:text-[32px] text-white leading-tight tracking-tight mb-1">
            {t.full_name}
          </h3>
          <span className="text-[12px] font-black text-[#0F9393] uppercase tracking-[0.25em] font-nunito">
            {t.qualification || 'Therapist'}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="pt-5 pb-8 px-6 md:pt-6 md:pb-10 md:px-8 flex flex-col flex-grow gap-6">
        
        <div className="flex flex-col gap-4">
          {/* Minimalist Expertise Badges */}
          <div className="flex flex-wrap gap-2">
            {((t.specialties && t.specialties.length > 0) ? t.specialties : ['Anxiety', 'Growth', 'Stress']).slice(0, 3).map((kw: string, i: number) => (
              <span key={i} className="bg-white/5 text-white/60 text-[10px] px-4 py-1.5 rounded-full font-bold uppercase tracking-wider border border-white/5">
                {kw}
              </span>
            ))}
          </div>

          <p className="text-gray-400 font-nunito text-[15px] leading-relaxed line-clamp-3 opacity-80 group-hover:opacity-100 transition-opacity">
            {t.bio || "Specializing in the identification and restructuring of repetitive mental patterns to achieve sustainable clarity."}
          </p>
        </div>

        {/* Stats & Actions */}
        <div className="mt-auto flex flex-col gap-6">
          <div className="flex justify-between items-center border-t border-white/5 pt-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] leading-none">Perspective</span>
              <span className="text-[16px] font-bold text-white font-georgia italic">{t.microtag || t.perspective || 'Insight-Driven'}</span>
            </div>
            <div className="text-right flex flex-col gap-1">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] leading-none">Impact</span>
              <span className="text-[18px] font-bold text-[#0F9393] font-georgia leading-none">{t.display_hours || '500+'} <span className="text-[12px] font-bold text-white/30">Hrs</span></span>
            </div>
          </div>

          {/* Buttons: Sleek Industrial Design */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/therapists/${t.user_id}`} className="flex-1">
              <button className="w-full h-[56px] border border-white/20 text-white rounded-full font-bold text-[14px] hover:bg-white hover:text-black transition-all active:scale-95">
                View Profile
              </button>
            </Link>
            <button 
              onClick={() => openBooking(t.user_id)}
              className="flex-1 h-[56px] bg-[#0F9393] text-white rounded-full font-bold text-[14px] hover:bg-[#0F9393]/80 transition-all shadow-xl shadow-[#0F9393]/10 active:scale-95"
            >
              Book Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TherapistListing() {
  const { openBookingModal } = useBooking();
  const [supabase] = useState(() => createClient());
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function getTherapists() {
      const { data } = await supabase
        .from('therapist_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setTherapists(data);
      }
      setLoading(false);
    }
    getTherapists();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white font-nunito text-[24px] font-bold">
        Discovering Experts...
      </div>
    );
  }

  return (
    <div className="relative w-full bg-[#111111] overflow-x-clip pt-48 md:pt-64">
      
      <div className="relative z-10 w-full flex flex-col items-center gap-16 lg:gap-24 mb-40">

        {/* THERAPIST GRID */}
        <div className="w-[97vw] max-w-[2440px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 lg:gap-16 min-h-[400px]">
          {therapists.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-40 text-gray-500 gap-8 bg-white/5 rounded-[60px] border border-white/5">
               <span className="text-[80px] opacity-20">📭</span>
               <div className="flex flex-col items-center gap-4">
                 <p className="italic text-[24px] font-georgia text-white/60">No counselors available.</p>
               </div>
            </div>
          ) : (
            therapists.map((t) => (
              <TherapistCard key={t.id} t={t} openBooking={(id) => openBookingModal({ therapist_id: id })} />
            ))
          )}
        </div>

      </div>

    </div>
  );
}
