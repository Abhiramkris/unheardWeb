'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { blogData } from '@/lib/data/landing';

const getCoverImage = (content: any[]) => {
  if (!content || !Array.isArray(content)) return '/assets/section_2_1.webp';
  for (const block of content) {
    if (block.images && Array.isArray(block.images)) {
      for (const img of block.images) {
        if (img && img.trim() !== '') return img;
      }
    }
  }
  return '/assets/section_2_1.webp';
};

const getReadTime = (content: any[]) => {
  if (!content || !Array.isArray(content)) return '3 min read';
  let wordCount = 0;
  for (const block of content) {
    if (block.value) {
      wordCount += block.value.split(/\s+/).length;
    }
  }
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
};

const renderBlock = (block: any, idx: number) => {
  switch (block.type) {
    case 'text':
      return (
        <div key={block.id || idx} className="mb-8">
          {block.heading && (
            <h4 className="text-[22px] md:text-[26px] font-bold font-georgia text-[#086B6B] mb-4">
              {block.heading}
            </h4>
          )}
          <p className="text-[17px] md:text-[19px] font-medium text-black/80 leading-relaxed font-nunito whitespace-pre-wrap">
            {block.value}
          </p>
        </div>
      );
    case 'text_image_left':
      return (
        <div key={block.id || idx} className="flex flex-col md:flex-row gap-8 mb-8 items-start">
          {block.images?.[0] && (
            <div className="w-full md:w-[45%] relative aspect-[4/3] rounded-2xl overflow-hidden shrink-0 shadow-sm border border-black/5">
              <Image src={block.images[0]} alt="" fill className="object-cover" />
            </div>
          )}
          <div className="flex-grow">
            {block.heading && (
              <h4 className="text-[22px] md:text-[26px] font-bold font-georgia text-[#086B6B] mb-4">
                {block.heading}
              </h4>
            )}
            <p className="text-[17px] md:text-[19px] font-medium text-black/80 leading-relaxed font-nunito whitespace-pre-wrap">
              {block.value}
            </p>
          </div>
        </div>
      );
    case 'text_image_right':
      return (
        <div key={block.id || idx} className="flex flex-col md:flex-row-reverse gap-8 mb-8 items-start">
          {block.images?.[0] && (
            <div className="w-full md:w-[45%] relative aspect-[4/3] rounded-2xl overflow-hidden shrink-0 shadow-sm border border-black/5">
              <Image src={block.images[0]} alt="" fill className="object-cover" />
            </div>
          )}
          <div className="flex-grow">
            {block.heading && (
              <h4 className="text-[22px] md:text-[26px] font-bold font-georgia text-[#086B6B] mb-4">
                {block.heading}
              </h4>
            )}
            <p className="text-[17px] md:text-[19px] font-medium text-black/80 leading-relaxed font-nunito whitespace-pre-wrap">
              {block.value}
            </p>
          </div>
        </div>
      );
    case 'multi_image':
      return (
        <div key={block.id || idx} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {block.images?.map((img: string, i: number) => img && (
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-black/5">
              <Image src={img} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
};

export default function BlogPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const supabase = createClient();
        const { data: dbBlog, error: fetchError } = await supabase
          .from('blogs')
          .select('*')
          .eq('slug', slug)
          .single();

        if (fetchError || !dbBlog) {
          // Check static blogs fallback
          const staticBlog = blogData.find(
            b => b.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') === slug
          );

          if (staticBlog) {
            const formatted = {
              title: staticBlog.title,
              author: staticBlog.author,
              date: staticBlog.date,
              readTime: staticBlog.readTime,
              image: staticBlog.image,
              keywords: staticBlog.keywords,
              content: [
                {
                  id: '1',
                  type: 'text',
                  heading: 'Introduction',
                  value: `This is a premium article from unHeard titled "${staticBlog.title}". Real professional clinical insights from our practitioners to decode human patterns and enable change that sustains.\n\nIn our counseling practices, we often observe individuals struggling with the weights of their inner narrative. Understanding these silent dynamics is the first step toward lasting emotional resilience.`
                },
                {
                  id: '2',
                  type: 'text_image_left',
                  heading: 'Understanding Complex Inner Narratives',
                  value: 'Every person operates within a structured network of cognitive loops. When these loops become cluttered with anxiety, overthinking, or low mood, the system starts to feel overwhelmed. By mapping out these behaviors and learning to read the signals of our mind, we can actively restructure how we perceive and respond to stress.',
                  images: [staticBlog.image]
                },
                {
                  id: '3',
                  type: 'text',
                  heading: 'Frameworks for Long-term Growth',
                  value: 'Growth is not linear. It requires deliberate work, structured journaling, therapeutic sessions, and daily focus. We believe that professional support should not just be passive listening, but active psychological work. Partnering with a licensed therapist can help unpack complex behavioral history and create custom exercises designed for your breakthrough.'
                }
              ]
            };
            preloadAssets(formatted);
          } else {
            setError(true);
            setLoading(false);
            setAssetsLoaded(true);
          }
        } else {
          // Fetch author name
          const { data: profile } = await supabase
            .from('therapist_profiles')
            .select('full_name')
            .eq('user_id', dbBlog.author_id)
            .single();

          const coverImg = getCoverImage(dbBlog.content);
          const formatted = {
            title: dbBlog.title,
            author: profile?.full_name || 'unHeard Specialist',
            date: new Date(dbBlog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            readTime: getReadTime(dbBlog.content),
            image: coverImg,
            keywords: ['Mental Health', 'Wellness'],
            content: dbBlog.content
          };
          preloadAssets(formatted);
        }
      } catch (err) {
        console.error(err);
        setError(true);
        setLoading(false);
        setAssetsLoaded(true);
      }
    };

    const preloadAssets = (blogObj: any) => {
      setBlog(blogObj);
      setLoading(false);

      // Collect all image URLs to preload
      const imageUrls: string[] = [];
      if (blogObj.image) {
        imageUrls.push(blogObj.image);
      }
      if (blogObj.content && Array.isArray(blogObj.content)) {
        blogObj.content.forEach((block: any) => {
          if (block.images && Array.isArray(block.images)) {
            block.images.forEach((img: string) => {
              if (img && img.trim() !== '') {
                imageUrls.push(img);
              }
            });
          }
        });
      }

      // Filter out duplicate or empty URLs
      const uniqueImages = Array.from(new Set(imageUrls.filter(Boolean)));

      if (uniqueImages.length === 0) {
        setAssetsLoaded(true);
        return;
      }

      let loadedCount = 0;
      let timeoutId: NodeJS.Timeout;

      // Safety timeout: 6 seconds max waiting for asset loading
      timeoutId = setTimeout(() => {
        setAssetsLoaded(true);
      }, 6000);

      uniqueImages.forEach((url) => {
        const img = new window.Image();
        img.src = url;
        const handleImageLoad = () => {
          loadedCount++;
          if (loadedCount === uniqueImages.length) {
            clearTimeout(timeoutId);
            setAssetsLoaded(true);
          }
        };

        img.onload = handleImageLoad;
        img.onerror = handleImageLoad; // treat errors as loaded to not block user
      });
    };

    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-black font-nunito gap-6">
        <h1 className="text-[32px] font-bold font-georgia text-black">Article not found</h1>
        <Link href="/">
          <button className="bg-black text-white font-nunito font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-800 transition-colors">
            Go Home
          </button>
        </Link>
      </div>
    );
  }

  if (loading || !assetsLoaded) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center text-black font-nunito gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-[#0F9393]/10"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#0F9393] border-t-transparent animate-spin"></div>
        </div>
        <p className="text-[18px] md:text-[20px] font-bold tracking-wide animate-pulse text-[#0F9393]">
          Loading article assets...
        </p>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-white text-black font-nunito flex flex-col items-center pb-[8vh] pt-[140px] md:pt-[180px] overflow-x-hidden w-full">
      <div className="w-full max-w-[800px] px-6 md:px-8 flex flex-col">
        
        {/* Back Navigation */}
        <Link href="/" className="self-start group flex items-center gap-2 text-black/55 hover:text-black transition-colors font-nunito font-bold text-[14px] uppercase tracking-wider mb-8">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1"><path d="m15 18-6-6 6-6"/></svg>
          Back to Home
        </Link>

        {/* Cover Image Banner */}
        {blog.image && (
          <div className="relative w-full aspect-[21/10] md:aspect-[21/9] rounded-2xl overflow-hidden mb-10 shadow-sm border border-black/5">
            <Image src={blog.image} alt={blog.title} fill className="object-cover" priority />
          </div>
        )}

        {/* Keywords */}
        <div className="flex flex-wrap gap-2 mb-6">
          {blog.keywords?.map((kw: string, i: number) => (
            <span key={i} className="bg-[#0F9393]/10 text-[#0F9393] text-[10px] px-4 py-1.5 rounded-full font-bold uppercase tracking-widest">
              {kw}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="font-georgia text-[36px] md:text-[52px] lg:text-[60px] font-bold leading-tight text-black tracking-tight mb-8">
          {blog.title}
        </h1>

        {/* Author details */}
        <div className="flex items-center gap-4 py-6 border-y border-black/5 mb-12">
          <div className="w-12 h-12 rounded-full bg-[#0F9393] text-white flex items-center justify-center font-bold text-[18px]">
            {blog.author?.[0]?.toUpperCase()}
          </div>
          <div className="text-left">
            <p className="font-nunito font-bold text-[16px] text-black">{blog.author}</p>
            <p className="font-nunito font-bold text-[13px] text-black/40">{blog.date} • {blog.readTime}</p>
          </div>
        </div>

        {/* Content body rendering */}
        <div className="prose max-w-none text-left">
          {blog.content?.map((block: any, idx: number) => renderBlock(block, idx))}
        </div>

      </div>
    </main>
  );
}
