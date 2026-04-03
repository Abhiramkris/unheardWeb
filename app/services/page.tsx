'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useBooking } from '@/components/BookingContext';

export default function ServicesPage() {
  const { openBookingModal } = useBooking();
  
  // SECTION PINNING REFS
  const card1Ref = useRef<HTMLElement>(null);
  const target1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLElement>(null);
  const target2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLElement>(null);
  const target3Ref = useRef<HTMLDivElement>(null);
  const card4Ref = useRef<HTMLElement>(null);
  const target4Ref = useRef<HTMLDivElement>(null);
  const card5Ref = useRef<HTMLElement>(null);
  const target5Ref = useRef<HTMLDivElement>(null);

  // STICKY TOP OFFSETS
  const [stickyTop1, setStickyTop1] = useState(0);
  const [stickyTop2, setStickyTop2] = useState(0);
  const [stickyTop3, setStickyTop3] = useState(0);
  const [stickyTop4, setStickyTop4] = useState(0);
  const [stickyTop5, setStickyTop5] = useState(0);

  useEffect(() => {
    const calculatePinOffset = () => {
      const getOffset = (card: HTMLElement | null, target: HTMLElement | null) => {
        if (!card || !target) return 0;
        
        // Calculate vertical distance from card top to target's center using offsetTop loop
        let targetCenterOffset = target.offsetHeight / 2;
        let curr: HTMLElement | null = target;
        while (curr && curr !== card) {
          targetCenterOffset += curr.offsetTop;
          const parent = curr.offsetParent as HTMLElement;
          if (!parent) break;
          curr = parent;
        }

        // Pin when the target reaches ~45% of the viewport height for a modern look
        const targetViewportY = window.innerHeight * 0.45;

        // Allow positive offsets to ensure pinning happens at the viewport center
        return targetViewportY - targetCenterOffset;
      };

      setStickyTop1(getOffset(card1Ref.current, target1Ref.current));
      setStickyTop2(getOffset(card2Ref.current, target2Ref.current));
      setStickyTop3(getOffset(card3Ref.current, target3Ref.current));
      setStickyTop4(getOffset(card4Ref.current, target4Ref.current));
      setStickyTop5(getOffset(card5Ref.current, target5Ref.current));
    };

    let resizeTimer: NodeJS.Timeout;
    const debouncedCalculate = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(calculatePinOffset, 150);
    };

    calculatePinOffset();
    
    // Multiple passes for layout stability (handling font loads/images)
    const timers = [
      setTimeout(calculatePinOffset, 100),
      setTimeout(calculatePinOffset, 500),
      setTimeout(calculatePinOffset, 2000)
    ];

    window.addEventListener('resize', debouncedCalculate);
    window.addEventListener('popstate', calculatePinOffset);
    
    return () => {
      window.removeEventListener('resize', debouncedCalculate);
      window.removeEventListener('popstate', calculatePinOffset);
      timers.forEach(clearTimeout);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <div className="relative w-full bg-[#111111] overflow-x-clip pb-[40vh]">
      
      {/* Invisible Navbar Spacer */}
      <div className="h-[110px] md:h-[135px] w-full shrink-0" />
      
      {/* 
        SECTION 1: INDIVIDUAL PSYCHOLOGICAL WORK (White Card)
      */}
      <section 
        ref={card1Ref}
        className="sticky z-10 w-full flex flex-col items-center pt-10 md:pt-20 lg:pt-28"
        style={{ top: `${stickyTop1}px` }}
      >
        <div className="relative w-full md:w-[95vw] lg:w-[90vw] max-w-[1400px] bg-[#FEFEFC] rounded-[40px] md:rounded-[60px] shadow-2xl overflow-hidden min-h-[140vh] flex flex-col items-center pt-24 md:pt-32 pb-20 px-6 md:px-12 lg:px-24">
          
          <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] bg-[#0F9393]/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 w-full flex flex-col items-center text-center gap-12 lg:gap-20">
            <div className="flex flex-col gap-6 items-center">
              <span className="text-[#0F9393] font-bold uppercase tracking-[0.2em] text-[14px] md:text-[16px]">PILLAR 01</span>
              <h1 className="text-[36px] md:text-[60px] lg:text-[80px] font-bold font-georgia text-black leading-[1.05] tracking-tight max-w-[1000px]">
                Individual <br />
                <span className="text-[#0F9393]">Psychological Work.</span>
              </h1>
              <p className="font-nunito font-bold text-[20px] md:text-[26px] text-gray-500 max-w-[800px] leading-relaxed">
                Strategic awareness and emotional restructuring for the modern individual functioning in a complex world.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8">
              {[
                { title: 'Personal Expansion', desc: 'Decoding internal narratives that limit your potential and response loops.' },
                { title: 'Emotional Resilience', desc: 'Building the core psychological strength to navigate high-stakes reality.' },
                { title: 'Clarity & Alignment', desc: 'Syncing your internal identity with your external actions and ambitions.' }
              ].map((item, i) => (
                <div key={i} className="p-10 rounded-[40px] bg-black/5 border border-black/5 flex flex-col items-center text-center gap-6 group hover:bg-white hover:shadow-xl transition-all h-full">
                  <h3 className="text-[22px] md:text-[26px] font-bold font-georgia text-black">{item.title}</h3>
                  <div className="h-[2px] w-12 bg-[#0F9393]/20 group-hover:w-20 transition-all"></div>
                  <p className="text-[16px] md:text-[19px] font-bold text-gray-400 font-nunito leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div ref={target1Ref} className="mt-12">
               <Button variant="black" className="px-20 h-[72px] rounded-full text-[20px] font-bold shadow-2xl transition-transform hover:scale-105" onClick={openBookingModal}>Consult for Individuals</Button>
            </div>
          </div>
          <div className="h-[800px] w-full" />
        </div>
      </section>

      {/* 
        SECTION 2: RELATIONSHIP & COUPLE DYNAMICS (Black Card)
      */}
      <section 
        ref={card2Ref}
        className="sticky z-20 w-full flex flex-col items-center mt-[-25vh] md:-mt-[60vh] pt-[100px] md:pt-[200px]"
        style={{ top: `${stickyTop2}px` }}
      >
        <div className="relative w-full md:w-[95vw] lg:w-[90vw] max-w-[1440px] bg-[#171612] rounded-[40px] md:rounded-[60px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden min-h-[140vh] flex flex-col items-center pt-32 pb-40 px-6 md:px-12 lg:px-24">
          
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#0F9393]/5 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 w-full flex flex-col items-center text-center gap-16 md:gap-24">
            <div className="flex flex-col gap-6 items-center">
              <span className="text-[#0F9393] font-bold uppercase tracking-[0.25em] text-[14px]">PILLAR 02</span>
              <h2 className="text-[36px] md:text-[60px] lg:text-[72px] font-bold font-georgia text-white leading-tight tracking-tight">
                Relationship & <br />
                <span className="text-[#0F9393]">Couple Dynamics.</span>
              </h2>
              <p className="text-gray-400 font-bold text-[18px] md:text-[24px] font-nunito leading-relaxed max-w-[800px]">
                Restructuring the silent patterns that govern partnership, intimacy, and shared reality.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
               <div className="p-12 rounded-[50px] bg-white/5 border border-white/5 flex flex-col items-center text-center gap-8 group hover:bg-[#0F9393]/10 transition-all">
                  <h3 className="text-[26px] md:text-[32px] font-bold text-[#0F9393] font-georgia">Pattern Decoding</h3>
                  <p className="text-[17px] md:text-[20px] text-gray-400 font-bold font-nunito leading-relaxed max-w-[400px]">We identify the repetitive emotional loops that create friction and disconnect in shared spaces.</p>
               </div>
               <div className="p-12 rounded-[50px] bg-white/5 border border-white/5 flex flex-col items-center text-center gap-8 group hover:bg-white/10 transition-all">
                  <h3 className="text-[26px] md:text-[32px] font-bold text-white font-georgia">Shared Alignment</h3>
                  <p className="text-[17px] md:text-[20px] text-gray-400 font-bold font-nunito leading-relaxed max-w-[400px]">Building a new system of communication that prioritizes clarity over comfort and alignment over avoidance.</p>
               </div>
            </div>

            <div className="bg-[#111111]/80 backdrop-blur-xl p-10 md:p-16 rounded-[40px] border border-white/5 w-full flex flex-col md:flex-row items-center justify-between gap-12 mt-8">
               <div className="flex flex-col gap-4 text-center md:text-left">
                  <h4 className="text-white font-bold text-[24px] md:text-[32px] font-georgia">Beyond Conversation.</h4>
                  <p className="text-gray-400 font-bold font-nunito text-[16px] md:text-[19px] max-w-[500px]">Our approach to relationships is analytical and solution-focused, designed for long-term psychological sync.</p>
               </div>
               <Button ref={target2Ref} variant="black" className="bg-white text-black hover:bg-gray-100 rounded-full px-16 h-[72px] font-bold text-[20px] shrink-0 shadow-2xl transition-all hover:scale-105" onClick={openBookingModal}>Optimize Relationship</Button>
            </div>
          </div>
          <div className="h-[800px] w-full" />
        </div>
      </section>

      {/* 
        SECTION 3: ADOLESCENT DEVELOPMENT SUPPORT (Off-white Card)
      */}
      <section 
        ref={card3Ref}
        className="sticky z-30 w-full flex flex-col items-center mt-[-25vh] md:-mt-[60vh] pt-[100px] md:pt-[200px]"
        style={{ top: `${stickyTop3}px` }}
      >
        <div className="relative w-full md:w-[95vw] lg:w-[90vw] max-w-[1440px] bg-[#FEFEFC] rounded-[40px] md:rounded-[60px] shadow-[0_[-40px]_100px_rgba(0,0,0,0.2)] overflow-hidden min-h-[140vh] flex flex-col items-center pt-32 pb-40 px-6 md:px-12 lg:px-24">
          
          <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-[#0F9393]/5 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 w-full flex flex-col items-center text-center gap-16 md:gap-24">
            <div className="flex flex-col gap-6 items-center">
              <span className="text-[#0F9393] font-bold uppercase tracking-[0.25em] text-[14px]">PILLAR 03</span>
              <h2 className="text-[36px] md:text-[60px] lg:text-[72px] font-bold font-georgia text-black leading-tight tracking-tight">
                Adolescent <br className="hidden md:block" />
                <span className="text-[#0F9393]">Development Support.</span>
              </h2>
              <p className="text-gray-500 font-bold text-[18px] md:text-[24px] font-nunito leading-relaxed max-w-[850px]">
                Providing a structured framework for identity formation, emotional regulation, and transitional clarity during the critical years.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
               {['Identity Mapping', 'Impulse Management', 'Social Navigation', 'Academic Flow'].map((title, i) => (
                 <div key={i} className="p-8 pb-12 rounded-[40px] bg-black/5 border border-black/5 flex flex-col items-center gap-6 group hover:bg-[#0F9393]/5 transition-all">
                    <div className="w-12 h-12 rounded-full bg-[#0F9393]/10 flex items-center justify-center text-[#0F9393] font-black">{i+1}</div>
                    <h3 className="text-[20px] font-bold text-black font-georgia">{title}</h3>
                 </div>
               ))}
            </div>

            <div className="mt-10 flex flex-col items-center gap-10">
               <p className="text-[20px] md:text-[28px] font-extrabold text-[#0F9393] leading-relaxed italic max-w-[900px]">
                 "Support that respects the adolescent's evolving agency while providing the tools for structural well-being."
               </p>
               <Button ref={target3Ref} variant="black" className="px-16 h-[72px] rounded-full text-[20px] font-bold shadow-2xl transition-transform hover:scale-105" onClick={openBookingModal}>Support Your Child</Button>
            </div>
          </div>
          <div className="h-[800px] w-full" />
        </div>
      </section>

      {/* 
        SECTION 4: INSTITUTIONAL PROGRAMS (Schools & Colleges) (Grey Card)
      */}
      <section 
        ref={card4Ref}
        className="sticky z-40 w-full flex flex-col items-center mt-[-25vh] md:-mt-[60vh] pt-[100px] md:pt-[200px]"
        style={{ top: `${stickyTop4}px` }}
      >
        <div className="relative w-full md:w-[95vw] lg:w-[90vw] max-w-[1440px] bg-[#1a1a1a] rounded-[40px] md:rounded-[60px] shadow-[0_[-40px]_100px_rgba(0,0,0,0.4)] overflow-hidden min-h-[140vh] flex flex-col items-center pt-32 pb-40 px-6 md:px-12 lg:px-24 text-white">
          
          <div className="absolute center-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-[150px] pointer-events-none"></div>

          <div className="relative z-10 w-full flex flex-col items-center text-center gap-16 md:gap-24">
            <div className="flex flex-col gap-6 items-center">
              <span className="text-[#0F9393] font-bold uppercase tracking-[0.25em] text-[14px]">PILLAR 04</span>
              <h2 className="text-[36px] md:text-[60px] lg:text-[72px] font-bold font-georgia text-white leading-tight tracking-tight">
                Institutional <br className="hidden md:block" />
                <span className="text-[#0F9393]">Programs.</span>
              </h2>
              <p className="text-gray-400 font-bold text-[18px] md:text-[24px] font-nunito leading-relaxed max-w-[850px]">
                Designing psychological safety and mental health frameworks for large-scale educational systems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-[1100px]">
               <div className="bg-white/5 p-12 rounded-[50px] border border-white/10 text-left flex flex-col gap-8 transition-all hover:bg-white/10">
                  <h3 className="text-[28px] md:text-[34px] font-bold font-georgia text-[#0F9393]">For Schools</h3>
                  <p className="text-gray-400 font-bold text-[16px] md:text-[19px] leading-relaxed">Integrated student counseling, teacher sensitization programs, and parent psychological workshops.</p>
               </div>
               <div className="bg-white/5 p-12 rounded-[50px] border border-white/10 text-left flex flex-col gap-8 transition-all hover:bg-white/10">
                  <h3 className="text-[28px] md:text-[34px] font-bold font-georgia text-white">For Universities</h3>
                  <p className="text-gray-400 font-bold text-[16px] md:text-[19px] leading-relaxed">High-performance mental coaching, peer-support networks, and crisis management protocols.</p>
               </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-8">
               <p className="text-[#0F9393] font-black uppercase tracking-[0.4em] text-[14px]">Transforming the system from within.</p>
               <Button ref={target4Ref} variant="black" className="bg-white text-black hover:bg-gray-100 rounded-full px-16 h-[72px] font-bold text-[20px] transition-all hover:scale-105" onClick={openBookingModal}>Partner with unHeard.</Button>
            </div>
          </div>
          <div className="h-[800px] w-full" />
        </div>
      </section>

      {/* 
        SECTION 5: CORPORATE MENTAL PERFORMANCE (Pure White/Teal Card)
      */}
      <section 
        ref={card5Ref}
        className="sticky z-50 w-full flex flex-col items-center mt-[-25vh] md:-mt-[60vh] pt-[100px] md:pt-[200px]"
        style={{ top: `${stickyTop5}px` }}
      >
        <div className="relative w-full md:w-[95vw] lg:w-[90vw] max-w-[1440px] bg-white rounded-[40px] md:rounded-[60px] shadow-[0_[-60px]_120px_rgba(0,0,0,0.3)] overflow-hidden min-h-[140vh] flex flex-col items-center pt-32 pb-40 px-6 md:px-12 lg:px-24">
          
          <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-[#0F9393]/10 to-transparent"></div>

          <div className="relative z-10 w-full flex flex-col items-center text-center gap-16 md:gap-24">
            <div className="flex flex-col gap-6 items-center">
              <span className="text-[#0F9393] font-bold uppercase tracking-[0.25em] text-[14px]">PILLAR 05</span>
              <h2 className="text-[36px] md:text-[60px] lg:text-[76px] font-bold font-georgia text-black leading-tight tracking-tight">
                Corporate Mental <br className="hidden md:block" />
                <span className="text-[#0F9393]">Performance.</span>
              </h2>
              <p className="text-gray-500 font-bold text-[18px] md:text-[24px] font-nunito leading-relaxed max-w-[850px]">
                Psychological clarity for high-performing organizations. From leadership awareness to cultural restructuring.
              </p>
            </div>

            <div className="w-full flex flex-col gap-16">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                  <div className="flex flex-col gap-6 p-10 bg-black/5 rounded-[40px] border border-black/5 group hover:bg-[#0F9393] transition-all duration-500">
                     <h3 className="text-[24px] font-bold text-black font-georgia group-hover:text-white transition-colors">Executive Coaching</h3>
                     <p className="text-gray-500 font-bold group-hover:text-white/80 transition-colors">Decoding behavioral blocks and decision patterns for leaders at the peak.</p>
                  </div>
                  <div className="flex flex-col gap-6 p-10 bg-black/5 rounded-[40px] border border-black/5 group hover:bg-black transition-all duration-500">
                     <h3 className="text-[24px] font-bold text-black font-georgia group-hover:text-[#0F9393] transition-colors">Culture Transformation</h3>
                     <p className="text-gray-500 font-bold group-hover:text-white/60 transition-colors">Building structural safety that enables creative friction and sustainable growth.</p>
                  </div>
               </div>

               <div className="flex flex-col items-center gap-12 mt-10">
                  <div className="flex flex-col items-center gap-6">
                    <h3 className="text-[32px] md:text-[56px] font-bold font-georgia text-black tracking-tight">Operational Clarity.</h3>
                    <p className="text-gray-500 font-bold text-[18px] md:text-[24px] font-nunito italic text-center">Unleash the cognitive potential of your organization.</p>
                  </div>
                  
                  <div ref={target5Ref} className="flex flex-col md:flex-row items-center gap-8">
                    <Button variant="black" className="px-20 h-[80px] rounded-full text-[24px] font-extrabold shadow-2xl hover:scale-105 active:scale-95 transition-all" onClick={openBookingModal}>Book for Organization</Button>
                    <Link href="/contact">
                      <button className="h-[80px] px-12 rounded-full border-[3px] border-black text-black font-black text-[22px] hover:bg-black hover:text-white transition-all text-center">Contact Sales</button>
                    </Link>
                  </div>
               </div>
            </div>

            <div className="mt-16 flex items-center gap-6 opacity-40 grayscale">
              <div className="h-[2px] w-16 bg-black"></div>
              <p className="text-black font-black uppercase tracking-[0.5em] text-[16px]">unHeard.</p>
              <div className="h-[2px] w-16 bg-black"></div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER SPACER */}
      <div className="h-[200px] w-full" />
    </div>
  );
}
