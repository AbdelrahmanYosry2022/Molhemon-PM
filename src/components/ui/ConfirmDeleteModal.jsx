import React, { useState, useEffect } from 'react';

export default function ConfirmDeleteModal({ open, projectName, itemsToRemove = [], onCancel, onConfirm }) {
  const [input, setInput] = useState('');
  const [ack, setAck] = useState(false);

  useEffect(() => {
    if (!open) setInput('');
  }, [open]);

  if (!open) return null;

  const matches = (projectName || '').trim().length > 0 && input.trim() === projectName.trim();
  const canDelete = matches && ack;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div dir="rtl" className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-lg">
        <h3 className="text-lg font-bold mb-2">تأكيد حذف المشروع</h3>
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded">
          <p className="text-sm text-red-700 font-semibold">تحذير: ستقوم بحذف المشروع نهائياً.</p>
          <p className="text-sm text-gray-600 mt-2">بمجرد الحذف، سيتم إزالة جميع البيانات المرتبطة بالمشروع. الأمثلة الشائعة:</p>
          <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
            {itemsToRemove.map((it, idx) => <li key={idx}>{it}</li>)}
          </ul>
          <p className="text-sm text-gray-600 mt-2">لا يمكن التراجع عن هذا الإجراء.</p>
        </div>

          <div className="mb-4">
          <p className="text-sm text-gray-700">للتأكيد، اكتب اسم المشروع أدناه ثم اضغط "حذف".</p>
          <div className="mt-2">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="اكتب اسم المشروع هنا"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && matches) onConfirm(); }}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
            <span className="text-sm text-gray-700">أفهم أن هذا الإجراء نهائي وسيؤدي إلى حذف جميع بيانات المشروع المرتبطة.</span>
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">إلغاء</button>
          <button
            onClick={onConfirm}
            disabled={!canDelete}
            className={`px-4 py-2 rounded ${canDelete ? 'bg-red-600 text-white' : 'bg-red-100 text-red-400 cursor-not-allowed'}`}
            title={canDelete ? 'حذف المشروع نهائياً' : 'تأكد من كتابة اسم المشروع وتفعيل المربع للتأكيد'}
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}
