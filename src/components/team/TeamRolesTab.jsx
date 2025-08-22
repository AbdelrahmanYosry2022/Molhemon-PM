import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Plus, 
  Edit2, 
  Trash2, 
  Check,
  X,
  Users,
  Settings,
  Eye,
  FileText,
  DollarSign,
  Calendar
} from 'lucide-react';

const TeamRolesTab = ({ teamMembers, language }) => {
  const [editingRole, setEditingRole] = useState(null);
  const [showAddRole, setShowAddRole] = useState(false);

  const t = language === 'ar' ? {
    rolesAndPermissions: 'الأدوار والصلاحيات',
    addNewRole: 'إضافة دور جديد',
    editRole: 'تعديل الدور',
    roleName: 'اسم الدور',
    roleDescription: 'وصف الدور',
    permissions: 'الصلاحيات',
    members: 'الأعضاء',
    actions: 'الإجراءات',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    confirmDelete: 'هل أنت متأكد من حذف هذا الدور؟',
    noRoles: 'لا توجد أدوار محددة',
    createFirstRole: 'إنشاء أول دور',
    // الصلاحيات
    viewProjects: 'عرض المشاريع',
    createProjects: 'إنشاء مشاريع',
    editProjects: 'تعديل المشاريع',
    deleteProjects: 'حذف المشاريع',
    viewTeam: 'عرض الفريق',
    manageTeam: 'إدارة الفريق',
    viewPayments: 'عرض المدفوعات',
    managePayments: 'إدارة المدفوعات',
    viewReports: 'عرض التقارير',
    manageSettings: 'إدارة الإعدادات',
    // الأدوار الافتراضية
    systemAdmin: 'مدير النظام',
    projectManager: 'مدير المشروع',
    teamLead: 'قائد الفريق',
    teamMember: 'عضو الفريق',
    viewer: 'مشاهد'
  } : {
    rolesAndPermissions: 'Roles & Permissions',
    addNewRole: 'Add New Role',
    editRole: 'Edit Role',
    roleName: 'Role Name',
    roleDescription: 'Role Description',
    permissions: 'Permissions',
    members: 'Members',
    actions: 'Actions',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this role?',
    noRoles: 'No roles defined',
    createFirstRole: 'Create first role',
    // Permissions
    viewProjects: 'View Projects',
    createProjects: 'Create Projects',
    editProjects: 'Edit Projects',
    deleteProjects: 'Delete Projects',
    viewTeam: 'View Team',
    manageTeam: 'Manage Team',
    viewPayments: 'View Payments',
    managePayments: 'Manage Payments',
    viewReports: 'View Reports',
    manageSettings: 'Manage Settings',
    // Default roles
    systemAdmin: 'System Administrator',
    projectManager: 'Project Manager',
    teamLead: 'Team Lead',
    teamMember: 'Team Member',
    viewer: 'Viewer'
  };

  // تعريف الصلاحيات المتاحة
  const availablePermissions = [
    { id: 'viewProjects', label: t.viewProjects, icon: Eye, category: 'projects' },
    { id: 'createProjects', label: t.createProjects, icon: Plus, category: 'projects' },
    { id: 'editProjects', label: t.editProjects, icon: Edit2, category: 'projects' },
    { id: 'deleteProjects', label: t.deleteProjects, icon: Trash2, category: 'projects' },
    { id: 'viewTeam', label: t.viewTeam, icon: Users, category: 'team' },
    { id: 'manageTeam', label: t.manageTeam, icon: Settings, category: 'team' },
    { id: 'viewPayments', label: t.viewPayments, icon: DollarSign, category: 'financial' },
    { id: 'managePayments', label: t.managePayments, icon: DollarSign, category: 'financial' },
    { id: 'viewReports', label: t.viewReports, icon: FileText, category: 'reports' },
    { id: 'manageSettings', label: t.manageSettings, icon: Settings, category: 'system' }
  ];

  // الأدوار الافتراضية مع صلاحياتها
  const defaultRoles = [
    {
      id: 'system_admin',
      name: t.systemAdmin,
      description: 'صلاحيات كاملة على النظام',
      permissions: availablePermissions.map(p => p.id),
      isDefault: true
    },
    {
      id: 'project_manager',
      name: t.projectManager,
      description: 'إدارة المشاريع والفريق',
      permissions: ['viewProjects', 'createProjects', 'editProjects', 'viewTeam', 'manageTeam', 'viewPayments', 'viewReports'],
      isDefault: true
    },
    {
      id: 'team_lead',
      name: t.teamLead,
      description: 'قيادة الفريق وإدارة المهام',
      permissions: ['viewProjects', 'editProjects', 'viewTeam', 'viewPayments', 'viewReports'],
      isDefault: true
    },
    {
      id: 'team_member',
      name: t.teamMember,
      description: 'عضو في الفريق',
      permissions: ['viewProjects', 'viewTeam', 'viewReports'],
      isDefault: true
    },
    {
      id: 'viewer',
      name: t.viewer,
      description: 'عرض فقط - بدون تعديل',
      permissions: ['viewProjects', 'viewTeam', 'viewReports'],
      isDefault: true
    }
  ];

  // دمج الأدوار الافتراضية مع الأدوار المخصصة
  const allRoles = useMemo(() => {
    const customRoles = []; // سيتم إضافة الأدوار المخصصة هنا
    return [...defaultRoles, ...customRoles];
  }, []);

  // حساب عدد الأعضاء لكل دور
  const roleMemberCounts = useMemo(() => {
    const counts = {};
    allRoles.forEach(role => {
      counts[role.id] = teamMembers.filter(member => member.role === role.id).length;
    });
    return counts;
  }, [allRoles, teamMembers]);

  // تجميع الصلاحيات حسب الفئة
  const permissionsByCategory = useMemo(() => {
    const categories = {};
    availablePermissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  }, [availablePermissions]);

  // مودال إضافة/تعديل دور
  const RoleModal = ({ role, onSave, onCancel, onDelete }) => {
    const [formData, setFormData] = useState({
      name: role?.name || '',
      description: role?.description || '',
      permissions: role?.permissions || []
    });

    const handlePermissionToggle = (permissionId) => {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permissionId)
          ? prev.permissions.filter(id => id !== permissionId)
          : [...prev.permissions, permissionId]
      }));
    };

    const handleSave = () => {
      if (!formData.name.trim()) {
        alert('يرجى إدخال اسم الدور');
        return;
      }
      onSave(formData);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {role ? t.editRole : t.addNewRole}
          </h3>

          <div className="space-y-4">
            {/* اسم الدور */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.roleName}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="أدخل اسم الدور"
              />
            </div>

            {/* وصف الدور */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.roleDescription}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={3}
                placeholder="أدخل وصف الدور"
              />
            </div>

            {/* الصلاحيات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t.permissions}
              </label>
              <div className="space-y-4">
                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 capitalize">
                      {category === 'projects' ? 'المشاريع' :
                       category === 'team' ? 'الفريق' :
                       category === 'financial' ? 'المالية' :
                       category === 'reports' ? 'التقارير' :
                       category === 'system' ? 'النظام' : category}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permissions.map(permission => (
                        <label key={permission.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <permission.icon size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-700">{permission.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              {t.save}
            </button>
            {role && !role.isDefault && (
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                {t.delete}
              </button>
            )}
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.rolesAndPermissions}</h2>
          <p className="text-gray-600 mt-1">
            إدارة الأدوار والصلاحيات في النظام
          </p>
        </div>
        <button
          onClick={() => setShowAddRole(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 inline-flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          {t.addNewRole}
        </button>
      </div>

      {/* قائمة الأدوار */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {allRoles.map((role) => (
          <div key={role.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Shield size={20} className="text-emerald-600" />
                  {role.name}
                  {role.isDefault && (
                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                      افتراضي
                    </span>
                  )}
                </h3>
                <p className="text-gray-600 mt-1">{role.description}</p>
              </div>
              {!role.isDefault && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingRole(role)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title={t.editRole}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(t.confirmDelete)) {
                        // حذف الدور
                      }
                    }}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title={t.delete}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* عدد الأعضاء */}
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
              <Users size={16} />
              <span>{roleMemberCounts[role.id] || 0} عضو</span>
            </div>

            {/* الصلاحيات */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">{t.permissions}</h4>
              <div className="grid grid-cols-2 gap-2">
                {availablePermissions.map(permission => (
                  <div
                    key={permission.id}
                    className={`flex items-center gap-2 text-xs p-2 rounded ${
                      role.permissions.includes(permission.id)
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    {role.permissions.includes(permission.id) ? (
                      <Check size={12} />
                    ) : (
                      <X size={12} />
                    )}
                    <span>{permission.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* مودال إضافة/تعديل دور */}
      {(showAddRole || editingRole) && (
        <RoleModal
          role={editingRole}
          onSave={(formData) => {
            // حفظ الدور
            console.log('Saving role:', formData);
            setShowAddRole(false);
            setEditingRole(null);
          }}
          onCancel={() => {
            setShowAddRole(false);
            setEditingRole(null);
          }}
          onDelete={() => {
            // حذف الدور
            setEditingRole(null);
          }}
        />
      )}
    </div>
  );
};

export default TeamRolesTab;
