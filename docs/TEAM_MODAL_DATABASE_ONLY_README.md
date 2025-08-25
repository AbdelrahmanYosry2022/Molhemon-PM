# تحديث مودال فريق العمل - استخدام قاعدة البيانات فقط

## المشكلة
كان مودال إضافة/تعديل عضو الفريق يسمح بإدخال اسم عضو يدوياً في حقل نص، مما يسمح بإضافة أعضاء غير موجودين في قاعدة البيانات.

## الحل
تم تحديث مودال `EditMemberModal` ليكون قائمة منسدلة فقط تأخذ البيانات من قاعدة البيانات الخاصة بفريق العمل.

## التغييرات المطبقة

### 1. إزالة حقل النص اليدوي
**قبل:**
```jsx
{/* Candidate selector (optional) + Name */}
<div>
  <label className="block text-xs text-gray-500 mb-1">العضو (اختر من القاعدة أو أدخل اسمًا جديدًا)</label>
  {candidates && candidates.length > 0 ? (
    <select>...</select>
  ) : null}
  
  <input
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right"
    value={v.name || ""}
    onChange={(e) => onChange((s) => ({ ...s, name: e.target.value, _candidate_id: "" }))}
    placeholder="اسم العضو"
  />
</div>
```

**بعد:**
```jsx
{/* Member selector from database */}
<div>
  <label className="block text-xs text-gray-500 mb-1">العضو (اختر من قاعدة البيانات)</label>
  <select
    className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-right"
    value={v._candidate_id || ""}
    onChange={(e) => {
      const cid = e.target.value;
      if (!cid) return onChange((s) => ({ ...s, _candidate_id: "", name: "", email: "", phone: "", avatar_url: "" }));
      const sel = candidates.find(c => String(c.id) === String(cid));
      if (sel) {
        onChange((s) => ({ 
          ...s, 
          _candidate_id: cid, 
          name: sel.name || (sel.first_name ? `${sel.first_name} ${sel.last_name||''}`.trim() : ''), 
          email: sel.email || '', 
          phone: sel.phone || '', 
          avatar_url: sel.avatar_url || sel.avatar || '' 
        }));
      }
    }}
    required
  >
    <option value="">-- اختر عضو من القائمة --</option>
    {candidates && candidates.length > 0 ? (
      candidates.map(c => (
        <option key={c.id} value={c.id}>
          {c.first_name ? `${c.first_name} ${c.last_name||''}`.trim() : c.name || c.email || c.id}
        </option>
      ))
    ) : (
      <option value="" disabled>لا توجد أعضاء متاحة</option>
    )}
  </select>
</div>
```

## الميزات الجديدة

### 1. قائمة منسدلة إجبارية
- **الوظيفة**: اختيار عضو من قاعدة البيانات فقط
- **التحقق**: حقل `required` يمنع الحفظ بدون اختيار
- **التصميم**: قائمة منسدلة واضحة مع خيار افتراضي

### 2. ملء البيانات تلقائياً
عند اختيار عضو من القائمة:
- **الاسم**: يتم ملؤه تلقائياً من قاعدة البيانات
- **البريد الإلكتروني**: يتم ملؤه تلقائياً
- **الهاتف**: يتم ملؤه تلقائياً
- **الصورة الشخصية**: يتم ملؤها تلقائياً

### 3. رسائل واضحة
- **الخيار الافتراضي**: "-- اختر عضو من القائمة --"
- **رسالة عدم وجود أعضاء**: "لا توجد أعضاء متاحة"
- **التسمية**: "العضو (اختر من قاعدة البيانات)"

### 4. التحقق من البيانات
- **إجبارية**: لا يمكن حفظ العضو بدون اختيار من القائمة
- **صحة البيانات**: جميع البيانات تأتي من قاعدة البيانات المعتمدة
- **التناسق**: ضمان أن جميع الأعضاء موجودون في النظام

## النتيجة

الآن مودال إضافة/تعديل عضو الفريق:

### ✅ **يسمح بـ:**
- اختيار عضو من قاعدة البيانات فقط
- ملء البيانات تلقائياً عند الاختيار
- تعديل الدور والحالة والتواريخ
- رفع صورة شخصية جديدة

### ❌ **لا يسمح بـ:**
- إدخال اسم عضو يدوياً
- إضافة أعضاء غير موجودين في قاعدة البيانات
- حفظ بيانات غير صحيحة

## الملفات المتأثرة
- `src/components/modals/EditMemberModal.jsx` - الملف الرئيسي الذي تم تحديثه

## ملاحظات
- تم الحفاظ على جميع الوظائف الأخرى (الدور، الحالة، التاريخ، إلخ)
- تم إضافة التحقق الإجباري من اختيار العضو
- البيانات الآن مضمونة الصحة لأنها تأتي من قاعدة البيانات
- التصميم والواجهة لم تتغير، فقط منطق الإدخال
