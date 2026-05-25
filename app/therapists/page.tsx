'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import TherapistProfileModal from '@/components/TherapistProfileModal';

interface Therapist {
  user_id: string;
  full_name: string;
  qualification: string;
  microtag: string;
  avatar_url: string;
  bio?: string;
  display_hours?: string;
  display_rating?: string;
  specialties?: string[];
  note?: string;
  tagline?: string;
  approach?: string;
  good_fit_for?: string[];
}

const TherapistCard = ({ therapist, index, onOpen }: { therapist: Therapist; index: number; onOpen: () => void }) => {
  const maskId = `polaroid-mask-${index}`;
  const name = therapist.full_name || 'Therapist';
  const qualification = therapist.qualification || 'Licensed Professional';
  const microtag = therapist.microtag || 'Mental Health';

  // Dynamic font scaling for the cutout name based on string length
  const getFontSize = (str: string) => {
    const len = str.length;
    if (len > 18) return '22';
    if (len > 14) return '28';
    if (len > 10) return '34';
    return '40';
  };

  const nameFontSize = getFontSize(name);

  return (
    <div 
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onOpen(); } }}
      className="group relative w-full aspect-[4/5.2] rounded-[32px] overflow-hidden border-[1.5px] border-black shadow-lg transition-all duration-500 hover:shadow-[0_30px_80px_rgba(15,147,147,0.25)] hover:-translate-y-2 max-w-[480px] mx-auto block cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#0F9393] focus:ring-offset-2 focus:ring-offset-black"
    >
      <Image 
        src={therapist.avatar_url} 
        alt={therapist.full_name} 
        fill 
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 600px"
        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
      />

      {/* 2. Inset Polaroid Frame Overlay */}
      <div className="absolute inset-1.5 sm:inset-2 md:inset-2.5 pointer-events-none select-none z-10">
        <svg 
          viewBox="0 0 400 520" 
          fill="none" 
          className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <mask id={maskId}>
              {/* White background: Accent frame will show fully */}
              <rect x="0" y="0" width="400" height="520" fill="white" rx="16" />
              
              {/* Black rectangle cutout: Transparent window showing the photo */}
              <rect x="10" y="10" width="380" height="380" fill="black" rx="8" />
            </mask>
          </defs>

          {/* Accent Frame (Masked) */}
          <rect 
            x="0" 
            y="0" 
            width="400" 
            height="520" 
            fill="#0F9393" 
            mask={`url(#${maskId})`} 
            rx="16" 
          />

          {/* Therapist Name (White text) */}
          <text 
            x="16" 
            y="430" 
            fontFamily="'Inter', 'Arial Black', system-ui, -apple-system, sans-serif" 
            fontWeight="900" 
            fontSize={nameFontSize} 
            fill="white"
            letterSpacing="-1"
          >
            {name}
          </text>

          {/* Qualifications text */}
          <text 
            x="16" 
            y="453" 
            fontFamily="'Inter', system-ui, -apple-system, sans-serif" 
            fontWeight="700" 
            fontSize={qualification.length > 25 ? "11" : "13"} 
            fill="white"
            opacity="0.9"
            letterSpacing="0.3"
          >
            {qualification}
          </text>

          {/* Divider line */}
          <line 
            x1="16" 
            y1="470" 
            x2="384" 
            y2="470" 
            stroke="white" 
            strokeWidth="1.5" 
            opacity="0.25" 
          />

          {/* Microtag text */}
          <text 
            x="16" 
            y="499" 
            fontFamily="'Inter', system-ui, -apple-system, sans-serif" 
            fontWeight="600" 
            fontSize="11" 
            fill="white"
            opacity="0.8"
            letterSpacing="0.5"
          >
            {microtag}
          </text>

          {/* 3. View Profile Button (SVG Group) - Vertically Centered & Right-Aligned */}
          <g>
            <rect 
              x="256" 
              y="479" 
              width="128" 
              height="32" 
              rx="16" 
              fill="white"
              className="transition-colors duration-300 group-hover:fill-neutral-200"
            />
            <text 
              x="320" 
              y="499" 
              fontFamily="'Inter', system-ui, -apple-system, sans-serif" 
              fontWeight="900" 
              fontSize="11" 
              fill="black" 
              textAnchor="middle"
              letterSpacing="0.4"
            >
              VIEW PROFILE
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default function TherapistListing() {
  const [supabase] = useState(() => createClient());
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fallbackTherapists: Therapist[] = [
    {
      user_id: '769132a4-be29-4569-bff9-127e05a9fe1e',
      full_name: 'Ananya Iyer',
      qualification: 'M.Sc. Clinical Psychology',
      microtag: 'Gentle Support',
      avatar_url: '/assets/section_2_1.webp',
      bio: 'Ananya is an empathetic counselor who specializes in trauma recovery, grief support, and self-esteem building. With a client-centered approach, she offers a safe space to grow.',
      display_hours: '120+',
      display_rating: '4.9',
      specialties: ['Grief Support', 'Trauma Recovery', 'Self-Esteem'],
      note: 'You are stronger than you think. Let us discover your inner light together.',
      approach: 'Client-centered, empathetic listening combined with gentle Cognitive Behavioral Therapy (CBT).',
      good_fit_for: ['Young adults navigating transitions', 'Individuals dealing with past trauma', 'Grief and loss support']
    },
    {
      user_id: '2',
      full_name: 'Vikram Seth',
      qualification: 'Ph.D. Counseling Psychology',
      microtag: 'Burnout & Stress',
      avatar_url: '/assets/section_2_2.webp',
      bio: 'Vikram has spent over a decade helping corporate professionals navigate burnout, chronic stress, and relationship conflicts. His style is goal-oriented and practical.',
      display_hours: '400+',
      display_rating: '5.0',
      specialties: ['Stress Management', 'Career Burnout', 'Relationship Conflict'],
      note: 'Growth begins at the edge of your comfort zone. Let us take the first step.',
      approach: 'Action-oriented therapy using CBT, Mindfulness, and stress reduction strategies.',
      good_fit_for: ['Professionals facing burnout', 'Couples trying to improve communication', 'High-stress lifestyle management']
    },
    {
      user_id: '3',
      full_name: 'Sarah Jenkins',
      qualification: 'M.Sc. Cognitive Science',
      microtag: 'Anxiety Specialist',
      avatar_url: '/assets/section_2_3.webp',
      bio: 'Sarah focuses on anxiety disorders, panic control, and obsessive-compulsive behaviors. She utilizes evidence-based cognitive strategies to empower her clients.',
      display_hours: '250+',
      display_rating: '4.8',
      specialties: ['Anxiety & Panic', 'OCD', 'Social Anxiety'],
      note: 'Anxiety is a wave you can learn to surf. Let us find your balance.',
      approach: 'Cognitive behavioral techniques (CBT) and Exposure Response Prevention (ERP).',
      good_fit_for: ['Individuals experiencing general anxiety', 'People dealing with panic attacks', 'Managing obsessive thoughts']
    }
  ];

  useEffect(() => {
    async function loadTherapists() {
      try {
        const { data, error } = await supabase
          .from('therapist_profiles')
          .select('*');
        
        if (error) {
          console.error('Error fetching from Supabase:', error);
          setTherapists(fallbackTherapists);
        } else if (data && data.length > 0) {
          const formatted = data.map((t, idx) => ({
            user_id: t.user_id,
            full_name: t.full_name || 'Therapist',
            qualification: t.qualification || 'Licensed Professional',
            microtag: t.microtag || 'Mental Health Expert',
            avatar_url: t.avatar_url || fallbackTherapists[idx % 3].avatar_url,
            bio: t.bio || '',
            display_hours: t.display_hours || '0+',
            display_rating: t.display_rating || '5.0',
            specialties: t.specialties || [],
            note: t.note || '',
            tagline: t.tagline || '',
            approach: t.approach || '',
            good_fit_for: t.good_fit_for || []
          }));
          setTherapists(formatted);
        } else {
          setTherapists(fallbackTherapists);
        }
      } catch (err) {
        console.error('Supabase load error:', err);
        setTherapists(fallbackTherapists);
      } finally {
        setLoading(false);
      }
    }

    loadTherapists();
  }, [supabase]);

  const handleOpenProfile = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white font-nunito text-[24px] font-bold">
        Loading Therapists...
      </div>
    );
  }

  return (
    <div className="relative w-full bg-[#111111] overflow-x-clip pt-48 md:pt-64 min-h-screen">
      
      <div className="relative z-10 w-full flex flex-col items-center gap-16 lg:gap-24 mb-40 px-4 md:px-8">

        {/* THERAPIST GRID (3 cards per row on desktop) */}
        <div className="w-full max-w-[1400px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12 min-h-[400px]">
          {therapists.map((therapist, index) => (
            <TherapistCard 
              key={therapist.user_id} 
              therapist={therapist} 
              index={index} 
              onOpen={() => handleOpenProfile(therapist)}
            />
          ))}
        </div>

      </div>

      <TherapistProfileModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTherapist(null);
        }}
        therapist={selectedTherapist as any}
      />
    </div>
  );
}
