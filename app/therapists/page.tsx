'use client';

import React from 'react';
import Image from 'next/image';

const TherapistCard = ({ imgUrl }: { imgUrl: string }) => {
  return (
    <div className="group relative bg-[#F7CE1A] rounded-[32px] md:rounded-[40px] overflow-hidden border-[3px] border-black p-5 md:p-6 pb-12 flex flex-col h-full w-[90vw] sm:w-full mx-auto transition-all duration-500 hover:shadow-[0_30px_80px_rgba(247,206,26,0.25)] hover:-translate-y-2">
      
      {/* Polaroid-style Framed Image */}
      <div className="relative w-full aspect-[4/5] overflow-hidden rounded-[20px] border-[3px] border-black shadow-sm">
        <Image 
          src={imgUrl} 
          alt="Therapist Profile" 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 600px"
          className="object-cover transition-transform duration-1000 group-hover:scale-105" 
        />
      </div>

    </div>
  );
};

export default function TherapistListing() {
  const staticImages = [
    '/assets/section_2_1.webp',
    '/assets/section_2_2.webp',
    '/assets/section_2_3.webp',
  ];

  return (
    <div className="relative w-full bg-[#111111] overflow-x-clip pt-48 md:pt-64 min-h-screen">
      
      <div className="relative z-10 w-full flex flex-col items-center gap-16 lg:gap-24 mb-40">

        {/* THERAPIST GRID (3 cards per row on desktop) */}
        <div className="w-[97vw] max-w-[2440px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16 min-h-[400px]">
          {staticImages.map((imgUrl, index) => (
            <TherapistCard key={index} imgUrl={imgUrl} />
          ))}
        </div>

      </div>

    </div>
  );
}
