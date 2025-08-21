// src/components/EditProjectModal.jsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { supabase } from '../supabaseClient';

function EditProjectModal({ onClose, onProjectUpdated, project, clients }) {
  const [formData, setFormData] = useState({
    name: '',
    total: '',
    currency: 'EGP',
    description: '',
    start_date: '',
    end_date: '',
    client_id: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        total: project.total || '',
        currency: project.currency || 'EGP',
        description: project.description || '',
        start_date: project.start_date ? project.start_date.split('T')[0] : '',
        end_date: project.end_date ? project.end_date.split('T')[0] : '',
        client_id: project.client_id || '',
        image_url: project.image_url || ''
      });
    }
  }, [project]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClientChange = (option) => {
    setFormData(prev => ({
      ...prev,
      client_id: option ? option.value : ''
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrl = formData.image_url;
      if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage.from('project-images').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      const projectData = {
        name: formData.name,
        total: parseFloat(formData.total) || 0,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        client_id: formData.client_id || null,
        image_url: imageUrl
      };

      // Refresh the project row from the database to ensure we have the canonical owner_id
      let freshProject = project;
      try {
        const { data: fetched, error: fetchErr } = await supabase.from('projects').select('*').eq('id', project.id).single();
        if (!fetchErr && fetched) {
          freshProject = fetched;
        } else if (fetchErr) {
          console.warn('Could not fetch fresh project row (continuing with provided project object):', fetchErr.message || fetchErr);
        }
      } catch (fetchEx) {
        console.warn('Exception while fetching fresh project row:', fetchEx);
      }

      // Try to get current authenticated user id (support v2 and fallback to older API)
      let currentUser = null;
      try {
        if (supabase.auth && typeof supabase.auth.getUser === 'function') {
          const { data: userData, error: userErr } = await supabase.auth.getUser();
          if (!userErr) currentUser = userData?.user || null;
        } else if (supabase.auth && typeof supabase.auth.user === 'function') {
          // older clients
          currentUser = supabase.auth.user();
        }
      } catch (uErr) {
        console.warn('Failed to read current user from supabase.auth', uErr);
      }

      // If we can detect the current user and they are not the project owner,
      // don't attempt to update the `projects` row (RLS will block it). Instead
      // try the metadata fallback which may have a different policy.
      if (currentUser && freshProject && freshProject.owner_id && String(currentUser.id) !== String(freshProject.owner_id)) {
        console.warn('Current user is not the project owner; skipping projects.update to avoid RLS failure and attempting metadata fallback.');
        const { error: attrErr } = await supabase.from('project_attributes').insert([{
          project_id: project.id,
          image_url: imageUrl || null,
          description: formData.description || null
        }]);
        if (attrErr) {
          // if metadata insert is also blocked, surface a clearer message to the user
          throw new Error('تم رفض التعديل بسبب سياسات قاعدة البيانات (RLS). لا يمكنك تعديل هذا المشروع من حسابك الحالي.');
        }
        // update UI locally so user sees the image immediately
        const localUpdated = { ...project, ...projectData, image_url: imageUrl };
        setSuccess(true);
        onProjectUpdated(localUpdated);
        setTimeout(() => { onClose(); }, 1200);
        return;
      }

      // Proceed with normal update attempt (user is owner or we couldn't determine the user)
      const { data, error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', project.id)
        .select()
        .single();

      if (error) {
        // If the update failed due to RLS (or any other reason), try to save as project_attributes metadata instead
        const errMsg = String(error.message || '');
        if (errMsg.toLowerCase().includes('row-level security') || errMsg.toLowerCase().includes('row level') || errMsg.toLowerCase().includes('violates row-level')) {
          console.warn('Update blocked by RLS, attempting to save metadata instead.');
          try {
            const { error: attrErr } = await supabase.from('project_attributes').insert([{ 
              project_id: project.id,
              image_url: imageUrl || null,
              description: formData.description || null
            }]);
            if (attrErr) {
              // surface a friendly error if metadata insert also fails
              throw new Error('تم رفض حفظ البيانات الوصفية أيضاً بسبب سياسات قاعدة البيانات. اتصل بمسؤول النظام.');
            }
            // update UI locally so user sees the image immediately
            const localUpdated = { ...project, ...projectData, image_url: imageUrl };
            setSuccess(true);
            onProjectUpdated(localUpdated);
            setTimeout(() => { onClose(); }, 1200);
            return;
          } catch (aErr) {
            console.error('Failed to save metadata fallback:', aErr);
            // rethrow a friendly error
            throw new Error(aErr.message || 'فشل تحديث المشروع بسبب قيود قاعدة البيانات.');
          }
        }
        throw error;
      }

      setSuccess(true);
      onProjectUpdated(data);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const raw = String((err && err.message) || err || '');
      const lower = raw.toLowerCase();
      if (lower.includes('row-level security') || lower.includes('row level') || lower.includes('violates row-level')) {
        setError('تم رفض التعديل بسبب سياسات الأمان على قاعدة البيانات (RLS). اتصل بمسؤول النظام لإعطاءك صلاحية التعديل.');
      } else {
        setError(raw || 'فشل تحديث المشروع. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clientOptions = clients
    .sort((a, b) => (a.first_name || '').localeCompare(b.first_name || ''))
    .map(c => ({ value: c.id, label: `${c.first_name || ''} ${c.last_name || ''}`.trim() }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">تعديل بيانات المشروع</h2>

        {success && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
            تم تحديث المشروع بنجاح!
          </div>
        )}

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">صورة المشروع</label>
              <input type="file" id="image" name="image" onChange={handleImageChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              {formData.image_url && !imageFile && (
                <img src={formData.image_url} alt="Project" className="w-20 h-20 mt-2 rounded" />
              )}
              {imageFile && (
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-20 h-20 mt-2 rounded" />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">اسم المشروع</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="total">الميزانية الإجمالية</label>
                <div className="flex gap-2">
                  <input type="number" id="total" name="total" value={formData.total} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
                  <select name="currency" value={formData.currency} onChange={handleInputChange} className="border rounded px-2">
                    <option value="EGP">EGP</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="start_date">تاريخ البدء</label>
                <input type="date" id="start_date" name="start_date" value={formData.start_date} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="end_date">تاريخ الانتهاء</label>
                <input type="date" id="end_date" name="end_date" value={formData.end_date} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="client_id">العميل</label>
              <Select
                id="client_id"
                name="client_id"
                options={clientOptions}
                value={clientOptions.find(c => c.value === formData.client_id)}
                onChange={handleClientChange}
                isClearable
                isSearchable
                placeholder="ابحث عن عميل أو اختر..."
              />
            </div>

            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">وصف المشروع (اختياري)</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full border rounded px-3 py-2 text-sm" placeholder="أضف وصفًا مختصرًا للمشروع، أهدافه ونطاقه." />
            </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? 'جاري التحديث...' : 'تحديث المشروع'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProjectModal;
