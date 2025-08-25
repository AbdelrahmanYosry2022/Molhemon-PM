# إصلاح عرض جدول فريق العمل

## المشكلة
كان جدول فريق العمل في داشبورد المشاريع يعرض الأعضاء على شكل بطاقات (cards) بدلاً من الجدول الطبيعي، مما يجعله مختلفاً عن باقي الجداول في النظام مثل جدول المخرجات.

## الحل
تم إصلاح ملف `src/components/TeamPanel.jsx` ليعرض الأعضاء في صفوف جدول عادية بدلاً من البطاقات.

## التغييرات المطبقة

### 1. استبدال TeamMemberCard بـ صفوف الجدول
**قبل:**
```jsx
<tbody>
  {filtered.map((row) => (
    <TeamMemberCard
      key={row.id}
      member={row}
      onEdit={openEdit}
      onDelete={removeRow}
      onAvatarChange={handleAvatarChange}
      RoleBadge={RoleBadge}
      StatusBadge={StatusBadge}
    />
  ))}
</tbody>
```

**بعد:**
```jsx
<tbody>
  {filtered.map((row) => (
    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
      <td className={`${td} font-medium`}>
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            {row.avatar_url ? (
              <img
                src={row.avatar_url}
                alt={row.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                {row.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
              </div>
            )}
            {handleAvatarChange && (
              <>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 bg-white border border-gray-300 rounded-full p-1 shadow"
                  title="تغيير الصورة"
                  onClick={() => document.getElementById(`avatar-input-${row.id}`)?.click()}
                >
                  <Pencil size={10} />
                </button>
                <input
                  type="file"
                  id={`avatar-input-${row.id}`}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleAvatarChange(row.id, file);
                    }
                  }}
                />
              </>
            )}
          </div>
          <span>{row.name}</span>
        </div>
      </td>
      <td className={td}>
        <RoleBadge value={row.role} />
      </td>
      <td className={td}>
        <StatusBadge value={row.status} />
      </td>
      <td className={td}>{row.joined || '-'}</td>
      <td className={td}>{row.email || '-'}</td>
      <td className={td}>{row.phone || '-'}</td>
      <td className={td}>
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-600"
            title="تعديل"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => removeRow?.(row.id)}
            className="p-1.5 rounded hover:bg-red-50 transition-colors text-red-600"
            title="حذف"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
```

## الميزات المحفوظة

### 1. عرض الصورة الشخصية
- عرض الصورة الشخصية بجانب اسم العضو
- إنشاء صورة افتراضية من الأحرف الأولى للاسم إذا لم توجد صورة
- إمكانية تغيير الصورة عبر زر التعديل

### 2. البطاقات (Badges)
- عرض الدور باستخدام `RoleBadge` مع ألوان مختلفة
- عرض الحالة باستخدام `StatusBadge` مع أيقونات

### 3. الإجراءات
- زر التعديل (قلم رصاص)
- زر الحذف (سلة المهملات)
- تأثيرات hover على الأزرار

### 4. التفاعل
- تأثير hover على الصفوف
- ترتيب الأعمدة
- البحث والفلترة

## النتيجة
الآن جدول فريق العمل في داشبورد المشاريع يعرض الأعضاء في صفوف جدول عادية مثل:
- جدول المخرجات
- جدول المدفوعات
- جدول مراحل العمل

مما يجعل الواجهة متناسقة ومتسقة في جميع أجزاء النظام.

## الملفات المتأثرة
- `src/components/TeamPanel.jsx` - الملف الرئيسي الذي تم تعديله

## ملاحظات
- تم الحفاظ على جميع الوظائف الموجودة
- تم الحفاظ على التصميم والألوان
- تم الحفاظ على التفاعل والاستجابة
- الجدول الآن متسق مع باقي الجداول في النظام
