'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Button from '@/components/ui/Button'
import { Plus, ArrowLeft, Bell, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { adminUpdateTherapistProfile } from '@/lib/actions'
import { motion } from 'framer-motion'

export default function SuperAdminEditTherapist() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [supabase] = useState(() => createClient())
  
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [expertiseInput, setExpertiseInput] = useState('')
  const [fitInput, setFitInput] = useState('')

  // Custom Inline Toast State Engine
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([])
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  useEffect(() => {
    async function loadProfile() {
      if (!id) return
      setFetchLoading(true)
      try {
        const { data, error } = await supabase
          .from('therapist_profiles')
          .select('*')
          .eq('user_id', id)
          .single()
        
        if (error) throw error
        setProfile(data)
      } catch (err: any) {
        showToast('Error fetching therapist profile: ' + err.message, 'error')
        setTimeout(() => router.push('/super-admin'), 2000)
      } finally {
        setFetchLoading(false)
      }
    }
    loadProfile()
  }, [id, supabase, router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${id}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('therapist-assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('therapist-assets')
        .getPublicUrl(filePath)

      setProfile({ ...profile, avatar_url: publicUrl })
      showToast('Avatar uploaded successfully!')
    } catch (error: any) {
      showToast('Error uploading image: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const updatePayload = {
        full_name: profile.full_name,
        bio: profile.bio,
        qualification: profile.qualification,
        display_hours: profile.display_hours,
        phone: profile.phone,
        note: profile.note,
        tagline: profile.note, // Keep note and tagline in sync
        microtag: profile.microtag,
        approach: profile.approach,
        specialties: profile.specialties || [],
        good_fit_for: profile.good_fit_for || [],
        avatar_url: profile.avatar_url,
        is_available: profile.is_available ?? true,
        qualification_desc: profile.qualification_desc || 'clinical'
      }
      
      await adminUpdateTherapistProfile(id, updatePayload)
      showToast('Profile updated successfully!')
      setTimeout(() => router.push('/super-admin'), 1500)
    } catch (error: any) {
      showToast('Error updating profile: ' + error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center gap-4 text-black">
        <div className="w-8 h-8 border-2 border-[#0F9393] border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-[14px]">Loading Profile Data...</p>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-12 px-4 md:px-8 text-black relative">
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[500] flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`p-4 rounded shadow-lg border text-xs font-bold uppercase tracking-wider flex items-center gap-2 bg-white animate-in slide-in-from-top-4 duration-200 pointer-events-auto ${t.type === 'error' ? 'border-red-200 text-red-600' : 'border-gray-200 text-slate-800'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${t.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`} />
            {t.message}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-20">
        
        {/* iOS-Style Floating Header */}
        <div className="flex justify-between items-center bg-white p-6 md:p-8 rounded-lg border border-gray-200 sticky top-4 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/super-admin')} 
              className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded flex items-center justify-center text-gray-900 border border-gray-200 transition-colors cursor-pointer"
              type="button"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-[20px] font-bold text-gray-900">Edit Therapist Profile</h2>
              <p className="text-[11px] text-[#0F9393] font-bold uppercase tracking-widest mt-0.5">Admin Control Panel</p>
            </div>
          </div>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="px-8 py-3 bg-[#0F9393] hover:bg-[#0c7f7f] text-white font-bold text-[13px] rounded uppercase tracking-wider transition-all cursor-pointer"
          >
            {loading ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

        <form onSubmit={handlePublish} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8-col): Identification & Clinical Presence */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Identification Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col gap-6">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block border-b pb-2">Identification</span>

              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded bg-gray-150 border border-gray-300 flex items-center justify-center overflow-hidden relative group cursor-pointer"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Image
                    src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name?.trim() || 'Therapist')}&background=0F9393&color=fff`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover group-hover:opacity-50 transition-opacity"
                    alt="Avatar"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={16} className="text-[#0F9393]" />
                  </div>
                  <input 
                    id="avatar-upload"
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={loading}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-slate-800">{loading ? 'Uploading...' : 'Profile Photo'}</span>
                  <span className="text-[11px] text-gray-400">SVG, PNG, or JPG formats supported</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Clinical Goal Microtag</label>
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="e.g. Clarity & Direction"
                    value={profile.microtag || ''}
                    onChange={(e) => setProfile({ ...profile, microtag: e.target.value })}
                    className="w-full border border-gray-300 rounded px-4 py-2 outline-none focus:border-[#0F9393] text-gray-800 text-[14px] font-semibold bg-white transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Professional Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ms. Taruni Priya"
                    value={profile.full_name || ''}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="w-full border border-gray-300 rounded px-4 py-2 outline-none focus:border-[#0F9393] text-gray-800 text-[14px] font-semibold bg-white transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Designation Type</label>
                  <select
                    value={profile.qualification_desc || 'clinical'}
                    onChange={(e) => setProfile({ ...profile, qualification_desc: e.target.value })}
                    className="w-full border border-gray-300 rounded px-4 py-2 outline-none focus:border-[#0F9393] text-gray-800 text-[14px] font-semibold bg-white transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%25236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%2%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                  >
                    <option value="clinical">Psychologist (trained in clinical psychology)</option>
                    <option value="counselling">Counselling Psychologist</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Primary Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. M.Sc. Counselling Psychology"
                    value={profile.qualification || ''}
                    onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                    className="w-full border border-gray-300 rounded px-4 py-2 outline-none focus:border-[#0F9393] text-gray-800 text-[14px] font-semibold bg-white transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Experience (Years)</label>
                  <input
                    type="text"
                    placeholder="e.g. 12+"
                    value={profile.display_hours || ''}
                    onChange={(e) => setProfile({ ...profile, display_hours: e.target.value })}
                    className="w-full border border-gray-300 rounded px-4 py-2 outline-none focus:border-[#0F9393] text-gray-800 text-[14px] font-semibold bg-white transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Clinical Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded px-4 py-2 outline-none focus:border-[#0F9393] text-gray-800 text-[14px] font-semibold bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Clinical Presence Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col gap-6">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block border-b pb-2">Clinical Presence</span>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Note from Therapist</label>
                  <input
                    type="text"
                    placeholder="e.g. For when you’re feeling stuck between choices and need a way forward."
                    value={profile.note || ''}
                    onChange={(e) => setProfile({ ...profile, note: e.target.value })}
                    className="w-full border border-gray-300 rounded px-4 py-2 outline-none focus:border-[#0F9393] text-gray-800 text-[14px] font-semibold bg-white transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Biography</label>
                  <textarea
                    placeholder="Her work centres on creating the internal conditions for change where feeling seen, heard, and supported allows growth to unfold naturally..."
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full h-32 border border-gray-300 rounded px-4 py-2 outline-none focus:border-[#0F9393] text-gray-700 text-[14px] font-semibold bg-white resize-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Therapeutic Approach</label>
                  <textarea
                    placeholder="Her approach is humanistic and trauma-informed, integrating REBT, CBT, EFT, and emotion-focused work..."
                    value={profile.approach || ''}
                    onChange={(e) => setProfile({ ...profile, approach: e.target.value })}
                    className="w-full h-32 border border-gray-300 rounded px-4 py-2 outline-none focus:border-[#0F9393] text-gray-700 text-[14px] font-semibold bg-white resize-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4-col): Methodology & Submission */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* Methodology Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col gap-8">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block border-b pb-2">Methodology</span>
              <div className="flex flex-col gap-6">
                
                {/* specialties list */}
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">I Excel At (Add up to 5)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(profile.specialties || []).map((p: string, i: number) => (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={i}
                        className="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded border border-gray-200"
                      >
                        <span className="text-[13px] font-bold text-slate-800">{p}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const items = [...(profile.specialties || [])]
                            items.splice(i, 1)
                            setProfile({ ...profile, specialties: items })
                          }}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Plus size={14} className="rotate-45" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                  {(!(profile.specialties) || profile.specialties.length < 5) && (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Add an expertise area (e.g. CBT, Trauma)..."
                        value={expertiseInput}
                        onChange={(e) => setExpertiseInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (expertiseInput.trim()) {
                              const current = profile.specialties || []
                              setProfile({ ...profile, specialties: [...current, expertiseInput.trim()] })
                              setExpertiseInput('')
                            }
                          }
                        }}
                        className="w-full border border-gray-300 rounded px-4 py-2 outline-none focus:border-[#0F9393] text-gray-800 text-[14px] font-semibold bg-white transition-colors"
                      />
                      <div 
                        onClick={() => {
                          if (expertiseInput.trim()) {
                            const current = profile.specialties || []
                            setProfile({ ...profile, specialties: [...current, expertiseInput.trim()] })
                            setExpertiseInput('')
                          }
                        }}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all cursor-pointer ${expertiseInput.trim() ? 'text-[#0F9393] scale-110' : 'text-gray-300 opacity-50'}`}
                      >
                        <Plus size={18} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Good Fit For */}
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Good Fit For</label>
                  <div className="flex flex-col gap-2 mb-2">
                    {profile.good_fit_for?.map((p: string, i: number) => (
                      <motion.div
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        key={i}
                        className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded border border-gray-200"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded bg-[#0F9393]" />
                          <span className="text-[13px] font-bold text-slate-800">{p}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const items = [...(profile.good_fit_for || [])]
                            items.splice(i, 1)
                            setProfile({ ...profile, good_fit_for: items })
                          }}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Plus size={14} className="rotate-45" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Career decisions and early-career uncertainty..."
                      value={fitInput}
                      onChange={(e) => setFitInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          if (fitInput.trim()) {
                            const current = profile.good_fit_for || []
                            setProfile({ ...profile, good_fit_for: [...current, fitInput.trim()] })
                            setFitInput('')
                          }
                        }
                      }}
                      className="w-full border border-gray-300 rounded px-4 py-2 outline-none focus:border-[#0F9393] text-gray-800 text-[14px] font-semibold bg-white transition-colors"
                    />
                    <div 
                      onClick={() => {
                        if (fitInput.trim()) {
                          const current = profile.good_fit_for || []
                          setProfile({ ...profile, good_fit_for: [...current, fitInput.trim()] })
                          setFitInput('')
                        }
                      }}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all cursor-pointer ${fitInput.trim() ? 'text-[#0F9393] scale-110' : 'text-gray-300 opacity-50'}`}
                    >
                      <Plus size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#0F9393] hover:bg-[#0c7f7f] text-white font-bold text-sm uppercase tracking-wider rounded shadow transition-all cursor-pointer"
              >
                {loading ? 'Publishing Changes...' : 'Publish to Showcase'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
