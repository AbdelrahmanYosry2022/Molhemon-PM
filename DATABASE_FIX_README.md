# إصلاح قاعدة البيانات - Team Management Dashboard

## المشاكل المكتشفة

### 1. مشكلة جدول `projects`
- **الخطأ**: `column "description" of relation "projects" does not exist`
- **الخطأ**: `column "status" of relation "projects" does not exist`
- **السبب**: جدول `projects` الموجود لا يحتوي على الأعمدة المطلوبة

### 2. مشكلة جدول `team_members`
- **الخطأ**: `column "first_name" of relation "team_members" does not exist`
- **الخطأ**: `column "created_at" of relation "team_members" does not exist`
- **السبب**: جدول `team_members` الموجود لا يحتوي على الأعمدة المطلوبة للوحة التحكم الجديدة

## الحل

### الخطوة 1: تشغيل ملف الإصلاح
قم بنسخ محتوى ملف `fix_projects_and_team_members.sql` وتشغيله في Supabase SQL Editor.

هذا الملف سيقوم بـ:
1. إضافة الأعمدة المفقودة لجدول `projects`
2. إضافة الأعمدة المفقودة لجدول `team_members`
3. إنشاء triggers لتحديث `updated_at` تلقائياً
4. إنشاء فهارس لتحسين الأداء
5. إضافة بيانات تجريبية
6. إنشاء جدول `custom_roles` للأدوار والصلاحيات

### الخطوة 2: التحقق من النتيجة
بعد تشغيل الملف، يجب أن تظهر رسالة:
```
تم إصلاح جداول projects و team_members بنجاح!
```

### الخطوة 3: اختبار التطبيق
1. أعد تشغيل التطبيق
2. انتقل إلى صفحة "إدارة فريق العمل"
3. تأكد من أن جميع التبويبات تعمل بشكل صحيح

## هيكل الجداول بعد الإصلاح

### جدول `projects`
```sql
- id (UUID, Primary Key)
- name (TEXT, NOT NULL)
- description (TEXT) -- تم إضافته
- status (TEXT, DEFAULT 'active') -- تم إضافته
- created_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()) -- تم إضافته
- updated_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()) -- تم إضافته
```

### جدول `team_members`
```sql
- id (UUID, Primary Key)
- project_id (UUID, Foreign Key)
- name (TEXT, NOT NULL)
- first_name (VARCHAR(100)) -- تم إضافته
- last_name (VARCHAR(100)) -- تم إضافته
- email (TEXT)
- phone (TEXT)
- role (TEXT, NOT NULL, DEFAULT 'member')
- status (TEXT, NOT NULL, DEFAULT 'active')
- joined (DATE)
- avatar_url (TEXT)
- bio (TEXT) -- تم إضافته
- skills (TEXT[]) -- تم إضافته
- hourly_rate (DECIMAL(10,2)) -- تم إضافته
- created_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()) -- تم إضافته
- updated_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()) -- تم إضافته
```

### جدول `custom_roles` (جديد)
```sql
- id (UUID, Primary Key)
- name (VARCHAR(100), UNIQUE, NOT NULL)
- description (TEXT)
- permissions (JSONB, DEFAULT '[]')
- is_default (BOOLEAN, DEFAULT FALSE)
- created_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
- updated_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
```

## الميزات المضافة

### 1. Triggers تلقائية
- تحديث `updated_at` تلقائياً عند تعديل أي سجل

### 2. فهارس محسنة
- فهارس على `role`, `status`, `email`, `created_at` لتحسين الأداء

### 3. بيانات تجريبية
- مشروع تجريبي واحد
- 6 أعضاء فريق تجريبيين بأدوار مختلفة
- 5 أدوار افتراضية مع صلاحيات محددة

## استكشاف الأخطاء

### إذا استمرت المشاكل:

1. **تحقق من وجود الجداول**:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('projects', 'team_members', 'custom_roles');
```

2. **تحقق من أعمدة جدول projects**:
```sql
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'projects';
```

3. **تحقق من أعمدة جدول team_members**:
```sql
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'team_members';
```

4. **إذا لم تنجح الطريقة الأولى، جرب حذف الجداول وإعادة إنشائها**:
```sql
-- تحذير: هذا سيحذف جميع البيانات الموجودة
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS custom_roles CASCADE;
```

ثم قم بتشغيل ملف `fix_projects_and_team_members.sql` مرة أخرى.

## ملاحظات مهمة

- الملف مصمم ليكون آمناً ويعمل عدة مرات دون مشاكل
- يستخدم `IF NOT EXISTS` لتجنب الأخطاء عند تشغيله مرات متعددة
- يستخدم `WHERE NOT EXISTS` لتجنب إدخال بيانات مكررة
- يتعامل مع الأخطاء بشكل ذكي ويحاول استرداد البيانات حتى لو كانت بعض الأعمدة مفقودة
