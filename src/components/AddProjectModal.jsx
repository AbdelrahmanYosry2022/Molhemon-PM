// src/components/AddProjectModal.jsx
import React, { useState } from 'react';
import Select from 'react-select';
import { supabase } from '../supabaseClient';

/**
 * AddProjectModal (redesigned)
 * - RTL friendly
 * - Deduplicated fields and clearer grouping
 * - Preview for deliverables & team entries
 * - Keeps existing Supabase insert logic (projects + project_attributes)
 */
function AddProjectModal({ onClose, onProjectAdded, clients = [] }) {
  const [name, setName] = useState('');
  const [total, setTotal] = useState('');
  const [currency, setCurrency] = useState('EGP');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('');

  // deliverables/team are entered as multiline text but previewed as chips
  const [deliverablesText, setDeliverablesText] = useState('');
  const [teamText, setTeamText] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const parseList = (s) => {
    if (!s) return [];
    return s
      .split(/\n|;|,/)
      .map(x => x.trim())
      .filter(Boolean);
  };

  const parseTeam = (s) => {
    return parseList(s).map(item => {
      const parts = item.split(/\s*-\s*/);
      return parts.length > 1 ? { name: parts[0].trim(), role: parts.slice(1).join(' - ').trim() } : { name: item.trim(), role: '' };
    });
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    setError(null);
    if (!name.trim()) return setError('الرجاء إدخال اسم المشروع');
    setLoading(true);

    try {
      const projectData = {
        name: name.trim(),
        total: parseFloat(total) || 0,
        currency: currency || 'EGP',
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
        client_id: clientId || null
      };

      const { data, error: insertErr } = await supabase.from('projects').insert([projectData]).select().single();
      if (insertErr) throw insertErr;

      // insert attributes (best-effort)
      try {
        await supabase.from('project_attributes').insert([
          {
            project_id: data.id,
            client_name: clients.find(c => c.id === data.client_id)?.first_name || 'عميل غير محدد',
            service: 'General',
            status: 'قيد التنفيذ',
            description: description || null,
            currency: currency || 'EGP',
            deliverables: parseList(deliverablesText),
            team: parseTeam(teamText)
          }
        ]);
      } catch (err) {
        // don't block main flow if attributes fail
        console.warn('Failed to write project_attributes:', err);
      }

      setSuccess(true);
      onProjectAdded?.(data);
      setTimeout(() => onClose?.(), 900);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // previews
  const deliverables = parseList(deliverablesText);
  const team = parseTeam(teamText);
  const clientOptions = clients
    .sort((a, b) => (a.first_name || '').localeCompare(b.first_name || ''))
    .map(c => ({ value: c.id, label: `${c.first_name || ''} ${c.last_name || ''}`.trim() }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div dir="rtl" className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-lg">
        <header className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">إضافة مشروع جديد</h3>
          <button onClick={onClose} className="text-sm text-gray-500">إغلاق</button>
        </header>

        {success && <div className="mb-4 p-2 bg-emerald-50 text-emerald-700 rounded">تمت الإضافة بنجاح</div>}
        {error && <div className="mb-4 p-2 bg-red-50 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">اسم المشروع</label>
              <input className="w-full border rounded px-3 py-2" value={name} onChange={e=>setName(e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">الميزانية الإجمالية</label>
              <div className="flex gap-2">
                <input type="number" className="flex-1 border rounded px-3 py-2" value={total} onChange={e=>setTotal(e.target.value)} />
                <select className="border rounded px-2" value={currency} onChange={e=>setCurrency(e.target.value)}>
                  <option>EGP</option>
                  <option>USD</option>
                  <option>EUR</option>
                  <option>SAR</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">تاريخ البدء</label>
              <input type="date" className="w-full border rounded px-3 py-2" value={startDate} onChange={e=>setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">تاريخ الانتهاء</label>
              <input type="date" className="w-full border rounded px-3 py-2" value={endDate} onChange={e=>setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs text-gray-600 mb-1">العميل</label>
            <Select
              options={clientOptions}
              onChange={option => setClientId(option ? option.value : '')}
              isClearable
              isSearchable
              placeholder="ابحث عن عميل أو اختر..."
              value={clientOptions.find(c => c.value === clientId)}
            />
          </div>

          <div className="mt-4">
            <label className="block text-xs text-gray-600 mb-1">وصف المشروع (اختياري)</label>
            <textarea rows={3} className="w-full border rounded px-3 py-2" value={description} onChange={e=>setDescription(e.target.value)} placeholder="أضف وصفًا مختصرًا للمشروع، أهدافه ونطاقه." />
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">المخرجات الأساسية (سطر لكل مخرج)</label>
              <textarea rows={4} className="w-full border rounded px-3 py-2" value={deliverablesText} onChange={e=>setDeliverablesText(e.target.value)} placeholder="مثال: Trailer 30s; Key Art v1; Episode 1 - Final" />
              {deliverables.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {deliverables.map((d,i)=> (
                    <span key={i} className="text-xs bg-gray-100 rounded px-2 py-1">{d}</span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">أعضاء الفريق الأساسيين (سطر: الاسم - الدور)</label>
              <textarea rows={4} className="w-full border rounded px-3 py-2" value={teamText} onChange={e=>setTeamText(e.target.value)} placeholder="مثال: Ahmed Hassan - Producer; Mona Ali - Editor" />
              {team.length > 0 && (
                <div className="mt-2">
                  {team.map((m,i)=> (
                    <div key={i} className="text-xs bg-gray-50 rounded px-2 py-1 mb-1">
                      <strong className="ml-2">{m.name}</strong>
                      <span className="text-gray-500">{m.role ? ` — ${m.role}` : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">إلغاء</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 text-white rounded">
              {loading ? 'جاري الإضافة...' : 'إضافة المشروع'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProjectModal;
