// src/App.jsx
import React, { useMemo, useState, useEffect } from "react";
import { supabase } from './supabaseClient.js';
import { toISO } from './utils/helpers.js';
import { colors } from './utils/colors.js';
import { Globe } from 'lucide-react';

// Import components
import HomePage from './components/HomePage.jsx';
import AppSidebar from './components/AppSidebar.jsx';
import ProjectDashboard from './components/ProjectDashboard.jsx';
import ClientsDatabase from './components/ClientsDatabase.jsx';

// نظام الترجمة للتطبيق الرئيسي
const appTranslations = {
  ar: {
    backToHome: "العودة للرئيسية",
    loadingProject: "جاري تحميل بيانات المشروع...",
    failedToLoad: "تعذر تحميل البيانات",
    noProjects: "لا توجد مشاريع",
    addFirstProject: "إضافة أول مشروع",
    clientsDatabase: "قاعدة بيانات العملاء",
    manageClients: "إدارة وتتبع جميع العملاء"
  },
  en: {
    backToHome: "Back to Home",
    loadingProject: "Loading project data...",
    failedToLoad: "Failed to load data",
    noProjects: "No projects",
    addFirstProject: "Add first project",
    clientsDatabase: "Clients Database",
    manageClients: "Manage and track all clients"
  }
};

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'projects', 'clients', etc.
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState("EGP");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Language state
  const [language, setLanguage] = useState(() => {
    const savedLang = localStorage.getItem('appLanguage');
    return savedLang || 'ar';
  });

  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeId, setActiveId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [payments, setPayments] = useState([]);
  const [milestones, setMilestones] = useState([]);

  // حفظ اللغة في localStorage
  useEffect(() => {
    localStorage.setItem('appLanguage', language);
    // تغيير اتجاه الصفحة حسب اللغة
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Toggle language function
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  // Get current translations
  const t = appTranslations[language];

  // Fetch all projects and clients when switching to projects view
  useEffect(() => {
    if (currentView === 'projects') {
      fetchProjectsAndClients();
    }
  }, [currentView]);

  const fetchProjectsAndClients = async () => {
    setLoading(true);
    try {
      setErrorMsg("");
      const [
        { data: projectsData, error: projectsError },
        { data: clientsData, error: clientsError }
      ] = await Promise.all([
        supabase.from('projects').select('*'),
        supabase.from('clients').select('*')
      ]);
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        setErrorMsg(projectsError.message || 'تعذر تحميل المشاريع');
      } else {
        const formattedProjects = projectsData?.map(p => ({ 
          ...p, 
          start: p.start_date, 
          end: p.end_date 
        })) || [];
        setProjects(formattedProjects);
        if (formattedProjects.length > 0 && !activeId) {
          setActiveId(formattedProjects[0].id);
        }
      }
      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
      } else {
        setClients(clientsData || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg(error?.message || 'حدث خطأ غير متوقع');
      setLoading(false);
    }
  };

  // Fetch data for the active project
  useEffect(() => {
    if (!activeId || currentView !== 'projects') {
      return;
    }
    fetchProjectData();
  }, [activeId, currentView]);

  const fetchProjectData = async () => {
    if (!activeId) return;
    
    setLoading(true);
    try {
      const [
        { data: categoriesData, error: catError }, 
        { data: paymentsData, error: payError }, 
        { data: milestonesData, error: mileError }
      ] = await Promise.all([
        supabase.from('categories').select('*').eq('project_id', activeId),
        supabase.from('payments').select('*').eq('project_id', activeId),
        supabase.from('milestones').select('*').eq('project_id', activeId)
      ]);

      if (catError) console.error('Error fetching categories:', catError);
      if (payError) console.error('Error fetching payments:', payError);
      if (mileError) console.error('Error fetching milestones:', mileError);

      setCategories(categoriesData || []);
      setMilestones(milestonesData || []);
      
      if (paymentsData && categoriesData) {
        const categoryMap = new Map(categoriesData.map(c => [c.id, c.name]));
        const formattedPayments = paymentsData.map(p => ({ 
          ...p, 
          date: p.pay_date, 
          category: categoryMap.get(p.category_id) || '' 
        }));
        setPayments(formattedPayments);
      } else {
        setPayments([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching project data:', error);
      setErrorMsg(error?.message || 'حدث خطأ أثناء تحميل بيانات المشروع');
      setLoading(false);
    }
  };

  const activeProject = useMemo(() => projects.find(p => p.id === activeId), [projects, activeId]);
  const project = activeProject || { name: "", total: 0, start: "", end: "" };
  const paid = useMemo(() => payments.reduce((s, p) => s + (Number(p.amount) || 0), 0), [payments]);
  const remaining = Math.max(0, (Number(project.total) || 0) - paid);
  const paidPct = project.total ? Math.min(100, Math.round((paid / project.total) * 100)) : 0;
  
  // --- Project CRUD ---
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
    const { data, error } = await supabase.from('projects').insert({ 
      name: `مشروع ${projects.length + 1}`, 
      total: 50000,
      start_date: toISO(new Date()),
      end_date: toISO(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)) // 90 days from now
    }).select().single();
    
    if (error) console.error("Error adding project:", error);
    else if (data) {
        const formattedProject = { ...data, start: data.start_date, end: data.end_date };
        setProjects(ps => [...ps, formattedProject]);
        setActiveId(data.id);
    }
  };

  const deleteProject = async () => {
    if (!project || !project.id) return;
    const { error } = await supabase.from('projects').delete().eq('id', project.id);
    if (error) console.error("Error deleting project:", error);
    else {
        const remainingProjects = projects.filter(p => p.id !== project.id);
        setProjects(remainingProjects);
        setActiveId(remainingProjects.length > 0 ? remainingProjects[0].id : null);
    }
  };

  // --- Payment CRUD ---
  const addPayment = async () => {
    const { data, error } = await supabase.from('payments').insert({ 
      amount: 0, 
      pay_date: toISO(new Date()), 
      note: "", 
      category_id: categories[0]?.id || null, 
      project_id: project.id 
    }).select().single();
    
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

  // --- Milestone CRUD ---
  const addMilestone = async () => {
    const { data, error } = await supabase.from('milestones').insert({ 
      title: "معلم جديد", 
      date: toISO(new Date()), 
      status: "in-progress", 
      project_id: project.id 
    }).select().single();
    
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

  // --- Category CRUD ---
  const addCategory = async () => {
    const { data, error } = await supabase.from('categories').insert({ 
      name: "بند جديد", 
      budget: 0, 
      project_id: project.id 
    }).select().single();
    
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

  // Handle navigation from HomePage
  const handleNavigate = (section) => {
    if (section === 'projects') {
      setCurrentView('projects');
    } else if (section === 'clients') {
      setCurrentView('clients');
    } else {
      alert(`سيتم فتح قسم: ${section}`);
    }
  };

  // Show Home Page
  if (currentView === 'home') {
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
          {/* Language Toggle Button - Global */}
          <button 
            onClick={toggleLanguage}
            className="absolute top-4 right-4 z-50 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-gray-700 hover:text-gray-900"
            title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <Globe size={18} />
            <span className="font-medium">{language === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          <HomePage 
            onNavigate={setCurrentView}
            language={language}
          />
        </div>
      </>
    );
  }

  // Show Clients Database
  if (currentView === 'clients') {
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
          <ClientsDatabase 
            onBack={() => setCurrentView('home')}
            language={language}
          />
        </div>
      </>
    );
  }

  // Show Projects Dashboard
  if (currentView === 'projects') {
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
          {/* Back to Home Button */}
          <button 
            onClick={() => setCurrentView('home')}
            className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'left-4'} z-50 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-gray-700 hover:text-gray-900`}
          >
            <svg className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span>{t.backToHome}</span>
          </button>

          <AppSidebar
            projects={projects}
            activeId={activeId}
            setActiveId={setActiveId}
            addProject={addProject}
            deleteProject={deleteProject}
            activeProject={activeProject}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            language={language}
          />

          <main className="flex-grow p-6 overflow-y-auto">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center text-slate-500">
                {t.loadingProject}
              </div>
            ) : errorMsg ? (
              <div className={`h-full w-full flex flex-col items-center justify-center text-center text-[${colors.textSubtle}] bg-[${colors.background}] rounded-xl border p-6`}>
                <h3 className="text-lg font-semibold mb-2">{t.failedToLoad}</h3>
                <p className="mb-2">{errorMsg}</p>
              </div>
            ) : activeProject ? (
              <ProjectDashboard
                project={project}
                paid={paid}
                remaining={remaining}
                paidPct={paidPct}
                currency={currency}
                updateProject={updateProject}
                categories={categories}
                addCategory={addCategory}
                removeCategory={removeCategory}
                updateCategory={updateCategory}
                payments={payments}
                addPayment={addPayment}
                removePayment={removePayment}
                updatePayment={updatePayment}
                milestones={milestones}
                addMilestone={addMilestone}
                removeMilestone={removeMilestone}
                updateMilestone={updateMilestone}
                language={language}
                clients={clients}
              />
            ) : (
              <div className={`h-full w-full flex flex-col items-center justify-center text-center text-[${colors.textSubtle}] bg-[${colors.background}] rounded-xl border`}>
                <h3 className="text-lg font-semibold">{t.noProjects}</h3>
                <p className="mb-4">{t.addFirstProject}</p>
                <button 
                  onClick={addProject}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {t.addFirstProject}
                </button>
              </div>
            )}
          </main>
        </div>
      </>
    );
  }

  // Default return (should not reach here)
  return <div>Loading...</div>;
}