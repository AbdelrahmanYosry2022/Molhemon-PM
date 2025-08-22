import React from 'react';
import { 
  Users, 
  UserCheck, 
  Briefcase, 
  TrendingUp,
  Calendar,
  Award
} from 'lucide-react';

const TeamOverviewTab = ({ stats, teamMembers, language }) => {
  const t = language === 'ar' ? {
    totalMembers: 'إجمالي الأعضاء',
    activeMembers: 'أعضاء نشطون',
    availableRoles: 'التخصصات المتاحة',
    activeProjects: 'المشاريع النشطة',
    recentActivity: 'النشاط الأخير',
    teamPerformance: 'أداء الفريق',
    noRecentActivity: 'لا يوجد نشاط حديث',
    viewAllMembers: 'عرض جميع الأعضاء',
    viewAllProjects: 'عرض جميع المشاريع'
  } : {
    totalMembers: 'Total Members',
    activeMembers: 'Active Members',
    availableRoles: 'Available Roles',
    activeProjects: 'Active Projects',
    recentActivity: 'Recent Activity',
    teamPerformance: 'Team Performance',
    noRecentActivity: 'No recent activity',
    viewAllMembers: 'View All Members',
    viewAllProjects: 'View All Projects'
  };

  // حساب التوزيع حسب الأدوار
  const roleDistribution = teamMembers.reduce((acc, member) => {
    const role = member.role || 'member';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  // الأعضاء الجدد (آخر 5)
  const recentMembers = teamMembers
    .filter(member => member.created_at)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // بطاقة إحصائية
  const StatCard = ({ title, value, icon: Icon, color = 'emerald', subtext }) => (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon size={24} className={`text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t.totalMembers}
          value={stats.total}
          icon={Users}
          color="blue"
        />
        <StatCard
          title={t.activeMembers}
          value={stats.active}
          icon={UserCheck}
          color="emerald"
          subtext={`${Math.round((stats.active / stats.total) * 100)}% من إجمالي الفريق`}
        />
        <StatCard
          title={t.availableRoles}
          value={stats.roles}
          icon={Briefcase}
          color="purple"
        />
        <StatCard
          title={t.activeProjects}
          value={stats.projects}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* توزيع الأدوار */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.availableRoles}</h3>
          <div className="space-y-3">
            {Object.entries(roleDistribution).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {role === 'manager' ? 'مدير' :
                     role === 'lead' ? 'قائد فريق' :
                     role === 'editor' ? 'محرر' :
                     role === 'designer' ? 'مصمم' :
                     role === 'member' ? 'عضو فريق' : role}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full" 
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8 text-left">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* الأعضاء الجدد */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.recentActivity}</h3>
          {recentMembers.length > 0 ? (
            <div className="space-y-3">
                             {recentMembers.map((member) => (
                 <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                   <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                     <span className="text-sm font-semibold text-emerald-700">
                       {member.name?.charAt(0) || 'U'}
                     </span>
                   </div>
                   <div className="flex-1">
                     <p className="text-sm font-medium text-gray-900">
                       {member.name || 'عضو بدون اسم'}
                     </p>
                                           <p className="text-xs text-gray-500">
                        انضم في {formatDate(member.created_at)}
                        {member.projects && member.projects.name && (
                          <span className="block text-xs text-blue-600">
                            مشروع: {member.projects.name}
                          </span>
                        )}
                      </p>
                   </div>
                   <div className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                     {member.role === 'manager' ? 'مدير' :
                      member.role === 'lead' ? 'قائد فريق' :
                      member.role === 'editor' ? 'محرر' :
                      member.role === 'designer' ? 'مصمم' :
                      member.role === 'member' ? 'عضو فريق' : member.role}
                   </div>
                 </div>
               ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t.noRecentActivity}</p>
            </div>
          )}
        </div>
      </div>

      {/* أداء الفريق */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.teamPerformance}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <Users size={24} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">{t.totalMembers}</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <Award size={24} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.roles}</p>
            <p className="text-sm text-gray-600">{t.availableRoles}</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={24} className="text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.projects}</p>
            <p className="text-sm text-gray-600">{t.activeProjects}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamOverviewTab;
