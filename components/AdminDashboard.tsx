import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_EXAMS, MOCK_STATS, MOCK_INVIGILATORS } from '../utils/mockData';
import { Button, Card, Input, Badge, Label } from './ui/UI';
import { Icons } from './ui/Icons';
import { Logo } from './ui/Logo';
import { Exam } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'invigilators'>('overview');
  const [exams, setExams] = useState<Exam[]>(MOCK_EXAMS);
  
  return (
    <div className="min-h-screen bg-brand-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20 relative">
        <div className="p-8 border-b border-slate-100">
          <div className="flex flex-col items-center text-center gap-4">
            <Logo className="w-20 h-20" />
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
                    <p className="text-4xl font-bold text-slate-800 mt-1">8</p>
                  </div>
              </Card>
              <Card className="p-6 flex items-center gap-5">
                  <div className="p-4 bg-green-50 rounded-2xl text-green-600">
                    <Icons.Users className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Students</p>
                    <p className="text-4xl font-bold text-slate-800 mt-1">342</p>
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
                <Button><Icons.Plus className="w-4 h-4 mr-2" /> Add to Schedule</Button>
              </div>
              <Card className="overflow-hidden border-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
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
                        <td className="px-6 py-4 font-medium text-slate-900">{exam.title}</td>
                        <td className="px-6 py-4 text-slate-600">{exam.assignedClass}</td>
                        <td className="px-6 py-4 text-slate-600">{exam.durationMinutes} mins</td>
                        <td className="px-6 py-4"><Badge color={exam.status === 'ACTIVE' ? 'green' : 'gray'}>{exam.status}</Badge></td>
                        <td className="px-6 py-4">
                          <button className="text-brand-600 font-medium text-sm hover:underline">Edit Schedule</button>
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
               <div className="bg-white p-6 rounded-2xl shadow-soft">
                 <h3 className="font-bold text-slate-800 mb-4">Assign Invigilator</h3>
                 <div className="space-y-4">
                   <div>
                     <Label>Staff Member</Label>
                     <Input placeholder="Search staff name..." />
                   </div>
                   <div>
                     <Label>Exam Hall</Label>
                     <select className="w-full rounded-lg border-slate-300 bg-white text-slate-900 focus:border-brand-600 focus:ring-brand-600 sm:text-sm py-3 px-4 border">
                       <option>Hall A (Science Block)</option>
                       <option>Hall B (Arts Block)</option>
                       <option>Computer Lab 1</option>
                     </select>
                   </div>
                   <Button className="w-full">Assign Duty</Button>
                 </div>
               </div>
               
               <div className="space-y-4">
                 {MOCK_INVIGILATORS.map(inv => (
                   <div key={inv.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                         <Icons.Users className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="font-bold text-slate-800">{inv.name}</p>
                         <p className="text-xs text-slate-500">Assigned to: {inv.assignedRoom}</p>
                       </div>
                     </div>
                     <Badge color={inv.status === 'Active' ? 'green' : 'gray'}>{inv.status}</Badge>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;