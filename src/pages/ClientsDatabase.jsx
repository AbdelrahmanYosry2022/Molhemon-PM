// src/components/ClientsDatabase.jsx
import React, { useEffect, useState, useRef } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  Building,
  Calendar,
  Eye,
  Grid3X3,
  List,
  Filter,
  X,
  ChevronDown,
  FolderOpen,
  DollarSign,
  Globe
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import ClientAccountCard from '../components/ClientAccountCard';

// نظام الترجمة
const translations = {
  ar: {
    title: "قاعدة بيانات العملاء",
    subtitle: "إدارة وتتبع جميع العملاء",
    addClient: "إضافة عميل",
    searchPlaceholder: "البحث عن عميل...",
    size: "الحجم:",
    advancedFilters: "التصفية المتقدمة",
    clearFilters: "مسح الفلاتر",
    allIndustries: "جميع الصناعات",
    allPeriods: "جميع الفترات",
    lastWeek: "آخر أسبوع",
    lastMonth: "آخر شهر",
    lastQuarter: "آخر 3 أشهر",
    lastYear: "آخر سنة",
    allClients: "جميع العملاء",
    hasProjects: "لديهم مشاريع",
    noProjects: "ليس لديهم مشاريع",
    dateRange: "المدة",
    resultsSummary: "عرض {filtered} من {total} عميل",
    activeFilters: "فلاتر نشطة",
    loading: "جاري التحميل...",
    confirmDelete: "تأكيد حذف العميل؟",
    deleteError: "تعذر حذف العميل",
    saveError: "تعذر حفظ العميل",
    updateError: "تعذر تحديث العميل",
    // Modal titles
    addClientTitle: "إضافة عميل جديد",
    editClientTitle: "تعديل بيانات العميل",
    // Form fields
    prefix: "اللقب",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    bio: "نبذة عن العميل",
    phone: "رقم الهاتف",
    email: "البريد الإلكتروني",
    joinDate: "تاريخ الانضمام",
    industry: "الصناعة",
    location: "الموقع",
    notes: "ملاحظات",
    profileImage: "صورة العميل",
    coverImage: "صورة الغلاف",
    locationPlaceholder: "مثال: القاهرة، مصر",
    bioPlaceholder: "وصف مختصر عن العميل...",
    selectImage: "اختيار صورة",
    changeImage: "تغيير الصورة",
    selectCoverImage: "اختيار صورة غلاف",
    // Buttons
    cancel: "إلغاء",
    save: "حفظ العميل",
    saveChanges: "حفظ التغييرات",
    saving: "جاري الحفظ...",
    // Client details
    projects: "المشاريع",
    budget: "الميزانية:",
    from: "من",
    to: "إلى",
    // Actions
    view: "عرض",
    edit: "تعديل",
    delete: "حذف"
  },
  en: {
    title: "Clients Database",
    subtitle: "Manage and track all clients",
    addClient: "Add Client",
    searchPlaceholder: "Search for a client...",
    size: "Size:",
    advancedFilters: "Advanced Filters",
    clearFilters: "Clear Filters",
    allIndustries: "All Industries",
    allPeriods: "All Periods",
    lastWeek: "Last Week",
    lastMonth: "Last Month",
    lastQuarter: "Last 3 Months",
    lastYear: "Last Year",
    allClients: "All Clients",
    hasProjects: "Has Projects",
    noProjects: "No Projects",
    dateRange: "Date Range",
    resultsSummary: "Showing {filtered} of {total} clients",
    activeFilters: "Active Filters",
    loading: "Loading...",
    confirmDelete: "Confirm delete client?",
    deleteError: "Failed to delete client",
    saveError: "Failed to save client",
    updateError: "Failed to update client",
    // Modal titles
    addClientTitle: "Add New Client",
    editClientTitle: "Edit Client Data",
    // Form fields
    prefix: "Prefix",
    firstName: "First Name",
    lastName: "Last Name",
    bio: "Client Bio",
    phone: "Phone Number",
    email: "Email Address",
    joinDate: "Join Date",
    industry: "Industry",
    location: "Location",
    notes: "Notes",
    profileImage: "Profile Image",
    coverImage: "Cover Image",
    locationPlaceholder: "Example: Cairo, Egypt",
    bioPlaceholder: "Brief description of the client...",
    selectImage: "Select Image",
    changeImage: "Change Image",
    selectCoverImage: "Select Cover Image",
    // Buttons
    cancel: "Cancel",
    save: "Save Client",
    saveChanges: "Save Changes",
    saving: "Saving...",
    // Client details
    projects: "Projects",
    budget: "Budget:",
    from: "From",
    to: "To",
    // Actions
    view: "View",
    edit: "Edit",
    delete: "Delete"
  }
};

const ClientsDatabase = ({ onBack }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const fileInputRef = useRef(null);

  // Language state
  const [language, setLanguage] = useState(() => {
    const savedLang = localStorage.getItem('clientsLanguage');
    return savedLang || 'ar';
  });

  // New state for advanced features
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [viewSize, setViewSize] = useState(() => {
    // استرجاع الحجم المحفوظ من localStorage
    const savedSize = localStorage.getItem('clientsViewSize');
    return savedSize ? Number(savedSize) : 1;
  }); // 0.8 to 1.5
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    industry: '',
    dateRange: '',
    hasProjects: 'all'
  });
  const [clientProjects, setClientProjects] = useState({});

  // حفظ اللغة والحجم في localStorage
  useEffect(() => {
    localStorage.setItem('clientsLanguage', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('clientsViewSize', viewSize.toString());
  }, [viewSize]);

  // Get current translations
  const t = translations[language];

  // Toggle language function
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const fullNameOf = (c) => [c.first_name, c.last_name].filter(Boolean).join(' ').trim();

  const fetchClients = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) throw err;
      setClients(data || []);
      
      // Fetch projects for each client
      await fetchClientProjects(data || []);
    } catch (e) {
      setError(e.message || 'تعذر تحميل بيانات العملاء');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientProjects = async (clientsList) => {
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, total, client_id, start_date, end_date');
      
      if (projectsError) throw projectsError;

      const projectsMap = {};
      clientsList.forEach(client => {
        const clientProjects = projectsData.filter(p => p.client_id === client.id);
        projectsMap[client.id] = clientProjects;
      });

      setClientProjects(projectsMap);
    } catch (e) {
      console.error('Error fetching client projects:', e);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) => {
    // Search filter
    const name = fullNameOf(client).toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = name.includes(q) || 
                         (client.email_address || '').toLowerCase().includes(q) || 
                         (client.phone_number || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    // Industry filter
    if (filters.industry && client.industry !== filters.industry) return false;

    // Date range filter
    if (filters.dateRange) {
      const clientDate = new Date(client.joined_date);
      const now = new Date();
      const daysDiff = Math.floor((now - clientDate) / (1000 * 60 * 60 * 24));
      
      switch (filters.dateRange) {
        case 'week':
          if (daysDiff > 7) return false;
          break;
        case 'month':
          if (daysDiff > 30) return false;
          break;
        case 'quarter':
          if (daysDiff > 90) return false;
          break;
        case 'year':
          if (daysDiff > 365) return false;
          break;
      }
    }

    // Has projects filter
    if (filters.hasProjects !== 'all') {
      const hasProjects = clientProjects[client.id]?.length > 0;
      if (filters.hasProjects === 'yes' && !hasProjects) return false;
      if (filters.hasProjects === 'no' && hasProjects) return false;
    }

    return true;
  });

  const getIndustries = () => {
    const industries = [...new Set(clients.map(c => c.industry).filter(Boolean))];
    return industries.sort();
  };

  const getTotalProjectsValue = (clientId) => {
    const projects = clientProjects[clientId] || [];
    return projects.reduce((sum, p) => sum + (Number(p.total) || 0), 0);
  };

  const AddClientModal = () => {
    const [form, setForm] = useState({
      prefix: '',
      first_name: '',
      last_name: '',
      client_bio: '',
      phone_number: '',
      email_address: '',
      joined_date: '',
      industry: '',
      location: '',
      notes: '',
      profile_image_url: '',
      cover_image_url: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState('');

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      }
    };

    const handleCoverImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setCoverImageFile(file);
        const reader = new FileReader();
        reader.onload = () => setCoverImagePreview(reader.result);
        reader.readAsDataURL(file);
      }
    };

    const uploadImage = async (file) => {
      if (!file) return null;
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `clients/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      return publicUrl;
    };

    const onSave = async () => {
      try {
        let imageUrl = null;
        let coverImageUrl = null;
        
        if (imageFile) {
          imageUrl = await uploadImage(imageFile);
        }
        
        if (coverImageFile) {
          coverImageUrl = await uploadImage(coverImageFile);
        }
        
        const clientData = { ...form };
        if (imageUrl) {
          clientData.profile_image_url = imageUrl;
        }
        if (coverImageUrl) {
          clientData.cover_image_url = coverImageUrl;
        }
        
        const { data, error: err } = await supabase
          .from('clients')
          .insert(clientData)
          .select()
          .single();
        if (err) throw err;
        setClients((arr) => [data, ...arr]);
        setShowAddModal(false);
        setImageFile(null);
        setImagePreview('');
        setCoverImageFile(null);
        setCoverImagePreview('');
        
        // Refresh projects data
        await fetchClientProjects([data, ...clients]);
      } catch (e) {
        alert(e.message || 'تعذر حفظ العميل');
      }
    };

    return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-2xl font-bold mb-6">{t.addClientTitle}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.prefix}</label>
              <input value={form.prefix} onChange={(e)=>setForm({...form, prefix:e.target.value})} type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.firstName}</label>
              <input value={form.first_name} onChange={(e)=>setForm({...form, first_name:e.target.value})} type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم العائلة</label>
              <input value={form.last_name} onChange={(e)=>setForm({...form, last_name:e.target.value})} type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.phone}</label>
              <input value={form.phone_number} onChange={(e)=>setForm({...form, phone_number:e.target.value})} type="tel" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.email}</label>
              <input value={form.email_address} onChange={(e)=>setForm({...form, email_address:e.target.value})} type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.joinDate}</label>
              <input value={form.joined_date} onChange={(e)=>setForm({...form, joined_date:e.target.value})} type="date" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.industry}</label>
              <input value={form.industry} onChange={(e)=>setForm({...form, industry:e.target.value})} type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.location}</label>
              <input value={form.location} onChange={(e)=>setForm({...form, location:e.target.value})} type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder={t.locationPlaceholder} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.bio}</label>
              <textarea value={form.client_bio} onChange={(e)=>setForm({...form, client_bio:e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" rows="2" placeholder={t.bioPlaceholder}></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.profileImage}</label>
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t.selectImage}
                </button>
                {imagePreview && (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                    <img src={imagePreview} alt="معاينة" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.coverImage}</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                  id="cover-image-input"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('cover-image-input').click()}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t.selectCoverImage}
                </button>
                {coverImagePreview && (
                  <div className="w-24 h-16 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img src={coverImagePreview} alt="معاينة الغلاف" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
          </div>
          <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.notes}</label>
              <textarea value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" rows="2"></textarea>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={() => setShowAddModal(false)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
              {t.cancel}
            </button>
            <button onClick={onSave} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              {t.save}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EditClientModal = () => {
    const [form, setForm] = useState(editingClient ? { ...editingClient } : {});
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(editingClient?.profile_image_url || '');
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState(editingClient?.cover_image_url || '');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
      if (editingClient) {
        setForm({ ...editingClient });
        setImagePreview(editingClient.profile_image_url || '');
        setCoverImagePreview(editingClient.cover_image_url || '');
      }
    }, [editingClient]);

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      }
    };

    const handleCoverImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setCoverImageFile(file);
        const reader = new FileReader();
        reader.onload = () => setCoverImagePreview(reader.result);
        reader.readAsDataURL(file);
      }
    };

    const uploadImage = async (file) => {
      if (!file) return null;
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `clients/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      return publicUrl;
    };

    const onSave = async () => {
      try {
        setSaving(true);
        let imageUrl = editingClient?.profile_image_url;
        let coverImageUrl = editingClient?.cover_image_url;
        
        if (imageFile) {
          imageUrl = await uploadImage(imageFile);
        }
        
        if (coverImageFile) {
          coverImageUrl = await uploadImage(coverImageFile);
        }
        
        const clientData = { ...form };
        if (imageUrl) {
          clientData.profile_image_url = imageUrl;
        }
        if (coverImageUrl) {
          clientData.cover_image_url = coverImageUrl;
        }
        
        const { data, error: err } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', editingClient.id)
          .select()
          .single();
        
        if (err) throw err;
        
        setClients((arr) => arr.map(c => c.id === editingClient.id ? data : c));
        setShowEditModal(false);
        setEditingClient(null);
        setImageFile(null);
        setImagePreview('');
        setCoverImageFile(null);
        setCoverImagePreview('');
      } catch (e) {
        alert(e.message || 'تعذر تحديث العميل');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-2xl font-bold mb-6">{t.editClientTitle}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.prefix}</label>
              <input value={form.prefix || ''} onChange={(e)=>setForm({...form, prefix:e.target.value})} type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.firstName}</label>
              <input value={form.first_name || ''} onChange={(e)=>setForm({...form, first_name:e.target.value})} type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم العائلة</label>
              <input value={form.last_name || ''} onChange={(e)=>setForm({...form, last_name:e.target.value})} type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.phone}</label>
              <input value={form.phone_number || ''} onChange={(e)=>setForm({...form, phone_number:e.target.value})} type="tel" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.email}</label>
              <input value={form.email_address || ''} onChange={(e)=>setForm({...form, email_address:e.target.value})} type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.joinDate}</label>
              <input value={form.joined_date || ''} onChange={(e)=>setForm({...form, joined_date:e.target.value})} type="date" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.industry}</label>
              <input value={form.industry || ''} onChange={(e)=>setForm({...form, industry:e.target.value})} type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.location}</label>
              <input value={form.location || ''} onChange={(e)=>setForm({...form, location:e.target.value})} type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.bio}</label>
              <textarea value={form.client_bio || ''} onChange={(e)=>setForm({...form, client_bio:e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" rows="2" placeholder={t.bioPlaceholder}></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.profileImage}</label>
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {imagePreview ? t.changeImage : t.selectImage}
                </button>
                {imagePreview && (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                    <img src={imagePreview} alt="معاينة" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.coverImage}</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                  id="cover-image-input"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('cover-image-input').click()}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t.selectCoverImage}
                </button>
                {coverImagePreview && (
                  <div className="w-24 h-16 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img src={coverImagePreview} alt="معاينة الغلاف" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.notes}</label>
              <textarea value={form.notes || ''} onChange={(e)=>setForm({...form, notes:e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" rows="2"></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingClient(null);
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t.cancel}
          </button>
            <button 
              onClick={onSave} 
              disabled={saving}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {saving ? t.saving : t.saveChanges}
          </button>
        </div>
      </div>
    </div>
  );
  };

  const ClientDetailsModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-bold">{fullNameOf(selectedClient || {}) || 'عميل'}</h3>
          <button 
            onClick={() => setSelectedClient(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="text-gray-400" size={20} />
              <span>{selectedClient?.phone_number || '-'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-gray-400" size={20} />
              <span>{selectedClient?.email_address || '-'}</span>
            </div>
            {selectedClient?.client_bio && (
              <div className="flex items-center gap-3">
                <span className="text-gray-400">نبذة:</span>
                <span className="inline-block px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  {selectedClient.client_bio}
                </span>
            </div>
            )}
            {selectedClient?.location && (
            <div className="flex items-center gap-3">
                <span className="text-gray-400">الموقع:</span>
                <span>{selectedClient.location}</span>
            </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Building className="text-gray-400" size={20} />
              <span>الصناعة: {selectedClient?.industry || '-'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400" size={20} />
              <span>تاريخ الانضمام: {selectedClient?.joined_date || '-'}</span>
            </div>
            {selectedClient?.profile_image_url && (
            <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                  <img src={selectedClient.profile_image_url} alt="صورة العميل" className="w-full h-full object-cover" />
                </div>
                <span>صورة العميل</span>
            </div>
            )}
          </div>
        </div>
        
        {/* Projects Section */}
        {clientProjects[selectedClient?.id]?.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <FolderOpen size={20} />
              {t.projects} ({clientProjects[selectedClient?.id].length})
            </h4>
            <div className="space-y-2">
              {clientProjects[selectedClient?.id].map((project) => (
                <div key={project.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="font-medium">{project.name}</span>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{t.budget}: {Number(project.total).toLocaleString()} جنيه</span>
                    <span>{t.from} {project.start_date} {t.to} {project.end_date}</span>
                  </div>
                </div>
              ))}
        </div>
          </div>
        )}
        
        {selectedClient?.notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">ملاحظات</h4>
            <p className="text-gray-600">{selectedClient?.notes}</p>
          </div>
        )}
      </div>
    </div>
  );

  const removeClient = async (id) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      const { error: err } = await supabase.from('clients').delete().eq('id', id);
      if (err) throw err;
      setClients((arr) => arr.filter((c) => c.id !== id));
      
      // Remove from projects map
      setClientProjects(prev => {
        const newMap = { ...prev };
        delete newMap[id];
        return newMap;
      });
    } catch (e) {
      alert(e.message || 'تعذر حذف العميل');
    }
  };

  const clearFilters = () => {
    setFilters({
      industry: '',
      dateRange: '',
      hasProjects: 'all'
    });
  };

  const getViewStyles = () => {
    const baseSize = viewMode === 'grid' ? 1 : 1.2;
    const scale = baseSize * viewSize;
    
    if (viewMode === 'grid') {
      return {
        gridTemplateColumns: `repeat(auto-fill, minmax(${280 * scale}px, 1fr))`,
        gap: `${24 * scale}px`
      };
    } else {
      return {
        gridTemplateColumns: '1fr',
        gap: `${16 * scale}px`
      };
    }
  };

  return (
    <div className={`min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 ${language === 'ar' ? 'rtl' : 'ltr'} flex flex-col`}>
      {/* Decorative backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-200 to-teal-200 blur-3xl animate-pulse" style={{ animationDelay: '4s', animationDuration: '4s', width: '28rem', height: '28rem', opacity: 0.10 }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className={`flex items-center justify-between ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className={`flex items-center gap-4 ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
              <button 
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              >
                <svg className={`w-6 h-6 ${language === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <Users className="text-white" size={20} />
                </div>
                <div className={`text-${language === 'ar' ? 'right' : 'left'}`}>
                  <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
                  <p className="text-sm text-gray-500">{t.subtitle}</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <Plus size={20} />
              <span>{t.addClient}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Controls Bar */}
      <div className="relative z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className={`flex flex-wrap items-center justify-between gap-4 ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
            {/* Search */}
            <div className={`flex items-center gap-3 flex-1 max-w-md ${language === 'ar' ? 'order-1' : 'order-2'}`}>
              <div className="relative flex-1">
                <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={20} />
                <input 
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700`}
                />
              </div>
            </div>
            
            {/* View Controls */}
            <div className={`flex items-center gap-3 ${language === 'ar' ? 'order-2' : 'order-1'}`}>
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List size={18} />
                </button>
              </div>

              {/* View Size Slider */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{t.size}</span>
                <input
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.1"
                  value={viewSize}
                  onChange={(e) => setViewSize(Number(e.target.value))}
                  className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-gray-500 w-8">{Math.round(viewSize * 100)}%</span>
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:text-gray-800'
                }`}
              >
                <Filter size={18} />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-700">{t.advancedFilters}</h4>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <X size={14} />
                  {t.clearFilters}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Industry Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.industry}</label>
                  <select
                    value={filters.industry}
                    onChange={(e) => setFilters({...filters, industry: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  >
                    <option value="">{t.allIndustries}</option>
                    {getIndustries().map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.dateRange}</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  >
                    <option value="">{t.allPeriods}</option>
                    <option value="week">{t.lastWeek}</option>
                    <option value="month">{t.lastMonth}</option>
                    <option value="quarter">{t.lastQuarter}</option>
                    <option value="year">{t.lastYear}</option>
                  </select>
                </div>

                {/* Has Projects Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.hasProjects}</label>
                  <select
                    value={filters.hasProjects}
                    onChange={(e) => setFilters({...filters, hasProjects: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  >
                    <option value="all">{t.allClients}</option>
                    <option value="yes">{t.hasProjects}</option>
                    <option value="no">{t.noProjects}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
              
      {/* Clients Grid/List */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex-1">
        {error && (
          <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        
        {/* Results Summary */}
        <div className={`mb-4 flex items-center justify-between ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className={`text-sm text-gray-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {t.resultsSummary.replace('{filtered}', filteredClients.length).replace('{total}', clients.length)}
          </div>
          {Object.values(filters).some(f => f !== '' && f !== 'all') && (
            <div className={`text-sm text-blue-600 ${language === 'ar' ? 'text-left' : 'text-right'}`}>
              {t.activeFilters}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-gray-500">{t.loading}</div>
        ) : (
          <div className="grid" style={getViewStyles()}>
            {filteredClients.map((client) => (
              <ClientAccountCard
                key={client.id}
                account={client}
                accountProjects={clientProjects}
                getTotalProjectsValue={getTotalProjectsValue}
                language={language}
                onView={setSelectedClient}
                onEdit={(client) => {
                  setEditingClient(client);
                  setShowEditModal(true);
                }}
                onDelete={removeClient}
              />
            ))}
            {filteredClients.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-8">
                لا توجد نتائج مطابقة.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showAddModal && <AddClientModal />}
      {showEditModal && <EditClientModal />}
      {selectedClient && <ClientDetailsModal />}
    </div>
  );
};

export default ClientsDatabase;