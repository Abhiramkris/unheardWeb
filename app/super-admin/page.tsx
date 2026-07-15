'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Button from '@/components/ui/Button'
import { 
  Trash2, Users, 
  PenTool, Ticket, Phone, 
  MonitorPlay, ArrowLeftRight, 
  Sparkles, 
  Plus, Smartphone, LogOut,
  UserCircle,
  AlertCircle,
  Menu,
  Video
} from 'lucide-react'
import Image from 'next/image'
import BlogEditor from '@/components/BlogEditor'
import { useCallback } from 'react'
import { adminUpdateTherapistProfile } from '@/lib/actions'

interface AdminRole {
  id: string;
  user_id: string;
  role: string;
  is_blogger: boolean;
  phone_number?: string;
  full_name?: string;
  qualification?: string;
  avatar_url?: string;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  usage_limit: number;
  usage_count: number;
  is_active: boolean;
  expires_at: string | null;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: any[];
  published: boolean;
  created_at: string;
  author_id: { id: string } | string;
}

interface WhatsappStatus {
  status: 'disconnected' | 'initializing' | 'pending_qr' | 'authenticated' | 'error';
  qrDataUrl: string | null;
}

export default function SuperAdminDashboard() {
  const [supabase] = useState(() => createClient())
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [admins, setAdmins] = useState<AdminRole[]>([])
  const [isTherapist, setIsTherapist] = useState(false)
  const [activeTab, setActiveTab] = useState('queue')
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [queue, setQueue] = useState<any[]>([])
  const [showClosed, setShowClosed] = useState(false)
  const [virtualRooms, setVirtualRooms] = useState<any[]>([])
  const [editingBlog, setEditingBlog] = useState<Partial<Blog> | null>(null)
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsappStatus>({ status: 'disconnected', qrDataUrl: null })
  const [selectedQueueItem, setSelectedQueueItem] = useState<any | null>(null)
  const [showQueueSheet, setShowQueueSheet] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [historyQueueItems, setHistoryQueueItems] = useState<any[]>([])
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false)
  const [cronStatus, setCronStatus] = useState<{ lastRun: string | null, loading: boolean }>({ lastRun: null, loading: false })
  
  // Custom Inline Toast State Engine
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([])
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])
  
  // Coupon Form State
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    usage_limit: -1,
    expires_at: ''
  })

  const logAction = async (action: string, targetId?: string, details?: any) => {
    try {
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, target_id: targetId, details })
      });
    } catch (e) {
      console.warn('Failed to log action:', e);
    }
  };

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      if (data.success) {
        setWhatsappStatus(data.data);
      }
    } catch {}
  }, []);

  const fetchBlogs = useCallback(async () => {
    const { data } = await supabase
      .from('blogs')
      .select('*, author_id(id)')
      .order('created_at', { ascending: false })
    if (data) setBlogs(data)
  }, [supabase]);

  const fetchAdmins = useCallback(async () => {
    const { data: profiles } = await supabase
      .from('therapist_profiles')
      .select('*')
      .order('full_name', { ascending: true })
    
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role, is_blogger, phone_number')

    if (profiles) {
      setAdmins(profiles.map((profile: any) => {
        const roleData = roles?.find(r => r.user_id === profile.user_id)
        return {
          id: profile.id,
          user_id: profile.user_id,
          role: roleData?.role || 'therapist',
          is_blogger: roleData ? !!roleData.is_blogger : false,
          phone_number: roleData?.phone_number || profile.phone,
          full_name: profile.full_name || 'Anonymous Professional',
          qualification: profile.qualification || 'Therapist',
          avatar_url: profile.avatar_url
        }
      }))
    }
  }, [supabase]);

  const fetchCoupons = useCallback(async () => {
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setCoupons(data)
  }, [supabase]);

  const fetchQueue = useCallback(async () => {
    let query = supabase
      .from('pre_booking_questionnaires')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!showClosed) {
        query = query.eq('status', 'pending');
    }
    
    const { data } = await query;
    if (data) setQueue(data);

    // Fetch history records (status === 'allotted')
    const { data: hist } = await supabase
      .from('pre_booking_questionnaires')
      .select('*')
      .eq('status', 'allotted')
      .order('created_at', { ascending: false });
    if (hist) setHistoryQueueItems(hist);
  }, [supabase, showClosed]);

  const fetchVirtualRooms = useCallback(async () => {
    const { data } = await supabase.from('virtual_rooms').select('*').order('created_at', { ascending: false });
    if (data) setVirtualRooms(data);
  }, [supabase]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === 'whatsapp') {
      fetchStatus();
      interval = setInterval(fetchStatus, 3000);
    }
    if (window.location.hash === '#blogs') {
      setActiveTab('blogs');
      fetchBlogs();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, fetchStatus, fetchBlogs]);

  const triggerCron = async () => {
    setCronStatus(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/cron/notifications');
      const data = await res.json();
      if (data.success) {
        setCronStatus({ lastRun: new Date().toLocaleTimeString(), loading: false });
      } else {
        setCronStatus(prev => ({ ...prev, loading: false }));
      }
    } catch {
      setCronStatus(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    triggerCron();
    const interval = setInterval(triggerCron, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleWhatsappReconnect = async () => {
    setWhatsappStatus({ status: 'initializing', qrDataUrl: null });
    await fetch('/api/whatsapp/reconnect', { method: 'POST' });
  };

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Run dependent checks after we have the session
        fetchAdmins();
        fetchQueue();
        fetchVirtualRooms();
        
        const { data } = await supabase
          .from('user_roles')
          .select('is_therapist')
          .eq('user_id', session.user.id)
          .single();
        if (data) setIsTherapist(data.is_therapist);
      }
    }
    init();
  }, [supabase, fetchAdmins, fetchQueue, fetchVirtualRooms]);

  const handleSaveBlog = async (blogData: Partial<Blog>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const slug = (blogData.title || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')

    const { error } = await supabase
      .from('blogs')
      .upsert({
        id: editingBlog?.id || undefined,
        author_id: user.id,
        title: blogData.title,
        slug,
        content: blogData.content,
        published: blogData.published,
        updated_at: new Date().toISOString()
      })

    if (error) {
      alert(error.message)
    } else {
      await logAction(editingBlog?.id ? 'edit_blog' : 'add_blog', blogData.title);
      alert('Blog saved successfully!')
      setEditingBlog(null)
      fetchBlogs()
      localStorage.removeItem('blog_draft')
    }
  }

  const toggleBloggerRole = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('user_roles')
      .update({ is_blogger: !currentStatus })
      .eq('user_id', userId)
    
    if (error) {
      alert(error.message)
    } else {
      fetchAdmins()
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: name, phone_number: phone }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage('Invitation sent successfully!')
        setEmail('')
        setName('')
        setPhone('')
      } else {
        setMessage('Failed to send invite')
      }
    } catch {
      setMessage('Failed to send invite')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignTherapist = async (questionnaireId: string, therapistId: string, meetingLink: string) => {
    if (!therapistId) return alert('Please select a therapist first');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/assign-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionnaire_id: questionnaireId, therapist_id: therapistId, meeting_link: meetingLink }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Therapist assigned and WhatsApp messages dispatched!');
        setShowQueueSheet(false);
        fetchQueue();
      } else {
        alert(data.error || 'Failed to assign therapist');
      }
    } catch {
      alert('Error assigning therapist');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col md:flex-row relative">
      
      {/* Desktop Sidebar (Standard professional sidebar) */}
      <aside 
        className="hidden md:flex w-[260px] bg-white border-r border-gray-200 p-8 flex-col gap-8 sticky top-0 h-screen overflow-y-auto scrollbar-hide"
      >
        <div className="flex flex-col gap-2 pb-6 border-b border-gray-150">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white">
            <span className="font-bold text-[18px]">U</span>
          </div>
          <h2 className="text-[20px] font-black tracking-tight text-gray-900 mt-3">unHeard</h2>
          <p className="text-[10px] text-[#0F9393] font-black uppercase tracking-[0.25em]">System Admin</p>
        </div>
        
        <nav className="flex flex-col gap-1.5 pb-6 border-b border-gray-150">
          <button 
            onClick={() => { setActiveTab('queue'); fetchQueue(); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-[13px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === 'queue' ? 'bg-[#0F9393] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Users size={16} /> Queue
          </button>
          <button 
            onClick={() => { setActiveTab('invite'); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-[13px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === 'invite' ? 'bg-[#0F9393] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Smartphone size={16} /> Staff
          </button>
          <button 
            onClick={() => { setActiveTab('blogs'); fetchBlogs(); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-[13px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === 'blogs' ? 'bg-[#0F9393] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <PenTool size={16} /> Content
          </button>
          <button 
            onClick={() => { setActiveTab('coupons'); fetchCoupons(); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-[13px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === 'coupons' ? 'bg-[#0F9393] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Ticket size={16} /> Offers
          </button>
          <button 
            onClick={() => { setActiveTab('whatsapp'); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-[13px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === 'whatsapp' ? 'bg-[#0F9393] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Phone size={16} /> Engine
          </button>
          <button 
            onClick={() => { setActiveTab('rooms'); fetchVirtualRooms(); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-[13px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === 'rooms' ? 'bg-[#0F9393] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Video size={16} /> Rooms
          </button>
          <button 
            onClick={() => { setActiveTab('system'); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-[13px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === 'system' ? 'bg-[#0F9393] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Sparkles size={16} /> System
          </button>
        </nav>

        {isTherapist && (
          <button 
            onClick={() => window.location.href = '/admin/dashboard'}
            className="mt-auto flex items-center gap-3 p-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded bg-[#0F9393] flex items-center justify-center">
              <ArrowLeftRight size={14} className="text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-bold leading-none">Therapist View</span>
              <span className="text-[8px] text-[#0F9393] font-bold uppercase tracking-wider mt-0.5">Switch</span>
            </div>
          </button>
        )}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {showSidebar && (
        <>
          <div 
            className="fixed inset-0 bg-black/35 z-40 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
          <aside className="fixed top-0 left-0 h-screen z-50 w-[260px] bg-white border-r border-gray-200 p-8 flex flex-col gap-8 md:hidden animate-in slide-in-from-left duration-250">
            <div className="flex flex-col gap-2 pb-6 border-b border-gray-150">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white">
                <span className="font-bold text-[18px]">U</span>
              </div>
              <h2 className="text-[20px] font-black tracking-tight text-gray-900 mt-3">unHeard</h2>
              <p className="text-[10px] text-[#0F9393] font-black uppercase tracking-[0.25em]">System Admin</p>
            </div>
            
            <nav className="flex flex-col gap-1.5 pb-6 border-b border-gray-150">
              <button 
                onClick={() => { setActiveTab('queue'); fetchQueue(); setShowSidebar(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-[13px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === 'queue' ? 'bg-[#0F9393] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Users size={16} /> Queue
              </button>
              <button 
                onClick={() => { setActiveTab('invite'); setShowSidebar(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-[13px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === 'invite' ? 'bg-[#0F9393] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Smartphone size={16} /> Staff
              </button>
              <button 
                onClick={() => { setActiveTab('blogs'); fetchBlogs(); setShowSidebar(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-[13px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === 'blogs' ? 'bg-[#0F9393] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <PenTool size={16} /> Content
              </button>
              <button 
                onClick={() => { setActiveTab('coupons'); fetchCoupons(); setShowSidebar(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-[13px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === 'coupons' ? 'bg-[#0F9393] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Ticket size={16} /> Offers
              </button>
              <button 
                onClick={() => { setActiveTab('whatsapp'); setShowSidebar(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-[13px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === 'whatsapp' ? 'bg-[#0F9393] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Phone size={16} /> Engine
              </button>
              <button 
                onClick={() => { setActiveTab('rooms'); fetchVirtualRooms(); setShowSidebar(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-[13px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === 'rooms' ? 'bg-[#0F9393] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Video size={16} /> Rooms
              </button>
              <button 
                onClick={() => { setActiveTab('system'); setShowSidebar(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-[13px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === 'system' ? 'bg-[#0F9393] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Sparkles size={16} /> System
              </button>
            </nav>
          </aside>
        </>
      )}

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto max-h-screen">
        {/* Top Header Controls */}
        <div className="flex justify-between items-center pb-6 mb-8 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {/* Hamburger Button for mobile manual trigger */}
              <button 
                onClick={() => setShowSidebar(true)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors md:hidden text-gray-700"
              >
                <Menu size={20} />
              </button>
              <div className="flex flex-col">
                 <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">System Controller</p>
                 <h1 className="text-[20px] font-bold text-gray-900 tracking-tight leading-none">Super Admin</h1>
              </div>
           </div>
           <div className="flex items-center gap-2">
              {isTherapist && (
                <button 
                  onClick={() => window.location.href = '/admin/dashboard'}
                  className="w-9 h-9 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center text-[#0F9393] cursor-pointer hover:bg-gray-50 transition-all"
                  title="Switch to Therapist View"
                >
                  <MonitorPlay size={16} />
                </button>
              )}
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/login';
                }}
                className="w-9 h-9 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center text-red-500 cursor-pointer hover:bg-red-50 transition-all"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
           </div>
        </div>


        {activeTab === 'invite' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Invite Form */}
            <div className="lg:col-span-4 bg-white p-6 rounded-lg border border-gray-200 flex flex-col gap-5 text-black">
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Invite Therapist</h2>
              <form onSubmit={handleInvite} className="flex flex-col gap-4">
                <label className="flex flex-col font-bold text-[12px] text-gray-600 uppercase tracking-wider gap-1">
                  Full Name
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name" 
                    className="border border-gray-200 rounded px-4 py-2 text-[14px] font-semibold text-gray-800 focus:outline-none focus:border-[#0F9393] bg-gray-50/50" 
                    required
                  />
                </label>
                <label className="flex flex-col font-bold text-[12px] text-gray-600 uppercase tracking-wider gap-1">
                  Phone Number
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number" 
                    className="border border-gray-200 rounded px-4 py-2 text-[14px] font-semibold text-gray-800 focus:outline-none focus:border-[#0F9393] bg-gray-50/50" 
                    required
                  />
                </label>
                <label className="flex flex-col font-bold text-[12px] text-gray-600 uppercase tracking-wider gap-1">
                  Email Address
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email" 
                    className="border border-gray-200 rounded px-4 py-2 text-[14px] font-semibold text-gray-800 focus:outline-none focus:border-[#0F9393] bg-gray-50/50" 
                    required
                  />
                </label>
                <button type="submit" className="w-full mt-2 py-3 bg-[#0F9393] hover:bg-[#0c7f7f] text-white font-bold text-xs uppercase tracking-wider rounded transition-colors" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Invite (Email & WhatsApp)'}
                </button>
                {message && <p className={`text-center text-xs font-bold ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
              </form>
            </div>

            {/* Existing Admins List */}
            <div className="lg:col-span-8 bg-white p-6 rounded-lg border border-gray-200 flex flex-col gap-5 text-black">
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Active Therapist Accounts</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 text-xs uppercase font-bold">
                      <th className="pb-3 font-semibold">Therapist</th>
                      <th className="pb-3 font-semibold">Qualification</th>
                      <th className="pb-3 font-semibold">Role &amp; Status</th>
                      <th className="pb-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-gray-400 italic">No therapists active yet.</td>
                      </tr>
                    ) : (
                      admins.map((admin, idx) => (
                        <tr key={admin.id || idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3.5 pr-2">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-sm uppercase flex-shrink-0">
                                {admin.full_name ? admin.full_name[0] : 'T'}
                              </div>
                              <div>
                                <span className="font-bold text-gray-800 text-[14px] block leading-tight">{admin.full_name}</span>
                                <span className="text-[11px] text-gray-400 font-semibold">{admin.phone_number || 'No Phone Sync'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 pr-2">
                            <span className="text-gray-600 text-xs font-medium block max-w-xs truncate">{admin.qualification || 'Awaiting profile setup'}</span>
                          </td>
                          <td className="py-3.5 pr-2">
                            <div className="flex items-center gap-2">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${admin.is_blogger ? 'bg-[#0f9393]/10 text-[#0f9393]' : 'bg-gray-100 text-gray-400'}`}>
                                {admin.is_blogger ? 'Blogger' : 'Staff'}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 text-right whitespace-nowrap">
                            <div className="inline-flex gap-2">
                              <button 
                                onClick={() => toggleBloggerRole(admin.user_id, admin.is_blogger)}
                                className={`px-2 py-1 text-[10px] font-bold border rounded uppercase transition-all ${admin.is_blogger ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                              >
                                {admin.is_blogger ? 'Disable Blog' : 'Enable Blog'}
                              </button>
                              <button 
                                onClick={() => router.push(`/super-admin/therapists/${admin.user_id}/edit`)}
                                className="px-2 py-1 text-[10px] font-bold border border-gray-200 text-[#0F9393] hover:bg-[#0f9393]/5 rounded uppercase transition-colors"
                              >
                                Edit Profile
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'blogs' && (
          <div className="flex flex-col gap-8">
            {/* Mobile Fallback */}
            <div className="md:hidden flex flex-col items-center justify-center py-20 px-6 bg-white rounded-[32px] border border-dashed border-gray-200 text-center gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                <PenTool size={32} />
              </div>
              <h3 className="text-[20px] font-bold text-gray-900">Desktop Only Feature</h3>
              <p className="text-gray-500 text-[14px] leading-relaxed max-w-[280px]">Please open this on a desktop computer to access the clinical content management and blog editor tools.</p>
            </div>

            {/* Desktop Blog View */}
            <div className="hidden md:flex flex-col gap-8">
              {editingBlog ? (
               <BlogEditor 
                 onSave={handleSaveBlog}
                 onBack={() => setEditingBlog(null)}
                 initialData={(editingBlog || undefined) as any}
               />
             ) : (
               <div className="flex flex-col gap-8">
                 <div className="flex justify-end">
                   <Button 
                     variant="black" 
                     className="h-[50px] gap-2 px-8"
                     onClick={() => setEditingBlog({ title: '', content: [], published: false })}
                   >
                     Write Official Blog
                   </Button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {blogs.map((blog: Blog, idx) => (
                    <div key={blog.id || idx} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col gap-6 hover:shadow-md transition-all">
                       <div className="flex justify-between items-start">
                          <span className={`text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${blog.published ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                            {blog.published ? 'Published' : 'Draft'}
                          </span>
                       </div>
                       <h3 className="font-bold text-[20px] font-georgia leading-tight">{blog.title}</h3>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0F9393]/10 flex items-center justify-center text-[#0F9393] font-black text-[12px]">
                            {typeof blog.author_id !== 'string' && blog.author_id?.id ? 'A' : 'T'}
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Author ID</p>
                            <p className="text-[14px] font-bold text-black truncate w-40">
                              {typeof blog.author_id === 'string' ? blog.author_id : (blog.author_id?.id || 'Platform')}
                            </p>
                          </div>
                       </div>
                       <div className="flex gap-3 pt-4 border-t border-gray-50">
                          <button onClick={() => setEditingBlog(blog)} className="flex-grow h-[45px] bg-[#0F9393]/5 text-[#0F9393] font-bold rounded-xl text-[14px]">Edit</button>
                          <button 
                            className="w-[45px] h-[45px] bg-red-50 flex items-center justify-center text-red-300 rounded-xl"
                            onClick={async () => {
                              if (confirm('Delete this blog?')) {
                                await supabase.from('blogs').delete().eq('id', blog.id)
                                fetchBlogs()
                              }
                             }}>
                             <Trash2 size={18} />
                           </button>
                       </div>
                    </div>
                 ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="bg-white rounded-xl border border-gray-200 text-black min-h-[500px]">
             <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                   <h2 className="text-[20px] font-bold text-gray-900 leading-tight">{showClosed ? 'All Requests' : 'Clinical Intake Queue'}</h2>
                   <p className="text-[13px] text-gray-500 mt-1">{showClosed ? 'Full session request history' : 'Assessing new patient questionnaires'}</p>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                      onClick={() => { setShowClosed(!showClosed); fetchQueue(); }}
                      className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all border ${showClosed ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                   >
                      {showClosed ? 'View Pending Only' : 'Monitor Full History'}
                   </button>
                   <button 
                      onClick={fetchQueue}
                      className="px-4 py-2 bg-[#0F9393] text-white rounded-lg flex items-center justify-center font-bold text-[13px] hover:bg-[#0c7f7f] transition-all"
                      title="Refresh Queue"
                   >
                      Sync Data
                   </button>
                </div>
             </div>

             <div className="w-full overflow-x-auto">
                {queue.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-gray-500 font-bold mb-1">Queue is Clear</p>
                    <p className="text-gray-400 text-[13px]">No pending intakes require clinical assessment.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        <th className="py-3 px-6">Name</th>
                        <th className="py-3 px-6">Type</th>
                        <th className="py-3 px-6">Age</th>
                        <th className="py-3 px-6">Language</th>
                        <th className="py-3 px-6">Date Requested</th>
                        <th className="py-3 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {queue.map((request, i) => {
                        const qAnswers = request.answers || {};
                        const isAllotted = request.status === 'allotted';
                        const displayName = qAnswers.name || qAnswers.guest_info?.name || (request.guest_name !== 'Guest' ? request.guest_name : 'Anonymous User');
                        
                        return (
                          <tr 
                            key={request.id || i}
                            onClick={() => { setSelectedQueueItem(request); setShowQueueSheet(true); }}
                            className={`hover:bg-[#0F9393]/5 transition-colors cursor-pointer group ${isAllotted ? 'bg-gray-50/50 grayscale opacity-60' : 'bg-white'}`}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-[#0F9393]/15 text-[#0F9393] flex items-center justify-center font-bold text-[13px] uppercase">
                                  {displayName[0]}
                                </div>
                                <span className="font-bold text-gray-900 text-[14px]">
                                  {displayName}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-[13px] font-semibold text-gray-700">
                              <span className={`px-2.5 py-1 rounded text-[11px] font-black uppercase tracking-wider ${request.is_trial ? 'bg-amber-150 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
                                {request.is_trial ? 'Discovery' : 'Standard'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">
                              {qAnswers.age || 'N/A'}
                            </td>
                            <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">
                              {qAnswers.language || 'N/A'}
                            </td>
                            <td className="py-4 px-6 text-[13px] text-gray-600">
                              <span className="font-semibold text-gray-900">{new Date(request.requested_start_time).toLocaleDateString([], { day: '2-digit', month: 'short' })}</span>
                              <span className="text-gray-400 ml-2">{new Date(request.requested_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => { setSelectedQueueItem(request); setShowQueueSheet(true); }}
                                  className="px-4 py-1.5 bg-[#0F9393]/10 text-[#0F9393] hover:bg-[#0F9393] hover:text-white rounded-md text-[12px] font-bold transition-all"
                                >
                                  Assess
                                </button>
                                {!isAllotted && (
                                  <button
                                    disabled={deletingId !== null}
                                    onClick={async () => {
                                      if (confirm('Are you sure you want to delete this questionnaire request?')) {
                                        setDeletingId(request.id);
                                        try {
                                          const { error } = await supabase
                                            .from('pre_booking_questionnaires')
                                            .delete()
                                            .eq('id', request.id);
                                          if (error) alert(error.message);
                                          else await fetchQueue();
                                        } catch (err) {
                                          console.error(err);
                                        } finally {
                                          setDeletingId(null);
                                        }
                                      }
                                    }}
                                    className="p-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-md text-[12px] font-bold transition-all disabled:opacity-50"
                                    title="Delete Questionnaire"
                                  >
                                    {deletingId === request.id ? (
                                      <span className="inline-block w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Trash2 size={14} />
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
             </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-black">
            {/* Create Coupon (Left pane, 5-cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-lg border border-gray-200 flex flex-col gap-5">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block border-b pb-2">Create New Coupon</span>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const { error } = await supabase.from('coupons').insert([couponForm]);
                  if (error) {
                    showToast(error.message, 'error');
                  } else {
                    showToast('Coupon created successfully!');
                    setCouponForm({ code: '', discount_type: 'percentage', value: 0, usage_limit: -1, expires_at: '' });
                    fetchCoupons();
                  }
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Coupon Code</label>
                  <input 
                    type="text" 
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    className="w-full border border-gray-300 rounded px-4 py-2 outline-none focus:border-[#0F9393] text-gray-800 text-[14px] font-semibold bg-white transition-colors" 
                    placeholder="E.g. UNHEARD20"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Type</label>
                    <select 
                      value={couponForm.discount_type}
                      onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value as any })}
                      className="w-full border border-gray-300 rounded px-4 py-2 outline-none focus:border-[#0F9393] text-gray-800 text-[14px] font-semibold bg-white transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%25236b7280%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%2%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Value</label>
                    <input 
                      type="number" 
                      value={couponForm.value}
                      onChange={(e) => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                      className="w-full border border-gray-300 rounded px-4 py-2 outline-none focus:border-[#0F9393] text-gray-800 text-[14px] font-semibold bg-white transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Usage Limit (-1 for unlimited)</label>
                    <input 
                      type="number" 
                      value={couponForm.usage_limit}
                      onChange={(e) => setCouponForm({ ...couponForm, usage_limit: Number(e.target.value) })}
                      className="w-full border border-gray-300 rounded px-4 py-2 outline-none focus:border-[#0F9393] text-gray-800 text-[14px] font-semibold bg-white transition-colors"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Expires At (Optional)</label>
                    <input 
                      type="date" 
                      value={couponForm.expires_at}
                      onChange={(e) => setCouponForm({ ...couponForm, expires_at: e.target.value })}
                      className="w-full border border-gray-300 rounded px-4 py-2 outline-none focus:border-[#0F9393] text-gray-850 text-[14px] font-semibold bg-white transition-colors"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full mt-2 py-3 bg-[#0F9393] hover:bg-[#0c7f7f] text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer">
                  Generate Coupon Code
                </button>
              </form>
            </div>

            {/* List Coupons (Right pane, 7-cols) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-lg border border-gray-200 flex flex-col gap-5 overflow-hidden">
               <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block border-b pb-2">Active Coupons</span>
               <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1">
                  {coupons.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-6 text-center">No coupons created yet.</p>
                  ) : (
                    coupons.map((coupon, i) => (
                      <div key={coupon.id || i} className="p-4 border border-gray-200 rounded flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-gray-300 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className="px-3 py-1.5 bg-[#0F9393]/10 rounded border border-[#0F9393]/20 flex items-center justify-center">
                              <span className="text-[15px] font-black text-[#0F9393] tracking-widest">{coupon.code}</span>
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[12px] font-bold text-slate-800 uppercase tracking-wide">
                                 {coupon.discount_type === 'percentage' ? `${coupon.value}% Discount` : `₹${coupon.value} Fixed Discount`}
                               </span>
                               <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                                 Usage: {coupon.usage_count} / {coupon.usage_limit === -1 ? 'Unlimited' : coupon.usage_limit}
                               </span>
                            </div>
                         </div>
                         <div className="flex items-center justify-between md:justify-end gap-6">
                            <div className="flex items-center gap-2">
                               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                               <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Active</span>
                            </div>
                            <button 
                              onClick={async () => {
                                if(confirm('Are you sure you want to delete this coupon?')) {
                                  const { error } = await supabase.from('coupons').delete().eq('id', coupon.id);
                                  if (error) {
                                    showToast(error.message, 'error');
                                  } else {
                                    showToast('Coupon deleted!');
                                    fetchCoupons();
                                  }
                                }
                              }}
                              className="p-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors cursor-pointer"
                              title="Delete Coupon"
                            >
                              <Trash2 size={14} />
                            </button>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'whatsapp' && (
          <div className="max-w-xl mx-auto bg-white p-6 rounded-lg border border-gray-200 flex flex-col gap-6 text-black">
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block border-b pb-2">WhatsApp Integration</span>
            <p className="text-xs text-gray-500 -mt-2">Scan to connect the automated message dispatcher.</p>
            
            {whatsappStatus.status === 'authenticated' && (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-[16px] font-bold text-emerald-600 tracking-tight">Connected & Automated</h3>
                <p className="text-gray-500 text-xs max-w-sm leading-relaxed">The secure WhatsApp WebSocket session is actively running and routing clinical message dispatches.</p>
                <div className="pt-2 w-full">
                  <button 
                    onClick={async () => {
                      if (confirm('Are you sure you want to reset WhatsApp login?')) {
                        await handleWhatsappReconnect();
                        showToast('WhatsApp session reset initiated.');
                      }
                    }} 
                    className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
                  >
                    Reset Connection &amp; Logout
                  </button>
                </div>
              </div>
            )}

            {whatsappStatus.status === 'error' && (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
                <h3 className="text-[16px] font-bold text-red-600 tracking-tight">Session Expired</h3>
                <p className="text-gray-500 text-xs max-w-sm leading-relaxed">The WhatsApp connection was closed due to a protocol error. Manual re-authentication is required.</p>
                <div className="pt-2 w-full">
                  <button 
                    onClick={handleWhatsappReconnect} 
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
                  >
                    Full Reset &amp; Scan QR
                  </button>
                </div>
              </div>
            )}

            {whatsappStatus.status === 'pending_qr' && whatsappStatus.qrDataUrl && (
              <div className="flex flex-col items-center gap-5 py-2">
                 <div className="p-3 border border-gray-200 rounded bg-white">
                   <Image src={whatsappStatus.qrDataUrl} alt="WhatsApp QR Code" width={220} height={220} className="rounded" />
                 </div>
                 <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded border border-gray-200 w-full text-xs">
                   <p className="text-slate-800 font-bold">1. Open WhatsApp on your mobile phone</p>
                   <p className="text-slate-800 font-bold">2. Tap Menu or Settings and select Linked Devices</p>
                   <p className="text-slate-800 font-bold">3. Point your phone scanner to this QR code</p>
                 </div>
                 <button 
                   onClick={handleWhatsappReconnect} 
                   className="w-full py-3 bg-[#0F9393] hover:bg-[#0c7f7f] text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
                 >
                   Refresh QR Code
                 </button>
              </div>
            )}

            {(whatsappStatus.status === 'disconnected' || whatsappStatus.status === 'initializing') && (
               <div className="flex flex-col items-center gap-5 py-6">
                 <div className="w-10 h-10 border-2 border-gray-200 border-t-[#0F9393] rounded-full animate-spin"></div>
                 <div className="flex flex-col gap-1 text-center">
                   <p className="text-slate-800 text-sm font-bold">
                     {whatsappStatus.status === 'initializing' ? 'Booting Secure WebSocket Connection...' : 'Waiting for Engine Startup'}
                   </p>
                   <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                     Establishing session stores
                   </p>
                 </div>
                 {whatsappStatus.status === 'disconnected' && (
                   <button 
                     onClick={handleWhatsappReconnect} 
                     className="w-full py-3 bg-[#0F9393] hover:bg-[#0c7f7f] text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
                   >
                     Start WhatsApp Engine
                   </button>
                 )}
               </div>
            )}
          </div>
        )}
        {activeTab === 'rooms' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-black">
            {/* Configure Virtual Room Form (5-cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-lg border border-gray-200 flex flex-col gap-5">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block border-b pb-2">Add Virtual Room Pool</span>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const { error } = await supabase.from('virtual_rooms').insert({
                    name: formData.get('name'),
                    gmeet_link: formData.get('gmeet_link')
                  });
                  if (error) {
                    showToast(error.message, 'error');
                  } else {
                    showToast('Virtual Room added to pool!');
                    fetchVirtualRooms();
                    (e.target as HTMLFormElement).reset();
                  }
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Room Name</label>
                  <input 
                    required 
                    name="name" 
                    type="text" 
                    placeholder="e.g. Room A" 
                    className="w-full border border-gray-300 rounded px-4 py-2 outline-none focus:border-[#0F9393] text-gray-800 text-[14px] font-semibold bg-white transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Google Meet Meeting Link</label>
                  <input 
                    required 
                    name="gmeet_link" 
                    type="url" 
                    placeholder="https://meet.google.com/..." 
                    className="w-full border border-gray-300 rounded px-4 py-2 outline-none focus:border-[#0F9393] text-gray-800 text-[14px] font-semibold bg-white transition-colors"
                  />
                </div>
                <button type="submit" className="w-full mt-2 py-3 bg-[#0F9393] hover:bg-[#0c7f7f] text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer">
                  Add Room
                </button>
              </form>
            </div>

            {/* Active Virtual Rooms List (7-cols) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-lg border border-gray-200 flex flex-col gap-5 overflow-hidden">
               <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block border-b pb-2">Active Virtual Rooms Pool</span>
               <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1">
                  {virtualRooms.length === 0 ? (
                    <p className="text-sm text-gray-400 italic py-6 text-center">No virtual rooms configured yet.</p>
                  ) : (
                    virtualRooms.map((room, i) => (
                      <div key={room.id || i} className="p-4 border border-gray-200 rounded flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-gray-300 transition-colors">
                         <div className="flex-1 flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                              <span className="text-[15px] font-bold text-slate-800">{room.name}</span>
                              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                Active
                              </span>
                            </div>
                            <span className="text-xs font-mono text-gray-500 break-all select-all">{room.gmeet_link}</span>
                         </div>
                         <div className="flex items-center justify-end">
                            <button 
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this virtual room?')) {
                                  const { error } = await supabase.from('virtual_rooms').delete().eq('id', room.id);
                                  if (error) {
                                    showToast(error.message, 'error');
                                  } else {
                                    showToast('Virtual Room deleted!');
                                    fetchVirtualRooms();
                                  }
                                }
                              }}
                              className="p-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors cursor-pointer"
                              title="Remove Pool"
                            >
                              <Trash2 size={14} />
                            </button>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>
        )}

         {activeTab === 'system' && (
           <div className="max-w-xl mx-auto bg-white p-6 rounded-lg border border-gray-200 flex flex-col gap-6 text-black">
             <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider block border-b pb-2">System Controller</span>
             <div className="flex flex-col gap-4 text-center py-4">
               <div className="flex justify-center mb-2">
                 <button 
                   onClick={async () => {
                     setCronStatus(prev => ({ ...prev, loading: true }));
                     showToast('Rebooting System Queue & Synchronization Cache...');
                     try {
                       await triggerCron();
                       await fetchQueue();
                       await fetchAdmins();
                       await fetchVirtualRooms();
                       showToast('System Reboot Complete.');
                     } catch (err: any) {
                       showToast('Reboot encountered issues: ' + err.message, 'error');
                     } finally {
                       setCronStatus(prev => ({ ...prev, loading: false }));
                     }
                   }}
                   disabled={cronStatus.loading}
                   className="w-16 h-16 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center text-red-650 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                   title="Reboot System"
                 >
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                     <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/>
                   </svg>
                 </button>
               </div>
               <h3 className="font-bold text-slate-800 text-[16px]">Soft Reset & Reboot</h3>
               <p className="text-gray-500 text-xs leading-relaxed px-4">
                 Clears the local sync schedules, triggers an immediate check for clinical session notifications, and updates live queue queries to fix any stuck room pools or client states.
               </p>
             </div>
           </div>
         )}
        </main>

      {/* Clinical Intake Detail Sheet */}
      {showQueueSheet && selectedQueueItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center md:p-4">
          <div onClick={() => setShowQueueSheet(false)} className="absolute inset-0 bg-black/45" />
          
          <div className="relative w-full h-full md:h-[85vh] md:max-w-5xl bg-white rounded-none md:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in md:zoom-in-95 duration-200 border-0 md:border border-gray-200">
            
            {/* Header Area */}
            <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-6 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-lg md:text-xl uppercase">
                  {(selectedQueueItem.guest_name !== 'Guest' && selectedQueueItem.guest_name) ? selectedQueueItem.guest_name[0] : (selectedQueueItem.answers?.name?.[0] || selectedQueueItem.answers?.guest_info?.name?.[0] || 'A')}
                </div>
                <div>
                  <h2 className="text-lg md:text-[22px] font-bold text-gray-900 leading-tight">
                    {selectedQueueItem.answers?.name || selectedQueueItem.answers?.guest_info?.name || (selectedQueueItem.guest_name !== 'Guest' ? selectedQueueItem.guest_name : 'Anonymous User')}
                  </h2>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] md:text-[11px] font-bold uppercase tracking-wider ${selectedQueueItem.is_trial ? 'bg-amber-100 text-amber-800' : 'bg-[#0f9393]/15 text-[#0F9393]'}`}>
                    {selectedQueueItem.is_trial ? 'Discovery Session' : 'Standard Session'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Allotted History Dropdown Button */}
                <div className="relative">
                  <button 
                    onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-[10px] md:text-xs uppercase rounded transition-colors cursor-pointer"
                  >
                    History
                  </button>
                  {showHistoryDropdown && (
                    <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white border border-gray-200 rounded shadow-xl z-[250] p-4 text-left">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block border-b pb-2 mb-2">Previous Allotted Sessions</span>
                      {historyQueueItems.filter(h => 
                        h.guest_email === selectedQueueItem.guest_email || 
                        (h.answers?.email && h.answers.email === selectedQueueItem.answers?.email)
                      ).length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {historyQueueItems
                            .filter(h => h.guest_email === selectedQueueItem.guest_email || (h.answers?.email && h.answers.email === selectedQueueItem.answers?.email))
                            .map((histItem, index) => {
                              const assignedTherapist = admins.find(a => a.user_id === histItem.assigned_therapist_id);
                              return (
                                <div key={index} className="p-2.5 bg-gray-50 border border-gray-150 rounded text-xs">
                                  <div className="flex justify-between font-bold text-gray-800">
                                    <span>{histItem.answers?.service || 'Session'}</span>
                                    <span className="text-[#0F9393]">{histItem.is_trial ? 'Discovery' : 'Standard'}</span>
                                  </div>
                                  <div className="text-[11px] text-gray-500 mt-1 flex justify-between">
                                    <span>{new Date(histItem.requested_start_time).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    <span className="font-semibold text-gray-600">By: {assignedTherapist?.full_name || 'Professional'}</span>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic py-2">No previous sessions found.</p>
                      )}
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => { setShowQueueSheet(false); setShowHistoryDropdown(false); }} 
                  className="p-2 border border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  title="Close"
                >
                  <Plus size={18} className="rotate-45" />
                </button>
              </div>
            </div>

            {/* Split Content Panels */}
            <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden bg-white relative">
                   {/* Left Column: Intake Dossier */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 relative group/scroll">
                
                {/* Dossier Header Info */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-b border-gray-150 pb-6">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Service Category</span>
                    <span className="text-[16px] font-bold text-gray-900 mt-1 block">{selectedQueueItem.answers?.service || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Language Preference</span>
                    <span className="text-[16px] font-bold text-gray-900 mt-1 block">{selectedQueueItem.answers?.language || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Payment Status</span>
                    <span className={`text-[16px] font-bold mt-1 block ${selectedQueueItem.is_trial ? 'text-emerald-600' : (selectedQueueItem.payment_status === 'paid' || selectedQueueItem.payment_intent_id ? 'text-[#0F9393]' : 'text-amber-600')}`}>
                      {selectedQueueItem.is_trial ? 'Free Discovery' : (selectedQueueItem.payment_status === 'paid' || selectedQueueItem.payment_intent_id ? 'Paid ✓' : 'Payment Pending')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Date Requested</span>
                    <span className="text-[16px] font-bold text-gray-900 mt-1 block">
                      {new Date(selectedQueueItem.requested_start_time).toLocaleDateString([], { day: '2-digit', month: 'short' })} at {new Date(selectedQueueItem.requested_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Patient Notes */}
                {selectedQueueItem.answers?.additionalInfo && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                    <p className="text-[14px] text-gray-800 leading-relaxed font-semibold italic">
                      &quot;{selectedQueueItem.answers.additionalInfo}&quot;
                    </p>
                  </div>
                )}

                {/* Personal Information Card */}
                {(selectedQueueItem.answers?.firstName || selectedQueueItem.answers?.dob || selectedQueueItem.answers?.gender || selectedQueueItem.answers?.occupation || selectedQueueItem.answers?.relationshipStatus) && (
                  <div className="bg-[#F8F9FA] p-6 rounded-lg border border-gray-200 space-y-4">
                    <div className="text-gray-500 border-b border-gray-200 pb-2 mb-1 flex justify-between items-center">
                      <span className="text-[12px] font-bold uppercase tracking-wider">Demographic Profile</span>
                      {selectedQueueItem.answers?.dob && (
                        <span className="text-[12px] font-bold text-[#0F9393] uppercase">
                          Computed Age: {new Date().getFullYear() - new Date(selectedQueueItem.answers.dob).getFullYear()} Years
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <span className="text-[11px] text-gray-400 font-medium block">Identity</span>
                        <span className="text-[15px] font-bold text-gray-900 block mt-0.5">{selectedQueueItem.answers?.firstName || ''} {selectedQueueItem.answers?.lastName || ''} ({selectedQueueItem.answers?.gender || 'N/A'})</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-400 font-medium block">Occupation / Status</span>
                        <span className="text-[15px] font-bold text-gray-900 block mt-0.5">{selectedQueueItem.answers?.occupation || 'N/A'} ({selectedQueueItem.answers?.relationshipStatus || 'N/A'})</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mental Health History */}
                {(selectedQueueItem.answers?.therapyBefore || selectedQueueItem.answers?.diagnoses || selectedQueueItem.answers?.medication || selectedQueueItem.answers?.underCare || selectedQueueItem.answers?.wellbeing || selectedQueueItem.answers?.stressLevel) && (
                  <div className="bg-[#F8F9FA] p-6 rounded-lg border border-gray-200 space-y-4">
                    <div className="text-gray-500 border-b border-gray-200 pb-2 mb-1">
                      <span className="text-[12px] font-bold uppercase tracking-wider">Clinical History</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <span className="text-[11px] text-gray-400 font-medium block">Therapy Before / Active Care</span>
                        <span className="text-[15px] font-bold text-gray-900 block mt-0.5">{selectedQueueItem.answers?.therapyBefore || 'No'} / {selectedQueueItem.answers?.underCare || 'No'}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-400 font-medium block">Active Medications</span>
                        <span className="text-[15px] font-bold text-gray-900 block mt-0.5">{selectedQueueItem.answers?.medication || 'None'}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-400 font-medium block">Wellbeing Rating</span>
                        <span className="text-[15px] font-bold text-gray-900 block mt-0.5">{selectedQueueItem.answers?.wellbeing || '0'}/10</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-400 font-medium block">Subjective Stress</span>
                        <span className="text-[15px] font-bold text-gray-900 block mt-0.5">{selectedQueueItem.answers?.stressLevel || '0'}/10</span>
                      </div>
                    </div>
                    {selectedQueueItem.answers?.diagnoses && (
                      <div className="border-t border-gray-200 pt-3 mt-1">
                        <span className="text-[11px] text-gray-400 font-medium block">Diagnoses</span>
                        <p className="text-[14px] text-gray-800 font-bold mt-1 leading-relaxed">{selectedQueueItem.answers.diagnoses}</p>
                      </div>
                    )}
                  </div>
                )}



                {/* Safety Risk Profile */}
                {(selectedQueueItem.answers?.harmingThoughts || selectedQueueItem.answers?.trustedPerson || selectedQueueItem.answers?.emergencyContactName || selectedQueueItem.answers?.digitalSignature) && (
                  <div className={`p-6 rounded-lg border ${selectedQueueItem.answers?.harmingThoughts === 'Yes' ? 'bg-red-50/50 border-red-200' : 'bg-white border-gray-200'} space-y-4`}>
                    <div className="text-rose-500 border-b border-gray-100 pb-2.5">
                      <span className="text-[12px] font-bold uppercase tracking-wider">Safety &amp; Consent Profile</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[11px] text-gray-400 font-medium block">Self-Harm Thoughts</span>
                        <span className={`text-[15px] font-bold ${selectedQueueItem.answers?.harmingThoughts === 'No' ? 'text-gray-900' : 'text-red-600 font-extrabold'}`}>
                          {selectedQueueItem.answers?.harmingThoughts || 'N/A'}
                        </span>
                      </div>
                      {selectedQueueItem.answers?.harmingThoughts !== 'No' && (
                        <>
                          {selectedQueueItem.answers?.trustedPerson && (
                            <div>
                              <span className="text-[11px] text-gray-400 font-medium block">Trusted Contact Person</span>
                              <span className="text-[14px] font-semibold text-gray-900 mt-0.5 block">{selectedQueueItem.answers.trustedPerson}</span>
                            </div>
                          )}
                          {(selectedQueueItem.answers?.emergencyContactName || selectedQueueItem.answers?.emergencyContactPhone) && (
                            <div className="p-3 bg-red-100/30 rounded border border-red-200/40 text-[12px] space-y-1 text-gray-700">
                              <p className="font-bold text-red-900 uppercase text-[9px] tracking-wider mb-1">Emergency Contact Details</p>
                              <div>Name: {selectedQueueItem.answers?.emergencyContactName || 'N/A'}</div>
                              <div>Phone: {selectedQueueItem.answers?.emergencyContactPhone || 'N/A'}</div>
                              <div>Relation: {selectedQueueItem.answers?.emergencyContactRelation || 'N/A'}</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

               {/* Right Column: Intake Assignment */}
               <div className="w-full md:w-[380px] bg-slate-50 p-8 overflow-y-auto space-y-6 flex flex-col border-l border-gray-200">
                 <div>
                   <h3 className="font-bold text-[14px] text-slate-800 uppercase tracking-wider">Clinical Assignment</h3>
                 </div>

                 {selectedQueueItem.status !== 'allotted' ? (
                   <form 
                     onSubmit={(e) => {
                       e.preventDefault();
                       const formData = new FormData(e.currentTarget);
                       handleAssignTherapist(
                         selectedQueueItem.id, 
                         formData.get('therapist_id') as string,
                         formData.get('meeting_link') as string
                       );
                     }}
                     className="flex-grow flex flex-col justify-between gap-6"
                   >
                     <div className="space-y-4">
                       <div className="flex flex-col gap-1.5">
                         <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Primary Therapist</label>
                         <select 
                           name="therapist_id" 
                           required
                           defaultValue=""
                           className="w-full h-11 border border-gray-300 rounded-lg px-4 bg-white text-gray-800 text-[14px] font-semibold outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] transition-all"
                         >
                           <option value="" disabled>Choose Professional...</option>
                           {admins.map((admin, i) => (
                             <option key={admin.user_id || i} value={admin.user_id}>{admin.full_name || 'Professional'}</option>
                           ))}
                         </select>
                       </div>
                       
                       <div className="flex flex-col gap-1.5">
                         <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Session Gate (Meet Override)</label>
                         <input 
                           type="url"
                           name="meeting_link"
                           placeholder="Paste meeting link here..."
                           className="w-full h-11 border border-gray-300 rounded-lg px-4 bg-white text-gray-800 text-[14px] font-semibold outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] transition-all placeholder:text-gray-400"
                         />
                       </div>
                     </div>

                     <button 
                       type="submit" 
                       disabled={loading} 
                       className="w-full py-4 bg-[#0F9393] hover:bg-[#0c7f7f] text-white text-[14px] font-bold uppercase tracking-wider rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 mt-auto"
                     >
                       {loading ? 'Processing...' : 'Confirm Assignment'}
                     </button>
                   </form>
                 ) : (
                   <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col items-center text-center gap-3">
                     <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                     </div>
                     <h3 className="font-bold text-emerald-950 text-[15px]">Successfully Allotted</h3>
                     <p className="text-emerald-700 text-xs leading-relaxed">This request has been processed and clinical resources have been assigned.</p>
                   </div>
                 )}
               </div>
             </div>

           </div>
         </div>
       )}
     </div>
   )
 }
