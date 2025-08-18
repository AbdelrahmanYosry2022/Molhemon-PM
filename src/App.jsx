import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from "recharts";
import { Plus, Trash2, Calendar, DollarSign, TimerReset, FolderPlus, ChevronsLeft, ChevronsRight, LayoutDashboard, LogOut } from "lucide-react";
import { supabase } from './supabaseClient.js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

// --- Professional Design System ---
const colors = {
  background: '#FFFFFF',
  surface: '#F6FAF8',
  sidebar: '#F5F7F6',
  border: '#E6EAE9',
  divider: '#EEF2F1',
  
  textPrimary: '#2F2D2D',
  textSecondary: '#565454',
  textSubtle: '#9CA3AF',

  primary: '#2E7D6E',
  primaryHover: '#276E61',
  primaryMuted: '#E8F1EF',

  destructive: '#C0392B',
  destructiveHover: '#A83227',
  destructiveMuted: '#FCEBEC',
  
  warning: '#F6A623',
  warningMuted: '#FFF6E5',
  
  info: '#2F6DAA',
  infoMuted: '#EAF2FB',
};

/* ================= Main App Component ================= */
export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
        <div className="h-screen w-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={['google', 'github']} // يمكنك إضافة المزيد
                    localization={{
                        variables: {
                            sign_in: { email_label: 'البريد الإلكتروني', password_label: 'كلمة المرور', button_label: 'تسجيل الدخول', link_text: 'لديك حساب بالفعل؟ سجل الدخول' },
                            sign_up: { email_label: 'البريد الإلكتروني', password_label: 'كلمة المرور', button_label: 'إنشاء حساب جديد', link_text: 'ليس لديك حساب؟ أنشئ واحداً' },
                        },
                    }}
                />
            </div>
        </div>
    );
  } else {
    return <Dashboard session={session} />;
  }
}


/* ================= Dashboard Component ================= */
function Dashboard({ session }) {
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("EGP");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [projects, setProjects] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [payments, setPayments] = useState([]);
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
        setLoading(true);
        const { data: projectsData, error: projectsError } = await supabase.from('projects').select('*');
        if (projectsError) {
            console.error('Error fetching projects:', projectsError);
        } else {
            const formattedProjects = projectsData.map(p => ({ ...p, start: p.start_date, end: p.end_date }));
            setProjects(formattedProjects);
            if (formattedProjects.length > 0) {
                setActiveId(formattedProjects[0].id);
            } else {
                setLoading(false);
            }
        }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const fetchProjectData = async () => {
        setLoading(true);
        const { data: categoriesData } = await supabase.from('categories').select('*').eq('project_id', activeId);
        const { data: paymentsData } = await supabase.from('payments').select('*').eq('project_id', activeId);
        const { data: milestonesData } = await supabase.from('milestones').select('*').eq('project_id', activeId);

        if (categoriesData) setCategories(categoriesData);
        if (milestonesData) setMilestones(milestonesData);
        if (paymentsData && categoriesData) {
            const categoryMap = new Map(categoriesData.map(c => [c.id, c.name]));
            const formattedPayments = paymentsData.map(p => ({ ...p, date: p.pay_date, category: categoryMap.get(p.category_id) || '' }));
            setPayments(formattedPayments);
        }
        setLoading(false);
    };
    fetchProjectData();
  }, [activeId]);

  const activeProject = useMemo(() => projects.find(p => p.id === activeId), [projects, activeId]);
  const project = activeProject || { name: "", total: 0, start: "", end: "" };
  const paid = useMemo(() => payments.reduce((s, p) => s + (Number(p.amount) || 0), 0), [payments]);
  const remaining = Math.max(0, (Number(project.total) || 0) - paid);
  const paidPct = project.total ? Math.min(100, Math.round((paid / project.total) * 100)) : 0;
  
  const updateProject = async (patch) => {
    const dbPatch = { ...patch };
    if (patch.start !== undefined) { dbPatch.start_date = patch.start; delete dbPatch.start; }
    if (patch.end !== undefined) { dbPatch.end_date = patch.end; delete dbPatch.end; }
    const { data, error } = await supabase.from('projects').update(dbPatch).eq('id', project.id).select().single();
    if (error) console.error("Error updating project:", error);
    else if (data) {
        const formattedProject = { ...data, start: data.start_date, end: data.end_date };
        setProjects(ps => ps.map(p => p.id === project.id ? formattedProject : p));
    }
  };

  const addProject = async () => {
    const { data, error } = await supabase.from('projects').insert({ name: `مشروع ${projects.length + 1}`, total: 50000 }).select().single();
    if (error) console.error("Error adding project:", error);
    else if (data) {
        const formattedProject = { ...data, start: data.start_date, end: data.end_date };
        setProjects(ps => [...ps, formattedProject]);
        setActiveId(data.id);
    }
  };

  const deleteProject = async () => {
    if (!project) return;
    const { error } = await supabase.from('projects').delete().eq('id', project.id);
    if (error) console.error("Error deleting project:", error);
    else {
        const remainingProjects = projects.filter(p => p.id !== project.id);
        setProjects(remainingProjects);
        setActiveId(remainingProjects.length > 0 ? remainingProjects[0].id : null);
    }
  };

  // ... (باقي دوال التعديل بدون تغيير)
  const addPayment = async () => {
    const { data, error } = await supabase.from('payments').insert({ amount: 0, pay_date: toISO(new Date()), note: "", category_id: categories[0]?.id || null, project_id: project.id }).select().single();
    if (error) console.error('Error adding payment:', error);
    else if (data) {
        const categoryName = categories.find(c => c.id === data.category_id)?.name || '';
        const formattedPayment = { ...data, date: data.pay_date, category: categoryName };
        setPayments(p => [...p, formattedPayment]);
    }
  };

  const removePayment = async (id) => {
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) console.error('Error removing payment:', error);
    else setPayments(p => p.filter(payment => payment.id !== id));
  };

  const updatePayment = async (id, patch) => {
      const dbPatch = { ...patch };
      if (patch.date !== undefined) { dbPatch.pay_date = patch.date; delete dbPatch.date; }
      if (patch.category !== undefined) {
          const category = categories.find(c => c.name === patch.category);
          dbPatch.category_id = category ? category.id : null;
          delete dbPatch.category;
      }
      const { data, error } = await supabase.from('payments').update(dbPatch).eq('id', id).select().single();
      if (error) console.error('Error updating payment:', error);
      else if (data) {
          const categoryName = categories.find(c => c.id === data.category_id)?.name || '';
          const formattedPayment = { ...data, date: data.pay_date, category: categoryName };
          setPayments(arr => arr.map(it => it.id === id ? formattedPayment : it));
      }
  };

  const addMilestone = async () => {
    const { data, error } = await supabase.from('milestones').insert({ title: "معلم جديد", date: toISO(new Date()), status: "in-progress", project_id: project.id }).select().single();
    if (error) console.error('Error adding milestone:', error);
    else if (data) setMilestones(m => [...m, data]);
  };

  const removeMilestone = async (id) => {
    const { error } = await supabase.from('milestones').delete().eq('id', id);
    if (error) console.error('Error removing milestone:', error);
    else setMilestones(m => m.filter(milestone => milestone.id !== id));
  };

  const updateMilestone = async (id, patch) => {
    const { data, error } = await supabase.from('milestones').update(patch).eq('id', id).select().single();
    if (error) console.error('Error updating milestone:', error);
    else if (data) setMilestones(arr => arr.map(it => it.id === id ? data : it));
  };

  const addCategory = async () => {
    const { data, error } = await supabase.from('categories').insert({ name: "بند جديد", budget: 0, project_id: project.id }).select().single();
    if (error) console.error('Error adding category:', error);
    else if (data) setCategories(c => [...c, data]);
  };

  const removeCategory = async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) console.error('Error removing category:', error);
    else setCategories(c => c.filter(cat => cat.id !== id));
  };

  const updateCategory = async (id, patch) => {
    const { data, error } = await supabase.from('categories').update(patch).eq('id', id).select().single();
    if (error) console.error('Error updating category:', error);
    else if (data) setCategories(arr => arr.map(it => it.id === id ? data : it));
  };

  if (loading && projects.length === 0) {
      return <div className={`h-screen w-screen bg-[${colors.background}] text-[${colors.textPrimary}] flex items-center justify-center text-xl`}>جاري تحميل البيانات...</div>
  }

  return (
    <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
      body {
        font-family: "Cairo", "Inter", "Noto Kufi Arabic", system-ui, -apple-system, "Segoe UI", "Noto Sans Arabic", sans-serif;
      }
      input, select, button {
        font-family: inherit;
      }
      input[type=number] {
        text-align: right;
        font-feature-settings: "tnum" 1;
      }
      input[type="date"] {
        direction: rtl;
        text-align: right;
      }
      input[type="date"]::-webkit-datetime-edit { direction: rtl; text-align: right; }
      input[type="date"]::-webkit-datetime-edit-fields-wrapper { direction: rtl; }
      input[type="date"]::-webkit-datetime-edit-text { padding: 0 2px; }
    `}</style>
    <div className={`h-screen w-screen bg-[${colors.background}] text-[${colors.textPrimary}] flex`}>
      {/* Sidebar */}
      <aside className={`bg-[${colors.sidebar}] border-l border-[${colors.border}] transition-all duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className={`p-4 border-b border-[${colors.border}] flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            <div className={`flex items-center gap-2 overflow-hidden transition-opacity ${!sidebarOpen && 'opacity-0 w-0 h-0'}`}>
                <LayoutDashboard style={{ color: colors.primary }} />
                <h1 className="text-lg font-bold">لوحة التحكم</h1>
            </div>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-1.5 rounded-md text-[${colors.primary}] hover:bg-[${colors.primaryMuted}]`}>
                {sidebarOpen ? <ChevronsRight /> : <ChevronsLeft />}
            </button>
        </div>
        <div className="p-4 flex-grow overflow-y-auto">
            <h2 className={`text-sm font-semibold text-[${colors.textSecondary}] mb-3 transition-all ${!sidebarOpen && 'text-center'}`}>{sidebarOpen ? 'المشاريع' : ' '}</h2>
            <div className="space-y-2">
                {projects.map(p => (
                    <button 
                        key={p.id}
                        onClick={() => setActiveId(p.id)}
                        className={`w-full text-right p-2.5 rounded-md text-sm font-medium transition-colors ${activeId === p.id ? `bg-[${colors.primaryMuted}] text-[${colors.primary}]` : `hover:bg-[${colors.border}]`}`}
                    >
                        {sidebarOpen ? p.name : <span className="flex items-center justify-center font-bold">{p.name.charAt(0).toUpperCase()}</span>}
                    </button>
                ))}
            </div>
        </div>
        <div className="p-4 border-t border-[${colors.border}] space-y-2">
            <button onClick={addProject} className={`w-full px-4 py-2.5 rounded-md bg-[${colors.primary}] text-white hover:bg-[${colors.primaryHover}] inline-flex items-center gap-2 ${!sidebarOpen && 'justify-center'}`}>
              <Plus size={16} /> {sidebarOpen && 'مشروع جديد'}
            </button>
            <button onClick={deleteProject} disabled={!activeProject} className={`w-full px-4 py-2.5 rounded-md bg-[${colors.destructiveMuted}] text-[${colors.destructive}] hover:bg-[${colors.destructiveMuted}]/60 inline-flex items-center gap-2 disabled:opacity-50 ${!sidebarOpen && 'justify-center'}`}>
              <Trash2 size={16} /> {sidebarOpen && 'حذف المشروع'}
            </button>
            <button onClick={() => supabase.auth.signOut()} className={`w-full px-4 py-2.5 rounded-md bg-white text-[${colors.textSecondary}] border border-[${colors.border}] hover:bg-[${colors.surface}] inline-flex items-center gap-2 ${!sidebarOpen && 'justify-center'}`}>
              <LogOut size={16} /> {sidebarOpen && 'تسجيل الخروج'}
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 overflow-y-auto">
        {loading ? (
             <div className="h-full w-full flex items-center justify-center text-slate-500">جاري تحميل بيانات المشروع...</div>
        ) : activeProject ? (
        <div className="space-y-6">
            <header>
                <h1 className={`text-3xl font-bold text-[${colors.textPrimary}]`}>{project.name}</h1>
                <p className={`text-[${colors.textSecondary}]`}>{session.user.email}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="الميزانية الكلية" value={fmtCurrency(project.total, currency)} icon={DollarSign} />
                <StatCard title="المدفوع" value={fmtCurrency(paid, currency)} icon={DollarSign} />
                <StatCard title="المتبقي" value={fmtCurrency(remaining, currency)} icon={DollarSign} />
                <StatCard title="نسبة الإنفاق" value={`${paidPct}%`} icon={DollarSign} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`lg:col-span-2 bg-[${colors.background}] p-4 rounded-xl border border-[${colors.border}] shadow-sm`}>
                    <h3 className="text-lg font-semibold mb-4">تفاصيل المشروع</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                    <label className="space-y-1">
                        <span className={`text-sm font-medium text-[${colors.textSecondary}]`}>اسم المشروع</span>
                        <input className={`w-full rounded-md border border-[${colors.border}] bg-white px-3 py-2 focus:border-[${colors.primary}] focus:ring-2 focus:ring-[${colors.primaryMuted}] outline-none`} value={project.name} onChange={(e) => updateProject({ name: e.target.value })} />
                    </label>
                    <label className="space-y-1">
                        <span className={`text-sm font-medium text-[${colors.textSecondary}]`}>الميزانية الكلية ({currency})</span>
                        <input type="number" className={`w-full rounded-md border border-[${colors.border}] bg-white px-3 py-2 focus:border-[${colors.primary}] focus:ring-2 focus:ring-[${colors.primaryMuted}] outline-none`} value={project.total} onChange={(e) => updateProject({ total: Number(e.target.value) })} />
                    </label>
                    <label className="space-y-1">
                        <span className={`text-sm font-medium text-[${colors.textSecondary}]`}>تاريخ البداية</span>
                        <input type="date" className={`w-full rounded-md border border-[${colors.border}] bg-white px-3 py-2 focus:border-[${colors.primary}] focus:ring-2 focus:ring-[${colors.primaryMuted}] outline-none`} value={project.start || ''} onChange={(e) => updateProject({ start: e.target.value })} />
                    </label>
                    <label className="space-y-1">
                        <span className={`text-sm font-medium text-[${colors.textSecondary}]`}>تاريخ النهاية</span>
                        <input type="date" className={`w-full rounded-md border border-[${colors.border}] bg-white px-3 py-2 focus:border-[${colors.primary}] focus:ring-2 focus:ring-[${colors.primaryMuted}] outline-none`} value={project.end || ''} onChange={(e) => updateProject({ end: e.target.value })} />
                    </label>
                    </div>
                </div>

                <div className={`bg-[${colors.background}] p-4 rounded-xl border border-[${colors.border}] shadow-sm flex flex-col items-center justify-center`}>
                    <h3 className="text-lg font-semibold mb-2">نسبة الإنفاق</h3>
                    <div className="w-full h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                            <Pie data={[{ name: "مدفوع", value: paid }, { name: "متبقي", value: remaining }]} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} startAngle={90} endAngle={-270} stroke={colors.background} strokeWidth={4}>
                                <Cell fill={colors.primary} />
                                <Cell fill={colors.border} />
                                <Label value={`${paidPct}%`} position="center" fontSize={28} fontWeight={700} fill={colors.textPrimary} />
                            </Pie>
                            <Tooltip formatter={(v) => [fmtCurrency(v, currency), ""]} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            {/* ... (باقي الأقسام بدون تغيير) ... */}
        </div>
        ) : (
            <div className={`h-full w-full flex flex-col items-center justify-center text-center text-[${colors.textSubtle}] bg-[${colors.background}] rounded-xl border`}>
                <h3 className="text-lg font-semibold">لا يوجد مشروع محدد</h3>
                <p>قم بإضافة مشروع جديد أو اختر واحداً من القائمة للبدء.</p>
            </div>
        )}
      </main>
    </div>
    </>
  );
}
