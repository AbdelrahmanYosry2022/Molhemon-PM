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
import AddProjectModal from './components/AddProjectModal.jsx';
import EditProjectModal from './components/EditProjectModal.jsx';
import ConfirmDeleteModal from './components/ConfirmDeleteModal.jsx';

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
  const [teamMembers, setTeamMembers] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeId, setActiveId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [payments, setPayments] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [deliverables, setDeliverables] = useState([]);

  // Modals state
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [itemsToRemove, setItemsToRemove] = useState([]);

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
        { data: clientsData, error: clientsError },
        { data: teamMembersData, error: teamMembersError }
      ] = await Promise.all([
        supabase.from('projects').select('*'),
        supabase.from('clients').select('*'),
        supabase.from('team_members').select('*')
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
      if (teamMembersError) {
        console.warn('Error fetching team_members:', teamMembersError);
      } else {
        setTeamMembers(teamMembersData || []);
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
        { data: milestonesData, error: mileError },
        { data: deliverablesData, error: delivError }
      ] = await Promise.all([
        supabase.from('categories').select('*').eq('project_id', activeId),
        supabase.from('payments').select('*').eq('project_id', activeId),
        supabase.from('milestones').select('*').eq('project_id', activeId),
        supabase.from('deliverables').select('*').eq('project_id', activeId)
      ]);

      if (catError) console.error('Error fetching categories:', catError);
      if (payError) console.error('Error fetching payments:', payError);
      if (mileError) console.error('Error fetching milestones:', mileError);
      if (delivError) console.error('Error fetching deliverables:', delivError);

      setCategories(categoriesData || []);
      setMilestones(milestonesData || []);
      setDeliverables(deliverablesData || []);
      // fetch team members for the active project
      try {
        const { data: tmData, error: tmErr } = await supabase.from('team_members').select('*').eq('project_id', activeId);
        if (tmErr) console.warn('Error fetching team_members for project:', tmErr);
        else setTeamMembers(tmData || []);
      } catch (err) {
        console.warn('Failed to fetch team_members:', err);
      }
      
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

  // Open Add Project Modal
  const addProject = () => {
    setShowAddProjectModal(true);
  };

  // Handle project added from modal
  const handleProjectAdded = (newProject) => {
    const formattedProject = { ...newProject, start: newProject.start_date, end: newProject.end_date };
    setProjects(ps => [...ps, formattedProject]);
    setActiveId(newProject.id);
    setShowAddProjectModal(false);
  };

  const deleteProject = async (id) => {
    const projectId = id || project.id;
    if (!projectId) return;
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) console.error("Error deleting project:", error);
    else {
        const remainingProjects = projects.filter(p => p.id !== projectId);
        setProjects(remainingProjects);
        if (activeId === projectId) {
          setActiveId(remainingProjects.length > 0 ? remainingProjects[0].id : null);
        }
    }
  };

  // Open confirm delete flow (shows modal asking to type project name)
  const openConfirmDelete = (proj, items = null) => {
    setProjectToDelete(proj);
    // default list of affected tables/items (Arabic strings for clarity)
    const defaults = [
      'المدفوعات (payments)',
      'المعالم (milestones)',
      'المخرجات (deliverables)',
      'بنود الميزانية / الفئات (categories)',
      'خصائص المشروع (project_attributes)',
      'الملفات والوسائط في تخزين Supabase (مثلاً: project-images bucket)'
    ];
    setItemsToRemove(Array.isArray(items) ? items : defaults);
    setShowConfirmDelete(true);
  };

  const handleCancelDelete = () => {
    setProjectToDelete(null);
    setShowConfirmDelete(false);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      // best-effort: write a deletion log
      const user = await supabase.auth.getUser();
      const userId = user?.data?.user?.id || null;
      const log = {
        project_id: projectToDelete.id,
        project_name: projectToDelete.name,
        deleted_by: userId,
        deleted_at: new Date().toISOString()
      };
      const { error: logErr } = await supabase.from('deletion_logs').insert([log]);
      if (logErr) console.warn('Failed to write deletion log:', logErr);
    } catch (err) {
      console.warn('Deletion log attempt failed:', err);
    }
    await deleteProject(projectToDelete.id);
    setProjectToDelete(null);
    setShowConfirmDelete(false);
  };

  const openEditModal = (projectToEdit) => {
    setEditingProject(projectToEdit);
    setShowEditProjectModal(true);
  };

  const handleProjectUpdated = (updatedProject) => {
    const formattedProject = { ...updatedProject, start: updatedProject.start_date, end: updatedProject.end_date };
    setProjects(ps => ps.map(p => p.id === updatedProject.id ? formattedProject : p));
    setShowEditProjectModal(false);
    setEditingProject(null);
  };

  // --- Payment CRUD ---
  const addPayment = async (newPayment) => {
    let categoryId = categories.find(c => c.name === newPayment.category)?.id || null;

    if (!categoryId && newPayment.category) {
      // Category does not exist, so create it.
      const { data: newCategory, error: newCategoryError } = await supabase.from('categories').insert({
        name: newPayment.category,
        project_id: project.id
      }).select().single();

      if (newCategoryError) {
        console.error('Error creating new category:', newCategoryError);
      } else if (newCategory) {
        categoryId = newCategory.id;
        setCategories(c => [...c, newCategory]);
      }
    }

    const { data, error } = await supabase.from('payments').insert({
      amount: newPayment.amount,
      pay_date: newPayment.date,
      note: newPayment.note,
      category_id: categoryId,
      project_id: project.id
    }).select().single();

    if (error) console.error('Error adding payment:', error);
    else if (data) {
        const categoryName = categories.find(c => c.id === data.category_id)?.name || newPayment.category || '';
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
          let categoryId = categories.find(c => c.name === patch.category)?.id || null;
          if (!categoryId && patch.category) {
            // Category does not exist, so create it.
            const { data: newCategory, error: newCategoryError } = await supabase.from('categories').insert({
              name: patch.category,
              project_id: project.id
            }).select().single();

            if (newCategoryError) {
              console.error('Error creating new category:', newCategoryError);
            } else if (newCategory) {
              categoryId = newCategory.id;
              setCategories(c => [...c, newCategory]);
            }
          }
          dbPatch.category_id = categoryId;
          delete dbPatch.category;
      }
      const { data, error } = await supabase.from('payments').update(dbPatch).eq('id', id).select().single();
      if (error) console.error('Error updating payment:', error);
      else if (data) {
          const categoryName = categories.find(c => c.id === data.category_id)?.name || patch.category || '';
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

  // --- Deliverable CRUD ---
  const addDeliverable = async (newDeliverable) => {
    console.log('Attempting to add new deliverable:', newDeliverable);
    const payload = { ...newDeliverable, project_id: project.id };

    // Remove 'id' from payload for new insertions, as Supabase will generate it
    delete payload.id;

    // Remove 'due' if it's an empty string to avoid Supabase date parsing errors
    if (payload.due === "") {
      delete payload.due;
    }

    // Ensure a default type exists (in case the UI didn't send one)
    if (!payload.type) {
      payload.type = 'podcast';
    }

  // Strip owner_id if present — the deliverables table doesn't have this column
  if ('owner_id' in payload) delete payload.owner_id;

    const { data, error } = await supabase.from('deliverables').insert(payload).select().single();
    
    if (error) {
      console.error('Error adding deliverable:', error);
      // Optionally, you could set an error message state here to display to the user
      // setErrorMsg(`Failed to add deliverable: ${error.message}`);
    } else if (data) {
      console.log('Deliverable added successfully:', data);
      setDeliverables(d => [...d, data]);
    }
  };

  const removeDeliverable = async (id) => {
    const { error } = await supabase.from('deliverables').delete().eq('id', id);
    if (error) console.error('Error removing deliverable:', error);
    else setDeliverables(d => d.filter(deliverable => deliverable.id !== id));
  };

  const updateDeliverable = async (id, patch) => {
  const dbPatch = { ...patch };
  // Clean empty strings that would otherwise overwrite DB columns with invalid values
  if (dbPatch.due === "") delete dbPatch.due;
  if (dbPatch.type === "") delete dbPatch.type;
  // Remove owner_id if present — deliverables table doesn't include this column
  if ('owner_id' in dbPatch) delete dbPatch.owner_id;

  const { data, error } = await supabase.from('deliverables').update(dbPatch).eq('id', id).select().single();
    if (error) console.error('Error updating deliverable:', error);
    else if (data) setDeliverables(arr => arr.map(it => it.id === id ? data : it));
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
            openConfirmDelete={openConfirmDelete}
            activeProject={activeProject}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            language={language}
            openEditModal={openEditModal}
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
                deliverables={deliverables}
                addDeliverable={addDeliverable}
                removeDeliverable={removeDeliverable}
                updateDeliverable={updateDeliverable}
                language={language}
                clients={clients}
                teamMembers={teamMembers}
                addTeamMember={async (member) => {
                  try {
                    const projectId = activeProject?.id || activeId;
                    // sanitize payload: only send allowed columns to PostgREST
                    const allowed = ['project_id', 'name', 'role', 'status', 'joined', 'email', 'phone', 'avatar_url'];
                    const raw = { ...member, project_id: projectId };
                    Object.keys(raw).forEach(k => { if (k.startsWith('_')) delete raw[k]; });
                    // ensure we never send an 'avatar' key (frontend may include a File or temp field)
                    if ('avatar' in raw) delete raw.avatar;
                    const insertPayload = {};
                    allowed.forEach(k => {
                      if (raw[k] !== undefined) insertPayload[k] = raw[k];
                    });
                    console.debug('App.addTeamMember -> inserting payload:', insertPayload);
                    const { data, error } = await supabase.from('team_members').insert(insertPayload).select().single();
                    if (error) {
                      console.error('Error inserting team_member:', error);
                      return null;
                    }
                    // update local teamMembers list
                    setTeamMembers(tm => [...tm, data]);
                    // also update the project's team field locally to keep UI in sync
                    setProjects(ps => ps.map(p => p.id === projectId ? { ...p, team: [...(p.team || []), data] } : p));
                    // NOTE: intentionally not persisting `projects.team` to DB here because
                    // it can fail if the column doesn't exist or RLS blocks the update.
                    // Use `team_members` table as source-of-truth for persistence.
                    return data;
                  } catch (err) {
                    console.error('addTeamMember failed:', err);
                    return null;
                  }
                }}
                updateTeamMember={async (id, patch) => {
                  try {
                    // sanitize patch to allowed DB columns only
                    const allowedUpd = ['name', 'role', 'status', 'joined', 'email', 'phone', 'avatar_url'];
                    const rawPatch = { ...patch };
                    Object.keys(rawPatch).forEach(k => { if (k.startsWith('_')) delete rawPatch[k]; });
                    if ('avatar' in rawPatch) delete rawPatch.avatar;
                    const dbPatch = {};
                    allowedUpd.forEach(k => { if (rawPatch[k] !== undefined) dbPatch[k] = rawPatch[k]; });
                    console.debug('App.updateTeamMember -> patch:', dbPatch);
                    const { data, error } = await supabase.from('team_members').update(dbPatch).eq('id', id).select().single();
                    if (error) {
                      console.error('Error updating team_member:', error);
                      return null;
                    }
                    setTeamMembers(tm => tm.map(t => t.id === id ? data : t));
                    // also sync into projects.team locally to keep UI consistent
                    setProjects(ps => ps.map(p => p.id === (activeProject?.id || activeId) ? { ...p, team: (p.team || []).map(m => m.id === id ? data : m) } : p));
                    // NOTE: skipping remote update of projects.team for the same reasons described above.
                    return data;
                  } catch (err) {
                    console.error('updateTeamMember failed:', err);
                    return null;
                  }
                }}
                removeTeamMember={async (id) => {
                  try {
                    console.debug('App.removeTeamMember -> deleting id:', id);
                    const { error } = await supabase.from('team_members').delete().eq('id', id);
                    if (error) {
                      console.error('Error deleting team_member:', error);
                      return false;
                    }
                    setTeamMembers(tm => tm.filter(t => t.id !== id));
                    // remove from project's team field locally to keep UI consistent
                    const projId = activeProject?.id || activeId;
                    setProjects(ps => ps.map(p => p.id === projId ? { ...p, team: (p.team || []).filter(m => m.id !== id) } : p));
                    // NOTE: not persisting the removal to projects table; use team_members table as source-of-truth.
                    return true;
                  } catch (err) {
                    console.error('removeTeamMember failed:', err);
                    return false;
                  }
                }}
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

        {showAddProjectModal && (
          <AddProjectModal
            onClose={() => setShowAddProjectModal(false)}
            onProjectAdded={handleProjectAdded}
            clients={clients}
          />
        )}

        {showEditProjectModal && (
          <EditProjectModal
            onClose={() => setShowEditProjectModal(false)}
            onProjectUpdated={handleProjectUpdated}
            project={editingProject}
            clients={clients}
          />
        )}
        <ConfirmDeleteModal
          open={showConfirmDelete}
          projectName={projectToDelete?.name}
          itemsToRemove={itemsToRemove}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      </>
    );
  }

  // Default return (should not reach here)
  return <div>Loading...</div>;
}
