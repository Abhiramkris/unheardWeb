'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Button from '@/components/ui/Button'
import { Trash2, Users, LayoutDashboard, PenTool, Ticket, Phone, MonitorPlay, ArrowLeftRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import Image from 'next/image'
import BlogEditor from '@/components/BlogEditor'

import { useCallback } from 'react'

interface AdminRole {
  id: string;
  user_id: string;
  role: string;
  is_blogger: boolean;
  phone_number?: string;
  full_name?: string;
  qualification?: string;
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
  
  // Coupon Form State
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    usage_limit: -1,
    expires_at: ''
  })

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      if (data.success) {
        setWhatsappStatus(data.data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === 'whatsapp') {
      // Fetch immediately, then poll
      fetchStatus();
      interval = setInterval(fetchStatus, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, fetchStatus]);

  const handleWhatsappReconnect = async () => {
    setWhatsappStatus({ status: 'initializing', qrDataUrl: null });
    await fetch('/api/whatsapp/reconnect', { method: 'POST' });
  };

  const fetchAdmins = useCallback(async () => {
    // Fetch roles
    const { data: roles } = await supabase
      .from('user_roles')
      .select('*, phone_number')
      .in('role', ['admin', 'super_admin', 'blogger'])
    
    // Fetch profiles
    const { data: profiles } = await supabase
      .from('therapist_profiles')
      .select('user_id, full_name, qualification')

    if (roles) {
      setAdmins(roles.map((role: any) => {
        const profile = profiles?.find(p => p.user_id === role.user_id)
        return {
          ...role,
          full_name: profile?.full_name || 'Admin User',
          qualification: profile?.qualification
        }
      }))
    }
  }, [supabase]);

  const fetchBlogs = useCallback(async () => {
    const { data } = await supabase
      .from('blogs')
      .select('*, author_id(id)')
      .order('created_at', { ascending: false })
    if (data) setBlogs(data)
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
      .from('appointments')
      .select(`
        *,
        pre_booking_questionnaires(answers)
      `)
      .order('created_at', { ascending: false });
    
    if (!showClosed) {
        query = query.is('therapist_id', null);
    }
    
    const { data } = await query;
    if (data) setQueue(data);
  }, [supabase, showClosed]);

  const fetchVirtualRooms = useCallback(async () => {
    const { data } = await supabase.from('virtual_rooms').select('*').order('created_at', { ascending: false });
    if (data) setVirtualRooms(data);
  }, [supabase]);

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
  }, [supabase, fetchAdmins, fetchQueue]);

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

  const handleAssignTherapist = async (appointmentId: string, therapistId: string, meetingLink: string) => {
    if (!therapistId) return alert('Please select a therapist first');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/assign-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: appointmentId, therapist_id: therapistId, meeting_link: meetingLink }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Therapist assigned and WhatsApp messages dispatched!');
        fetchQueue();
      } else {
        alert(data.error || 'Failed to assign therapist');
      }
    } catch (e: any) {
      alert('Error assigning therapist');
    } finally {
      setLoading(false);
    }
  };

  const getDuration = (appt: any) => {
    if (!appt.joined_at_therapist || !appt.joined_at_patient) return null;
    const start = Math.max(new Date(appt.joined_at_therapist).getTime(), new Date(appt.joined_at_patient).getTime());
    const end = appt.completed_at ? new Date(appt.completed_at).getTime() : Date.now();
    const diff = Math.floor((end - start) / (1000 * 60));
    return diff;
  }

  return (
    <div className="min-h-screen bg-[#FEFEFC] font-nunito flex">
      {/* Sidebar */}
      <aside className="w-[280px] bg-white border-r border-gray-100 p-8 flex flex-col gap-10 flex-shrink-0 sticky top-0 h-screen overflow-y-auto custom-scrollbar">
        <h2 className="text-[28px] font-georgia font-bold text-[#0F9393]">unHeard <span className="text-[12px] text-gray-400 font-bold uppercase tracking-widest block">System Admin</span></h2>
        
        <nav className="flex flex-col gap-3">
          <button 
            onClick={() => { setActiveTab('queue'); fetchQueue(); }}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-[14px] transition-all ${activeTab === 'queue' ? 'bg-[#0F9393] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} /> Registrations
          </button>
          <button 
            onClick={() => setActiveTab('invite')}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-[14px] transition-all ${activeTab === 'invite' ? 'bg-[#0F9393] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Users size={20} /> Management
          </button>
          <button 
            onClick={() => { setActiveTab('blogs'); fetchBlogs(); }}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-[14px] transition-all ${activeTab === 'blogs' ? 'bg-[#0F9393] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <PenTool size={20} /> Blog Library
          </button>
          <button 
            onClick={() => { setActiveTab('coupons'); fetchCoupons(); }}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-[14px] transition-all ${activeTab === 'coupons' ? 'bg-[#0F9393] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Ticket size={20} /> Coupons
          </button>
          <button 
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-[14px] transition-all ${activeTab === 'whatsapp' ? 'bg-[#0F9393] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Phone size={20} /> WhatsApp Engine
          </button>
          <button 
            onClick={() => { setActiveTab('rooms'); fetchVirtualRooms(); }}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-[14px] transition-all ${activeTab === 'rooms' ? 'bg-[#0F9393] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <MonitorPlay size={20} /> Virtual Rooms
          </button>

          {isTherapist && (
            <button 
              onClick={() => window.location.href = '/admin/dashboard'}
              className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all bg-gray-900 text-white hover:bg-black mt-12 shadow-lg"
            >
               <ArrowLeftRight size={20} className="text-[#0F9393]" /> Therapist View
            </button>
          )}
        </nav>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto max-h-screen">

        {activeTab === 'invite' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Invite Form */}
            <div className="bg-white p-10 rounded-[24px] shadow-xl border border-gray-100 flex flex-col gap-6 text-black">
              <h2 className="text-[24px] font-bold font-georgia text-gray-900">Invite a New Therapist</h2>
              <form onSubmit={handleInvite} className="flex flex-col gap-6">
                <label className="flex flex-col font-bold text-[14px] text-gray-700">
                  Therapist&apos;s Name
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name" 
                    className="mt-1 border border-gray-200 rounded-full px-5 py-3 font-normal text-black focus:outline-none focus:border-[#0F9393] bg-gray-50/50" 
                    required
                  />
                </label>
                <label className="flex flex-col font-bold text-[14px] text-gray-700">
                  Phone Number
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number" 
                    className="mt-1 border border-gray-200 rounded-full px-5 py-3 font-normal text-black focus:outline-none focus:border-[#0F9393] bg-gray-50/50" 
                    required
                  />
                </label>
                <label className="flex flex-col font-bold text-[14px] text-gray-700">
                  Email Address
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email" 
                    className="mt-1 border border-gray-200 rounded-full px-5 py-3 font-normal text-black focus:outline-none focus:border-[#0F9393] bg-gray-50/50" 
                    required
                  />
                </label>
                <Button type="submit" variant="black" className="w-full mt-2" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Invite via Resend'}
                </Button>
                {message && <p className={`text-center font-bold ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
              </form>
            </div>

            {/* Existing Admins List */}
            <div className="bg-white p-10 rounded-[32px] shadow-xl border border-gray-100 flex flex-col gap-6 text-black">
              <h2 className="text-[24px] font-bold font-georgia text-gray-900">Existing Therapists (Admins)</h2>
              <div className="flex flex-col gap-4">
                {admins.length === 0 ? (
                  <p className="text-gray-400 italic">No therapists active yet.</p>
                ) : (
                  admins.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <div>
                        <div className="flex items-center gap-3">
                           <h4 className="font-bold text-[18px] text-[#0F9393]">{admin.full_name}</h4>
                           <span className="text-[12px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">{admin.phone_number || 'No Phone Sync'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <p className="text-[14px] text-gray-600">{admin.qualification || 'Awaiting profile setup'}</p>
                           <span className="text-gray-300">•</span>
                           <button 
                             onClick={() => toggleBloggerRole(admin.user_id, admin.is_blogger)}
                             className={`text-[12px] font-black uppercase tracking-widest ${admin.is_blogger ? 'text-[#0F9393]' : 'text-gray-400 hover:text-gray-600'}`}
                           >
                              {admin.is_blogger ? 'Blogger Active' : 'Enable Blogging'}
                           </button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-[12px] text-gray-400 uppercase font-black tracking-widest">Active</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'blogs' && (
          <div className="flex flex-col gap-8">
             <div className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <div className="flex flex-col">
                  <h2 className="text-[24px] font-georgia font-bold text-black">Global Blog Repository</h2>
                  <p className="text-gray-400 font-bold text-[14px] uppercase tracking-widest">Monitor and curate all platform content</p>
                </div>
                {!editingBlog && (
                  <Button 
                    variant="black" 
                    className="h-[50px] gap-2"
                    onClick={() => setEditingBlog({ title: '', content: [], published: false })}
                  >
                    Write Official Blog
                  </Button>
                )}
             </div>

              {editingBlog ? (
               <BlogEditor 
                 onSave={handleSaveBlog}
                 initialData={(editingBlog || undefined) as any}
               />
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {blogs.map((blog: Blog) => (
                    <div key={blog.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col gap-6 hover:shadow-md transition-all">
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
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                       </div>
                    </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="bg-white p-10 rounded-[32px] shadow-xl border border-gray-100 flex flex-col gap-6 text-black min-h-[500px]">
             <div className="flex justify-between items-center mb-4">
                <div>
                   <h2 className="text-[28px] font-bold font-georgia text-gray-900">{showClosed ? 'All Session Logs' : 'Unassigned Registrations'}</h2>
                   <p className="text-gray-500 font-nunito">Review pending patient registrations and manually assign them to an available therapist.</p>
                </div>
                <button 
                   onClick={() => setShowClosed(!showClosed)}
                   className={`px-6 py-2.5 rounded-full text-[13px] font-bold transition-all border ${showClosed ? 'bg-black text-white' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
                >
                   {showClosed ? 'Back to Queue' : 'Monitor Live Sessions'}
                </button>
                <button onClick={fetchQueue} className="text-[#0F9393] font-bold text-[14px] hover:underline">Refresh List</button>
             </div>

             <div className="flex flex-col gap-6">
                {queue.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-500 font-bold mb-2">Queue is Empty</p>
                    <p className="text-gray-400 text-[14px]">All registrations have been assigned successfully.</p>
                  </div>
                ) : (
                  queue.map((appt) => {
                    const qData = appt.pre_booking_questionnaires?.[0]?.answers || {};
                    const guestInfo = qData.guest_info || {};
                    
                    return (
                      <div key={appt.id} className="p-6 border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow bg-white">
                        <div className="flex flex-col lg:flex-row justify-between gap-6">
                           <div className="flex-1">
                              <div className="flex items-center gap-3 mb-4">
                                 <h3 className="font-bold text-[22px] font-georgia text-black">{guestInfo.name || 'Anonymous User'}</h3>
                                 {appt.is_trial && <span className="bg-[#0F9393]/10 text-[#0F9393] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Trial Session</span>}
                              </div>
                              <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-[14px] mb-4 text-black">
                                 <div>
                                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">Contact</p>
                                    <p className="font-bold text-gray-800">{guestInfo.phone || 'No Phone Sync'}</p>
                                 </div>
                                 <div>
                                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">Type / Concern</p>
                                    <p className="font-bold text-gray-800">{qData.type || 'Individual'} • {qData.service || 'General'}</p>
                                 </div>
                                 <div>
                                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">Age Group</p>
                                    <p className="font-bold text-gray-800">{qData.age || 'Unspecified'}</p>
                                 </div>
                                 <div>
                                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">Language</p>
                                    <p className="font-bold text-gray-800">{qData.language || 'Unspecified'}</p>
                                 </div>
                                 <div className="col-span-2 mt-2">
                                    <p className="text-[#0F9393] text-[14px] font-bold">
                                       Requested Date: {new Date(appt.start_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="flex-1 bg-gray-50 rounded-2xl p-6 flex flex-col justify-center border border-gray-100 text-black">
                              <p className="text-gray-800 font-bold mb-4 font-georgia text-[18px]">Assign to Therapist</p>
                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const formData = new FormData(e.currentTarget);
                                  handleAssignTherapist(
                                    appt.id, 
                                    formData.get('therapist_id') as string,
                                    formData.get('meeting_link') as string
                                  );
                                }}
                                className="flex flex-col gap-3"
                              >
                                 <select 
                                   name="therapist_id" 
                                   required
                                   defaultValue=""
                                   className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white font-bold outline-none focus:border-[#0F9393]"
                                 >
                                   <option value="" disabled>Select an active therapist</option>
                                   {admins.filter(a => a.full_name).map(admin => (
                                     <option key={admin.user_id} value={admin.user_id}>Dr. {admin.full_name}</option>
                                   ))}
                                 </select>
                                 <input 
                                   type="url"
                                   name="meeting_link"
                                   placeholder="Meet Link (leave blank for Auto-Assign)"
                                   className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white font-bold outline-none focus:border-[#0F9393]"
                                 />
                                 <Button variant="black" type="submit" disabled={loading} className="w-full">Assign & Notify</Button>
                              </form>
                           </div>
                        </div>
                      </div>
                    )
                  })
                )}
             </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-black">
            {/* Create Coupon */}
            <div className="bg-white p-10 rounded-[32px] shadow-xl border border-gray-100 flex flex-col gap-6">
              <h2 className="text-[24px] font-bold font-georgia text-gray-900">Create New Coupon</h2>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const { error } = await supabase.from('coupons').insert([couponForm]);
                  if (error) alert(error.message);
                  else {
                    alert('Coupon created!');
                    setCouponForm({ code: '', discount_type: 'percentage', value: 0, usage_limit: -1, expires_at: '' });
                    fetchCoupons();
                  }
                }}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-bold text-gray-600">Coupon Code</label>
                  <input 
                    type="text" 
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    className="border border-gray-200 rounded-full px-5 py-3 focus:border-[#0F9393] outline-none" 
                    placeholder="E.g. UNHEARD20"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[14px] font-bold text-gray-600">Type</label>
                    <select 
                      value={couponForm.discount_type}
                      onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value as any })}
                      className="border border-gray-200 rounded-full px-5 py-3 focus:border-[#0F9393] outline-none bg-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[14px] font-bold text-gray-600">Value</label>
                    <input 
                      type="number" 
                      value={couponForm.value}
                      onChange={(e) => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                      className="border border-gray-200 rounded-full px-5 py-3 focus:border-[#0F9393] outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[14px] font-bold text-gray-600">Usage Limit (-1 for unlimited)</label>
                    <input 
                      type="number" 
                      value={couponForm.usage_limit}
                      onChange={(e) => setCouponForm({ ...couponForm, usage_limit: Number(e.target.value) })}
                      className="border border-gray-200 rounded-full px-5 py-3 focus:border-[#0F9393] outline-none"
                      required
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[14px] font-bold text-gray-600">Expires At (Optional)</label>
                    <input 
                      type="date" 
                      value={couponForm.expires_at}
                      onChange={(e) => setCouponForm({ ...couponForm, expires_at: e.target.value })}
                      className="border border-gray-200 rounded-full px-5 py-3 focus:border-[#0F9393] outline-none"
                    />
                  </div>
                </div>
                <Button variant="black" type="submit" className="mt-4">Generate Coupon Code</Button>
              </form>
            </div>

            {/* List Coupons */}
            <div className="bg-white p-10 rounded-[32px] shadow-xl border border-gray-100 flex flex-col gap-6 overflow-hidden">
               <h2 className="text-[24px] font-bold font-georgia text-gray-900">Active Coupons</h2>
               <div className="flex flex-col gap-4 overflow-y-auto max-h-[600px] pr-2">
                  {coupons.length === 0 ? (
                    <p className="text-gray-400 italic">No coupons created yet.</p>
                  ) : (
                    coupons.map((coupon) => (
                      <div key={coupon.id} className="p-5 border border-gray-100 rounded-2xl hover:bg-gray-50/50 transition-all group">
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col">
                               <span className="text-[20px] font-black text-[#0F9393] tracking-wider">{coupon.code}</span>
                               <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                                 {coupon.discount_type === 'percentage' ? `${coupon.value}% Off` : `₹${coupon.value} Off`}
                               </span>
                            </div>
                            <button 
                              onClick={async () => {
                                if(confirm('Delete coupon?')) {
                                  await supabase.from('coupons').delete().eq('id', coupon.id);
                                  fetchCoupons();
                                }
                              }}
                              className="text-red-200 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-3 rounded-xl border border-gray-50 shadow-sm">
                               <p className="text-[10px] uppercase font-black text-gray-400 tracking-tighter">Usage</p>
                               <p className="text-[14px] font-bold text-gray-700">{coupon.usage_count} / {coupon.usage_limit === -1 ? '∞' : coupon.usage_limit}</p>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-gray-50 shadow-sm">
                               <p className="text-[10px] uppercase font-black text-gray-400 tracking-tighter">Status</p>
                               <p className={`text-[14px] font-bold ${coupon.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                 {coupon.is_active ? 'Active' : 'Disabled'}
                               </p>
                            </div>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'whatsapp' && (
          <div className="bg-white p-10 rounded-[32px] shadow-xl border border-gray-100 flex flex-col items-center text-center max-w-[600px] mx-auto text-black mt-8">
            <h2 className="text-[28px] font-bold font-georgia text-gray-900 mb-2">WhatsApp Integration</h2>
            <p className="text-gray-500 mb-8">Scan to connect the automated message dispatcher.</p>
            
            {whatsappStatus.status === 'authenticated' && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2 shadow-inner">
                  <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-[24px] font-bold text-green-600 tracking-tight">Connected & Automated</h3>
                <p className="text-gray-500 mb-6 max-w-[300px]">The secure WebSocket session is actively running and ready to dispatch messages.</p>
                <div className="flex gap-4">
                  <Button variant="black" onClick={handleWhatsappReconnect} className="bg-red-600 hover:bg-red-700">Reset Login & Logout</Button>
                </div>
              </div>
            )}

            {whatsappStatus.status === 'error' && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2 shadow-inner">
                  <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
                <h3 className="text-[24px] font-bold text-red-600 tracking-tight">Session Expired</h3>
                <p className="text-gray-500 mb-6 max-w-[300px]">The WhatsApp connection was closed due to a protocol error. Manual re-authentication is required.</p>
                <Button variant="black" className="bg-red-600 hover:bg-red-700" onClick={handleWhatsappReconnect}>Full Reset & Scan QR</Button>
              </div>
            )}

            {whatsappStatus.status === 'pending_qr' && whatsappStatus.qrDataUrl && (
              <div className="flex flex-col items-center gap-6">
                 <div className="p-4 border border-gray-200 rounded-3xl bg-white shadow-xl shadow-black/5">
                   <Image src={whatsappStatus.qrDataUrl} alt="WhatsApp QR Code" width={280} height={280} className="rounded-xl" />
                 </div>
                 <div className="flex flex-col gap-2 bg-gray-50 p-6 rounded-2xl w-full">
                   <p className="text-gray-700 font-bold text-[14px]">1. Open WhatsApp on your phone</p>
                   <p className="text-gray-700 font-bold text-[14px]">2. Tap Menu or Settings and select Linked Devices</p>
                   <p className="text-gray-700 font-bold text-[14px]">3. Point your phone to this screen</p>
                 </div>
                 <Button variant="black" onClick={handleWhatsappReconnect} className="w-full mt-2">Refresh QR Code</Button>
              </div>
            )}

            {(whatsappStatus.status === 'disconnected' || whatsappStatus.status === 'initializing') && (
               <div className="flex flex-col items-center gap-6 py-12">
                 <div className="w-16 h-16 border-4 border-gray-100 border-t-[#0F9393] rounded-full animate-spin"></div>
                 <div className="flex flex-col gap-1">
                   <p className="text-black text-[18px] font-bold">
                     {whatsappStatus.status === 'initializing' ? 'Booting Secure WebSocket Connection...' : 'Waiting for Engine Startup'}
                   </p>
                   <p className="text-gray-400 text-[14px]">
                     Establishing link with Supabase session store
                   </p>
                 </div>
                 {whatsappStatus.status === 'disconnected' && (
                   <Button variant="black" onClick={handleWhatsappReconnect} className="mt-4">
                     Start WhatsApp Engine
                   </Button>
                 )}
               </div>
            )}
          </div>
        )}
        {activeTab === 'rooms' && (
          <div className="bg-white p-10 rounded-[32px] shadow-xl border border-gray-100 flex flex-col gap-6 text-black">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h2 className="text-[28px] font-bold font-georgia text-gray-900">Virtual Room Engine</h2>
                    <p className="text-gray-500 font-nunito">Supply Google Meet links to beautifully automate session routing without any APIs.</p>
                 </div>
                 <form 
                   onSubmit={async (e) => {
                     e.preventDefault();
                     const formData = new FormData(e.currentTarget);
                     const { error } = await supabase.from('virtual_rooms').insert({
                       name: formData.get('name'),
                       gmeet_link: formData.get('gmeet_link')
                     });
                     if (error) alert(error.message);
                     else {
                       fetchVirtualRooms();
                       (e.target as HTMLFormElement).reset();
                     }
                   }}
                   className="flex gap-3 bg-gray-50 p-2 rounded-2xl"
                 >
                   <input required name="name" type="text" placeholder="e.g. Room A" className="px-4 py-2 rounded-xl border border-gray-200" />
                   <input required name="gmeet_link" type="url" placeholder="https://meet.google.com/..." className="px-4 py-2 rounded-xl border border-gray-200 w-[280px]" />
                   <Button variant="black" type="submit">Add Room</Button>
                 </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {virtualRooms.length === 0 ? (
                   <div className="col-span-full py-20 text-center flex flex-col items-center">
                      <p className="text-gray-400 font-bold">No virtual rooms configured.</p>
                   </div>
                 ) : (
                   virtualRooms.map((room) => (
                     <div key={room.id} className="p-6 rounded-2xl border border-gray-100 flex flex-col gap-4 shadow-sm bg-gray-50/50">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-[18px]">{room.name}</h4>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${room.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {room.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-[12px] font-mono p-3 bg-white rounded-xl break-all border border-gray-100 text-gray-500">{room.gmeet_link}</p>
                        <div className="flex gap-2 mt-2">
                           <button 
                             onClick={async () => {
                               const { error } = await supabase.from('virtual_rooms').delete().eq('id', room.id);
                               if (!error) fetchVirtualRooms();
                             }}
                             className="flex-1 bg-red-50 text-red-500 font-bold text-[13px] py-2.5 rounded-xl hover:bg-red-100 transition-all"
                           >
                             Remove Pool
                           </button>
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
