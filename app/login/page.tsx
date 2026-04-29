'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Phone, ChevronRight, MessageSquare, ShieldCheck } from 'lucide-react'

export default function Login() {
  const [supabase] = useState(() => createClient())
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1) // 1: Phone, 2: OTP
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/whatsapp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      
      setStep(2)
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/whatsapp/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      
      // Sync with Supabase SDK using the custom JWT returned
      if (data.access_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.access_token // Using the same for now as it's custom
        })
        if (sessionError) throw sessionError
      }

      // Check permissions and redirect
      const { data: { user } } = await supabase.auth.getUser()
      console.log('FRONTEND AUTH USER:', user?.id);

      if (user) {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role, is_therapist')
          .eq('user_id', user.id)
          .single()

        console.log('FRONTEND ROLE DATA:', roleData, 'ERROR:', roleError);

        const role = roleData?.role || 'patient'
        const isTherapist = roleData?.is_therapist || false
        
        console.log('DETERMINED REDIRECT - Role:', role, 'isTherapist:', isTherapist);

        if (role === 'super_admin') {
          window.location.href = '/super-admin'
        } else if (role === 'admin' || isTherapist) {
          window.location.href = '/admin/dashboard'
        } else {
          window.location.href = '/'
        }
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-[#FEFEFC] relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#0F9393]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#0F9393]/5 blur-[120px] rounded-full" />

      <div className="relative z-10 p-10 bg-white rounded-[40px] shadow-2xl max-w-md w-full border border-gray-100 mx-4">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#0F9393]/10 rounded-2xl flex items-center justify-center text-[#0F9393] mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-[36px] font-georgia font-bold text-gray-900 mb-2">unHeard.</h1>
          <p className="text-gray-400 font-nunito text-[14px] font-bold uppercase tracking-widest">Admin & Therapist Portal</p>
        </div>
        
        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-nunito font-bold text-[14px] text-gray-600 ml-1">WhatsApp Number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210" 
                  className="w-full border border-gray-200 rounded-2xl pl-12 pr-5 py-4 font-nunito text-black focus:outline-none focus:border-[#0F9393] focus:ring-4 focus:ring-[#0F9393]/5 transition-all bg-gray-50/50" 
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-[13px] font-bold text-center">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#0F9393] text-white py-4 rounded-2xl font-nunito font-bold text-[18px] shadow-lg shadow-[#0F9393]/20 hover:bg-[#0D7F7F] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send WhatsApp OTP'}
              <ChevronRight size={20} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-nunito font-bold text-[14px] text-gray-600 ml-1">Enter 6-Digit Code</label>
              <div className="relative">
                <MessageSquare size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000 000" 
                  className="w-full border border-gray-200 rounded-2xl pl-12 pr-5 py-4 font-nunito text-[24px] tracking-[0.5em] text-center font-bold text-black focus:outline-none focus:border-[#0F9393] focus:ring-4 focus:ring-[#0F9393]/5 transition-all bg-gray-50/50" 
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-[13px] font-bold text-center">{error}</p>}

            <div className="flex flex-col gap-3">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-black text-white py-4 rounded-2xl font-nunito font-bold text-[18px] shadow-lg shadow-black/10 hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
                <ShieldCheck size={20} />
              </button>
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="text-gray-400 font-nunito font-bold text-[14px] hover:text-gray-600 transition-all"
              >
                Change Phone Number
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
