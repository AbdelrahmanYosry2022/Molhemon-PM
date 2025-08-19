// src/App.js
import React, { useMemo, useState, useEffect } from "react";
import { supabase } from './supabaseClient.js';
import { toISO } from './utils/helpers.js';
import { colors } from './utils/colors.js';

// Import newly created components
import AppSidebar from './components/AppSidebar.jsx';
import ProjectDashboard from './components/ProjectDashboard.jsx';

export default function BudgetTimelineApp() {
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("EGP"); // You might want to make this configurable
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [projects, setProjects] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [payments, setPayments] = useState([]);
  const [milestones, setMilestones] = useState([]);

  // Fetch all projects on initial load
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
                setActiveId(formattedProjects[0].id); // Set the first project as active
            } else {
                setLoading(false); // No projects, stop loading
            }
        }
    };
    fetchProjects();
  }, []);

  // Fetch data for the active project
  useEffect(() => {
    if (!activeId) {
        setCategories([]);
        setPayments([]);
        setMilestones([]);
        setLoading(false);
        return;
    }
    const fetchProjectData = async () => {
        setLoading(true);
        const [{ data: categoriesData, error: catError }, { data: paymentsData, error: payError }, { data: milestonesData, error: mileError }] = await Promise.all([
            supabase.from('categories').select('*').eq('project_id', activeId),
            supabase.from('payments').select('*').eq('project_id', activeId),
            supabase.from('milestones').select('*').eq('project_id', activeId)
        ]);

        if (catError) console.error('Error fetching categories:', catError);
        if (payError) console.error('Error fetching payments:', payError);
        if (mileError) console.error('Error fetching milestones:', mileError);

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
    const { data, error } = await supabase.from('projects').insert({ name: `مشروع ${projects.length + 1}`, total: 50000 }).select().single();
    if (error) console.error("Error adding project:", error);
    else if (data) {
        const formattedProject = { ...data, start: data.start_date, end: data.end_date };
        setProjects(ps => [...ps, formattedProject]);
        setActiveId(data.id);
    }
  };

  const deleteProject = async () => {
    if (!project || !project.id) return; // Ensure project and its ID exist
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

  // --- Milestone CRUD ---
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

  // --- Category CRUD ---
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
      <AppSidebar
        projects={projects}
        activeId={activeId}
        setActiveId={setActiveId}
        addProject={addProject}
        deleteProject={deleteProject}
        activeProject={activeProject}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="flex-grow p-6 overflow-y-auto">
        {loading ? (
             <div className="h-full w-full flex items-center justify-center text-slate-500">جاري تحميل بيانات المشروع...</div>
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
            />
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