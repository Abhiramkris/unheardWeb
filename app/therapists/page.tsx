'use client';

import React from 'react';
import Image from 'next/image';

const TherapistCard = ({ imgUrl }: { imgUrl: string }) => {
  return (
    <div className="group relative bg-[#F7CE1A] rounded-[32px] md:rounded-[40px] overflow-hidden border-[3px] border-black px-3 md:px-4 pt-5 md:pt-6 pb-12 flex flex-col h-full w-[90vw] sm:w-full mx-auto transition-all duration-500 hover:shadow-[0_30px_80px_rgba(247,206,26,0.25)] hover:-translate-y-2">
      
      {/* Polaroid-style Framed Image with Graphic Overflow */}
      <div className="relative w-full aspect-[4/5] rounded-[20px] border-[3px] border-black shadow-sm mb-4">
        {/* Inner wrapper shifted up and left to overflow the outer frame */}
        <div className="absolute -top-4 -left-3 w-[calc(100%+6px)] h-[calc(100%+8px)] rounded-[16px] overflow-hidden">
          <Image 
            src={imgUrl} 
            alt="Therapist Profile" 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 600px"
            className="object-cover transition-transform duration-1000 group-hover:scale-105" 
          />
        </div>
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
