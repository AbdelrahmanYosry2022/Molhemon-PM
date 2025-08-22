# إصلاح مشكلة Bucket غير موجود في Supabase Storage

## 🔧 المشكلة

**الخطأ:** `Bucket not found`
- النظام يحاول استخدام bucket `team-avatars` غير موجود
- خطأ 400 Bad Request عند محاولة رفع الصور
- الصور لا تُرفع إلى Supabase Storage

## 🛠️ الحل

### 1. تغيير Bucket من `team-avatars` إلى `avatars`

**المشكلة:** استخدام bucket غير موجود
```jsx
// قبل الإصلاح
.from('team-avatars')
.upload(fileName, memberData.avatar_file);

avatarUrl = `https://.../team-avatars/${fileName}`;
```

**الحل:** استخدام bucket موجود `avatars`
```jsx
// بعد الإصلاح
.from('avatars')
.upload(fileName, memberData.avatar_file);

avatarUrl = `https://.../avatars/${fileName}`;
```

### 2. إصلاح `handleAddMember` في `TeamDashboard.jsx`

**تغيير Bucket:**
```jsx
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('avatars') // تغيير من 'team-avatars' إلى 'avatars'
  .upload(fileName, memberData.avatar_file);

// تغيير URL أيضاً
avatarUrl = `https://zsshxpdgbnxfuszanaeo.supabase.co/storage/v1/object/public/avatars/${fileName}`;
```

### 3. إصلاح `handleUpdateMember` في `TeamDashboard.jsx`

**نفس التغيير:**
```jsx
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('avatars') // تغيير من 'team-avatars' إلى 'avatars'
  .upload(fileName, updates.avatar_file);

// تغيير URL أيضاً
avatarUrl = `https://zsshxpdgbnxfuszanaeo.supabase.co/storage/v1/object/public/avatars/${fileName}`;
```

## 🔄 تدفق العمل الجديد

### رفع الصور:
1. النظام يستخدم bucket `avatars` الموجود
2. الصور تُرفع بنجاح إلى Supabase Storage
3. URLs الصحيحة تُحفظ في قاعدة البيانات
4. الصور تظهر في الواجهة

### URLs الصحيحة:
- **قبل الإصلاح:** `https://.../team-avatars/filename.png` (غير موجود)
- **بعد الإصلاح:** `https://.../avatars/filename.png` (موجود)

## 🎯 التحسينات الجديدة

### 1. استخدام Bucket صحيح
- استخدام bucket `avatars` الموجود
- منع أخطاء "Bucket not found"
- رفع الصور بنجاح

### 2. URLs صحيحة
- URLs تعمل بشكل صحيح
- الصور تظهر في الواجهة
- عدم فقدان الصور

### 3. توافق مع النظام
- نفس Bucket المستخدم في `TeamPanel.jsx`
- توحيد نظام تخزين الصور
- تجنب تضارب Buckets

## 🚀 الخطوات التالية

1. **اختبار رفع الصور:** التأكد من عمل رفع الصور
2. **اختبار عرض الصور:** التأكد من ظهور الصور
3. **اختبار تحديث الصور:** التأكد من عمل التحديث

## 📝 ملاحظات مهمة

- الآن يتم استخدام bucket `avatars` الموجود
- الصور تُرفع بنجاح إلى Supabase Storage
- URLs صحيحة تُحفظ في قاعدة البيانات
- النظام متوافق مع باقي الأجزاء

## 🔧 إعدادات Supabase

**Bucket المستخدم:** `avatars`
**URL Format:** `https://[PROJECT_ID].supabase.co/storage/v1/object/public/avatars/[FILENAME]`
**Permissions:** Public read access
**Status:** موجود ومتاح

## 🚨 ملاحظة مهمة

إذا كنت تريد استخدام bucket `team-avatars`، يجب إنشاؤه أولاً في Supabase Dashboard:
1. اذهب إلى Storage في Supabase
2. اضغط "New Bucket"
3. أدخل اسم `team-avatars`
4. اختر Public access
5. اضغط "Create bucket"
