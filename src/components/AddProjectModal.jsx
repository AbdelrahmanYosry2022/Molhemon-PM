// src/components/AddProjectModal.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function AddProjectModal({ onClose, onProjectAdded, clients }) {
  const [formData, setFormData] = useState({
    name: '',
    total: '',
    currency: 'EGP',
    description: '',
    start_date: '',
    end_date: '',
    client_id: '',
    deliverables_text: '', // user enters newline or semicolon separated list
    team_text: '', // user enters lines like "Name - Role" or comma separated
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // تحويل القيم المنطقية
      // Only include columns that exist in `projects` table schema
      const projectData = {
        name: formData.name,
        total: parseFloat(formData.total) || 0,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        client_id: formData.client_id || null
      };

      // إدخال المشروع
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // إدخال الخصائص الإضافية للمشروع (مع معالجة الأخطاء المحتملة)
      let attributesError = null;
      try {
        // تحويل النصوص إلى مصفوفات بسيطة
        const parseList = (s) => {
          if (!s) return [];
          return s
            .split(/\n|;|,/) // split on newline, semicolon or comma
            .map(x => x.trim())
            .filter(Boolean);
        };

        const parseTeam = (s) => {
          return parseList(s).map(item => {
            const parts = item.split(/\s*-\s*/);
            return parts.length > 1 ? { name: parts[0].trim(), role: parts.slice(1).join(' - ').trim() } : { name: item.trim(), role: '' };
          });
        };

        const deliverables = parseList(formData.deliverables_text);
        const team = parseTeam(formData.team_text);

        // محاولة إضافة السجل باستخدام RLS، مع تمرير metadata مبدئي
        const { error: attrError } = await supabase
          .from('project_attributes')
          .insert([{ 
            project_id: data.id,
            client_name: clients?.find(c => c.id === data.client_id)?.first_name || 'عميل غير محدد',
            service: 'General',
            status: 'قيد التنفيذ',
            description: formData.description || null,
            currency: formData.currency || 'EGP',
            deliverables: deliverables,
            team: team
          }]);

        attributesError = attrError;
      } catch (err) {
        attributesError = err;
      }

      // في حال وجود خطأ في إضافة الخصائص، نستمر لكن نطبع رسالة تحذير
      if (attributesError) {
        console.warn('لم تتمكن من إضافة الخصائص الإضافية للمشروع:', attributesError);
        // لا نرمي الخطأ هنا حتى لا يفشل الإضافة الكاملة
      }

      setSuccess(true);
      onProjectAdded(data);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">إضافة مشروع جديد</h2>

        {success && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
            تم إضافة المشروع بنجاح!
          </div>
        )}

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              <select id="client_id" name="client_id" value={formData.client_id} onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option value="">اختر عميل</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.first_name} {client.last_name}</option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">وصف المشروع (اختياري)</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full border rounded px-3 py-2 text-sm" placeholder="أضف وصفًا مختصرًا للمشروع، أهدافه ونطاقه." />
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="deliverables_text">المخرجات الأساسية (سطر لكل مخرج)</label>
                <textarea id="deliverables_text" name="deliverables_text" value={formData.deliverables_text} onChange={handleInputChange} rows={4} className="w-full border rounded px-3 py-2 text-sm" placeholder="مثال: Trailer 30s; Key Art v1; Episode 1 - Final" />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="team_text">أعضاء الفريق الأساسيين (سطر: الاسم - الدور)</label>
                <textarea id="team_text" name="team_text" value={formData.team_text} onChange={handleInputChange} rows={4} className="w-full border rounded px-3 py-2 text-sm" placeholder="مثال: Ahmed Hassan - Producer; Mona Ali - Editor" />
              </div>
            </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              اسم المشروع
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="total">
              الميزانية الإجمالية
            </label>
            <input
              type="number"
              id="total"
              name="total"
              value={formData.total}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="start_date">
              تاريخ البدء
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="end_date">
              تاريخ الانتهاء
            </label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="client_id">
              العميل
            </label>
            <select
              id="client_id"
              name="client_id"
              value={formData.client_id}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">اختر عميل</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.first_name} {client.last_name}
                </option>
              ))}
            </select>
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
              {loading ? 'جاري الإضافة...' : 'إضافة المشروع'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProjectModal;
