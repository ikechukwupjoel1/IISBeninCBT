
import React, { useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_STATS } from '../utils/mockData';
import { Button, Card, Input, Badge, Label } from './ui/UI';
import { Icons } from './ui/Icons';
import { Logo } from './ui/Logo';
import { Exam, ExamStatus, User, UserRole, InvigilatorAssignment } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
  exams: Exam[];
  onUpdateExams: React.Dispatch<React.SetStateAction<Exam[]>>;
  globalLogo: string;
  onUpdateLogo: (logo: string) => void;
  users: User[];
  onUpdateUsers: React.Dispatch<React.SetStateAction<User[]>>;
  halls: string[];
  onUpdateHalls: React.Dispatch<React.SetStateAction<string[]>>;
  invigilators: InvigilatorAssignment[];
  onUpdateInvigilators: React.Dispatch<React.SetStateAction<InvigilatorAssignment[]>>;
}

const SCHOOL_CLASSES = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 
  'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onLogout, 
  exams, 
  onUpdateExams, 
  globalLogo, 
  onUpdateLogo,
  users,
  onUpdateUsers,
  halls,
  onUpdateHalls,
  invigilators,
  onUpdateInvigilators
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'invigilators' | 'users' | 'settings'>('overview');
  
  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    assignedClass: '',
    duration: 30,
    status: 'SCHEDULED',
    date: '',
    time: ''
  });

  // User Management State
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    role: UserRole.STUDENT,
    grade: '',
    regNumber: '',
    email: '',
    phone: '',
    subject: ''
  });

  // Settings State
  const [newHallName, setNewHallName] = useState('');
  
  // Invigilator Assignment State
  const [assignStaffId, setAssignStaffId] = useState('');
  const [assignHall, setAssignHall] = useState('');

  const handleEditClick = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
        title: exam.title,
        subject: exam.subject,
        assignedClass: exam.assignedClass,
        duration: exam.durationMinutes,
        status: exam.status,
        date: exam.date || '',
        time: exam.time || ''
    });
    setShowScheduleModal(true);
  };

  const handleAddNewClick = () => {
    setEditingExam(null);
    setFormData({ title: '', subject: '', assignedClass: '', duration: 30, status: 'SCHEDULED', date: '', time: '' });
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = () => {
    if (editingExam) {
        // Update existing
        onUpdateExams(prev => prev.map(e => e.id === editingExam.id ? {
            ...e,
            title: formData.title,
            subject: formData.subject,
            assignedClass: formData.assignedClass,
            durationMinutes: formData.duration,
            status: formData.status as ExamStatus,
            date: formData.date,
            time: formData.time
        } : e));
    } else {
        // Create new placeholder exam
        const newExam: Exam = {
            id: `admin-e-${Date.now()}`,
            title: formData.title,
            subject: formData.subject,
            assignedClass: formData.assignedClass,
            durationMinutes: formData.duration,
            status: formData.status as ExamStatus,
            totalQuestions: 0,
            questions: [],
            date: formData.date,
            time: formData.time
        };
        onUpdateExams(prev => [...prev, newExam]);
    }
    setShowScheduleModal(false);
  };

  // Logo Upload Logic
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // User Management Logic
  const handleAddUser = () => {
    if (!newUser.name) return;
    
    const generatedPin = Math.floor(10000 + Math.random() * 90000).toString();
    const userToAdd: User = {
      id: `new-u-${Date.now()}`,
      name: newUser.name,
      role: newUser.role,
      regNumber: newUser.role === UserRole.STUDENT ? newUser.regNumber : undefined,
      pin: generatedPin,
      avatar: `https://ui-avatars.com/api/?name=${newUser.name.replace(' ', '+')}&background=random&color=fff`,
      grade: newUser.role === UserRole.STUDENT ? newUser.grade : undefined,
      // Staff fields (optional on User type but good to store if we extend)
    };
    
    onUpdateUsers(prev => [...prev, userToAdd]);
    setShowUserModal(false);
    
    // Reset form
    setNewUser({ name: '', role: UserRole.STUDENT, grade: '', regNumber: '', email: '', phone: '', subject: '' });
    
    // Show credentials
    const loginId = userToAdd.role === UserRole.STUDENT ? userToAdd.regNumber : 'Use Email/ID';
    alert(`User Created Successfully!\n\nName: ${userToAdd.name}\nRole: ${userToAdd.role}\nLogin ID: ${loginId}\nPIN: ${generatedPin}\n\nPlease copy these credentials.`);
  };

  const handleAddHall = () => {
    if (newHallName && !halls.includes(newHallName)) {
      onUpdateHalls(prev => [...prev, newHallName]);
      setNewHallName('');
      alert('New Hall Added');
    }
  };

  const handleAssignInvigilator = () => {
    if(!assignStaffId || !assignHall) return;

    const staffMember = users.find(u => u.id === assignStaffId);
    if(!staffMember) return;

    const newAssignment: InvigilatorAssignment = {
      id: `inv-${Date.now()}`,
      staffId: assignStaffId,
      staffName: staffMember.name,
      hallName: assignHall,
      status: 'Active'
    };
    
    onUpdateInvigilators(prev => [...prev, newAssignment]);
    setAssignStaffId('');
    setAssignHall('');
  };

  return (
    <div className="min-h-screen bg-brand-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20 relative">
        <div className="p-8 border-b border-slate-100">
          <div className="flex flex-col items-center text-center gap-4">
            <Logo className="w-20 h-20" src={globalLogo} />
            <div>
                <span className="block text-lg font-serif font-bold text-brand-900">IISBenin</span>
                <span className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-1 block">Admin Control</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'overview' ? 'bg-brand-50 text-brand-900 ring-1 ring-brand-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Icons.Dashboard className="w-5 h-5" /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'schedule' ? 'bg-brand-50 text-brand-900 ring-1 ring-brand-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Icons.Clock className="w-5 h-5" /> Schedule Exams
          </button>
          <button 
            onClick={() => setActiveTab('invigilators')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'invigilators' ? 'bg-brand-50 text-brand-900 ring-1 ring-brand-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
             <Icons.Users className="w-5 h-5" /> Invigilators
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'users' ? 'bg-brand-50 text-brand-900 ring-1 ring-brand-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
             User Management
          </button>
           <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'settings' ? 'bg-brand-50 text-brand-900 ring-1 ring-brand-200' : 'text-slate-500 hover:bg-slate-50'}`}
          >
             <Icons.Sparkles className="w-5 h-5" /> Settings
          </button>
        </nav>
        <div className="p-6 border-t border-slate-100">
          <button onClick={onLogout} className="flex items-center gap-3 text-red-500 hover:text-red-700 text-sm font-medium w-full transition-colors pl-2">
            <Icons.LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-serif font-bold text-brand-900">
              {activeTab === 'overview' && 'School Performance Overview'}
              {activeTab === 'schedule' && 'Examination Schedule'}
              {activeTab === 'invigilators' && 'Staff & Invigilation'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'settings' && 'System Settings'}
            </h2>
            <p className="text-slate-500 mt-1">Manage the IISBenin testing environment.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm border border-slate-200">
            <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-xs">A</div>
            <span className="text-sm font-bold text-slate-700">Administrator</span>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 flex items-center gap-5">
                  <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
                    <Icons.BookOpen className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scheduled Exams</p>
                    <p className="text-4xl font-bold text-slate-800 mt-1">{exams.length}</p>
                  </div>
              </Card>
              <Card className="p-6 flex items-center gap-5">
                  <div className="p-4 bg-green-50 rounded-2xl text-green-600">
                    <Icons.Users className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Users</p>
                    <p className="text-4xl font-bold text-slate-800 mt-1">{users.length}</p>
                  </div>
              </Card>
              <Card className="p-6 flex items-center gap-5">
                  <div className="p-4 bg-purple-50 rounded-2xl text-purple-600">
                    <Icons.Dashboard className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg. Pass Rate</p>
                    <p className="text-4xl font-bold text-slate-800 mt-1">92%</p>
                  </div>
              </Card>
            </div>

            <Card className="p-8">
              <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-bold text-slate-800">Global Performance Metrics</h3>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_STATS}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Bar dataKey="pass" name="Pass" fill="#4a7cbd" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fail" name="Fail" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'schedule' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <p className="text-slate-500">Set start/end times and assign classes.</p>
                <Button onClick={handleAddNewClick}>
                    <Icons.Plus className="w-4 h-4 mr-2" /> Add to Schedule
                </Button>
              </div>
              <Card className="overflow-hidden border-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Exam</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {exams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-600">{exam.date || 'Unscheduled'}</td>
                        <td className="px-6 py-4 text-slate-600 font-mono text-sm">{exam.time || '--:--'}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{exam.title}</td>
                        <td className="px-6 py-4 text-slate-600"><Badge color="blue">{exam.assignedClass}</Badge></td>
                        <td className="px-6 py-4 text-slate-600">{exam.durationMinutes} mins</td>
                        <td className="px-6 py-4"><Badge color={exam.status === 'ACTIVE' ? 'green' : 'gray'}>{exam.status}</Badge></td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleEditClick(exam)}
                            className="text-brand-600 font-medium text-sm hover:underline"
                          >
                            Edit Schedule
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
        )}

        {activeTab === 'invigilators' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-6">
                   <Card className="p-6 rounded-2xl shadow-soft bg-white">
                     <h3 className="font-bold text-slate-800 mb-4">Assign Invigilator</h3>
                     <div className="space-y-4">
                       <div>
                         <Label>Staff Member</Label>
                         <select 
                            className="w-full rounded-lg border-slate-300 bg-white text-slate-900 focus:border-brand-600 focus:ring-brand-600 sm:text-sm py-3 px-4 border"
                            value={assignStaffId}
                            onChange={(e) => setAssignStaffId(e.target.value)}
                         >
                            <option value="">Select Staff...</option>
                            {users.filter(u => u.role === UserRole.TEACHER).map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                         </select>
                       </div>
                       <div>
                         <Label>Exam Hall</Label>
                         <select 
                            className="w-full rounded-lg border-slate-300 bg-white text-slate-900 focus:border-brand-600 focus:ring-brand-600 sm:text-sm py-3 px-4 border"
                            value={assignHall}
                            onChange={(e) => setAssignHall(e.target.value)}
                         >
                           <option value="">Select Hall...</option>
                           {halls.map(h => (
                             <option key={h} value={h}>{h}</option>
                           ))}
                         </select>
                       </div>
                       <Button className="w-full" onClick={handleAssignInvigilator}>Assign Duty</Button>
                     </div>
                   </Card>

                   <Card className="p-6 rounded-2xl shadow-soft bg-brand-50 border border-brand-100">
                     <h3 className="font-bold text-brand-900 mb-4 flex items-center gap-2">
                       <Icons.Plus className="w-4 h-4" /> Add New Hall
                     </h3>
                     <div className="flex gap-2">
                        <Input 
                            placeholder="Hall Name (e.g. Room 304)" 
                            value={newHallName}
                            onChange={(e:any) => setNewHallName(e.target.value)}
                            className="bg-white"
                        />
                        <Button onClick={handleAddHall} variant="secondary" className="whitespace-nowrap">Add</Button>
                     </div>
                   </Card>
               </div>
               
               <div className="space-y-4">
                 <h3 className="font-bold text-slate-800 px-1">Current Assignments</h3>
                 {invigilators.length === 0 ? (
                     <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 border-dashed">
                         No active assignments.
                     </div>
                 ) : (
                     invigilators.map((inv) => (
                        <div key={inv.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><Icons.Users className="w-5 h-5" /></div>
                            <div>
                                <p className="font-bold text-slate-800">{inv.staffName}</p>
                                <p className="text-xs text-slate-500">Assigned to: {inv.hallName}</p>
                            </div>
                            </div>
                            <Badge color="green">{inv.status}</Badge>
                        </div>
                     ))
                 )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-center">
                <p className="text-slate-500">Manage Student and Staff accounts.</p>
                <Button onClick={() => setShowUserModal(true)}>
                    <Icons.Plus className="w-4 h-4 mr-2" /> Add User
                </Button>
             </div>
             
             <Card className="overflow-hidden border-0">
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 shadow-sm">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Role</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">ID / Reg No</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Class</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">PIN (Auto)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.filter(u => u.role !== UserRole.ADMIN).map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                             <img src={user.avatar} className="w-6 h-6 rounded-full" alt="" />
                             {user.name}
                          </td>
                          <td className="px-6 py-4"><Badge color={user.role === UserRole.TEACHER ? 'blue' : 'gray'}>{user.role}</Badge></td>
                          <td className="px-6 py-4 text-slate-600 font-mono text-xs">{user.regNumber || '-'}</td>
                          <td className="px-6 py-4 text-slate-600 font-mono text-xs">{user.grade || '-'}</td>
                          <td className="px-6 py-4 text-slate-600 font-mono text-xs tracking-widest">{user.pin || '****'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </Card>
          </div>
        )}

        {activeTab === 'settings' && (
            <div className="animate-in fade-in duration-500 space-y-8">
                <Card className="p-8 max-w-2xl">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">System Customization</h3>
                    <div className="space-y-6">
                        <div>
                            <Label>School Branding Logo</Label>
                            <div className="mt-2 flex items-center gap-6">
                                <div className="w-24 h-24 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                                    <Logo className="w-full h-full p-2" src={globalLogo} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-2">Upload a transparent PNG for best results.</p>
                                    <label className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium bg-white text-brand-900 border border-brand-200 hover:bg-brand-50 cursor-pointer transition-all shadow-sm">
                                        <span>Upload New Logo</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-8 max-w-2xl">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">Exam Halls List</h3>
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2 mt-4">
                            {halls.map(hall => (
                                <span key={hall} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium border border-slate-200">
                                    {hall}
                                </span>
                            ))}
                        </div>
                         <p className="text-xs text-slate-400">Tip: Add new halls in the Invigilator tab.</p>
                    </div>
                </Card>
            </div>
        )}
      </main>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md p-6 animate-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-brand-900 mb-4">{editingExam ? 'Edit Exam Schedule' : 'Add New Schedule'}</h3>
                <div className="space-y-4">
                    <div>
                        <Label>Exam Title</Label>
                        <Input value={formData.title} onChange={(e: any) => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <div>
                        <Label>Subject</Label>
                        <Input value={formData.subject} onChange={(e: any) => setFormData({...formData, subject: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Date</Label>
                            <Input type="date" value={formData.date} onChange={(e: any) => setFormData({...formData, date: e.target.value})} />
                        </div>
                        <div>
                            <Label>Time</Label>
                            <Input type="time" value={formData.time} onChange={(e: any) => setFormData({...formData, time: e.target.value})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Class</Label>
                            <select 
                                className="w-full rounded-lg border-slate-300 bg-white text-slate-900 sm:text-sm py-3 px-4 border"
                                value={formData.assignedClass}
                                onChange={(e) => setFormData({...formData, assignedClass: e.target.value})}
                            >
                                <option value="">Select Class...</option>
                                {SCHOOL_CLASSES.map(cls => (
                                    <option key={cls} value={cls}>{cls}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Duration (Mins)</Label>
                            <Input type="number" value={formData.duration} onChange={(e: any) => setFormData({...formData, duration: parseInt(e.target.value)})} />
                        </div>
                    </div>
                    <div>
                         <Label>Status</Label>
                         <select 
                            className="w-full rounded-lg border-slate-300 bg-white text-slate-900 sm:text-sm py-3 px-4 border"
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                         >
                             <option value="SCHEDULED">Scheduled</option>
                             <option value="ACTIVE">Active (Live)</option>
                             <option value="COMPLETED">Completed</option>
                         </select>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
                    <Button onClick={handleSaveSchedule}>Save Changes</Button>
                </div>
            </Card>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md p-6 animate-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-brand-900 mb-4">Add New User</h3>
                <div className="space-y-4">
                    <div>
                        <Label>Full Name</Label>
                        <Input value={newUser.name} onChange={(e: any) => setNewUser({...newUser, name: e.target.value})} />
                    </div>
                    <div>
                        <Label>Role</Label>
                        <select 
                            className="w-full rounded-lg border-slate-300 bg-white text-slate-900 sm:text-sm py-3 px-4 border"
                            value={newUser.role}
                            onChange={(e: any) => setNewUser({...newUser, role: e.target.value})}
                        >
                            <option value={UserRole.STUDENT}>Student</option>
                            <option value={UserRole.TEACHER}>Staff / Teacher</option>
                        </select>
                    </div>
                    
                    {/* Student Fields */}
                    {newUser.role === UserRole.STUDENT && (
                      <>
                        <div>
                          <Label>Grade / Class</Label>
                           <select 
                                className="w-full rounded-lg border-slate-300 bg-white text-slate-900 sm:text-sm py-3 px-4 border"
                                value={newUser.grade}
                                onChange={(e) => setNewUser({...newUser, grade: e.target.value})}
                            >
                                <option value="">Select Grade...</option>
                                {SCHOOL_CLASSES.map(cls => (
                                    <option key={cls} value={cls}>{cls}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                          <Label>Admission Number</Label>
                          <Input value={newUser.regNumber} onChange={(e: any) => setNewUser({...newUser, regNumber: e.target.value})} placeholder="e.g. IIS-2024-XXX" />
                        </div>
                      </>
                    )}

                    {/* Staff Fields */}
                    {newUser.role === UserRole.TEACHER && (
                        <>
                           <div>
                              <Label>Email Address</Label>
                              <Input type="email" value={newUser.email} onChange={(e: any) => setNewUser({...newUser, email: e.target.value})} placeholder="name@school.com" />
                           </div>
                           <div>
                              <Label>Phone Number</Label>
                              <Input type="tel" value={newUser.phone} onChange={(e: any) => setNewUser({...newUser, phone: e.target.value})} placeholder="+229..." />
                           </div>
                           <div>
                              <Label>Subject Specialization</Label>
                              <Input value={newUser.subject} onChange={(e: any) => setNewUser({...newUser, subject: e.target.value})} placeholder="e.g. Mathematics" />
                           </div>
                        </>
                    )}

                    <div className="bg-blue-50 p-3 rounded text-xs text-blue-700">
                        A secure PIN password will be automatically generated for this user upon creation.
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setShowUserModal(false)}>Cancel</Button>
                    <Button onClick={handleAddUser}>Create User</Button>
                </div>
            </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
