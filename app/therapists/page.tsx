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
  const displayName = (t.full_name || 'Specialist').toUpperCase();

  return (
    <div className="group relative bg-[#F7CE1A] rounded-[32px] md:rounded-[40px] overflow-hidden border-[3px] border-black/10 hover:border-black transition-all duration-500 hover:shadow-[0_30px_80px_rgba(247,206,26,0.25)] flex flex-col h-full w-[90vw] sm:w-full mx-auto">
      
      {/* Framed Image Section (Full-cover image with yellow frame overlay) */}
      <div className="relative w-full aspect-[4/5] overflow-hidden border-b-[3px] border-black">
        <Image 
          src={t.avatar_url || '/assets/section_2_3.webp'} 
          alt={t.full_name} 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 600px"
          className="object-cover transition-transform duration-1000 group-hover:scale-105" 
        />
        {/* Yellow Frame Overlay */}
        <div className="absolute inset-0 border-[16px] border-[#F7CE1A] pointer-events-none">
          {/* Inner thin black border inside the yellow frame */}
          <div className="absolute inset-0 border-[2.5px] border-black" />
        </div>
      </div>

      {/* Content Section */}
      <div className="pt-6 pb-8 px-6 md:px-8 flex flex-col flex-grow">
        
        {/* Massive Bold Full Name (Transparent text showing the photo behind it) */}
        <h3 
          className="font-sans font-black text-[30px] md:text-[36px] leading-tight tracking-tighter uppercase mb-1 bg-cover bg-center bg-clip-text text-transparent"
          style={{ 
            backgroundImage: `url(${t.avatar_url || '/assets/section_2_3.webp'})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {displayName}
        </h3>

        {/* Qualification under the Name */}
        <p className="text-[13px] md:text-[14px] font-black text-black/60 uppercase tracking-widest leading-none mb-4">
          {t.qualification || 'Therapist'}
        </p>

        {/* Separator Line */}
        <div className="w-full h-[3px] bg-black mb-3" />

        {/* Microtag under the Line */}
        <p className="text-black font-sans font-black text-[15px] md:text-[16px] uppercase tracking-wide leading-snug mb-3">
          {t.microtag || 'Insight-Driven'}
        </p>

        {/* Bio description */}
        <p className="text-black/80 font-nunito text-[13px] md:text-[14px] font-semibold leading-relaxed line-clamp-3 mb-6">
          {t.bio || "Specializing in the identification and restructuring of repetitive mental patterns to achieve sustainable clarity."}
        </p>

        {/* Stats & Actions */}
        <div className="mt-auto flex flex-col gap-6">
          
          {/* Metadata Row */}
          <div className="flex justify-between items-center border-t-2 border-black/10 pt-4">
            <div className="flex items-center gap-1.5 text-black">
              <span className="text-[14px] font-black">✓</span>
              <span className="text-[10px] font-black uppercase tracking-wider">Verified Specialist</span>
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider bg-black/15 text-black px-3 py-1 rounded-full">
              {t.display_hours || '500+ Hrs'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link href={`/therapists/${t.user_id}`} className="flex-1">
              <button className="w-full h-[52px] border-[2.5px] border-black text-black font-black text-[13px] rounded-full hover:bg-black hover:text-[#F7CE1A] transition-all active:scale-95 duration-300">
                View Profile
              </button>
            </Link>
            <button 
              onClick={() => openBooking(t.user_id)}
              className="flex-1 h-[52px] bg-black text-[#F7CE1A] font-black text-[13px] rounded-full hover:bg-black/90 transition-all shadow-md active:scale-95 duration-300"
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

        {/* THERAPIST GRID (3 cards per row on desktop) */}
        <div className="w-[97vw] max-w-[2440px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16 min-h-[400px]">
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
