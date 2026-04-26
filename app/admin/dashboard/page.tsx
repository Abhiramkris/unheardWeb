'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import Button from '@/components/ui/Button'
import { 
  Calendar, User, Clock, Plus, UserCircle, 
  Save, Trash2, Newspaper, LayoutDashboard, 
  Ticket, CheckCircle2, AlertCircle, Users
} from 'lucide-react'
import BlogEditor from '@/components/BlogEditor'

interface Registration {
  id: string;
  start_time: string;
  is_trial: boolean;
  status: string;
  assignment_status?: string;
  guest_info?: {
    name: string;
    email: string;
    phone: string;
  };
  answers?: any;
  session_count?: number;
}

interface Therapist {
  user_id: string;
  full_name: string;
  qualification: string;
  display_hours: string;
  display_rating: string;
  is_available: boolean;
  avatar_url: string;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  value: number;
  usage_count: number;
  is_active: boolean;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('registrations')
  const [supabase] = useState(() => createClient())
  
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkUserPermissions = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (data) {
      setIsAdmin(['admin', 'super_admin'].includes(data.role))
    }
  }, [supabase])

  const fetchRegistrations = useCallback(async () => {
    // Join appointments with questionnaires to get guest info
    const { data: apts, error } = await supabase
      .from('appointments')
      .select(`
        *,
        pre_booking_questionnaires(answers)
      `)
      .order('created_at', { ascending: false })

    if (apts) {
      // Fetch session counts for these phones
      const phones = apts.map(a => a.pre_booking_questionnaires?.[0]?.answers?.guest_info?.phone).filter(Boolean)
      const { data: fingerprints } = await supabase
        .from('user_fingerprints')
        .select('phone_number, session_count')
        .in('phone_number', phones)

      const fpMap = new Map(fingerprints?.map(f => [f.phone_number, f.session_count]) || [])

      const formatted = apts.map(a => ({
        id: a.id,
        start_time: a.start_time,
        is_trial: a.is_trial,
        status: a.status,
        assignment_status: a.assignment_status,
        guest_info: a.pre_booking_questionnaires?.[0]?.answers?.guest_info,
        answers: a.pre_booking_questionnaires?.[0]?.answers,
        session_count: fpMap.get(a.pre_booking_questionnaires?.[0]?.answers?.guest_info?.phone) || 0
      }))
      setRegistrations(formatted)
    }
  }, [supabase])

  const fetchTherapists = useCallback(async () => {
    const { data } = await supabase
      .from('therapist_profiles')
      .select('*')
    if (data) setTherapists(data)
  }, [supabase])

  const fetchCoupons = useCallback(async () => {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
    if (data) setCoupons(data)
  }, [supabase])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await checkUserPermissions()
      await Promise.all([
        fetchRegistrations(),
        fetchTherapists(),
        fetchCoupons()
      ])
      setLoading(false)
    }
    init()
  }, [checkUserPermissions, fetchRegistrations, fetchTherapists, fetchCoupons])

  const handleAllotTherapist = async (appointmentId: string, therapistId: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ 
        therapist_id: therapistId,
        assignment_status: 'allotted',
        status: 'confirmed'
      })
      .eq('id', appointmentId)
    
    if (error) alert(error.message)
    else {
      alert('Therapist Allotted Successfully!')
      fetchRegistrations()
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FEFEFC]">Loading Admin Dashboard...</div>

  return (
    <div className="min-h-screen bg-[#FEFEFC] font-nunito flex">
      {/* Sidebar */}
      <aside className="w-[280px] bg-white border-r border-gray-100 p-8 flex flex-col gap-10">
        <h2 className="text-[28px] font-georgia font-bold text-[#0F9393]">unHeard <span className="text-[12px] text-gray-400 font-bold uppercase tracking-widest block">Super Admin</span></h2>
        
        <nav className="flex flex-col gap-3">
          <button 
            onClick={() => setActiveTab('registrations')}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'registrations' ? 'bg-[#0F9393] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} /> Registrations
          </button>
          <button 
            onClick={() => setActiveTab('coupons')}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'coupons' ? 'bg-[#0F9393] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Ticket size={20} /> Coupons
          </button>
          <button 
            onClick={() => setActiveTab('therapists')}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'therapists' ? 'bg-[#0F9393] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Users size={20} /> Therapists
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-10 overflow-y-auto">
        
        {activeTab === 'registrations' && (
          <div className="flex flex-col gap-8 h-full">
            <div className="flex justify-between items-center">
              <h1 className="text-[32px] font-georgia font-bold">New Registrations</h1>
              <div className="flex gap-4">
                <span className="flex items-center gap-2 text-[13px] font-bold text-gray-400"><CheckCircle2 size={16} className="text-green-500"/> Allotted</span>
                <span className="flex items-center gap-2 text-[13px] font-bold text-gray-400"><AlertCircle size={16} className="text-yellow-500"/> Pending</span>
              </div>
            </div>

            {/* Split Pane View */}
            <div className="flex gap-8 h-full min-h-0">
               {/* Left: Registrations List */}
               <div className="w-[65%] flex flex-col gap-4 overflow-y-auto pr-4 custom-scrollbar">
                  {registrations.length === 0 ? (
                    <div className="bg-white p-20 rounded-[32px] border border-dashed border-gray-200 text-center flex flex-col items-center gap-4">
                      <LayoutDashboard size={48} className="text-gray-200" />
                      <p className="text-gray-400 italic">No new registrations yet.</p>
                    </div>
                  ) : (
                    registrations.map((reg) => (
                      <div key={reg.id} className="bg-white p-6 rounded-[24px] border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-all group">
                         <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                               <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-[14px] ${reg.assignment_status === 'allotted' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                  {reg.session_count || 0}
                               </div>
                               <div>
                                  <h4 className="font-bold text-[18px] text-gray-900">{reg.guest_info?.name || 'Anonymous Patient'}</h4>
                                  <p className="text-[13px] text-gray-500 font-bold">{reg.guest_info?.phone} • {reg.is_trial ? 'Trial' : 'Standard'}</p>
                               </div>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest ${reg.assignment_status === 'allotted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                               {reg.assignment_status || 'Pending'}
                            </span>
                         </div>
                         
                         <div className="grid grid-cols-3 gap-4 py-3 border-y border-gray-50">
                            <div className="flex flex-col">
                               <span className="text-[10px] text-gray-400 font-bold uppercase">Requested At</span>
                               <span className="text-[13px] font-bold text-gray-700">{new Date(reg.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[10px] text-gray-400 font-bold uppercase">Care Type</span>
                               <span className="text-[13px] font-bold text-gray-700">{reg.answers?.type || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[10px] text-gray-400 font-bold uppercase">Constancy</span>
                               <span className="text-[13px] font-bold text-green-600">{reg.session_count > 0 ? `${reg.session_count} Session(s)` : 'New User'}</span>
                            </div>
                         </div>

                         <div className="flex gap-3 mt-2">
                            <button className="flex-grow h-[45px] bg-[#0F9393]/5 hover:bg-[#0F9393]/10 text-[#0F9393] font-bold rounded-xl text-[13px] transition-all">View Details</button>
                            <button className="h-[45px] px-6 bg-black text-white font-bold rounded-xl text-[13px] hover:bg-gray-800 transition-all">Manual Allot</button>
                         </div>
                      </div>
                    ))
                  )}
               </div>

               {/* Right: Therapist Pool */}
               <div className="w-[35%] bg-white rounded-[32px] border border-gray-100 p-8 flex flex-col gap-6 sticky top-0 h-fit">
                  <div>
                    <h3 className="font-georgia font-bold text-[20px]">Therapist Pool</h3>
                    <p className="text-[13px] text-gray-400 font-bold">Select a therapist to allot to a pending registration.</p>
                  </div>
                  
                  <div className="flex flex-col gap-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                    {therapists.map((t) => (
                      <div key={t.user_id} className="p-4 rounded-2xl border border-gray-50 bg-gray-50/30 flex items-center gap-4 hover:border-[#0F9393]/30 transition-all cursor-pointer group">
                         <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden ring-2 ring-white ring-offset-2">
                           {t.avatar_url && <img src={t.avatar_url} className="w-full h-full object-cover" />}
                         </div>
                         <div className="flex-grow">
                           <h5 className="font-bold text-[14px] leading-tight group-hover:text-[#0F9393] transition-colors">{t.full_name}</h5>
                           <span className="text-[11px] text-gray-400 font-bold">{t.qualification}</span>
                         </div>
                         <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-6 border-t border-gray-100">
                    <Button variant="black" className="w-full h-[55px] rounded-2xl gap-2"><Plus size={18}/> Manage Pool</Button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <h1 className="text-[32px] font-georgia font-bold">Coupon Manager</h1>
              <Button variant="black" className="h-[50px] gap-2"><Plus size={18}/> Create New Coupon</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {coupons.length === 0 ? (
                 <div className="col-span-full bg-white p-20 rounded-[32px] border border-dashed border-gray-200 text-center flex flex-col items-center gap-4">
                   <Ticket size={48} className="text-gray-200" />
                   <p className="text-gray-400 italic">No coupons created yet.</p>
                 </div>
               ) : (
                 coupons.map((c) => (
                   <div key={c.id} className="bg-white p-8 rounded-[32px] border border-gray-100 flex flex-col gap-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[#0F9393]/5 rounded-bl-full flex items-center justify-center transition-transform group-hover:scale-110">
                         <Ticket size={24} className="text-[#0F9393]/20" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-[#0F9393] uppercase tracking-[0.2em]">Promo Code</span>
                        <h3 className="text-[24px] font-black text-gray-900 tracking-tight">{c.code}</h3>
                      </div>
                      <div className="flex justify-between items-end">
                         <div>
                            <p className="text-[12px] text-gray-400 font-bold uppercase mb-1">Value</p>
                            <h4 className="text-[20px] font-bold text-gray-800">{c.value}{c.discount_type === 'percentage' ? '%' : '/-'} OFF</h4>
                         </div>
                         <div className="text-right">
                            <p className="text-[12px] text-gray-400 font-bold uppercase mb-1">Usage</p>
                            <h4 className="text-[20px] font-bold text-gray-800">{c.usage_count} Used</h4>
                         </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-grow h-[45px] bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-xl text-[13px] transition-all">Disable</button>
                        <button className="w-[45px] h-[45px] bg-gray-50 flex items-center justify-center text-red-300 hover:text-red-500 rounded-xl transition-all"><Trash2 size={16}/></button>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
