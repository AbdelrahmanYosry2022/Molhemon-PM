// src/components/AddProjectModal.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function AddProjectModal({ onClose, onProjectAdded, clients }) {
  const [formData, setFormData] = useState({
    name: '',
    total: '',
    start_date: '',
    end_date: '',
    client_id: ''
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
        // محاولة إضافة السجل باستخدام RLS
        const { error: attrError } = await supabase
          .from('project_attributes')
          .insert([{ 
            project_id: data.id,
            client_name: clients.find(c => c.id === data.client_id)?.first_name || 'عميل غير محدد',
            service: 'غير محدد',
            status: 'قيد التنفيذ'
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

          <div className="flex justify-end space-x-2">
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
