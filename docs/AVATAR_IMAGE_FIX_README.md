# إصلاح مشكلة الصور الشخصية للأعضاء

## 🔧 المشكلة

**الخطأ:** `blob:http://localhost:5173/... net::ERR_FILE_NOT_FOUND`
- الصور تستخدم روابط blob مؤقتة تختفي عند إعادة تحميل الصفحة
- عند إضافة عضو جديد، الصورة تظهر مؤقتاً ثم تختفي
- الصور لا تُحفظ بشكل دائم في قاعدة البيانات

## 🛠️ الحل

### 1. إصلاح معالجة الصور في `EditMemberModal.jsx`

**المشكلة:** الصور تُحفظ كـ blob URLs مؤقتة
```jsx
// قبل الإصلاح
onChange((s) => ({ 
  ...s, 
  avatar_file: file,
  avatar_url: URL.createObjectURL(file) // Create preview URL
}))
```

**الحل:** عدم حفظ blob URL، فقط معاينة مؤقتة
```jsx
// بعد الإصلاح
onChange((s) => ({ 
  ...s, 
  avatar_file: file,
  // لا نضع avatar_url هنا لأنها ستكون blob مؤقت
  // سيتم رفع الصورة في TeamDashboard
}))
```

### 2. إضافة معاينة للصورة المحددة حديثاً

**معاينة الصورة في المودال:**
```jsx
<img
  src={
    v.avatar_file 
      ? URL.createObjectURL(v.avatar_file) // معاينة مؤقتة للصورة الجديدة
      : (v.avatar_url || v.avatar || "https://i.pravatar.cc/96?img=1") // صورة موجودة أو افتراضية
  }
  alt="avatar"
  className="w-16 h-16 rounded-full object-cover border border-gray-200"
/>
```

### 3. رفع الصور إلى Supabase Storage

**في `TeamDashboard.jsx`:**
```jsx
// رفع الصورة إذا كانت موجودة
let avatarUrl = memberData.avatar_url;
if (memberData.avatar_file) {
  console.log('Uploading avatar file:', memberData.avatar_file.name);
  const fileExt = memberData.avatar_file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('team-avatars')
    .upload(fileName, memberData.avatar_file);

  if (uploadError) {
    console.error('Avatar upload error:', uploadError);
    throw uploadError;
  }
  // استخدام URL مباشر بدلاً من متغير البيئة
  avatarUrl = `https://zsshxpdgbnxfuszanaeo.supabase.co/storage/v1/object/public/team-avatars/${fileName}`;
  console.log('Avatar uploaded successfully:', avatarUrl);
}
```

## 🔄 تدفق العمل الجديد

### إضافة عضو جديد مع صورة:
1. المستخدم يفتح مودال "إضافة عضو"
2. يختار صورة من جهازه
3. يرى معاينة للصورة (blob URL مؤقت)
4. يضغط "حفظ"
5. الصورة تُرفع إلى Supabase Storage
6. يتم حفظ URL الصورة الدائم في قاعدة البيانات
7. عند إعادة التحميل، الصورة تظهر من الرابط الدائم

### معالجة الصور:
- **في المودال:** معاينة مؤقتة باستخدام `URL.createObjectURL()`
- **في الخادم:** رفع الصورة إلى Supabase Storage
- **في قاعدة البيانات:** حفظ URL الصورة الدائم
- **في العرض:** استخدام URL الدائم من قاعدة البيانات

## 🎯 التحسينات الجديدة

### 1. معالجة صحيحة للصور
- عدم حفظ blob URLs مؤقتة
- رفع الصور إلى Supabase Storage
- حفظ URLs دائمة في قاعدة البيانات

### 2. معاينة فورية للصور
- رؤية الصورة المحددة فوراً
- معاينة قبل الحفظ
- تجربة مستخدم محسنة

### 3. استقرار الصور
- الصور لا تختفي عند إعادة التحميل
- URLs دائمة ومستقرة
- تخزين آمن في Supabase

## 🚀 الخطوات التالية

1. **اختبار إضافة عضو:** التأكد من ظهور الصورة
2. **اختبار إعادة التحميل:** التأكد من استمرار ظهور الصورة
3. **اختبار تعديل الصورة:** التأكد من تحديث الصورة

## 📝 ملاحظات مهمة

- الصور الآن تُحفظ بشكل دائم في Supabase Storage
- URLs الصور مستقرة ولا تختفي
- معاينة فورية للصور المحددة
- تجربة مستخدم محسنة مع الصور

## 🔧 إعدادات Supabase

**Bucket:** `team-avatars`
**URL Format:** `https://[PROJECT_ID].supabase.co/storage/v1/object/public/team-avatars/[FILENAME]`
**Permissions:** Public read access
