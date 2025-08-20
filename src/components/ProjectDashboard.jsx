// src/components/ProjectDashboard.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { colors } from '../utils/colors';

import ProjectSections from "./ProjectSections.jsx";

function ProjectDashboard() {

  // دالة تحديث عضو الفريق مع إعادة جلب بيانات الفريق بعد التعديل
  const handleUpdateTeamMember = async (id, payload) => {
    await supabase.from('team_members').update(payload).eq('id', id);
    // إعادة جلب بيانات الفريق
    const { data: teamData } = await supabase.from('team_members').select('*');
    setTeam(teamData);
  };

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // بيانات مرتبطة بالمشروع
  const [clients, setClients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [payments, setPayments] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // جلب المشاريع
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*, project_attributes(*)');
        if (projectsError) throw projectsError;
        setProjects(projectsData);

        // جلب العملاء
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*');
        if (clientsError) throw clientsError;
        setClients(clientsData);

        // جلب الفئات
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*');
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData);

        // جلب المراحل
        const { data: milestonesData, error: milestonesError } = await supabase
          .from('milestones')
          .select('*');
        if (milestonesError) throw milestonesError;
        setMilestones(milestonesData);

        // جلب المدفوعات
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*');
        if (paymentsError) throw paymentsError;
        setPayments(paymentsData);

        // جلب المخرجات
        const { data: deliverablesData, error: deliverablesError } = await supabase
          .from('deliverables')
          .select('*');
        if (deliverablesError) throw deliverablesError;
        setDeliverables(deliverablesData);

        // جلب أعضاء الفريق
        const { data: teamData, error: teamError } = await supabase
          .from('team_members')
          .select('*');
        if (teamError) throw teamError;
        setTeam(teamData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>حدث خطأ: {error}</div>;

  if (!selectedProject) {
    return (
      <div className="p-6 w-full max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">المشاريع</h2>
        <ul className="space-y-2">
          {projects.map((project) => (
            <li key={project.id} className="border p-3 rounded cursor-pointer" onClick={() => setSelectedProject(project)}>
              <strong>{project.name}</strong> - الإجمالي: {project.total}
              <br />
              {project.project_attributes ? (
                <span>
                  العميل: {project.project_attributes.client_name} | الخدمة: {project.project_attributes.service} | الحالة: {project.project_attributes.status}
                </span>
              ) : (
                <span>لا توجد خصائص إضافية</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // عرض تفاصيل المشروع بنفس التنسيق القديم
  const project = selectedProject;
  const client = project.project_attributes ? { first_name: project.project_attributes.client_name, last_name: '' } : null;
  const currency = 'جنيه';

  // تصفية البيانات حسب المشروع المختار
  const filteredCategories = categories.filter(c => c.project_id === project.id);
  const filteredMilestones = milestones.filter(m => m.project_id === project.id);
  const filteredPayments = payments.filter(p => p.project_id === project.id);
  const filteredDeliverables = deliverables.filter(d => d.project_id === project.id);
  const filteredTeam = team.filter(t => t.project_id === project.id);

  // ربط العميل الحقيقي لو وجد
  const realClient = clients.find(c => c.id === project.client_id) || client;

  return (
    <div className="space-y-6 p-6 w-full max-w-7xl mx-auto">
      <button className="mb-4 px-4 py-2 bg-gray-200 rounded" onClick={() => setSelectedProject(null)}>رجوع لقائمة المشاريع</button>
      <header>
        <h1 className={`text-3xl font-bold text-[${colors.textPrimary}]`}>
          {project.name}
        </h1>
        {realClient && (
          <p className={`text-[${colors.textSecondary}] text-lg`}>
            العميل: {realClient.first_name} {realClient.last_name}
          </p>
        )}
        <p className={`text-[${colors.textSecondary}]`}>
          مرحباً بك، قم بإدارة ميزانية وجداول مشروعك من هنا.
        </p>
      </header>

      <ProjectSections
        projectId={project?.id}
        language="ar"
        project={project}
        client={realClient}
        clients={clients}
        categories={filteredCategories}
        milestones={filteredMilestones}
        payments={filteredPayments}
        deliverables={filteredDeliverables}
        team={filteredTeam}
        currency={currency}
        onUpdateTeamMember={handleUpdateTeamMember}
      />
    </div>
  );
}

export default ProjectDashboard;
